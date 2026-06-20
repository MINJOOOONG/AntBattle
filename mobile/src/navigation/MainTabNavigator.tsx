import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MainTabParamList } from './types';
import { COLORS } from '../constants/colors';
import HomeScreen from '../screens/home/HomeScreen';
import MyPageScreen from '../screens/profile/MyPageScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Phase 3, 4에서 실제 화면으로 교체
function BattlePlaceholder() {
  return <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>배틀 (Phase 3)</Text>;
}
function ShopPlaceholder() {
  return <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>상점 (Phase 4)</Text>;
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: { backgroundColor: COLORS.surface },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '홈', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="Battle"
        component={BattlePlaceholder}
        options={{ tabBarLabel: '배틀', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚔️</Text> }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopPlaceholder}
        options={{ tabBarLabel: '상점', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛒</Text> }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ tabBarLabel: '마이', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🐜</Text> }}
      />
    </Tab.Navigator>
  );
}
