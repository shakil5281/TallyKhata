import React, { useEffect, useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Appbar, Avatar, Button, TextInput, Card, Text, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { addCustomer, dropCustomersTable, initDB } from '~/lib/db';

export default function AddCustomerScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'Customer' | 'Supplier'>('Customer');
  const router = useRouter();

  const isValidPhone = (num: string) => /^01[3-9]\d{8}$/.test(num);
  const isFormValid = name.trim() && isValidPhone(phone) && type;

  const handleAddCustomer = async () => {
    if (isFormValid) {
      const data = await addCustomer({ name, phone, type });
      console.log('Customer added:', data);
      router.push('/');
    }
  };

  // useEffect(() => {
  //   dropCustomersTable().then(() => {
  //     initDB(); // Recreate with correct columns
  //   });
  // }, []);


  return (
    <>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: '#2563eb' }}>
        <Appbar.BackAction onPress={() => router.back()} color="white" />
        <Appbar.Content
          title="Add Customer"
          titleStyle={{ color: 'white', fontWeight: 'bold' }}
        />
      </Appbar.Header>

      {/* Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-gray-100 p-4"
      >
        <Card className="rounded-xl shadow-md bg-white p-5">
          <View className="items-center mb-6">
            <Avatar.Image
              size={72}
              source={require('../../assets/user-avater.png')} // Replace with your own image
            />
            <Text className="mt-2 text-base font-semibold text-gray-700">
              Add New Contact
            </Text>
          </View>

          <View className="gap-5">
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"

              style={{ fontSize: 14 }}
            />
            <TextInput
              label="Phone (e.g. 017XXXXXXXX)"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="number-pad"

              style={{ fontSize: 14 }}
              error={!!phone && !isValidPhone(phone)}
            />

            <View>

              <Text className="mt-2 mb-1 font-medium text-gray-600">Type</Text>
              <RadioButton.Group onValueChange={(value) => setType(value as any)} value={type}>
                <View className="flex-row items-center mb-1">
                  <RadioButton value="Customer" />
                  <Text>Customer</Text>
                </View>
                <View className="flex-row items-center mb-4">
                  <RadioButton value="Supplier" />
                  <Text>Supplier</Text>
                </View>
              </RadioButton.Group>
            </View>

            <Button
              mode="contained"
              onPress={handleAddCustomer}
              disabled={!isFormValid}
              style={{ backgroundColor: isFormValid ? '#2563eb' : '#9ca3af' }}
            >
              Add Customer
            </Button>
          </View>
        </Card>
      </KeyboardAvoidingView>
    </>
  );
}
