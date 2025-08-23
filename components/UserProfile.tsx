import React from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import ModernButton from './ModernButton';

export const UserProfile: React.FC = () => {
  const { user, signOut, isLoading } = useAuth();

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        {user.photo ? (
          <Image source={{ uri: user.photo }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profilePlaceholderText}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email || 'No email'}</Text>
          <Text style={styles.userId}>ID: {user.id}</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <ModernButton
          onPress={handleSignOut}
          disabled={isLoading}
          style={styles.signOutButton}
          labelStyle={styles.signOutButtonText}
          variant="error">
          Sign Out
        </ModernButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fe4c24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profilePlaceholderText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'monospace',
  },
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  signOutButton: {
    backgroundColor: '#ff4444',
  },
  signOutButtonText: {
    color: '#ffffff',
  },
});

export default UserProfile;
