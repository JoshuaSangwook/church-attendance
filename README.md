# 교회 청소년부 출석부

Next.js, Prisma, PostgreSQL로 구축된 교회 청소년부 출석 관리 시스템입니다. 반 관리, 학생 관리, 출석 체크, 통계 시각화 기능을 제공합니다.

## 기술 스택

- **프론트엔드**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts
- **백엔드**: Next.js API Routes, Prisma ORM
- **데이터베이스**: PostgreSQL
- **폼**: React Hook Form, Zod
- **배포**: Vercel

## 개발 환경 설정

### 1. Docker 시작 (로컬 데이터베이스)

이 프로젝트는 로컬 개발을 위해 Docker PostgreSQL을 사용합니다.

```bash
# Docker 컨테이너 시작
npm run docker:up

# Docker 컨테이너 중지
npm run docker:down

# Docker 로그 확인
npm run docker:logs

# 데이터베이스 초기화 (볼륨 삭제 후 재시작)
npm run docker:reset
```

### 2. 환경변수 설정

`.env.example` 파일을 참고하여 `.env.local` 파일을 생성합니다.

```bash
cp .env.example .env.local
```

`.env.local` 파일 내용:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/church_attendance"
```

### 3. 데이터베이스 마이그레이션

```bash
# Prisma 스키마를 데이터베이스에 적용
npm run db:push

# 또는 마이그레이션 파일 생성 및 적용
npm run db:migrate
```

### 4. 개발 서버 시작

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 데이터베이스 관리

```bash
# Prisma Studio 실행 (데이터베이스 GUI)
npm run db:studio

# 데이터베이스 스키마 변경사항 즉시 반영 (개발용)
npm run db:push

# 마이그레이션 생성 및 적용
npm run db:migrate
```

## 주요 기능

- **반 관리**: 반(클래스) 생성, 수정, 삭제
- **학생 관리**: 학생 생성, 수정, 삭제, 반 배정
- **출석 체크**: 날짜별 출석 기록 (출석/결석/병결)
- **통계 및 리포트**: 반별 출석률, 주별 추이, 시각화 차트

## 프로젝트 구조

```
church-attendance/
├── src/
│   ├── app/           # Next.js App Router 페이지 및 API 라우트
│   ├── components/    # React 컴포넌트 (ui/는 shadcn/ui)
│   └── lib/           # 유틸리티 (Prisma client, 헬퍼)
├── prisma/            # 데이터베이스 스키마 및 마이그레이션
├── public/            # 정적 에셋
└── [config files]     # Next.js, TypeScript, ESLint, Tailwind 설정
```

## 배포

이 프로젝트는 Vercel에 배포됩니다. 프로덕션 환경에서는 Supabase PostgreSQL을 사용합니다.

배포 시 `.env.production` 파일의 환경변수가 사용됩니다.

## 참고 문서

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
