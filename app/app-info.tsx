import React from 'react';
import { Stack } from 'expo-router';
import AppInfoScreen from '~/screen/AppInfoScreen';

export default function AppInfoLayout() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'App Information',
          headerStyle: {
            backgroundColor: '#fe4c24',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppInfoScreen />
    </>
  );
}
