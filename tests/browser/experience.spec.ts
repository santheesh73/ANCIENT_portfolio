import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { projects } from "../../src/content/projects";

test("one canvas travels the frontier, armillary and project vault", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const backdrop = page.locator("[data-artwork]");
  await expect(backdrop).toHaveAttribute("data-artwork", "live", { timeout: 20000 });
  await expect(backdrop).toHaveAttribute("data-shot", "hero");
  const canvas = await page.locator(".world-canvas canvas").elementHandle();
  await page.getByRole("link", { name: "Enter the frontier" }).click();
  await expect(backdrop).toHaveAttribute("data-shot", "approach");
  await page.getByRole("link", { name: "Follow the road" }).click();
  await expect(backdrop).toHaveAttribute("data-shot", "observatory");
  await page.getByRole("link", { name: "Enter the chamber" }).click();
  await expect(backdrop).toHaveAttribute("data-shot", "philosophy");
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(
    page.getByText("The rings align to represent deterministic validation."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Vault", exact: true }).click();
  await expect(backdrop).toHaveAttribute("data-shot", "gallery");
  await page.locator("#gallery").getByRole("link", { name: "Next instrument" }).click();
  await expect(backdrop).toHaveAttribute("data-shot", "exhibit-minchal");
  expect(await canvas?.evaluate((node) => node.isConnected)).toBe(true);
  await page.locator("#exhibit-minchal").getByRole("link", { name: "Read case study" }).click();
  await expect(page).toHaveURL(/work\/minchal$/);
  expect(errors).toEqual([]);
});

test("WebGL fallback keeps keyboard navigation and contact usable", async ({ page }) => {
  await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
        return kind.startsWith("webgl") ? null : Reflect.apply(native, this, [kind, ...args]);
      },
    });
  });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await expect(page.locator("[data-artwork]")).toHaveAttribute("data-artwork", "still");
  await expect(page.getByRole("link", { name: "Email Santheesh" })).toHaveAttribute(
    "href",
    "mailto:santheesh737@gmail.com",
  );
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target }) => target) })),
  ).toEqual([]);
});

test("reduced motion and seven responsive widths retain project access", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Pause motion" })).toHaveCount(0);
  await expect(page.locator(".world-canvas canvas")).toHaveCount(0);
  for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 800 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  await page.setViewportSize({ width: 390, height: 780 });
  await page.getByRole("link", { name: "Vault", exact: true }).click();
  await expect(
    page.locator("#gallery").getByRole("link", { name: "Read case study" }),
  ).toHaveAttribute("href", "/work/pulse");
  await expect(
    page.locator("#exhibit-frontend-craft").getByRole("link", { name: "Read case study" }),
  ).toHaveAttribute("href", "/work/frontend-craft");
});

test("every project and internal page resolves", async ({ page, request }) => {
  await page.goto("/work");
  await expect(page.locator(".work-index li")).toHaveCount(7);
  for (const project of projects) {
    const response = await request.get("/work/" + project.slug);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(project.repository);
  }
  expect((await request.get("/about")).status()).toBe(200);
  expect((await request.get("/work/unavailable")).status()).toBe(404);
});

test("the scene falls back to a still after a WebGL context loss and can recover", async ({
  page,
}) => {
  await page.goto("/");
  const backdrop = page.locator("[data-artwork]");
  await expect(backdrop).toHaveAttribute("data-artwork", "live", { timeout: 20000 });
  const canvas = page.locator(".world-canvas canvas");
  await canvas.evaluate((element: HTMLCanvasElement) => {
    const extension = element.getContext("webgl2")?.getExtension("WEBGL_lose_context");
    if (!extension) throw new Error("The browser cannot simulate WebGL context loss.");
    element.addEventListener(
      "webglcontextlost",
      () => setTimeout(() => extension.restoreContext(), 1500),
      { once: true },
    );
    extension.loseContext();
  });
  await expect(backdrop).toHaveAttribute("data-artwork", "still");
  await expect(backdrop).toHaveAttribute("data-artwork", "live", { timeout: 20000 });
});
test("archive pages connect the exhibits, biography, and contact links", async ({ page }) => {
  await page.goto("/work");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation.getByRole("link", { name: "Work" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator(".archive-work-index li")).toHaveCount(7);
  await expect(page.locator(".archive-index-art img").first()).toBeVisible();
  await page
    .getByRole("link", { name: "Pulse Incident Management & On-Call Orchestration" })
    .click();
  await expect(page).toHaveURL(/work\/pulse$/);
  await navigation.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "Technical toolkit" })).toBeVisible();
  await page.getByRole("link", { name: "Get in touch" }).click();
  await expect(page).toHaveURL(/contact$/);
  await expect(navigation.getByRole("link", { name: "Contact" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("link", { name: "Email Santheesh" })).toHaveAttribute(
    "href",
    "mailto:santheesh737@gmail.com",
  );
  await expect(page.getByRole("link", { name: "santheesh73", exact: true })).toHaveAttribute(
    "href",
    "https://github.com/santheesh73",
  );
});
