# 통계 화면 기간 설정에 조회 버튼 추가

## 메타데이터

- **이슈 번호**: #5
- **이슈 제목**: Improve: 통계 화면 기간 설정에 조회 버튼 추가
- **브랜치**: feature/statistics-fetch-button
- **시작일**: 2026-02-21
- **상태**: 🔄 진행 중

---

## 문제 분석

### 현재 문제점

1. **불필요한 API 호출**
   - 날짜 선택할 때마다 즉시 API 호출 발생
   - 시작일과 종료일을 각각 변경할 때마다 2번 호출됨

2. **사용자 경험 저하**
   - 사용자가 날짜를 입력하다가도 계속 요청이 감
   - 의도치 않은 불필요한 데이터 로딩

3. **서버 리소스 낭비**
   - 중간 과정의 불필요한 DB 쿼리 발생
   - 네트워크 리소스 낭비

### 현재 코드 분석

**src/app/statistics/page.tsx:42-45**
```typescript
useEffect(() => {
  fetchStatistics()
  fetchWeeklyStats()
}, [startDate, endDate])
```

- `startDate` 또는 `endDate`가 변경될 때마다 즉시 실행됨
- 사용자가 날짜 선택을 완료하기 전에도 API 호출 발생

---

## 실행 목록

### 1. 조회 버튼 UI 추가 🎨
- [x] 기간 설정 카드에 "조회" 버튼 추가
- [x] 버튼 스타일 적용 (shadcn/ui Button 컴포넌트)
- [x] 버튼 위치: 종료일 입력 필드 아래

### 2. 상태 관리 수정 📝
- [x] 자동 조회 로직 제거 (useEffect 의존성 변경)
- [x] 수동 조회 함수 생성
- [x] 초기 로딩 시에는 자동 조회 유지

### 3. 로딩 상태 개선 ✨
- [x] 조회 버튼에 로딩 상태 표시
- [x] 조회 중일 때 버튼 비활성화

### 4. 테스트 ✅
- [x] 날짜 변경 후 API가 호출되지 않는지 확인
- [x] 조회 버튼 클릭 시 API가 호출되는지 확인
- [x] 초기 로딩 시 자동 조회되는지 확인

---

## 상세 구현 내용

### Phase 1: UI 변경

**변경 전:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>기간 설정</CardTitle>
  </CardHeader>
  <CardContent>
    <Input type="date" value={startDate} onChange={...} />
    <Input type="date" value={endDate} onChange={...} />
  </CardContent>
</Card>
```

**변경 후:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>기간 설정</CardTitle>
  </CardHeader>
  <CardContent>
    <Input type="date" value={startDate} onChange={...} />
    <Input type="date" value={endDate} onChange={...} />
    <Button onClick={handleFetch} disabled={loading}>
      조회
    </Button>
  </CardContent>
</Card>
```

### Phase 2: 로직 변경

**변경 전:**
```typescript
useEffect(() => {
  fetchStatistics()
  fetchWeeklyStats()
}, [startDate, endDate])  // 날짜 변경 시 즉시 실행
```

**변경 후:**
```typescript
// 초기 로딩 시에만 자동 조회
useEffect(() => {
  fetchStatistics()
  fetchWeeklyStats()
}, [])  // 빈 의존성 배열

// 조회 버튼 클릭 핸들러
const handleFetch = () => {
  fetchStatistics()
  fetchWeeklyStats()
}
```

### Phase 3: UX 개선 (선택사항)

- 엔터키로 조회 가능
- 날짜 선택 후 자동 포커스를 조회 버튼으로 이동
- 마지막 조회 시간 표시

---

## 주의사항

1. **초기 로딩**: 페이지 진입 시에는 기본값으로 자동 조회되어야 함
2. **로딩 상태**: 조회 중일 때 중복 호출 방지
3. **날짜 유효성**: 시작일 > 종료일 경우 처리
4. **기존 UX 유지**: 현재 사용자들이 익숙한 흐름 최대한 유지

---

## 진행 상황

- [x] Phase 1: 조회 버튼 UI 추가
- [x] Phase 2: 상태 관리 수정
- [x] Phase 3: 로딩 상태 개선
- [x] Phase 4: 테스트
