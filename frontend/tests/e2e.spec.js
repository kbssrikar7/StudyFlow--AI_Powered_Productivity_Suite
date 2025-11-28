import { test, expect } from '@playwright/test';

test('Login and Dashboard Verification', async ({ page }) => {
    // 1. Go to Login Page
    await page.goto('http://localhost:5173/login');

    // Check if default credentials are visible (optional, but good for verification)
    await expect(page.getByText('admin@admin.com')).toBeVisible();

    // 2. Fill Credentials
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin');

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Verify Redirect to Dashboard
    await expect(page).toHaveURL('http://localhost:5173/');

    // 5. Verify Dashboard Elements
    // Sidebar Logo
    await expect(page.getByAltText('Batman Logo')).toBeVisible();

    // Focus Timer Visibility
    await expect(page.getByText('Focus Timer')).toBeVisible();

    // Verify Global Background (by checking if the main container exists)
    // Note: Visual regression is better for opacity checks, but we can check existence
    const bgImage = page.locator('img[alt="Gotham Background"]');
    await expect(bgImage).toBeVisible();

    // Check Tabs
    await page.click('button:has-text("Objectives")');
    await expect(page.getByText('Task Board')).toBeVisible();

    await page.click('button:has-text("Intel")');
    await expect(page.getByText('Add New Snippet')).toBeVisible();

    await page.click('button:has-text("Alfred")');
    await expect(page.getByText('Your assistant')).toBeVisible();
});
