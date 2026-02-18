# 로컬 개발 환경 Docker PostgreSQL 구축 계획

## 메타데이터

- **이슈 번호**: #2
- **이슈 제목**: 개선: 로컬 개발 환경에 Docker PostgreSQL 추가
- **브랜치**: feature/local-docker-postgresql
- **시작일**: 2026-02-15
- **상태**: 🔄 진행 중

---

## 문제 분석

### 현재 문제점
1. **데이터 분리 부족**: 로컬 개발과 프로덕션이 같은 Supabase 데이터베이스 사용
2. **테스트 데이터 관리 어려움**: 개발 중 자유로운 테스트 데이터 생성/삭제 불가
3. **프로덕션 데이터 위험**: 개발 중 실수로 실제 데이터를 삭제/수정할 위험
4. **개발 효율성 저하**: 안전하게 테스트하기 어려운 환경

### 해결 방안
Docker로 로컬 PostgreSQL 환경 구축하여 개발 데이터와 프로덕션 데이터 분리

---

## 실행 목록

### 1. Docker 환경 설정 ✅
- [x] `docker-compose.yml` 파일 작성
- [x] `.dockerignore` 파일 작성
- [x] `package.json`에 Docker 관련 스크립트 추가

### 2. 환경변수 설정 ✅
- [x] `.env.example` 파일 작성 (환경변수 템플릿)
- [x] `.env.local` 수정 (로컬 Docker DB 연결)
- [x] `.env.production` 수정 (Supabase 프로덕션 연결)
- [x] `prisma.config.ts` 수정 (.env.local 로드)
- [x] `.gitignore` 확인 (환경변수 파일 보안)

### 3. Prisma 설정 ✅
- [x] Prisma Schema 확인 (기존 설정 호환성 체크)
- [x] 마이그레이션 실행 (db:push)
- [ ] 시드(Seed) 데이터 스크립트 작성 (선택사항)

### 4. 개발 가이드 문서화 ✅
- [x] README.md에 Docker 사용법 추가
- [x] CLAUDE.md에 환경 설정 내용 업데이트
- [x] 로컬 개발 환경 설정 가이드 작성

### 5. 테스트 ✅
- [x] Docker 컨테이너 시작 테스트
- [x] 로컬 DB 연결 테스트
- [x] Prisma 마이그레이션 테스트
- [x] 개발 서버 실행 테스트
- [x] API 동작 테스트 (반 생성, 학생 생성, 출석 기록)
- [x] 데이터 조회 테스트

### 6. 문서 정리
- [ ] plan.md를 `plan_issue2_로컬_Docker_PostgreSQL_YYYYMMDD.md`로 백업
- [ ] Git 커밋 및 푸시
- [ ] PR(Pull Request) 생성

---

## 상세 구현 내용

### 1. Docker Compose 설정

**파일**: `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: church-attendance-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: church_attendance
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

**설명**:
- PostgreSQL 16 Alpine 이미지 사용 (가볍고 빠름)
- 포트 5432 매핑 (로컬에서 5432로 접근)
- 영구 저장소 볼륨 설정 (데이터 유지)
- 헬스체크 설정 (컨테이너 상태 모니터링)

### 2. 환경변수 설정

**`.env.local`** (로컬 개발용):
```bash
# Docker PostgreSQL (로컬 개발용)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/church_attendance"
```

**`.env.production`** (프로덕션용):
```bash
# Supabase (프로덕션용)
DATABASE_URL="postgresql://postgres.fmfmwjzxtimzwtutmwmu:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false"
```

**`.env.example`** (템플릿):
```bash
# 데이터베이스 연결 URL
DATABASE_URL="postgresql://user:password@host:port/database"

# 로컬 개발 (Docker)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/church_attendance"

# 프로덕션 (Supabase)
# DATABASE_URL="postgresql://postgres:password@host:port/postgres"
```

### 3. package.json 스크립트

**추가할 스크립트**:

```json
{
  "scripts": {
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f postgres",
    "docker:reset": "docker-compose down -v && docker-compose up -d",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "dev": "npm run docker:up && next dev"
  }
}
```

**스크립트 설명**:
- `docker:up`: Docker 컨테이너 시작
- `docker:down`: Docker 컨테이너 중지
- `docker:logs`: PostgreSQL 로그 확인
- `docker:reset`: 데이터베이스 초기화 (볼륨 삭제 후 재시작)
- `db:migrate`: Prisma 마이그레이션 실행
- `db:seed`: 시드 데이터 삽입
- `db:studio`: Prisma Studio 실행 (DB GUI)
- `dev`: Docker 시작 후 개발 서버 실행

### 4. .dockerignore

**파일**: `.dockerignore`

```
node_modules
.next
.git
.env.local
.env.production
*.md
```

### 5. 시드 데이터 (선택사항)

**파일**: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 테스트용 반 데이터 생성
  await prisma.class.createMany({
    data: [
      { name: '중1반', teacherName: '김선생님' },
      { name: '중2반', teacherName: '이선생님' },
      { name: '고1반', teacherName: '박선생님' },
    ]
  })

  // 테스트용 학생 데이터 생성
  const classes = await prisma.class.findMany()

  for (const cls of classes) {
    await prisma.student.createMany({
      data: [
        { name: '테스트학생1', classId: cls.id },
        { name: '테스트학생2', classId: cls.id },
      ]
    })
  }

  console.log('시드 데이터가 생성되었습니다.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## 개발 단계

### 단계 1: 기본 설정 ✅
1. Docker Compose 파일 작성
2. 환경변수 파일 설정
3. package.json 스크립트 추가

### 단계 2: 데이터베이스 설정
1. Docker 컨테이너 시작
2. Prisma 마이그레이션 실행
3. 테이블 생성 확인

### 단계 3: 테스트
1. 개발 서버 실행
2. API 동작 테스트
3. 데이터 생성/삭제 테스트

### 단계 4: 문서화
1. README.md 업데이트
2. 개발 가이드 작성
3. PR 생성

---

## 사용법 (구현 후)

### 개발 환경 시작

```bash
# 1. Docker 컨테이너 시작
npm run docker:up

# 2. 데이터베이스 마이그레이션
npm run db:migrate

# 3. 시드 데이터 삽입 (선택사항)
npm run db:seed

# 4. 개발 서버 시작
npm run dev
```

### 데이터베이스 관리

```bash
# Prisma Studio (DB GUI)
npm run db:studio

# 데이터베이스 초기화
npm run docker:reset
npm run db:migrate
npm run db:seed
```

### 컨테이너 관리

```bash
# 로그 확인
npm run docker:logs

# 컨테이너 중지
npm run docker:down

# 컨테이너 재시작
npm run docker:down && npm run docker:up
```

---

## 참고 사항

### 장점
- ✅ 로컬 개발 데이터와 프로덕션 데이터 완전 분리
- ✅ 자유로운 테스트 데이터 생성 및 삭제
- ✅ 프로덕션 데이터 안전성 확보
- ✅ 오프라인 개발 환경 지원
- ✅ 일관된 개발 환경 (팀 전체가 동일한 Docker 설정 사용)

### 주의사항
- `.env.local`과 `.env.production`을 혼동하지 않기
- 프로덕션 배포 시 `.env.production` 사용 확인
- Docker 볼륨 데이터 정기 백업 (로컬 개발 데이터 보존 필요 시)
- 포트 5432가 이미 사용 중인지 확인

### 트러블슈팅

**문제**: 컨테이너가 시작하지 않음
- **해결**: `npm run docker:logs`로 로그 확인, 포트 충돌 확인

**문제**: 데이터베이스 연결 실패
- **해결**: Docker 컨테이너 실행 중인지 확인, `DATABASE_URL` 확인

**문제**: 마이그레이션 실패
- **해결**: `npm run docker:reset`으로 데이터베이스 초기화

---

## 다음 단계

1. ✅ Docker Compose 설정 작성
2. ✅ 환경변수 파일 구성
3. ✅ package.json 스크립트 추가
4. ✅ 테스트 및 검증
5. ✅ 문서화
6. ✅ PR 생성 및 머지
