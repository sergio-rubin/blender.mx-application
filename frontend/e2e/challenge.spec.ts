import { expect, test } from "@playwright/test";

const leads = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Carlos Ruiz",
    phone: "+523322222222",
    email: "carlos@example.com",
    created_at: "2026-10-22T19:15:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Ana López",
    phone: "+523311111111",
    email: "ana@example.com",
    created_at: "2026-10-21T17:00:00Z",
  },
];

test("presenta el departamento y registra un interesado", async ({ page }) => {
  await page.route("**/api/v1/auth/csrf/", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ csrfToken: "test-token" }) }),
  );
  await page.route("**/api/v1/leads/", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    expect(route.request().headers()["x-csrftoken"]).toBe("test-token");
    const body = route.request().postDataJSON();
    expect(body).toMatchObject({ name: "Ana López", email: "ana@example.com", privacy_consent: true });
    await new Promise((resolve) => setTimeout(resolve, 120));
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "Gracias, te contactaremos pronto" }),
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Departamento en Zapopan" })).toBeVisible();
  await expect(page.getByText("$3,450,000 MXN", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("2 recámaras", { exact: true })).toBeVisible();
  await expect(page.locator(".location-note .ui-button")).toHaveCSS("color", "rgb(255, 255, 255)");

  await page.getByRole("button", { name: /Me interesa/ }).first().click();
  await page.getByLabel("Nombre").fill("Ana López");
  await page.getByLabel("Teléfono").fill("33 1234 5678");
  await page.getByLabel("Correo electrónico").fill("correo-invalido");
  await page.getByLabel(/Acepto el aviso/).check();
  await page.getByRole("button", { name: /Enviar mis datos/ }).click();
  await expect(page.getByText("Escribe un correo válido.")).toBeVisible();

  await page.getByLabel("Correo electrónico").fill("ana@example.com");
  await page.getByRole("button", { name: /Enviar mis datos/ }).click();
  await expect(page.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("te contactaremos pronto");
});

test("cierra el formulario móvil al deslizar la manija hacia abajo", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "El gesto sólo existe en la hoja inferior móvil.");

  await page.goto("/");
  await page.locator(".mobile-cta").getByRole("button", { name: /Me interesa/ }).click();

  const sheet = page.getByRole("dialog");
  const handle = page.getByRole("button", { name: "Desliza hacia abajo para cerrar" });
  await expect(sheet).toBeVisible();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();

  const startX = box!.x + box!.width / 2;
  const startY = box!.y + box!.height / 2;
  await handle.dispatchEvent("pointerdown", {
    pointerId: 7,
    pointerType: "touch",
    button: 0,
    clientX: startX,
    clientY: startY,
  });
  await page.evaluate(({ x, y }) => {
    window.dispatchEvent(new PointerEvent("pointermove", {
      bubbles: true,
      pointerId: 7,
      pointerType: "touch",
      clientX: x,
      clientY: y + 130,
    }));
    window.dispatchEvent(new PointerEvent("pointerup", {
      bubbles: true,
      pointerId: 7,
      pointerType: "touch",
      clientX: x,
      clientY: y + 130,
    }));
  }, { x: startX, y: startY });

  await page.waitForTimeout(230);
  if (await sheet.count()) {
    const sheetTop = await sheet.evaluate((element) => element.getBoundingClientRect().top);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    expect(sheetTop).toBeGreaterThanOrEqual(viewportHeight - 1);
  }
  await expect(sheet).toBeHidden();
  await page.waitForTimeout(320);
  await expect(sheet).toBeHidden();
});

test("muestra interesados recientes y filtra por nombre", async ({ page }) => {
  await page.route("**/api/v1/auth/session/", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ authenticated: true, username: "reviewer" }) }),
  );
  await page.route("**/api/v1/leads/**", (route) => {
    const search = new URL(route.request().url()).searchParams.get("search")?.toLowerCase();
    const results = search ? leads.filter((lead) => lead.name.toLowerCase().includes(search)) : leads;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: results.length, next: null, previous: null, results }),
    });
  });

  await page.goto("/interesados");
  await expect(page.getByRole("heading", { name: "Interesados" })).toBeVisible();
  const visibleNames = page.locator(".lead-row strong");
  await expect(visibleNames).toHaveText(["Carlos Ruiz", "Ana López"]);

  await page.getByLabel("Buscar por nombre").fill("Ana");
  await expect(visibleNames).toHaveText(["Ana López"]);
});
