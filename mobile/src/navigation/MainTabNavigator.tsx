import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, ImageSourcePropType, View, StyleSheet } from 'react-native';
import { MainTabParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import MyPageScreen from '../screens/profile/MyPageScreen';
import BattleListScreen from '../screens/battle/BattleListScreen';
import ShopScreen from '../screens/shop/ShopScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS = {
  home: require('../../assets/tab-icons/home.png'),
  battle: require('../../assets/tab-icons/battle.png'),
  shop: require('../../assets/tab-icons/shop.png'),
  mypage: require('../../assets/tab-icons/mypage.png'),
} satisfies Record<string, ImageSourcePropType>;

function TabImageIcon({ source, focused }: { source: ImageSourcePropType; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Image
        source={source}
        style={[styles.tabIcon, focused ? styles.activeIcon : styles.inactiveIcon]}
        resizeMode="contain"
      />
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#babdc5',
          borderTopWidth: 0.5,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabImageIcon source={TAB_ICONS.home} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Battle"
        component={BattleListScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabImageIcon source={TAB_ICONS.battle} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabImageIcon source={TAB_ICONS.shop} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabImageIcon source={TAB_ICONS.mypage} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    height: 34,
    width: 34,
  },
  activeIcon: {
    opacity: 1,
  },
  inactiveIcon: {
    opacity: 0.35,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2c2f38',
    marginTop: 4,
  },
});
