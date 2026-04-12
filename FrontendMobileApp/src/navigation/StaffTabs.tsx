import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {LayoutDashboard, User, Bell, ClipboardList} from 'lucide-react-native';
import StaffDashboard from '../screens/staff/StaffDashboard';
import StaffNotificationScreen from '../screens/staff/StaffNotificationScreen';
import StaffProfileScreen from '../screens/staff/StaffProfileScreen';
import QueueHandlingScreen from '../screens/staff/QueueHandlingScreen';

const Tab = createBottomTabNavigator();

const StaffTabs = () => {
  const getTabBarIcon = (route: any) => ({color, size}: any) => {
    switch (route.name) {
      case 'Dashboard':
        return <LayoutDashboard size={size} color={color} />;
      case 'Queue Handling':
        return <ClipboardList size={size} color={color} />;
      case 'Notifications':
        return <Bell size={size} color={color} />;
      case 'Profile':
        return <User size={size} color={color} />;
      default:
        return null;
    }
  };

  return (
    <Tab.Navigator
      id="staff-tabs"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1917',
          borderTopColor: '#292524',
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#C2410C',
        tabBarInactiveTintColor: '#78716C',
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: 'black',
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        tabBarIcon: getTabBarIcon(route),
      })}>
      <Tab.Screen name="Dashboard" component={StaffDashboard} />
      <Tab.Screen name="Queue Handling" component={QueueHandlingScreen} />
      <Tab.Screen name="Notifications" component={StaffNotificationScreen} />
      <Tab.Screen name="Profile" component={StaffProfileScreen} />
    </Tab.Navigator>
  );
};

export default StaffTabs;
