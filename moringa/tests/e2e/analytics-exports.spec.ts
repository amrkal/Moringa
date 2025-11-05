import { test, expect, request, Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const ADMIN_PHONE = '+254712345678';
const ADMIN_PASSWORD = 'admin123';

async function apiLoginAndPrimeLocalStorage(page: Page) {
  const req = await request.newContext({ baseURL: 'http://localhost:8000/api/v1' });
  const res = await req.post('/auth/login', {
    data: { phone: ADMIN_PHONE, password: ADMIN_PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  const token = data.access_token;
  const user = data.user;
  // Prime localStorage before any page scripts run
  await page.addInitScript(([tok, usr]) => {
    localStorage.setItem('token', tok as string);
    localStorage.setItem('user', JSON.stringify(usr));
  }, [token, user]);
}

test('exports CSV and PDF from admin dashboard', async ({ page }) => {
  await apiLoginAndPrimeLocalStorage(page);
  await page.goto('/admin/dashboard');

  // Ensure analytics loads and buttons become enabled
  const exportCsv = page.getByRole('button', { name: 'Export CSV' });
  const exportPdf = page.getByRole('button', { name: 'Export PDF' });

  await expect(exportCsv).toBeVisible();
  await expect(exportPdf).toBeVisible();

  // Wait for data to load (buttons become enabled when dailySales has data)
  await expect(exportCsv).toBeEnabled({ timeout: 15000 });
  await expect(exportPdf).toBeEnabled({ timeout: 15000 });

  // Capture CSV download
  const [csvDownload] = await Promise.all([
    page.waitForEvent('download'),
    exportCsv.click(),
  ]);
  const csvFilename = await csvDownload.suggestedFilename();
  expect(csvFilename).toMatch(/sales-report-.*\.csv$/);

  // Verify CSV content includes expected header
  const csvTempPath = path.join(os.tmpdir(), `playwright-${Date.now()}-${csvFilename}`);
  await csvDownload.saveAs(csvTempPath);
  const csvContents = await fs.readFile(csvTempPath, 'utf-8');
  expect(csvContents).toContain('Date,Orders,Revenue');

  // Capture PDF download
  const [pdfDownload] = await Promise.all([
    page.waitForEvent('download'),
    exportPdf.click(),
  ]);
  const pdfFilename = await pdfDownload.suggestedFilename();
  expect(pdfFilename).toMatch(/sales-report-.*\.pdf$/);

  // Verify PDF is non-empty (basic sanity check)
  const pdfTempPath = path.join(os.tmpdir(), `playwright-${Date.now()}-${pdfFilename}`);
  await pdfDownload.saveAs(pdfTempPath);
  const pdfStat = await fs.stat(pdfTempPath);
  expect(pdfStat.size).toBeGreaterThan(500); // at least ~0.5KB
});
