import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import HomeScreen from '~/screen/Home';
import CashboxScreen from '~/screen/Cashbox';
import CustomersListScreen from '~/screen/CustomersList';
import SettingsScreen from '~/screen/Settings';
import { useTheme } from '~/context/ThemeContext';
import ModernStatusBar from '../components/ModernStatusBar';
import ProtectedRoute from '../components/ProtectedRoute';

export default function TabLayout() {
  const { theme } = useTheme();
  const { colors } = theme.custom;

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'Tally',
      title: 'হোম',
      focusedIcon: 'home',
      unfocusedIcon: 'home-outline',
    },
    {
      key: 'Cashbox',
      title: 'রিপোর্ট',
      focusedIcon: 'chart-line',
      unfocusedIcon: 'chart-line-variant',
    },
    {
      key: 'customers',
      title: 'গ্রাহক',
      focusedIcon: 'account-group',
      unfocusedIcon: 'account-group-outline',
    },
    {
      key: 'settings',
      title: 'সেটিংস',
      focusedIcon: 'cog',
      unfocusedIcon: 'cog-outline',
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    Tally: HomeScreen,
    Cashbox: CashboxScreen,
    customers: CustomersListScreen,
    settings: SettingsScreen,
  });

  return (
    <ProtectedRoute>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernStatusBar />
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
          barStyle={[
            styles.bottomNavBar,
            {
              backgroundColor: colors.bottomNavBackground,
              borderTopColor: colors.bottomNavBorder,
            },
          ]}
          activeColor={colors.bottomNavActive}
          inactiveColor={colors.bottomNavInactive}
          activeIndicatorStyle={[styles.activeIndicator, { backgroundColor: colors.primary + '20' }]}
          style={styles.bottomNavigation}
        />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavigation: {},
  bottomNavBar: {
    height: 80,
    paddingBottom: 0,
    paddingTop: 0,
    borderTopWidth: 1,
  },
  activeIndicator: {
    borderRadius: 16,
    height: 32,
    marginHorizontal: 12,
  },
});
