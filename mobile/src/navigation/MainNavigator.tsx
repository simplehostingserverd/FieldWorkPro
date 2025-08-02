import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';

import DashboardScreen from '../screens/main/DashboardScreen';
import EquipmentListScreen from '../screens/equipment/EquipmentListScreen';
import EquipmentDetailScreen from '../screens/equipment/EquipmentDetailScreen';
import EquipmentFormScreen from '../screens/equipment/EquipmentFormScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import CustomerFormScreen from '../screens/customers/CustomerFormScreen';
import JobListScreen from '../screens/jobs/JobListScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import JobFormScreen from '../screens/jobs/JobFormScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Equipment: undefined;
  Customers: undefined;
  Jobs: undefined;
  Profile: undefined;
};

export type EquipmentStackParamList = {
  EquipmentList: undefined;
  EquipmentDetail: { id: string };
  EquipmentForm: { id?: string };
};

export type CustomerStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { id: string };
  CustomerForm: { id?: string };
};

export type JobStackParamList = {
  JobList: undefined;
  JobDetail: { id: string };
  JobForm: { id?: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const EquipmentStack = createNativeStackNavigator<EquipmentStackParamList>();
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();
const JobStack = createNativeStackNavigator<JobStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const EquipmentNavigator = () => (
  <EquipmentStack.Navigator>
    <EquipmentStack.Screen
      name="EquipmentList"
      component={EquipmentListScreen}
      options={{ title: 'Equipment' }}
    />
    <EquipmentStack.Screen
      name="EquipmentDetail"
      component={EquipmentDetailScreen}
      options={{ title: 'Equipment Details' }}
    />
    <EquipmentStack.Screen
      name="EquipmentForm"
      component={EquipmentFormScreen}
      options={({ route }) => ({
        title: route.params?.id ? 'Edit Equipment' : 'Add Equipment',
      })}
    />
  </EquipmentStack.Navigator>
);

const CustomerNavigator = () => (
  <CustomerStack.Navigator>
    <CustomerStack.Screen
      name="CustomerList"
      component={CustomerListScreen}
      options={{ title: 'Customers' }}
    />
    <CustomerStack.Screen
      name="CustomerDetail"
      component={CustomerDetailScreen}
      options={{ title: 'Customer Details' }}
    />
    <CustomerStack.Screen
      name="CustomerForm"
      component={CustomerFormScreen}
      options={({ route }) => ({
        title: route.params?.id ? 'Edit Customer' : 'Add Customer',
      })}
    />
  </CustomerStack.Navigator>
);

const JobNavigator = () => (
  <JobStack.Navigator>
    <JobStack.Screen
      name="JobList"
      component={JobListScreen}
      options={{ title: 'Jobs' }}
    />
    <JobStack.Screen
      name="JobDetail"
      component={JobDetailScreen}
      options={{ title: 'Job Details' }}
    />
    <JobStack.Screen
      name="JobForm"
      component={JobFormScreen}
      options={({ route }) => ({
        title: route.params?.id ? 'Edit Job' : 'Add Job',
      })}
    />
  </JobStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <ProfileStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </ProfileStack.Navigator>
);

const MainNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Equipment':
              iconName = 'build';
              break;
            case 'Customers':
              iconName = 'people';
              break;
            case 'Jobs':
              iconName = 'work';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Equipment"
        component={EquipmentNavigator}
        options={{ title: 'Equipment' }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerNavigator}
        options={{ title: 'Customers' }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobNavigator}
        options={{ title: 'Jobs' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
