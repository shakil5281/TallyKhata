import * as React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import HomeScreen from '~/screen/Home';


const TransactionsRoute = () => <Text>Transactions</Text>;
const CustomersRoute = () => <Text>Customers</Text>;
const SettingsRoute = () => <Text>Settings</Text>;

const TallyKhataMenu = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'Tally', title: 'Tally', focusedIcon: 'notebook-outline' },
    { key: 'transactions', title: 'Transactions', focusedIcon: 'swap-horizontal' },
    { key: 'customers', title: 'Customers', focusedIcon: 'account-group' },
    { key: 'settings', title: 'Settings', focusedIcon: 'cog' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    Tally: HomeScreen,
    transactions: TransactionsRoute,
    customers: CustomersRoute,
    settings: SettingsRoute,
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
