import { expect, test } from "@playwright/test";

test.describe("プロフィールページ", () => {
  test("About カードとアイコンが表示される", async ({ page }) => {
    await page.goto("/en/profile");

    await expect(page.getByText("@p-jihyo")).toBeVisible();
    await expect(page.getByText("Naoya Tatetsu").first()).toBeVisible();

    // 全アイコン画像が実際に読み込まれていること
    // (devin.png が壊れた HTML だった問題のリグレッションテスト)
    const icons = page.locator('img[src^="/icons/"]:visible');
    const count = await icons.count();
    expect(count).toBeGreaterThan(10);
    for (let i = 0; i < count; i++) {
      const img = icons.nth(i);
      const [src, naturalWidth] = await img.evaluate(
        (el: HTMLImageElement) => [el.src, el.naturalWidth] as const,
      );
      expect(naturalWidth, `${src} が読み込めていない`).toBeGreaterThan(0);
    }
  });
});

test.describe("ブログ", () => {
  test("一覧から詳細ページに遷移できる", async ({ page }) => {
    await page.goto("/en/blog");

    const card = page.locator('a[href^="/en/blog/"]').first();
    await expect(card).toBeVisible();
    await card.click();

    await page.waitForURL(/\/en\/blog\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // frontmatter の日付(YYYY-MM-DD)が表示される
    await expect(page.getByText(/\d{4}-\d{2}-\d{2}/)).toBeVisible();
  });
});

test.describe("Experience ページ", () => {
  test("タイムラインが表示される", async ({ page }) => {
    await page.goto("/en/experience");
    await expect(page.getByText("FOURDIGIT, Inc.")).toBeVisible();
  });
});

test.describe("404", () => {
  test("存在しないページは 404 を表示する", async ({ page }) => {
    const response = await page.goto("/en/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByText("Page Not Found")).toBeVisible();
  });
});
