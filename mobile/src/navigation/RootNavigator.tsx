import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants/colors';
import { AuthStackParamList, RootStackParamList } from './types';

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import MainTabNavigator from './MainTabNavigator';
import FriendSearchScreen from '../screens/social/FriendSearchScreen';
import FriendListScreen from '../screens/social/FriendListScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
      }}
    >
      <RootStack.Screen name="MainTab" component={MainTabNavigator} options={{ headerShown: false }} />
      <RootStack.Screen name="FriendSearch" component={FriendSearchScreen} options={{ title: '친구 찾기' }} />
      <RootStack.Screen name="FriendList" component={FriendListScreen} options={{ title: '친구 목록' }} />
    </RootStack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
