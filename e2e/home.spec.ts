import { expect, test } from "@playwright/test";

test.describe("トップページ", () => {
  test("タイトルとアイコンが表示される", async ({ page }) => {
    await page.goto("/en");

    await expect(page).toHaveTitle("Tatetsu Portfolio");

    // メインアイコンが実際に読み込まれている(壊れた画像でない)こと
    const icon = page.getByAltText("dev icon");
    await expect(icon).toBeVisible();
    expect(
      await icon.evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
  });

  test("タイピングアニメーションが動く", async ({ page }) => {
    await page.goto("/en");

    // "I'm" は静的に出ていて、テキストが徐々にタイプされる
    const heading = page.getByRole("heading", { level: 2 });
    await expect(heading).toContainText("I'm");
    await expect(heading).toContainText(/Naoya Tatetsu|System Engineer/, {
      timeout: 10_000,
    });
  });

  test("軌道ナビに全リンクが揃っている", async ({ page }) => {
    await page.goto("/en");

    const nav = page.getByRole("navigation", { name: "Main" });
    // name は部分一致のため exact 指定("X" が "Experience" にもマッチする)
    for (const name of ["Profile", "Blog", "Experience", "Contact"]) {
      await expect(
        nav.getByRole("link", { name, exact: true }),
      ).toHaveAttribute("href", `/en/${name.toLowerCase()}`);
    }
    // 外部リンクは新しいタブで開く
    for (const name of ["X", "Instagram", "GitHub"]) {
      await expect(
        nav.getByRole("link", { name, exact: true }),
      ).toHaveAttribute("target", "_blank");
    }
  });
});
