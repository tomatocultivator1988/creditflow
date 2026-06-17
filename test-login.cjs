const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  page.on("response", (res) => {
    console.log(`[${res.status()}] ${res.url().substring(0, 100)}`);
  });

  page.on("pageerror", (err) => {
    console.log(`[pageerror] ${err.message}`);
  });

  console.log("1. Navigating to login page...");
  await page.goto("https://jbvcredit.vercel.app/login", { waitUntil: "networkidle" });
  console.log("2. URL:", page.url());

  await page.fill('input[type="email"]', "admin@jbvcredit.com");
  await page.fill('input[type="password"]', "admin123");
  console.log("3. Filled credentials, clicking Sign In...");

  try {
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForURL("**/dashboard", { timeout: 15000 }),
    ]);
    console.log("4. Redirected to dashboard!");
  } catch (e) {
    console.log("4. No redirect. Current URL:", page.url());
    const body = await page.evaluate(() => document.body.innerText);
    console.log("5. Page body:", body);
  }

  await page.waitForTimeout(2000);

  const cookies = await context.cookies();
  console.log("6. Cookies:");
  for (const c of cookies) {
    console.log(`   ${c.name}: ${c.value.substring(0, 50)}... (domain: ${c.domain}, httpOnly: ${c.httpOnly})`);
  }

  // Try to hit session API directly
  try {
    const sessionRes = await context.request.get("https://jbvcredit.vercel.app/api/auth/session");
    const body = await sessionRes.text();
    console.log("7. GET /api/auth/session:", body.substring(0, 200));
  } catch (e) {
    console.log("7. Session API error:", e.message);
  }

  await page.screenshot({ path: "login-result.png", fullPage: true });
  console.log("8. Screenshot saved");

  await browser.close();
})();
