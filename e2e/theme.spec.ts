import { expect, test } from "@playwright/test";

test.describe("テーマ切替", () => {
  test("既定はダークモード", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("切替でライトモードになり、リロード後も維持される", async ({ page }) => {
    await page.goto("/en");

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveClass(/light/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "light",
    );

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("AWS アイコンはテーマに応じて画像が切り替わる", async ({ page }) => {
    await page.goto("/en/profile");

    const light = page.locator('img[src="/icons/aws.svg"]');
    const dark = page.locator('img[src="/icons/aws-dark.svg"]');

    // 既定(ダーク)では白文字版が表示される
    await expect(dark).toBeVisible();
    await expect(light).toBeHidden();

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(light).toBeVisible();
    await expect(dark).toBeHidden();
  });
});
