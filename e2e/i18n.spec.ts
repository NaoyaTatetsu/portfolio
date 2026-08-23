import { expect, test } from "@playwright/test";

test.describe("i18n", () => {
  // ルート / から /en への振り分けは public/_redirects で定義しており、
  // Cloudflare のエッジが 308 を返す。_redirects は Cloudflare 固有の
  // ファイルで astro preview は解釈しないため、この構成では検証できない。
  // e2e を wrangler dev 上で走らせるようにしたら再有効化する。
  test.skip("ルート / は /en にリダイレクトされる", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/en", { timeout: 10_000 });
  });

  test("日本語ページは日本語の文言で表示される", async ({ page }) => {
    await page.goto("/ja/profile");
    await expect(
      page
        .getByRole("heading", { name: "プロフィール" })
        .or(page.getByText("プロフィール").first()),
    ).toBeVisible();
  });

  test("言語切替で同じページの別ロケールに移動する", async ({ page }) => {
    await page.goto("/en/profile");

    await page.getByRole("button", { name: "Switch language" }).click();
    // 選択肢は絵文字ラベルのため、ドロップダウン内のリンクを直接指定する。
    // astro preview は末尾スラッシュ付き URL に正規化するため前方一致で拾う
    const jaLink = page.locator('[data-lang-list] a[href^="/ja/profile"]');
    await expect(jaLink).toBeVisible();
    await jaLink.click();

    await page.waitForURL(/\/ja\/profile\/?$/);
    await expect(page.getByText("プロフィール").first()).toBeVisible();
  });

  test("ロケール別のメタディスクリプションが出力される", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Naoya Tatetsu/,
    );

    await page.goto("/ja");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /立津尚也/,
    );
  });
});
