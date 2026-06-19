import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

const MOCK_STOCKS = [
  { code: '005930', name: '삼성전자', sector: '반도체', currentPrice: 72000, previousClose: 71500 },
  { code: '000660', name: 'SK하이닉스', sector: '반도체', currentPrice: 185000, previousClose: 183000 },
  { code: '035420', name: 'NAVER', sector: 'IT서비스', currentPrice: 215000, previousClose: 213000 },
  { code: '035720', name: '카카오', sector: 'IT서비스', currentPrice: 44000, previousClose: 44500 },
  { code: '005380', name: '현대차', sector: '자동차', currentPrice: 235000, previousClose: 233000 },
  { code: '000270', name: '기아', sector: '자동차', currentPrice: 95000, previousClose: 94500 },
  { code: '373220', name: 'LG에너지솔루션', sector: '배터리', currentPrice: 380000, previousClose: 382000 },
  { code: '068270', name: '셀트리온', sector: '바이오', currentPrice: 185000, previousClose: 184000 },
  { code: '005490', name: 'POSCO홀딩스', sector: '소재', currentPrice: 310000, previousClose: 308000 },
  { code: '207940', name: '삼성바이오로직스', sector: '바이오', currentPrice: 820000, previousClose: 815000 },
  { code: '051910', name: 'LG화학', sector: '화학', currentPrice: 340000, previousClose: 338000 },
  { code: '105560', name: 'KB금융', sector: '금융', currentPrice: 78000, previousClose: 77500 },
  { code: '055550', name: '신한지주', sector: '금융', currentPrice: 52000, previousClose: 51800 },
  { code: '006400', name: '삼성SDI', sector: '배터리', currentPrice: 410000, previousClose: 412000 },
  { code: '012450', name: '한화에어로스페이스', sector: '방산', currentPrice: 280000, previousClose: 278000 },
];

const MOCK_ITEMS = [
  // 모자
  { name: '안전모', category: 'hat', price: 50, rarity: 'common', emoji: '⛑️', description: '안전제일 개미!' },
  { name: '왕관', category: 'hat', price: 200, rarity: 'epic', emoji: '👑', description: '개미왕의 상징' },
  { name: '차트 모자', category: 'hat', price: 100, rarity: 'rare', emoji: '📈', description: '항상 우상향 기원' },
  { name: '월급날 모자', category: 'hat', price: 80, rarity: 'common', emoji: '💰', description: '월급날엔 주식 사는 개미' },
  { name: '불장 헬멧', category: 'hat', price: 300, rarity: 'legendary', emoji: '🔥', description: '불장에서 살아남은 증거' },
  // 안경
  { name: '증권맨 안경', category: 'glasses', price: 60, rarity: 'common', emoji: '🤓', description: '차트 분석의 시작' },
  { name: '빨간불 선글라스', category: 'glasses', price: 120, rarity: 'rare', emoji: '🕶️', description: '빨간불만 보이는 마법 안경' },
  { name: '눈물 고글', category: 'glasses', price: 80, rarity: 'common', emoji: '😭', description: '물릴 때 필수템' },
  // 표정
  { name: '떡상 미소', category: 'expression', price: 70, rarity: 'common', emoji: '😄', description: '수익 날 때의 표정' },
  { name: '물림 눈물', category: 'expression', price: 70, rarity: 'common', emoji: '😢', description: '손절 직전의 표정' },
  { name: '반등 기도', category: 'expression', price: 90, rarity: 'rare', emoji: '🙏', description: '제발 반등해주세요...' },
  { name: '무념무상', category: 'expression', price: 150, rarity: 'epic', emoji: '😶', description: '차트를 초월한 경지' },
  // 의상
  { name: '정장 개미', category: 'outfit', price: 100, rarity: 'rare', emoji: '👔', description: '여의도 증권맨 룩' },
  { name: '불장 개미', category: 'outfit', price: 200, rarity: 'epic', emoji: '🦺', description: '불장 생존 장비' },
  { name: '월급 개미', category: 'outfit', price: 50, rarity: 'common', emoji: '👕', description: '평범한 월급쟁이 개미' },
  // 배경
  { name: '여의도 배경', category: 'background', price: 150, rarity: 'rare', emoji: '🏙️', description: '금융의 중심' },
  { name: '빨간불 배경', category: 'background', price: 120, rarity: 'rare', emoji: '🔴', description: '온통 빨간 세상' },
  { name: '파란불 배경', category: 'background', price: 120, rarity: 'rare', emoji: '🔵', description: '우울한 파란 세상' },
  { name: '달나라 떡상', category: 'background', price: 300, rarity: 'legendary', emoji: '🌙', description: 'TO THE MOON!' },
  // 칭호
  { name: '개미왕', category: 'title', price: 500, rarity: 'legendary', emoji: '🏆', description: '최고의 개미' },
  { name: '물림왕', category: 'title', price: 100, rarity: 'rare', emoji: '📉', description: '물림의 달인' },
  { name: '반등기도중', category: 'title', price: 80, rarity: 'common', emoji: '🙏', description: '기도 메타 유저' },
  { name: '수익률 깡패', category: 'title', price: 250, rarity: 'epic', emoji: '💪', description: '수익률로 승부한다' },
];

function generatePriceHistory(basePrice: number, days: number = 30): { date: Date; price: number }[] {
  const history: { date: Date; price: number }[] = [];
  let price = basePrice * (0.9 + Math.random() * 0.1);

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(15, 30, 0, 0); // 장마감 시간

    const change = (Math.random() - 0.48) * 0.03; // 약간 상승 편향
    price = price * (1 + change);
    price = Math.round(price / 100) * 100; // 100원 단위 반올림

    history.push({ date, price });
  }

  return history;
}

async function main() {
  console.log('Seeding database...');

  // 주식 데이터 삽입
  for (const stock of MOCK_STOCKS) {
    const changeRate = ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
    const created = await prisma.stock.upsert({
      where: { code: stock.code },
      update: { ...stock, changeRate: parseFloat(changeRate.toFixed(2)) },
      create: { ...stock, changeRate: parseFloat(changeRate.toFixed(2)) },
    });

    // 가격 히스토리 생성
    const history = generatePriceHistory(stock.currentPrice);
    for (const entry of history) {
      await prisma.stockPriceHistory.upsert({
        where: { stockId_date: { stockId: created.id, date: entry.date } },
        update: { price: entry.price },
        create: { stockId: created.id, date: entry.date, price: entry.price },
      });
    }
  }

  console.log(`Seeded ${MOCK_STOCKS.length} stocks with price history`);

  // 아이템 데이터 삽입 (기존 데이터 삭제 후 재생성)
  await prisma.antItem.deleteMany({});
  await prisma.antItem.createMany({ data: MOCK_ITEMS });

  console.log(`Seeded ${MOCK_ITEMS.length} shop items`);

  // 테스트 유저 2명 생성 (비밀번호: test1234)
  const testPassword = await bcrypt.hash('test1234', BCRYPT_ROUNDS);

  const testUsers = [
    {
      email: 'mindoo@test.com',
      nickname: '민두개미',
      handle: 'ant_mindoo',
      passwordHash: testPassword,
    },
    {
      email: 'chulsoo@test.com',
      nickname: '철수개미',
      handle: 'ant_chulsoo',
      passwordHash: testPassword,
    },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { handle: userData.handle },
      update: {},
      create: userData,
    });

    // 가입 보너스 개미콩 지급 (레저 테이블)
    const existingBonus = await prisma.antBeanTransaction.findFirst({
      where: { userId: user.id, type: 'signup_bonus' },
    });
    if (!existingBonus) {
      await prisma.antBeanTransaction.create({
        data: {
          userId: user.id,
          amount: 500,
          type: 'signup_bonus',
          description: '회원가입 보너스',
        },
      });
    }
  }

  console.log(`Seeded ${testUsers.length} test users (password: test1234)`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
