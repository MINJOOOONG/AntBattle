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
import BattleRequestScreen from '../screens/battle/BattleRequestScreen';
import PeriodNegotiationScreen from '../screens/battle/PeriodNegotiationScreen';
import StockSelectScreen from '../screens/battle/StockSelectScreen';
import BattleProgressScreen from '../screens/battle/BattleProgressScreen';
import BattleResultScreen from '../screens/battle/BattleResultScreen';

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
      <RootStack.Screen name="BattleRequest" component={BattleRequestScreen} options={{ title: '도전장 보내기' }} />
      <RootStack.Screen name="PeriodNegotiation" component={PeriodNegotiationScreen} options={{ title: '기간 정하기' }} />
      <RootStack.Screen name="StockSelect" component={StockSelectScreen} options={{ title: '종목 고르기' }} />
      <RootStack.Screen name="BattleProgress" component={BattleProgressScreen} options={{ title: '겨루는 중' }} />
      <RootStack.Screen name="BattleResult" component={BattleResultScreen} options={{ title: '승부 결과' }} />
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
        <ActivityIndicator size="large" color={COLORS.clay} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
