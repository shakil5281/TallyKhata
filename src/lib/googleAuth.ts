import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google Sign-In Configuration
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // Android client ID from Google Cloud Console
    webClientId: '305086174723-92oovinblc0a9p9oadqo99oo2jrfvagp.apps.googleusercontent.com',
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
    accountName: '',
    // iOS client ID (if needed for future iOS builds)
    iosClientId: '305086174723-ebak00s0i6i27tujruih20p1lrlv87d8.apps.googleusercontent.com',
    googleServicePlistPath: '',
    openIdRealm: '',
    profileImageSize: 120,
  });
};

// Google Sign-In Service
export class GoogleAuthService {
  static async signIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return {
        success: true,
        user: userInfo,
        idToken: userInfo.idToken || null,
      };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      return {
        success: false,
        error: error.message || 'Sign-in failed',
      };
    }
  }

  static async signOut() {
    try {
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Google Sign-Out Error:', error);
      return {
        success: false,
        error: error.message || 'Sign-out failed',
      };
    }
  }

  static async isSignedIn() {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Check Sign-In Status Error:', error);
      return false;
    }
  }

  static async getCurrentUser() {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      console.error('Get Current User Error:', error);
      return null;
    }
  }

  static async getTokens() {
    try {
      const tokens = await GoogleSignin.getTokens();
      return {
        success: true,
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
      };
    } catch (error: any) {
      console.error('Get Tokens Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get tokens',
      };
    }
  }

  static async revokeAccess() {
    try {
      await GoogleSignin.revokeAccess();
      return { success: true };
    } catch (error: any) {
      console.error('Revoke Access Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to revoke access',
      };
    }
  }
}

// User type definition
export interface GoogleUser {
  idToken: string | null;
  serverAuthCode: string | null;
  scopes: string[] | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
}

// Auth result type
export interface AuthResult {
  success: boolean;
  user?: GoogleUser;
  idToken?: string | null;
  error?: string;
}
