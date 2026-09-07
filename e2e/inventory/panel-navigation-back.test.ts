import { test, expect, type Page } from '@playwright/test'

test.describe('Panel Navigation Bug Fix - Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  const loginAs = async (page: Page, email: string, password: string) => {
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)
  }

  test('should allow navigation from panel to movements and back, with panel buttons still working', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')

    // Step 1: Verify on inventory dashboard
    await page.goto('/inventory')
    await expect(page.getByText('Panel de Inventario')).toBeVisible()

    // Step 2: Click "Movimientos" from dashboard header (first match = dashboard button)
    await page.getByRole('button', { name: 'Movimientos' }).first().click()
    await expect(page).toHaveURL(/.*\/inventory\/movements/)
    await expect(page.getByText('Movimientos de Inventario')).toBeVisible()

    // Step 3: Go back to inventory dashboard (this was the buggy flow)
    await page.goto('/inventory')
    await expect(page.getByText('Panel de Inventario')).toBeVisible()

    // Step 4: Verify panel buttons are still clickable and functional
    // Use .first() to get the dashboard header button (not sidebar)
    await page.getByRole('button', { name: 'Productos' }).first().click()
    await expect(page).toHaveURL(/.*\/inventory\/products/)

    // Go back to dashboard
    await page.goto('/inventory')
    await expect(page.getByText('Panel de Inventario')).toBeVisible()

    // Click "Proveedores" button from dashboard
    await page.getByRole('button', { name: 'Proveedores' }).first().click()
    await expect(page).toHaveURL(/.*\/inventory\/providers/)

    // Go back to dashboard
    await page.goto('/inventory')
    await expect(page.getByText('Panel de Inventario')).toBeVisible()

    // Click "Alertas de Stock" button from dashboard
    await page.getByRole('button', { name: 'Alertas de Stock' }).first().click()
    await expect(page).toHaveURL(/.*\/inventory\/alerts/)

    // Go back to dashboard - this is the critical test
    await page.goto('/inventory')
    await expect(page.getByText('Panel de Inventario')).toBeVisible()

    // Final verification: all panel buttons should be visible and functional
    await expect(page.getByRole('button', { name: 'Productos' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Movimientos' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Proveedores' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Alertas de Stock' }).first()).toBeVisible()
  })
})