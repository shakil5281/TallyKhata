import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: any;
  textStyle?: any;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  style,
  textStyle,
}) => {
  const { signIn, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Sign-in failed';
      console.error('Google Sign-In Error:', errorMessage);
      
      if (onError) {
        onError(errorMessage);
      } else {
        Alert.alert('Sign-In Error', errorMessage);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const isDisabled = isLoading || isSigningIn;

  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: '#dadce0',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
          minHeight: 48,
        },
        style,
        isDisabled && { opacity: 0.6 },
      ]}
      onPress={handleSignIn}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {isSigningIn ? (
        <ActivityIndicator size="small" color="#4285f4" />
      ) : (
        <>
          <View
            style={{
              width: 20,
              height: 20,
              marginRight: 12,
              backgroundColor: '#4285f4',
              borderRadius: 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>G</Text>
          </View>
          <Text
            style={[
              {
                color: '#3c4043',
                fontSize: 16,
                fontWeight: '500',
                fontFamily: 'Roboto',
              },
              textStyle,
            ]}
          >
            Sign in with Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;
