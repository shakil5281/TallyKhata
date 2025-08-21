import React from 'react';
import { Stack } from 'expo-router';
import AppInfoScreen from '~/screen/AppInfoScreen';

export default function AppInfoLayout() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <AppInfoScreen />
    </>
  );
}
