# Project Log

개미배틀 개발 진행 기록. 각 Phase의 목표, 구현 내용, 검증 결과, 트러블슈팅, 아키텍처 결정을 누적 기록한다.

## 문서 구조

| 파일 | 역할 |
|------|------|
| `docs/architecture.md` | 기술 아키텍처, 데이터 모델, 서비스 레이어, 확장 설계 |
| `docs/design.md` | 디자인 가이드, 색상, 타이포그래피, 화면 레이아웃, 마이크로카피 |
| `docs/claude.md` | Claude 코딩 규칙, 금지 사항, 컨벤션, 우선순위 |
| `docs/PROJECT_LOG.md` | 개발 진행 기록 (이 파일) |

---

## Phase 0: 프로젝트 스캐폴딩

**목표**: 프로젝트 루트/서버/모바일 기본 구조 생성, Docker Compose + PostgreSQL, Prisma 스키마, Express health check

**상태**: 완료 (2026-06-18)

### 생성 파일

```
AntBattle/
├── .gitignore
├── .env.example
├── docker-compose.yml              # name: antbattle, antbattle-postgres, antbattle-api
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example, .env
│   ├── prisma/
│   │   ├── schema.prisma           # 10 models
│   │   ├── seed.ts                 # 15 mock stocks + 23 shop items + price history
│   │   └── migrations/20260617165815_init/
│   └── src/
│       ├── index.ts, app.ts
│       ├── config/env.ts           # zod 환경변수 검증
│       ├── middleware/             # auth.ts, errorHandler.ts, validate.ts
│       ├── routes/                # index.ts, auth.routes.ts (stub)
│       ├── utils/                 # errors.ts, jwt.ts, battle-calc.ts, rank.ts
│       └── types/index.ts
├── mobile/
│   ├── (Expo blank-typescript template)
│   └── src/
│       ├── types/                 # models.ts, enums.ts, api.ts
│       ├── constants/             # colors.ts, ranks.ts, rewards.ts
│       └── services/api.ts       # axios + JWT interceptor
└── docs/
```

### 검증 결과

| 항목 | 결과 |
|------|------|
| `docker compose up -d postgres` | antbattle-postgres Up (healthy) |
| `prisma migrate dev --name init` | 성공, 10 테이블 생성 |
| `prisma db seed` | 15 stocks + 23 items + price history 삽입 |
| `GET /api/health` | 200 OK |
| `tsc --noEmit` | 에러 없음 |

### 아키텍처 결정

| 결정 | 이유 | 대안 | 변경 가능성 |
|------|------|------|------------|
| Express + PostgreSQL | AWS Free Tier 적합, 단순, 확장 가능 | Fastify, Lambda+DynamoDB | 낮음 |
| Prisma ORM | TypeScript DX, migration 관리, 타입 안전 | Drizzle | 낮음 |
| 단일 레포 폴더 분리 | 초기 단순성, 모노레포 도구 불필요 | Turborepo | 중간 (DAU 증가 시) |
| AntBeanTransaction 레저 | 잔액 무결성, 이력 추적, 중복 방지 | balance 컬럼 직접 수정 | 낮음 |
| JWT stateless auth | 수평 확장 가능, 서버 메모리 무상태 | 세션 기반 | 낮음 |
| Docker naming: antbattle-* | Docker Desktop에서 프로젝트 식별 용이 | - | 낮음 |

---

## Phase 1: Auth + 유저 + AntBean 레저

**목표**: 회원가입(bcrypt, zod 검증, email+handle unique), 로그인(JWT), /api/auth/me, AntBean 레저 서비스, seed에 테스트 유저 2명

**상태**: 완료 (2026-06-20)

### 생성/수정 파일

**신규 생성**:
- `server/src/services/auth.service.ts` — 회원가입(bcrypt), 로그인(JWT), me 조회, passwordHash 제외 응답
- `server/src/services/ant-bean.service.ts` — 레저 기반 개미콩 (credit/debit/getBalance/grantBattleReward)
- `server/src/controllers/auth.controller.ts` — auth 라우트 핸들러
- `server/prisma/migrations/20260618020000_add_user_email/migration.sql` — email 컬럼 migration

**수정**:
- `server/prisma/schema.prisma` — User.email 필드 추가 (NOT NULL, UNIQUE)
- `server/prisma/seed.ts` — 테스트 유저 2명 추가 (bcrypt 해싱, 레저 기반 가입 보너스)
- `server/src/routes/auth.routes.ts` — signup/login/me 엔드포인트 구현 (zod 검증)
- `mobile/src/types/models.ts` — User.email 필드 추가
- `mobile/src/types/api.ts` — SignupRequest.email 필드 추가

### API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/auth/signup` | 불필요 | 회원가입 (email, nickname, handle, password) |
| POST | `/api/auth/login` | 불필요 | 로그인 (handle, password) → JWT 발급 |
| GET | `/api/auth/me` | 필요 | 현재 유저 정보 + antBeans 잔액 조회 |

### 검증 결과

| 항목 | 결과 |
|------|------|
| `tsc --noEmit` | 에러 없음 |
| `tsc` (빌드) | 성공, dist/ 생성 |
| 회원가입 API | 201 Created, passwordHash 미포함, antBeans: 500 (레저 기반) |
| 로그인 API | 200 OK, JWT 발급, antBeans 잔액 반환 |
| `/api/auth/me` (유효 토큰) | 200 OK, 유저 정보 + antBeans 반환 |
| `/api/auth/me` (토큰 없음) | 401, `UNAUTHORIZED` |
| `/api/auth/me` (잘못된 토큰) | 401, `Invalid or expired token` |
| 중복 email 가입 | 409, `이미 사용 중인 이메일입니다` |
| 중복 handle 가입 | 409, `이미 사용 중인 핸들입니다` |
| seed 재실행 | 테스트 유저 2명 생성 (password: test1234, bcrypt 해싱) |

### 보안 체크

- [x] 비밀번호 bcrypt 해싱 (10 rounds)
- [x] 응답에 passwordHash 미포함 (toSafeUser 함수)
- [x] JWT payload에 userId만 포함
- [x] email/handle unique constraint 기반 중복 방지
- [x] zod validation (email 형식, handle 영문/숫자/밑줄, 비밀번호 6자+)
- [x] 가입 보너스 개미콩은 AntBeanTransaction 레저 테이블에 signup_bonus로 기록

### Troubleshooting Notes

#### 2026-06-18: `prisma migrate dev` non-interactive 환경 에러

**증상**: User 모델에 required `email` 필드(unique)를 추가하고 migration 실행 시 에러

```
Error: Prisma Migrate has detected that the environment is non-interactive, which is not supported.
```

**원인**:
- `prisma migrate dev`와 `--create-only` 모두 interactive 프롬프트가 필요
- Claude Code CLI 환경이 non-interactive로 감지됨
- DB 상태(User 0건)와는 무관한 실행 환경 문제

**해결 방법**: 수동 migration 방식 사용
1. `prisma/migrations/20260618020000_add_user_email/migration.sql` 파일을 직접 작성
2. `npx prisma migrate deploy`로 적용 (non-interactive OK)
3. `npx prisma generate`로 Client 재생성

**Migration SQL 내용**:
```sql
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
```

**검증 결과**:

| 항목 | 결과 |
|------|------|
| `prisma migrate deploy` | 성공, migration 적용 완료 |
| DB 스키마 확인 | `email TEXT NOT NULL` 컬럼 존재 확인 |
| `prisma generate` | Prisma Client 재생성 완료 |
| `tsc --noEmit` | 에러 없음 |
| seed 재실행 | 불필요 (User 0건, Stock/AntItem 데이터 영향 없음) |

**향후 참고**: 이 프로젝트에서 `prisma migrate dev`는 사용 불가. migration은 항상 SQL 수동 작성 + `prisma migrate deploy` 방식으로 진행.

### Migrations

| Migration | 변경 내용 | 적용일 |
|-----------|----------|--------|
| `20260617165815_init` | 전체 스키마 초기 생성 (10 테이블) | 2026-06-18 |
| `20260618020000_add_user_email` | User.email 컬럼 추가 (NOT NULL, UNIQUE, INDEX) | 2026-06-18 |
