# 통계 화면 출석 수 계산 오류 해결 계획

## 메타데이터

- **이슈 번호**: #4
- **이슈 제목**: Bug: 통계 화면 출석 수 계산 오류
- **브랜치**: (미정)
- **시작일**: 2026-02-19
- **상태**: 🔄 진행 중

---

## 문제 분석

### 현재 문제점

**테스트 조건**: 2026년 2월 15일 (시작일 = 종료일)
- **총 출석 기록**: 68건
- **실제 출석 수**: 46명
- **차이**: 22건

### 원인 분석

#### 1. Prisma Schema 확인 ([prisma/schema.prisma:41](prisma/schema.prisma:41))
```prisma
status    String   // 출석 상태 (자유형태)
```
- `status`가 **String 타입**으로 정의됨 (Enum이 아님!)
- 즉, 제약조건 없이 어떤 문자열이든 저장 가능

#### 2. 출석 체크 페이지 저장 값 확인 ([src/app/attendance/page.tsx](src/app/attendance/page.tsx:346-374))
```typescript
// 출석 버튼 클릭 시
onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
// 결석 버튼 클릭 시
onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
```
- **대문자**로 저장: `'PRESENT'`, `'ABSENT'`

#### 3. 통계 API 필터링 로직 ([src/app/api/statistics/route.ts:53-58](src/app/api/statistics/route.ts:53-58))
```typescript
const presentCount = cls.students.reduce((sum: number, s: any) =>
  sum + s.attendances.filter((a: any) => a.status === 'PRESENT').length, 0
)
const absentCount = cls.students.reduce((sum: number, s: any) =>
  sum + s.attendances.filter((a: any) => a.status === 'ABSENT').length, 0
)
```
- `'PRESENT'`와 `'ABSENT'`만 필터링
- **다른 상태값이 있으면 카운트되지 않음!**

### 결론

68건 중 46건만 카운트된 이유:
- **68건** = 전체 출석 기록
- **46건** = PRESENT 또는 ABSENT 상태
- **22건** = 다른 상태값 (예: 소문자로 저장된 값, 빈 문자열, null 등)

---

## 실행 목록

### 1. 데이터 검증 🔍
- [x] 실제 데이터베이스에서 2/15 출석 기록의 status 값 확인
- [x] 어떤 상태값들이 실제로 저장되어 있는지 확인
- [x] 문제 분석: 데이터는 정확함 (PRESENT 46건 + ABSENT 22건 = 68건)
- [x] UI 개선: 출석/결석 건수를 명확하게 표시하도록 수정

### 2. Prisma Schema 개선 📝
- [ ] String 타입을 Enum으로 변경
- [ ] Enum 값 정의: `PRESENT`, `ABSENT`, `SICK` (병결)
- [ ] 마이그레이션 생성 및 실행

### 3. 데이터 마이그레이션 🔄
- [ ] 기존 데이터의 status 값 표준화
- [ ] 소문자/빈 값 등을 올바른 Enum 값으로 변환
- [ ] 데이터 무결성 확인

### 4. 통계 API 수정 🔧
- [ ] `src/app/api/statistics/route.ts` 수정
- [ ] 모든 상태값(PRESENT, ABSENT, SICK) 올바르게 카운트
- [ ] 통계 화면에 병결(SICK) 표시 추가

### 5. 통계 화면 UI 수정 🎨
- [ ] `src/app/statistics/page.tsx` 수정
- [ ] 출석/결석/병결 3가지 상태 표시
- [ ] 차트에 병결 데이터 추가
- [ ] 원형 차트에 3가지 상태 표시

### 6. 출석 체크 화면 개선 ✨ (선택사항)
- [ ] 병결 버튼 추가
- [ ] 3가지 상태(출석/결석/병결) 선택 가능

### 7. 테스트 ✅
- [ ] 기존 데이터로 통계 정확성 검증
- [ ] 새로운 출석 기록 생성 후 통계 확인
- [ ] 모든 상태값이 올바르게 카운트되는지 확인

### 8. 문서 업데이트 📚
- [ ] README.md에 출석 상태 설명 추가
- [ ] CLAUDE.md에 상태값 관련 내용 추가

---

## 상세 구현 내용

### Phase 1: 데이터 검증

```bash
# Prisma Studio로 데이터 확인
npm run db:studio

# 또는 직접 쿼리
npm run db:push  # 마이그레이션 후
```

확인해야 할 것:
- `status` 필드에 어떤 값들이 있는지?
- 중복된 값이 있는지? (예: 'present', 'PRESENT' 동시 존재)

### Phase 2: Schema 수정

**수정 전:**
```prisma
model Attendance {
  ...
  status    String   // 출석 상태 (자유형태)
  ...
}
```

**수정 후:**
```prisma
enum AttendanceStatus {
  PRESENT   // 출석
  ABSENT    // 결석
  SICK      // 병결
}

model Attendance {
  ...
  status    AttendanceStatus   @default(ABSENT)
  ...
}
```

### Phase 3: 데이터 마이그레이션

기존 데이터 정리 스크립트 필요:
- 소문자 → 대문자
- 빈 값/null → ABSENT (기본값)
- 기타 예외값 처리

### Phase 4: API 수정

현재 로직:
```typescript
const presentCount = ...filter(a => a.status === 'PRESENT').length
const absentCount = ...filter(a => a.status === 'ABSENT').length
```

수정 후:
```typescript
const presentCount = ...filter(a => a.status === 'PRESENT').length
const absentCount = ...filter(a => a.status === 'ABSENT').length
const sickCount = ...filter(a => a.status === 'SICK').length  // 추가
```

### Phase 5: UI 수정

**카드 추가:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>병결</CardTitle>
  </CardHeader>
  <CardContent>
    <div>{sickCount}건</div>
  </CardContent>
</Card>
```

**차트 수정:**
- 3가지 색상: 초록(출석), 빨강(결석), 노랑(병결)

---

## 주의사항

1. **데이터 백업**: 마이그레이션 전 반드시 데이터베이스 백업
2. **기존 데이터 호환성**: String → Enum 변경 시 기존 데이터 처리 필수
3. **API 응답 형식**: 변경 시 프론트엔드도 함께 수정
4. **테스트**: 실제 데이터로 검증 후 배포

---

## 진행 상황

- [ ] Phase 1: 데이터 검증
- [ ] Phase 2: Schema 수정
- [ ] Phase 3: 데이터 마이그레이션
- [ ] Phase 4: API 수정
- [ ] Phase 5: UI 수정
- [ ] Phase 6: 출석 체크 화면 개선 (선택)
- [ ] Phase 7: 테스트
- [ ] Phase 8: 문서 업데이트
