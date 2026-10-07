# Chef SaaS Platform — Frontend (React + Vite + Tailwind)

## ដំណើរការ
```bash
npm install
cp .env.example .env     # កំណត់ VITE_USE_MOCK=true (Mock) ឬ false (API ពិត)
npm run dev
npm run build
```
- `VITE_API_BASE_URL` ត្រូវបញ្ចប់ដោយ `/api/v1` (ពេល `VITE_USE_MOCK=false`)
- Mock Flags សាកល្បង (Console → `localStorage.setItem(key, value)`): `mock.dish=empty`, `mock.menuSet=empty`, `mock.event=empty`, `mock.vendor=empty`, `mock.dishDelete=fk`, `mock.menuSetDelete=fk`, `mock.togglePurchased=fail`, `mock.reportPdf=fail`, `mock.reportExcel=fail`, `mock.sub=expired`

## ឯកសារ
- `docs/ai/4_FRONTEND_PROGRESS.md` — ស្ថានភាព Epic, Test Checklist, Backend Gaps (#1–#142)
- `docs/ai/7_PENDING_BACKEND_9E.md` — Spec Backend សម្រាប់ US-44.1 (Fixed Dish)

## ស្ថានភាព
Epic 2 → 12 ✅ (Mock) · ⏸️ 9E រង់ចាំ Backend · ⬜ US-58 S3 Telegram, US-59 S2/CSV, Sub-category (Gap)
