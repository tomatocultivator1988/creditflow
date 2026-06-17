import { chromium } from "@playwright/test";
import { fileURLToPath } from "url";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();

// Listen for all requests/responses
page.on("response", (res) => {
  console.log(`[${res.status()}] ${res.url()}`);
});

page.on("console", (msg) => {
  console.log(`[console] ${msg.type()}: ${msg.text()}`);
});

page.on("pageerror", (err) => {
  console.log(`[pageerror] ${err.message}`);
});

console.log("1. Navigating to login page...");
await page.goto("https://jbvcredit.vercel.app/login", { waitUntil: "networkidle" });
console.log("2. Page loaded. Title:", await page.title());
console.log("3. URL:", page.url());

// Fill in credentials
await page.fill('input[type="email"]', "admin@jbvcredit.com");
await page.fill('input[type="password"]', "admin123");

console.log("4. Filled credentials, clicking Sign In...");

// Click and wait for navigation
await Promise.all([
  page.click('button[type="submit"]'),
  page.waitForURL("**/dashboard", { timeout: 15000 }).catch((e) => console.log("5. No redirect to dashboard:", e.message)),
]);

await page.waitForTimeout(2000);

console.log("6. After login URL:", page.url());
console.log("7. Page title:", await page.title());

// Check cookies
const cookies = await context.cookies();
console.log("8. Cookies:");
for (const c of cookies) {
  console.log(`   ${c.name}: ${c.value.substring(0, 40)}... (domain: ${c.domain}, httpOnly: ${c.httpOnly}, secure: ${c.secure}, sameSite: ${c.sameSite})`);
}

// Screenshot
await page.screenshot({ path: "login-result.png", fullPage: true });
console.log("9. Screenshot saved to login-result.png");

// Check session API
const sessionRes = await page.goto("https://jbvcredit.vercel.app/api/auth/session", { waitUntil: "networkidle" });
const sessionText = await page.evaluate(() => document.body.innerText);
console.log("10. Session API response:", sessionText);

await browser.close();
