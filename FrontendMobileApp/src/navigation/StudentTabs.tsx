import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {LayoutDashboard, Bell, User, Activity} from 'lucide-react-native';
import StudentDashboard from '../screens/student/StudentDashboard';
import LiveQueueScreen from '../screens/student/LiveQueueScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
const Tab = createBottomTabNavigator();
const StudentTabs = () => {
  return (
    <Tab.Navigator
      id="student-tabs"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#292524',
          borderTopColor: '#44403C',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C2410C',
        tabBarInactiveTintColor: '#D6D3D1',
        tabBarLabelStyle: {fontSize: 10, fontWeight: 'bold'},
        tabBarIcon: ({color, size}) => {
          if (route.name === 'Home') {
            return <LayoutDashboard size={size} color={color} />;
          }
          if (route.name === 'Live Queue') {
            return <Activity size={size} color={color} />;
          }
          if (route.name === 'Notifications') {
            return <Bell size={size} color={color} />;
          }
          if (route.name === 'Profile') {
            return <User size={size} color={color} />;
          }
        },
      })}><Tab.Screen name="Home" component={StudentDashboard} /><Tab.Screen name="Live Queue" component={LiveQueueScreen} /><Tab.Screen name="Notifications" component={NotificationsScreen} /><Tab.Screen name="Profile" component={ProfileScreen} /></Tab.Navigator>
  );
};
export default StudentTabs;
