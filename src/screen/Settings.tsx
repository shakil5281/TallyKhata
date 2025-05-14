import React, { useState } from 'react';
import { View, ScrollView, Alert, SwitchBase, TextInput } from 'react-native';
import { Card, Switch, List, Divider, useTheme, Avatar, Button, Text } from 'react-native-paper';

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsComponent() {
  const { colors } = useTheme();
  const [darkMode, setDarkMode] = useState(false);

  const settingItems: SettingItem[] = [
    {
      id: 'passwordChange',
      title: 'Change Password',
      type: 'action',
      onPress: () => Alert.alert('Change Password', 'Navigate to password change screen'),
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      type: 'toggle',
      value: darkMode,
    },
    {
      id: 'settings',
      title: 'App Settings',
      type: 'action',
      onPress: () => Alert.alert('Settings', 'Navigate to app settings'),
    },
    {
      id: 'logout',
      title: 'Logout',
      type: 'action',
      onPress: () => Alert.alert('Logout', 'You have been logged out'),
    },
  ];

  const onToggle = (item: SettingItem) => {
    if (item.id === 'darkMode') setDarkMode(prev => !prev);
  };

  return (
    <ScrollView className="bg-gray-50 flex-1">
      <View className="">
        {/* Profile Header */}
        <Card style={{ backgroundColor: '#fe4c24', paddingTop: 35 }} className="rounded-b-3xl mb-6 bg-[#fe4c24]">
          <Card.Content className="items-center py-6">
            <Avatar.Image size={80} source={{ uri: 'https://i.pravatar.cc/300' }} />
            <Text style={{ color: 'white', fontSize: 25 }} variant="titleLarge" className="mt-4">John Doe</Text>
            <Text style={{ color: 'white' }} variant="bodyMedium" className="mt-1 text-gray-500">+1 234 567 890</Text>
          </Card.Content>
        </Card>

        {/* Settings List */}
        <Card className="rounded-2xl p-2 bg-white shadow-none border-none" elevation={0}>
          {settingItems.map((item, idx) => (
            <View key={item.id}>
              {item.type === 'toggle' ? (
                <List.Item
                  title={item.title}
                  right={() => (
                    <Switch
                      value={item.value}
                      onValueChange={() => onToggle(item)}
                      color={colors.primary}
                    />
                  )}
                  className="bg-white rounded-lg border-none"
                />
              ) : (
                <List.Item
                  title={item.title}
                  onPress={item.onPress}
                  className="bg-white rounded-lg"
                  right={() => <List.Icon icon={item.id === 'logout' ? 'logout' : 'chevron-right'} />}
                />
              )}
              {idx < settingItems.length - 1 && <Divider />}
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}
