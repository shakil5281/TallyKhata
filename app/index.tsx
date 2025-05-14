import * as React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import Cashbox from '~/screen/Cashbox';
import HomeScreen from '~/screen/Home';
import SettingsScreen from '~/screen/Settings';


const CustomersRoute = () => <Text>Customers</Text>;


const TallyKhataMenu = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'Tally', title: 'Tally', focusedIcon: 'notebook-outline' },
    { key: 'Cashbox', title: 'Cashbox', focusedIcon: 'swap-horizontal' },
    { key: 'customers', title: 'Customers', focusedIcon: 'account-group' },
    { key: 'settings', title: 'Settings', focusedIcon: 'cog' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    Tally: HomeScreen,
    Cashbox: Cashbox,
    customers: CustomersRoute,
    settings: SettingsScreen,
  });

  return (
<BottomNavigation
  navigationState={{ index, routes }}
  onIndexChange={setIndex}
  renderScene={renderScene}
  barStyle={{ backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}              // Deep red bar
  activeColor="red"                                  // Soft pink-white active icon
  inactiveColor="red"                                // Faded red inactive icon
  activeIndicatorStyle={{ backgroundColor: '#ffdfd8' }} 
/>

  );
};

export default TallyKhataMenu;
