import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Button, Card, Avatar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCustomers, initDB } from '~/lib/db';

export default function HomeScreen() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [activeCard, setActiveCard] = useState<string | null>(null); // Track active card
    const router = useRouter();
      const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        // Initialize DB (only once)
        await initDB();
        
        // Fetch customers after DB initialization
        const result = await getCustomers();
        
        // Set the customer data into state
        setCustomers(result);
      } catch (error) {
        console.error("Error loading customers:", error);
      } finally {
        setLoading(false); // Once the data is loaded, set loading to false
      }
    };

    loadCustomers(); // Call the async function
  }, []);

    const handlePressIn = (id: string) => {
        setActiveCard(id); // Mark card as active
    };

    const handlePressOut = () => {
        setActiveCard(null); // Reset active card
    };

    const renderCustomer = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPressIn={() => handlePressIn(item.id)}
            onPressOut={handlePressOut}
            onPress={() => router.push(`/transaction/${item.id}`)}
        >
            <Card
                className="mb-4 shadow-none"
                elevation={0}
                style={[
                    styles.card,
                    activeCard === item.id && styles.cardActive, // Apply active style
                ]}
            >
                <Card.Title
                    titleStyle={{ fontSize: 20, fontWeight: 'bold' }}
                    title={item.name}
                    subtitle={item.phone || 'No phone provided'}
                    left={(props) => (
                        <Avatar.Text
                            {...props}
                            label={item.name ? item.name.charAt(0).toUpperCase() : '?'}
                            color="white"
                            style={{ backgroundColor: '#3b82f6' }} // Tailwind blue-500
                        />
                    )}
                    right={(props) => (
                        <View className="flex-row items-center pr-2">
                            <Text className="text-lg font-semibold mr-2 text-green-600">
                                ৳{item.total_balance || '0'}
                            </Text>
                            <IconButton
                                {...props}
                                icon="chevron-right"
                            />
                        </View>
                    )}
                />
            </Card>
        </TouchableOpacity>
    );

    return (
        <>
            <Appbar.Header style={{ backgroundColor: '#fe4c24' }}>
                <Appbar.Content
                    title="Customer"
                    titleStyle={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}
                />
            </Appbar.Header>

            <View className="flex-1 bg-gray-50 p-4">
                <FlatList
                    data={customers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCustomer}
                />
            </View>

            {/* Floating Add Button */}
            <View style={styles.floatingButtonContainer}>
                <Button
                    style={styles.floatingButton}
                    icon="account-plus"
                    mode="contained"
                    onPress={() => router.push('/add-customer')}
                    labelStyle={{ color: 'white' }}
                    contentStyle={{ flexDirection: 'row-reverse' }}
                >
                    Add Customer
                </Button>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    floatingButton: {
        backgroundColor: 'red',
        borderRadius: 30,
        padding: 6,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        fontSize: 20,
    },
    card: {
        backgroundColor: 'transparent', // Transparent background
        marginBottom: 10,
        borderRadius: 8,
        borderColor: 'transparent', // Default border color
        borderWidth: 1,
    },
    cardActive: {
        backgroundColor: 'none', // Active card background color
        borderColor: 'transparent', // Highlight border when active
        elevation: 0, // Add box shadow when active
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
    },
});
