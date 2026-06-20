import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
};

// Main Tab
export type MainTabParamList = {
  Home: undefined;
  Battle: undefined;
  Shop: undefined;
  MyPage: undefined;
};

// Root Stack (Main Tab 위에 쌓이는 화면들)
export type RootStackParamList = {
  MainTab: undefined;
  FriendSearch: undefined;
  FriendList: undefined;
  BattleRequest: undefined;
  PeriodNegotiation: { battleId: string };
  StockSelect: { battleId: string };
  BattleProgress: { battleId: string };
  BattleResult: { battleId: string };
  AntCustomize: undefined;
  Ranking: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
