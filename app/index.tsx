import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { StyleSheet, View, StatusBar } from 'react-native';
import Cashbox from '~/screen/Cashbox';
import HomeScreen from '~/screen/Home';
import SettingsScreen from '~/screen/Settings';
import CustomersListScreen from '~/screen/CustomersList';

const CustomersRoute = () => <CustomersListScreen />;

const TallyKhataMenu = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'Tally',
      title: 'Home',
      focusedIcon: 'home',
      unfocusedIcon: 'home-outline',
    },
    {
      key: 'Cashbox',
      title: 'Reports',
      focusedIcon: 'chart-line',
      unfocusedIcon: 'chart-line-variant',
    },
    {
      key: 'customers',
      title: 'Customers',
      focusedIcon: 'account-group',
      unfocusedIcon: 'account-group-outline',
    },
    {
      key: 'settings',
      title: 'Settings',
      focusedIcon: 'cog',
      unfocusedIcon: 'cog-outline',
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    Tally: HomeScreen,
    Cashbox: Cashbox,
    customers: CustomersRoute,
    settings: SettingsScreen,
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fe4c24" barStyle="light-content" translucent={false} />
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        barStyle={styles.bottomNavBar}
        activeColor="#fe4c24"
        inactiveColor="#999"
        activeIndicatorStyle={styles.activeIndicator}
        style={styles.bottomNavigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  bottomNavigation: {},
  bottomNavBar: {
    backgroundColor: 'white',
    height: 80,
    paddingBottom: 0,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  activeIndicator: {
    backgroundColor: 'rgba(254, 76, 36, 0.12)',
    borderRadius: 16,
    height: 32,
    marginHorizontal: 12,
  },
});

export default TallyKhataMenu;
