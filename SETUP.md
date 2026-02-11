# 🚀 재고관리 시스템 설정 가이드

이 프로젝트는 **Vercel Postgres + Cloudinary**를 사용합니다.

## 📋 설정 순서

### 1️⃣ Vercel에 프로젝트 배포

```bash
# Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 프로젝트 배포
vercel
```

### 2️⃣ Vercel Postgres 추가

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 > **Storage** 탭
3. **Create Database** 클릭
4. **Postgres** 선택
5. 데이터베이스 이름 입력 후 생성
6. 환경 변수가 자동으로 추가됨

### 3️⃣ 데이터베이스 테이블 생성

Vercel 대시보드 > Storage > Postgres > **Query** 탭에서 실행:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  purchase_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  margin_rate DECIMAL(5, 2) NOT NULL,
  link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (선택사항, 성능 향상)
CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_created_at ON products(created_at DESC);
```

### 4️⃣ Cloudinary 설정

1. [Cloudinary](https://cloudinary.com) 무료 계정 생성
2. Dashboard 접속
3. **Cloud Name** 확인 (상단에 표시됨)
4. Settings > **Access Keys** 메뉴
5. API Key와 API Secret 확인

### 5️⃣ Cloudinary Upload Preset 생성

1. Settings > **Upload** 탭
2. **Add upload preset** 클릭
3. **Signing Mode**: Unsigned 선택
4. **Preset name** 입력 (예: `inventory_preset`)
5. 저장

### 6️⃣ 환경 변수 설정

Vercel 대시보드 > 프로젝트 > **Settings** > **Environment Variables**:

```env
# Vercel Postgres는 자동 설정됨

# Cloudinary 추가
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=inventory_preset
```

### 7️⃣ 재배포

환경 변수 추가 후 자동 재배포되거나, 수동 재배포:

```bash
vercel --prod
```

---

## 💻 로컬 개발 환경 설정

### 방법 1: Vercel CLI 사용 (추천)

```bash
# Vercel 프로젝트 링크
vercel link

# 환경 변수 가져오기
vercel env pull .env.local

# 개발 서버 실행
npm run dev
```

### 방법 2: 수동 설정

1. `.env.local.example`을 `.env.local`로 복사
2. Vercel 대시보드에서 환경 변수 복사
3. `.env.local`에 값 입력

```bash
cp .env.local.example .env.local
# .env.local 파일 수정
npm run dev
```

---

## ✅ 동작 확인

1. 브라우저에서 `http://localhost:3000` 접속
2. 제품 등록 폼에 데이터 입력
3. 이미지 업로드 (카메라 또는 갤러리)
4. 등록 버튼 클릭
5. 제품 목록에 표시되는지 확인

---

## 🔍 문제 해결

### 데이터베이스 연결 실패

```
Error: relation "products" does not exist
```

→ 테이블 생성 쿼리를 실행하지 않았음. 3️⃣ 단계 확인

### Cloudinary 업로드 실패

```
Error: Cloudinary 설정이 없습니다
```

→ 환경 변수 확인:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` 설정 확인
- Vercel 재배포 필요

### 이미지가 표시되지 않음

→ `next.config.ts`에 Cloudinary 도메인 추가 확인:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
    },
  ],
}
```

---

## 📊 무료 플랜 제한

### Vercel Postgres
- 저장소: **512MB**
- 예상 제품 수: **150만개** (충분!)

### Cloudinary
- 저장소: **25GB**
- 대역폭: **25GB/월**
- 예상 이미지 수: **5만개** (500KB/이미지 기준)

---

## 🎯 다음 단계

- [ ] 제품 카테고리 추가
- [ ] 검색/필터 기능
- [ ] 통계 대시보드
- [ ] 엑셀 내보내기
- [ ] 바코드 스캔 기능

문제가 있으면 이슈를 등록해주세요! 🙌
