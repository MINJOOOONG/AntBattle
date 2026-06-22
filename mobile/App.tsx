import RootNavigator from './src/navigation/RootNavigator';
import { useBGM } from './src/hooks/useBGM';

function AppContent() {
  useBGM();
  return <RootNavigator />;
}

export default function App() {
  return <AppContent />;
}
