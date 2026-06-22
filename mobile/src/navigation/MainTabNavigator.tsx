import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { COLORS } from '../constants/colors';
import HomeScreen from '../screens/home/HomeScreen';
import MyPageScreen from '../screens/profile/MyPageScreen';
import BattleListScreen from '../screens/battle/BattleListScreen';
import ShopScreen from '../screens/shop/ShopScreen';
import HomeIcon from '../components/icons/HomeIcon';
import BattleIcon from '../components/icons/BattleIcon';
import ShopIcon from '../components/icons/ShopIcon';
import MyPageIcon from '../components/icons/MyPageIcon';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.clay,
        tabBarInactiveTintColor: COLORS.disabled,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderSoft,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '홈', tabBarIcon: ({ color }) => <HomeIcon size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Battle"
        component={BattleListScreen}
        options={{ tabBarLabel: '배틀', tabBarIcon: ({ color }) => <BattleIcon size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{ tabBarLabel: '상점', tabBarIcon: ({ color }) => <ShopIcon size={22} color={color} /> }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ tabBarLabel: '마이', tabBarIcon: ({ color }) => <MyPageIcon size={22} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
