import { Platform } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { useBGM } from './src/hooks/useBGM';

// react-native-web Image 기본 흰색 배경 제거
// RNW는 Image를 div(background-image) + 내부 img 로 렌더링하며 기본 bg가 #fff
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    img,
    [role="img"],
    [style*="background-image"],
    [style*="background-size"] {
      background-color: transparent !important;
      background-color: rgba(0,0,0,0) !important;
    }
  `;
  document.head.appendChild(style);

  // MutationObserver로 동적 생성되는 Image 요소의 인라인 background-color 제거
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          const imgs = node.querySelectorAll
            ? node.querySelectorAll('img, [role="img"], [style*="background-image"]')
            : [];
          imgs.forEach((el) => {
            (el as HTMLElement).style.backgroundColor = 'transparent';
          });
          if (node.style && node.style.backgroundImage) {
            node.style.backgroundColor = 'transparent';
          }
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function AppContent() {
  useBGM();
  return <RootNavigator />;
}

export default function App() {
  return <AppContent />;
}
