import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {LayoutDashboard, Users, User, Bell, ClipboardList} from 'lucide-react-native';
import StaffDashboard from '../screens/staff/StaffDashboard';
import SectionDashboard from '../screens/staff/SectionDashboard';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import DocumentVerificationList from '../screens/staff/DocumentVerificationList';

const Tab = createBottomTabNavigator();

const StaffTabs = () => {
  const getTabBarIcon = (route: any) => ({color, size}: any) => {
    if (route.name === 'Counter') {
      return <LayoutDashboard size={size} color={color} />;
    }
    if (route.name === 'Documents') {
      return <ClipboardList size={size} color={color} />;
    }
    if (route.name === 'My Section') {
      return <Users size={size} color={color} />;
    }
    if (route.name === 'Notifications') {
      return <Bell size={size} color={color} />;
    }
    if (route.name === 'Profile') {
      return <User size={size} color={color} />;
    }
    return null;
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
      <Tab.Screen name="Counter" component={StaffDashboard} options={{tabBarLabel: 'QUEUE'}} />
      <Tab.Screen name="Documents" component={DocumentVerificationList} options={{tabBarLabel: 'VERIFY'}} />
      <Tab.Screen name="My Section" component={SectionDashboard} options={{tabBarLabel: 'SECTION'}} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{tabBarLabel: 'ALERTS'}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel: 'ID'}} />
    </Tab.Navigator>
  );
};

export default StaffTabs;
