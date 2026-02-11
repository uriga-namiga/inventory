# 📦 재고관리 시스템

Next.js + Vercel Postgres + Cloudinary로 만든 전문 재고관리 프로그램입니다.

## ✨ 기능

- ✅ 제품 등록 (제품명, 사진, 구입가, 판매가, 링크)
- ✅ 마진율 자동 계산
- ✅ 제품 수정 및 삭제
- ✅ **클라우드 데이터베이스 (Vercel Postgres)** - 비활성 정지 없음!
- ✅ **전문 이미지 관리 (Cloudinary)** - 자동 최적화, CDN 지원
- ✅ 반응형 디자인 (웹, 모바일 모두 지원)
- ✅ 다크모드 지원

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 설정

자세한 설정 가이드는 [SETUP.md](SETUP.md)를 참고하세요.

**간단 요약:**
1. Vercel에 배포
2. Vercel Postgres 추가
3. Cloudinary 계정 생성
4. 환경 변수 설정

### 3. 로컬 개발

```bash
# Vercel 환경 변수 가져오기
vercel env pull .env.local

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres (PostgreSQL 512MB 무료)
- **Image Storage**: Cloudinary (25GB 무료)
- **Deployment**: Vercel

## 📊 무료 플랜으로 가능한 것

| 리소스 | 무료 용량 | 예상 가능량 |
|--------|----------|------------|
| **데이터베이스** | 512MB | 150만개 제품 |
| **이미지 저장소** | 25GB | 5만개 이미지 |
| **대역폭** | 25GB/월 | 충분한 트래픽 |

→ **개인/소상공인은 수년간 무료!**

## 📱 주요 기능

### 제품 등록
- 제품명, 사진, 구입가, 판매가, 링크 입력
- 마진율 자동 계산: `(판매가 - 구입가) / 구입가 × 100`
- 이미지 자동 압축 및 최적화

### 제품 관리
- 실시간 제품 목록 조회
- 수정/삭제 기능
- 마진율, 마진액 자동 표시

### 이미지 처리
- 카메라 직접 촬영 또는 갤러리에서 선택
- 자동 압축 (800px 최대 크기)
- Cloudinary CDN으로 빠른 로딩
- WebP 자동 변환 (용량 50% 절감)

## 🗄️ 데이터베이스 스키마

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
```

## 📝 API 엔드포인트

- `GET /api/products` - 전체 제품 목록
- `POST /api/products` - 제품 생성
- `GET /api/products/[id]` - 제품 상세
- `PUT /api/products/[id]` - 제품 수정
- `DELETE /api/products/[id]` - 제품 삭제
- `POST /api/upload` - 이미지 업로드 (Cloudinary)

## 🔧 문제 해결

문제가 발생하면 [SETUP.md](SETUP.md)의 **문제 해결** 섹션을 확인하세요.

## 📄 라이센스

MIT License
