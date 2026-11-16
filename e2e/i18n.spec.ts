import { expect, test } from "@playwright/test";

test.describe("i18n", () => {
  test("ルート / はリダイレクトせずに日本語のトップを表示する", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(
      page.getByRole("link", { name: "プロフィール" }).first(),
    ).toHaveAttribute("href", "/ja/profile");
  });

  // /ja → / の 308 は public/_redirects（Cloudflare 固有）で返すため、
  // astro preview では検証できない。代わりに日本語トップへのリンクが / に向くことを見る
  test("日本語のトップへのリンクは / に向く", async ({ page }) => {
    await page.goto("/ja/profile");
    await expect(page.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );

    // 英語のトップの言語切替（en 以外の選択肢は ja だけ）
    await page.goto("/en");
    await expect(page.locator("[data-lang-list] a")).toHaveAttribute(
      "href",
      "/",
    );
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

    await page.goto("/");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /立津尚也/,
    );
  });

  test("タイトルに名前とページ名が入る", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("立津尚也のポートフォリオ");

    await page.goto("/ja/profile/");
    await expect(page).toHaveTitle("プロフィール | 立津尚也のポートフォリオ");
  });

  test("canonical と hreflang が対になるページを指す", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://p-jihyo.jp/",
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", "https://p-jihyo.jp/en/");

    await page.goto("/en/profile/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://p-jihyo.jp/en/profile/",
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="ja"]'),
    ).toHaveAttribute("href", "https://p-jihyo.jp/ja/profile/");
  });

  test("トップに人物の構造化データが出力される", async ({ page }) => {
    await page.goto("/");
    const json = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const person = JSON.parse(json ?? "{}");
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("立津尚也");
    expect(person.alternateName).toContain("Naoya Tatetsu");
  });
});
