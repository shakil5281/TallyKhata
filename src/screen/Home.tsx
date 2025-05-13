import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Appbar, Button, Card, Avatar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCustomers, initDB } from '~/lib/db';

export default function HomeScreen() {
    const [customers, setCustomers] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const loadCustomers = async () => {
            await initDB();
            const result = await getCustomers();
            setCustomers(result);
        };
        loadCustomers();
    }, []);

    const renderCustomer = ({ item }: { item: any }) => (
        <Card onPress={() => router.push(`/transaction/${item.id}`)} className="mb-4 bg-gray-100">
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
                            ৳{item.total || '0'}
                        </Text>
                        <IconButton
                            {...props}
                            icon="chevron-right"
                        />
                    </View>
                )}
            />
        </Card>
    );

    return (
        <>
            <Appbar.Header style={{ backgroundColor: '#3b82f6' }}>
                <Appbar.Content
                    title="Customer"
                    titleStyle={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}
                />
            </Appbar.Header>


            <View className="flex-1 bg-white p-4">
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
});
