# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code (claude.ai/code)를 위한 가이드를 제공합니다.

## 프로젝트 개요

Next.js 15, Prisma, SQLite로 구축된 교회 청소년부 출석 관리 시스템입니다. 반 관리, 학생 관리, 출석 체크, 통계 시각화 기능을 제공합니다.

## 주요 명령어

### 개발
```bash
npm run dev          # 개발 서버 시작 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run lint         # ESLint 실행
```

### 데이터베이스
```bash
npx prisma generate   # 스키마 변경 후 Prisma Client 생성
npx prisma migrate dev # 마이그레이션 생성 및 적용
npx prisma studio     # Prisma Studio로 데이터 조회/편집
npx prisma db push    # 스키마 변경사항 즉시 반영 (개발 전용)
```

### UI 컴포넌트 추가
```bash
npx shadcn@latest add [component-name]  # 새 shadcn/ui 컴포넌트 추가
```

## 아키텍처

### App Router 구조 (Next.js 15)
```
src/app/
├── page.tsx              # 4개 주요 기능으로의 네비게이션 대시보드
├── layout.tsx            # 루트 레이아웃 (한국어 설정, Geist 폰트)
├── globals.css           # Tailwind v4 스타일
├── classes/              # 반 관리 페이지
├── students/             # 학생 관리 페이지
├── attendance/           # 출석 체크 페이지
├── statistics/           # 통계 및 리포트 페이지
└── api/                  # API 라우트
    ├── classes/          # 반 CRUD
    ├── students/         # 학생 CRUD
    ├── attendance/       # 출석 체크
    └── statistics/       # 통계 생성
```

### 데이터베이스 스키마 (Prisma + SQLite)

**세 개의 주요 모델:**

1. **Class** - 반/그룹 (예: "중1반", "고1반")
   - 필드: id, name, teacherName, createdAt, updatedAt
   - 관계: hasMany Student
   - 위치: [prisma/schema.prisma](prisma/schema.prisma:14-21)

2. **Student** - 학생 기록
   - 필드: id, name, phone (선택), classId (FK), createdAt, updatedAt
   - 관계: belongsTo Class, hasMany Attendance
   - 연쇄 삭제: Class 삭제 시 모든 Student 삭제
   - 위치: [prisma/schema.prisma](prisma/schema.prisma:24-33)

3. **Attendance** - 출석 기록
   - 필드: id, studentId (FK), date, status, note, reason, createdAt, updatedAt
   - 관계: belongsTo Student
   - 연쇄 삭제: Student 삭제 시 모든 Attendance 기록 삭제
   - 유니크 제약조건: [studentId, date] 중복 기록 방지
   - 위치: [prisma/schema.prisma](prisma/schema.prisma:36-48)

### Prisma Client 싱글톤

위치: [src/lib/prisma.ts](src/lib/prisma.ts)

개발 환경에서 여러 Prisma Client 인스턴스 생성을 방지하기 위한 싱글톤 패턴 사용. 모든 API 라우트에서 이 파일의 `prisma`를 import해서 사용하세요.

### UI 컴포넌트 (shadcn/ui)

위치: [src/components/ui/](src/components/ui/)

"New York" 스타일 variant의 사전 구축된 컴포넌트:
- Button, Card, Input, Label, Table, Dialog, Form
- 모든 컴포넌트는 class-variance-authority 사용
- Tailwind v4 with OKLCH 색상 공간
- 다크 모드 지원 구성됨

### 스타일링

- **Tailwind CSS v4** with PostCSS
- **커스텀 CSS 변수** in [src/app/globals.css](src/app/globals.css) 테마용
- **반응형 디자인**: 모바일 퍼스트 with `md:` 브레이크포인트
- **한국어 인터페이스** (`lang="ko"`)
- **폰트**: Geist Sans, Geist Mono (next/font로 최적화)

## 페이지별 주요 기능

### 1. 대시보드 ([/](src/app/page.tsx))
- 카드 기반 네비게이션
- 한국어 인터페이스: "청소년부 출석부"
- /classes, /students, /attendance, /statistics 링크

### 2. 반 관리 ([/classes](src/app/classes/page.tsx))
- 반 CRUD 기능
- 담당 선생님 이름과 학생 수 표시
- API: [api/classes/route.ts](src/app/api/classes/route.ts)

### 3. 학생 관리 ([/students](src/app/students/page.tsx))
- 학생 CRUD 기능
- 학생을 반에 배정
- 학생 정보와 반 이름 표시
- API: [api/students/route.ts](src/app/api/students/route.ts)

### 4. 출석 체크 ([/attendance](src/app/attendance/page.tsx))
- 날짜별 출석 체크
- 출석 상태 기록 (출석/결석/병결)
- 유니크 제약조건으로 중복 기록 방지
- API: [api/attendance/route.ts](src/app/api/attendance/route.ts)

### 5. 통계 ([/statistics](src/app/statistics/page.tsx))
- 반별 출석률
- 날짜 범위 필터링
- Recharts를 사용한 시각화 차트:
  - 막대 그래프 (반별 출석)
  - 원형 차트 (전체 분포)
- API: [api/statistics/route.ts](src/app/api/statistics/route.ts)

## API 라우트 패턴

### REST API 구조

모든 API 라우트는 표준 패턴을 따름:

**GET** - 레코드 조회
**POST** - 레코드 생성 (Zod 검증 적용)
**PUT** - 레코드 수정
**DELETE** - 레코드 삭제

예시: [api/classes/[id]/route.ts](src/app/api/classes/[id]/route.ts)
- 동적 라우트가 개별 레코드 작업 처리
- JSON 응답 반환
- 사용자 facing 에러는 한국어 메시지

### 폼 검증

- **React Hook Form** 클라이언트 사이드 폼 상태 관리
- **Zod** 스키마 검증
- **@hookform/resolvers** 통합

## TypeScript 설정

- **Strict mode** 활성화
- **Path alias**: `@/*` → `src/*`
- `@/`로 src/からの 절대 import 사용
- 위치: [tsconfig.json](tsconfig.json)

## 개발 참고사항

### 데이터베이스 변경 워크플로우
1. [prisma/schema.prisma](prisma/schema.prisma) 수정
2. `npx prisma migrate dev --name [설명]` 실행
3. 또는 개발용: `npx prisma db push`
4. Prisma Client 자동 생성

### 새 기능 추가
1. `src/app/[feature]/page.tsx`에 페이지 생성
2. `src/app/api/[feature]/route.ts`에 API 라우트 생성
3. 필요시 대시보드에 링크 추가
4. 일관된 UI를 위해 shadcn/ui 컴포넌트 사용

### 에러 핸들링
- API 라우트는 적절한 HTTP 상태 코드 반환
- 사용자 facing 에러는 한국어 메시지
- 더 나은 UX를 위한 UI 로딩 상태

## 기술 스택

**프론트엔드**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts
**백엔드**: Next.js API Routes, Prisma ORM
**데이터베이스**: SQLite (개발용), PostgreSQL로 마이그레이션 용이
**폼**: React Hook Form, Zod
**아이콘**: Lucide React
**폰트**: Geist Sans, Geist Mono (next/font로 최적화)

## 프로젝트 구조 (상위 레벨)

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

## 중요한 컨텍스트

이것은 **교회 청소년부 출석 관리 시스템**으로 한국어 인터페이스입니다. 모든 사용자 facing 텍스트는 한국어로 작성해야 합니다. 시스템은 다음을 관리합니다:
- 담당 선생님이 배정된 반 (반)
- 반에 배정된 학생 (학생)
- 날짜별 출석 (출석) 추적
- 시각화된 통계 (통계)
