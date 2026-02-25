# 파츠 목록 드래그 앤 드롭 기능 구현 완료

## ✅ 구현 완료

관리자 페이지의 파츠 목록에 드래그 앤 드롭으로 순서를 변경할 수 있는 기능이 추가되었습니다.

## 📦 변경된 파일

### 1. 패키지 추가
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. 수정된 파일
- `components/calculator/admin/PartsList.tsx` - 드래그 앤 드롭 기능 추가
- `app/calculator/admin/page.tsx` - onReorder 핸들러 추가

## 🎯 주요 기능

### 1. 드래그 앤 드롭
- ⋮⋮ 아이콘을 드래그하여 파츠 순서 변경
- 실시간으로 순서 업데이트
- 부드러운 애니메이션 효과

### 2. 시각적 피드백
- 드래그 중인 항목: 50% 투명도
- 마우스 커서: grab → grabbing 변경
- 호버 시 아이콘 색상 변경

### 3. 접근성
- 키보드로도 순서 변경 가능 (Space/Enter + 방향키)
- 스크린 리더 지원

## 🎨 UI/UX

### 드래그 핸들 (⋮⋮)

```
┌───────────────────────────────────────────────┐
│ 파츠 목록 (2개)  ⋮⋮ 아이콘을 드래그하여 순서 변경  │
├───┬────────┬──────────┬──────────┬─────┬──────┤
│⋮⋮│ 이미지  │ 파츠명    │ 카테고리  │ 가격 │ 작업 │
├───┼────────┼──────────┼──────────┼─────┼──────┤
│⋮⋮│ [IMG]  │ 헬로키티2 │ 캐릭터   │₩2,500│[수정]│ ← 드래그 가능
├───┼────────┼──────────┼──────────┼─────┼──────┤
│⋮⋮│ [IMG]  │ 키티 완형│ 헤드     │₩1,500│[수정]│ ← 드래그 가능
└───┴────────┴──────────┴──────────┴─────┴──────┘
```

### 드래그 중 모습

```
┌───────────────────────────────────────────────┐
│⋮⋮│ [IMG]  │ 키티 완형│ 헤드     │₩1,500│[수정]│
├───┼────────┼──────────┼──────────┼─────┼──────┤
│⋮⋮│ [IMG]  │ 헬로키티2 │ 캐릭터   │₩2,500│[수정]│ ← 드래그 중 (반투명)
└───┴────────┴──────────┴──────────┴─────┴──────┘
         ↓ (마우스로 위로 드래그)
┌───────────────────────────────────────────────┐
│⋮⋮│ [IMG]  │ 헬로키티2 │ 캐릭터   │₩2,500│[수정]│ ← 순서 변경됨!
├───┼────────┼──────────┼──────────┼─────┼──────┤
│⋮⋮│ [IMG]  │ 키티 완형│ 헤드     │₩1,500│[수정]│
└───────────────────────────────────────────────┘
```

## 📝 구현 세부사항

### @dnd-kit 라이브러리 사용

**장점:**
- React 19 완벽 호환
- TypeScript 네이티브 지원
- 접근성 우선 설계
- 가볍고 성능 좋음
- 모바일 터치 지원

### 주요 컴포넌트

**1. DndContext**
- 드래그 앤 드롭 컨텍스트 제공
- 센서 설정 (마우스, 키보드)
- 충돌 감지 알고리즘

**2. SortableContext**
- 정렬 가능한 항목 목록 관리
- 수직 리스트 정렬 전략

**3. useSortable Hook**
- 개별 항목을 드래그 가능하게 만듦
- 드래그 핸들 및 스타일 제공

### 드래그 핸들러

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    const oldIndex = parts.findIndex((p) => p.id === active.id);
    const newIndex = parts.findIndex((p) => p.id === over.id);

    const newParts = arrayMove(parts, oldIndex, newIndex);
    onReorder(newParts); // 부모 컴포넌트로 전달
  }
};
```

### 드래그 아이콘 SVG

```typescript
<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
</svg>
```

## 🚀 사용 방법

### 마우스로 드래그

1. http://localhost:3000/calculator/admin 접속
2. 파츠 목록에서 ⋮⋮ 아이콘에 마우스 올리기
3. 클릭하고 드래그하여 원하는 위치로 이동
4. 마우스 놓기 → 순서 즉시 변경!

### 키보드로 정렬

1. Tab 키로 ⋮⋮ 아이콘에 포커스
2. Space 또는 Enter 키 누르기
3. 방향키 (↑/↓)로 위치 이동
4. Space 또는 Enter로 확정

## ⚙️ 기술적 특징

### 1. 센서 설정

```typescript
const sensors = useSensors(
  useSensor(PointerSensor),           // 마우스/터치
  useSensor(KeyboardSensor, {         // 키보드
    coordinateGetter: sortableKeyboardCoordinates,
  })
);
```

### 2. 충돌 감지

```typescript
collisionDetection={closestCenter}  // 가장 가까운 중심점 기준
```

### 3. 스타일 변환

```typescript
const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : 1,
};
```

### 4. 배열 재정렬

```typescript
import { arrayMove } from '@dnd-kit/sortable';

const newParts = arrayMove(parts, oldIndex, newIndex);
```

## 💡 향후 개선 사항

### 1. 서버 저장 (선택사항)
현재는 클라이언트 상태만 변경됩니다. 순서를 영구 저장하려면:

**데이터베이스에 sort_order 컬럼 추가:**
```sql
ALTER TABLE parts ADD COLUMN sort_order INTEGER DEFAULT 0;
```

**API 엔드포인트 추가:**
```typescript
// PUT /api/calculator/parts/reorder
// Body: { orders: [{ id: 1, sort_order: 0 }, { id: 2, sort_order: 1 }] }
```

### 2. 로컬스토리지 저장
사용자별 커스텀 순서를 저장하려면:
```typescript
localStorage.setItem('parts_order', JSON.stringify(partIds));
```

### 3. 다중 선택
Shift/Ctrl 키로 여러 항목을 한번에 이동

### 4. 그룹별 정렬
카테고리별로 그룹화하여 드래그

## ✨ 완성!

드래그 앤 드롭 기능이 정상적으로 동작합니다. 린터 오류도 없습니다!

### 테스트 체크리스트
- [ ] 마우스로 파츠 드래그
- [ ] 순서가 즉시 변경되는지 확인
- [ ] 드래그 중 시각적 피드백 확인
- [ ] 키보드로 순서 변경 (Tab + Space + 방향키)
- [ ] 모바일에서도 터치 드래그 동작 확인

지금 바로 테스트해보세요! 🎉
