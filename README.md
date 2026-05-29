# 🛒 shopping-list-app

브라우저에서 바로 실행되는 간단한 쇼핑리스트 웹앱입니다. 별도 빌드나 서버 없이 [index.html](index.html)을 열기만 하면 됩니다.

## 기능
- ➕ **아이템 추가** — 입력창 + `추가` 버튼 또는 `Enter`
- ✅ **체크(완료) 토글** — 동그라미/라벨 클릭
- 🗑️ **삭제** — 각 항목의 `×` 버튼
- ⚡ **자동 추가** — 샘플 아이템을 하나씩 자동으로 추가하는 데모 버튼
- 🧹 **완료 항목 비우기**
- 💾 **localStorage 자동 저장** — 새로고침해도 목록 유지

## 실행
[index.html](index.html) 파일을 더블클릭하거나 브라우저로 엽니다.

## 테스트
[Playwright](https://playwright.dev) 기반 자동 테스트가 포함되어 있습니다.

```bash
npm install
npx playwright install chromium
npx playwright test
```

추가/삭제/체크/자동추가/localStorage 영속성 등 9개 시나리오를 검증합니다.
