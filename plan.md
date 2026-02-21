# 출석 체크 시 추가 정보 입력 및 출석 일지 기능

## 메타데이터

- **이슈 번호**: #6 (새로 생성 예정)
- **이슈 제목**: Feature: 출석 체크 시 추가 정보 입력 및 출석 일지 기능
- **브랜치**: (미정)
- **시작일**: 2026-02-21
- **상태**: 🔄 계획 중

---

## 문제 분석

### 현재 상황
- 출석 체크: 출석/결석 2가지 상태만 저장
- 추가 정보(기도제목, 큐티, 결석 사유)를 입력할 방법이 없음
- 출석 이후의 내용을 확인할 수 없음

### 요구사항
1. 출석 체크 시 **기도제목/결석 사유** 입력
2. **큐티 완료 여부** 체크
3. 통계 화면 하단에 **출석 일지** 테이블로 내용 표시

---

## 실행 목록

### 1. Prisma Schema 수정 📝
- [ ] Attendance 모델에 필드 추가
  - `note`: String? (기도제목/결석 사유 통합)
  - `isQuietTimeDone`: Boolean? (큐티 완료 여부)
- [ ] 마이그레이션 생성 및 실행

### 2. 출석 체크 화면 수정 🎨
- [ ] 학생별로 입력 필드 추가
  - Note 입력 (기도제목/결석 사유)
  - 큐티 완료 체크박스
- [ ] UI 개선 (입력 필드 배치 최적화)
- [ ] 저장 로직 수정

### 3. API 수정 🔧
- [ ] 출석 체크 API에 추가 필드 처리
- [ ] 출석 일지 조회 API 생성

### 4. 통계 화면에 출석 일지 추가 📊
- [ ] 화면 최하단에 카드 추가
- [ ] 출석 일지 테이블 렌더링
- [ - 날짜, 학생명, 반, 내용(Note), 큐티 표시
- [ ] 기간 필터 적용

### 5. 테스트 ✅
- [ ] 출석 체크 시 추가 정보 저장 확인
- [ ] 출석 일지 데이터 정확성 확인
- [ ] 기간 필터 동작 확인

---

## 상세 구현 내용

### Phase 1: Prisma Schema 수정

**변경 전:**
```prisma
model Attendance {
  id        Int      @id @default(autoincrement())
  studentId Int
  student   Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date      DateTime
  status    String
  note      String?  // 사유 (선택)
  reason    String?  // 결석/병결 사유
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([studentId, date])
}
```

**변경 후:**
```prisma
model Attendance {
  id              Int      @id @default(autoincrement())
  studentId       Int
  student         Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date            DateTime
  status          String

  // 추가 필드
  note            String?  // 기도제목 또는 결석 사유 (통합)
  isQuietTimeDone Boolean? @default(false) // 큐티 완료 여부

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([studentId, date])
}
```

### Phase 2: 출석 체크 화면 UI

**UI 구성:**
```
┌─────────────────────────────────────────────┐
│  철수 (중1반)                               │
│  ┌──────────┬──────────┐                    │
│  │  ✓ 출석 │  ✗ 결석 │                    │
│  └──────────┴──────────┘                    │
│                                            │
│  Note (기도제목/결석사유)                  │
│  ┌──────────────────────────────────────┐  │
│  │ __________________________________  │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  [☐] 큐티 완료                             │
└─────────────────────────────────────────────┘
```

### Phase 3: 출석 일지 UI (통계 화면 하단)

**위치:** 통계 화면 최하단

**UI 구성:**
```
┌────────────────────────────────────────────────────────────────┐
│  출석 일지                                                      │
├────────────────────────────────────────────────────────────────┤
│  날짜    │ 학생  │ 반   │ 내용              │ 큐티        │
├──────────┼───────┼──────┼───────────────────┼─────────────┤
│  2/15    │ 철수  │ 중1반│ 시험 잘 볼 수 있 │ ✓          │
│          │       │      │ 도록             │             │
├──────────┼───────┼──────┼───────────────────┼─────────────┤
│  2/15    │ 민지  │ 중2반│                  │ ✗          │
│          │       │      │                  │             │
├──────────┼───────┼──────┼───────────────────┼─────────────┤
│  2/15    │ 영희  │ 중1반│ 몸살             │ -           │
│          │       │      │ (결석)           │             │
└──────────┴───────┴──────┴───────────────────┴─────────────┘
```

**표시 규칙:**
- **출석 (PRESENT)**: Note 표시, 큐티 완료 여부 ✓/✗
- **결석 (ABSENT)**: Note (결석 사유) 표시, 큐티는 "-" 표시
- **정렬**: 날짜 내림차순, 학생명 오름차순

### Phase 4: API 명세

**출석 체크 API 수정**
```typescript
// POST /api/attendance
{
  "studentId": 1,
  "date": "2026-02-15",
  "status": "PRESENT",
  "note": "시험 잘 볼 수 있도록", // 추가
  "isQuietTimeDone": true          // 추가
}
```

**출석 일지 조회 API**
```typescript
// GET /api/attendance/daily?startDate=2026-02-01&endDate=2026-02-28
{
  "logs": [
    {
      "date": "2026-02-15",
      "studentName": "철수",
      "className": "중1반",
      "status": "PRESENT",
      "note": "시험 잘 볼 수 있도록",
      "isQuietTimeDone": true
    },
    ...
  ]
}
```

---

## 주의사항

1. **기존 데이터 호환성**
   - `note`, `reason` 필드를 하나의 `note` 필드로 통합
   - 기존 `reason` 필드의 데이터를 `note`로 마이그레이션

2. **UI 복잡도**
   - 학생이 많을 경우 입력 필드 관리 필요
   - collapsible/토글로 입력 필드 표시/숨김 고려

3. **성능**
   - 출석 일지 데이터가 많을 경우 페이지네이션 필요

---

## 진행 상황

- [ ] Phase 1: Prisma Schema 수정
- [ ] Phase 2: 출석 체크 화면 수정
- [ ] Phase 3: API 수정
- [ ] Phase 4: 통계 화면에 출석 일지 추가
- [ ] Phase 5: 테스트
