// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

// index.html 을 file:// URL 로 변환
const appUrl = pathToFileURL(
  path.join(__dirname, "..", "index.html")
).href;

// 각 테스트 전에 localStorage 를 비우고 깨끗한 상태로 시작
test.beforeEach(async ({ page }) => {
  await page.goto(appUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("초기 상태: 빈 목록과 안내 문구가 보인다", async ({ page }) => {
  await expect(page.locator(".empty")).toBeVisible();
  await expect(page.locator("#counter")).toHaveText(
    "남은 항목 0개 / 전체 0개"
  );
  await expect(page.locator("ul#list li")).toHaveCount(0);
});

test("아이템 추가 (버튼 클릭)", async ({ page }) => {
  await page.fill("#itemInput", "우유");
  await page.click("#addBtn");

  const items = page.locator("ul#list li");
  await expect(items).toHaveCount(1);
  await expect(items.first().locator(".label")).toHaveText("우유");
  await expect(page.locator("#counter")).toHaveText(
    "남은 항목 1개 / 전체 1개"
  );
  // 입력창은 비워지고 포커스 유지
  await expect(page.locator("#itemInput")).toHaveValue("");
});

test("아이템 추가 (Enter 키) + 여러 개 추가", async ({ page }) => {
  await page.fill("#itemInput", "계란");
  await page.press("#itemInput", "Enter");
  await page.fill("#itemInput", "빵");
  await page.press("#itemInput", "Enter");

  const items = page.locator("ul#list li");
  await expect(items).toHaveCount(2);
  await expect(items.nth(0).locator(".label")).toHaveText("계란");
  await expect(items.nth(1).locator(".label")).toHaveText("빵");
  await expect(page.locator("#counter")).toHaveText(
    "남은 항목 2개 / 전체 2개"
  );
});

test("공백만 입력하면 추가되지 않는다", async ({ page }) => {
  await page.fill("#itemInput", "   ");
  await page.click("#addBtn");
  await expect(page.locator("ul#list li")).toHaveCount(0);
});

test("체크(완료) 토글이 작동한다", async ({ page }) => {
  await page.fill("#itemInput", "사과");
  await page.click("#addBtn");

  const item = page.locator("ul#list li").first();
  await expect(item).not.toHaveClass(/done/);

  // 체크 동그라미 클릭 → 완료
  await item.locator(".check").click();
  await expect(item).toHaveClass(/done/);
  await expect(item.locator(".check")).toHaveText("✓");
  await expect(page.locator("#counter")).toHaveText(
    "남은 항목 0개 / 전체 1개"
  );

  // 다시 클릭 → 완료 해제
  await item.locator(".check").click();
  await expect(item).not.toHaveClass(/done/);
  await expect(page.locator("#counter")).toHaveText(
    "남은 항목 1개 / 전체 1개"
  );
});

test("라벨 클릭으로도 체크 토글이 된다", async ({ page }) => {
  await page.fill("#itemInput", "바나나");
  await page.click("#addBtn");

  const item = page.locator("ul#list li").first();
  await item.locator(".label").click();
  await expect(item).toHaveClass(/done/);
});

test("아이템 삭제가 작동한다", async ({ page }) => {
  await page.fill("#itemInput", "삭제될항목");
  await page.click("#addBtn");
  await page.fill("#itemInput", "남을항목");
  await page.click("#addBtn");

  let items = page.locator("ul#list li");
  await expect(items).toHaveCount(2);

  // 첫 번째 항목 삭제
  await items.nth(0).locator(".delete").click();

  items = page.locator("ul#list li");
  await expect(items).toHaveCount(1);
  await expect(items.first().locator(".label")).toHaveText("남을항목");
  await expect(page.locator("#counter")).toHaveText(
    "남은 항목 1개 / 전체 1개"
  );
});

test("'완료 항목 비우기'가 체크된 항목만 제거한다", async ({ page }) => {
  for (const name of ["A", "B", "C"]) {
    await page.fill("#itemInput", name);
    await page.click("#addBtn");
  }
  const items = page.locator("ul#list li");

  // A, C 체크
  await items.nth(0).locator(".check").click();
  await items.nth(2).locator(".check").click();

  await page.click("#clearDone");

  await expect(page.locator("ul#list li")).toHaveCount(1);
  await expect(page.locator("ul#list li .label")).toHaveText("B");
});

test("새로고침 후에도 localStorage 로 데이터가 유지된다", async ({ page }) => {
  await page.fill("#itemInput", "지속항목");
  await page.click("#addBtn");
  await page.locator("ul#list li").first().locator(".check").click();

  await page.reload();

  const item = page.locator("ul#list li").first();
  await expect(item.locator(".label")).toHaveText("지속항목");
  await expect(item).toHaveClass(/done/);
});
