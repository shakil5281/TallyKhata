// Fallback data for when database operations fail
export const defaultProfile = {
  id: 1,
  name: 'TallyKhata User',
  phone: '',
  email: '',
  business_name: '',
  address: '',
  profile_image: '',
  currency: '৳',
  dark_mode: false,
  notifications_enabled: true,
  backup_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const defaultStats = {
  totalCustomers: 0,
  totalTransactions: 0,
  totalCredit: 0,
  totalDebit: 0,
  totalBalance: 0,
  netBalance: 0,
};

export const isProfileDataValid = (profile: any): boolean => {
  return profile && typeof profile === 'object' && profile.name && typeof profile.name === 'string';
};

export const sanitizeProfileData = (profile: any) => {
  if (!isProfileDataValid(profile)) {
    return defaultProfile;
  }

  return {
    ...defaultProfile,
    ...profile,
    dark_mode: Boolean(profile.dark_mode),
    notifications_enabled: Boolean(profile.notifications_enabled),
    backup_enabled: Boolean(profile.backup_enabled),
  };
};
