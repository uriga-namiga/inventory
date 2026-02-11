# Vercel 배포 가이드

## 🚀 빠른 배포 방법

### 1️⃣ GitHub에 푸시 (추천)

```bash
# Git 저장소 초기화 (아직 안했다면)
git init
git add .
git commit -m "Initial commit: 재고관리 시스템"

# GitHub에 새 repository 만들고
git remote add origin https://github.com/your-username/inventory-management.git
git push -u origin main
```

### 2️⃣ Vercel에서 Import

1. https://vercel.com 접속
2. **"Add New"** → **"Project"** 클릭
3. **"Import Git Repository"** 선택
4. GitHub repository 선택
5. **"Deploy"** 클릭

자동으로 배포됩니다!

---

## ⚙️ 환경 변수 설정

배포 후 Vercel 대시보드에서:

1. 프로젝트 → **Settings** → **Environment Variables**
2. 아래 변수들 추가:

```env
# Prisma Postgres (이미 연결되어 있음)
DATABASE_URL=postgres://668ad223d8f8e1d062a05278cc8dc86adb47036c8132e7fb1abdd4d34953be48:sk_ElUfxjRcKwD3Ird_fngoT@db.prisma.io:5432/postgres?sslmode=require

POSTGRES_URL=postgres://668ad223d8f8e1d062a05278cc8dc86adb47036c8132e7fb1abdd4d34953be48:sk_ElUfxjRcKwD3Ird_fngoT@db.prisma.io:5432/postgres?sslmode=require

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dfl7aukvb
CLOUDINARY_API_KEY=323915878376984
CLOUDINARY_API_SECRET=OpVBqSrtC0UJCuGt_q7uNVh2tL4
```

3. **Save** 클릭
4. **Redeploy** (재배포)

---

## 🎯 CLI로 배포 (대안)

터미널에서 직접:

```bash
# Vercel 로그인 (처음 한 번만)
vercel login

# 배포
vercel --prod
```

프롬프트에서:
- Project name: 원하는 이름 입력
- Directory: Enter (현재 디렉토리)
- Override settings? No

---

## ✅ 배포 완료 후

배포가 완료되면:
1. Vercel이 URL 제공 (예: https://your-app.vercel.app)
2. 브라우저에서 접속
3. 제품 등록 테스트

데이터베이스는 이미 Vercel과 연결되어 있으므로 바로 작동합니다!

---

## 🔧 문제 해결

### 빌드 에러 발생시
- Vercel 대시보드 → Deployments → 실패한 배포 클릭
- Logs 확인
- 환경 변수 누락 확인

### 데이터베이스 연결 실패시
- Environment Variables에 `POSTGRES_URL` 확인
- Prisma Postgres가 Vercel 프로젝트에 연결되었는지 확인

### 이미지 업로드 실패시
- Cloudinary 환경 변수 확인
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`이 올바른지 확인
