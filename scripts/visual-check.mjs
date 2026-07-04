import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const errors = [];

async function checkPage({ width, height, isMobile, file }) {
  const page = await browser.newPage({ viewport: { width, height }, isMobile });
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${isMobile ? 'mobile' : 'desktop'}: ${msg.text()}`);
  });
  await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: file, fullPage: false });
  const canvasCount = await page.locator('canvas').count();
  const text = await page.locator('body').innerText();
  await page.close();
  return { canvasCount, text: text.slice(0, 240) };
}

async function loginAndCheck({ path, width, height, isMobile, file }) {
  const page = await browser.newPage({ viewport: { width, height }, isMobile });
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${isMobile ? 'mobile' : 'desktop'} ${path}: ${msg.text()}`);
  });
  const login = await page.request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'teste.visual@local.dev', senha: 'Teste1234' },
  });
  const payload = await login.json();
  await page.goto('http://localhost:4000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((token) => localStorage.setItem('token', token), payload.token);
  await page.goto(`http://localhost:4000${path}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: file, fullPage: false });
  const canvasCount = await page.locator('canvas').count();
  const text = await page.locator('body').innerText();
  await page.close();
  return { canvasCount, text: text.slice(0, 260) };
}

const desktop = await checkPage({ width: 1440, height: 1100, isMobile: false, file: 'visual-login-desktop.png' });
const mobile = await checkPage({ width: 390, height: 900, isMobile: true, file: 'visual-login-mobile.png' });
const inicio = await loginAndCheck({ path: '/inicio', width: 1440, height: 1100, isMobile: false, file: 'visual-inicio-desktop.png' });
const simuladorMobile = await loginAndCheck({ path: '/simulador', width: 390, height: 1100, isMobile: true, file: 'visual-simulador-mobile.png' });

await browser.close();

console.log(JSON.stringify({ desktop, mobile, inicio, simuladorMobile, errors }, null, 2));
