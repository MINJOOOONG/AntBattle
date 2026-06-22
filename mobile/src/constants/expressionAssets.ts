import { ImageSourcePropType } from 'react-native';

export type ExpressionKey =
  | 'face_blank'
  | 'face_smirk'
  | 'face_angry'
  | 'face_shock'
  | 'face_cry';

export const EXPRESSION_ITEMS: Array<{
  key: ExpressionKey;
  name: string;
  description: string;
}> = [
  { key: 'face_blank', name: '무표정', description: '아무 생각 없는 개미 얼굴' },
  { key: 'face_smirk', name: '능글미소', description: '다 알고 있다는 표정' },
  { key: 'face_angry', name: '정색', description: '손절 버튼 앞의 표정' },
  { key: 'face_shock', name: '깜놀', description: '급등락을 본 표정' },
  { key: 'face_cry', name: '눈물', description: '물린 개미의 표정' },
];

export const EXPRESSION_ASSETS: Partial<Record<ExpressionKey, ImageSourcePropType>> = {
  face_blank: require('../../assets/expressions/face_blank.png'),
  face_smirk: require('../../assets/expressions/face_smirk.png'),
  face_angry: require('../../assets/expressions/face_angry.png'),
  face_shock: require('../../assets/expressions/face_shock.png'),
  face_cry: require('../../assets/expressions/face_cry.png'),
};

export function isExpressionKey(value: string | null | undefined): value is ExpressionKey {
  return (
    value === 'face_blank' ||
    value === 'face_smirk' ||
    value === 'face_angry' ||
    value === 'face_shock' ||
    value === 'face_cry'
  );
}
