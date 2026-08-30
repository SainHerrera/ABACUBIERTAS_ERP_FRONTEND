import { test, expect, type Page } from '@playwright/test'

test.describe('Paquete Rol Compras - Acceso y Navegación (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  const loginAs = async (page: Page, email: string, password: string, expectedUrl: RegExp) => {
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(expectedUrl)
  }

  test('1. Compras aterriza en su panel dedicado /compras tras iniciar sesión', async ({ page }) => {
    await loginAs(page, 'compras@test.com', 'Compras12345!', /.*compras/)
    await expect(page.locator('#main-content').getByText('Panel de Compras', { exact: true })).toBeVisible()
  })

  test('2. Compras ve el menú del panel y puede navegar a solicitudes, órdenes y reporte', async ({ page }) => {
    await loginAs(page, 'compras@test.com', 'Compras12345!', /.*compras/)

    await expect(page.locator('#main-content').getByText('Solicitudes de abastecimiento', { exact: true })).toBeVisible()
    await expect(page.locator('#main-content').getByText('Órdenes de compra', { exact: true })).toBeVisible()

    await page.getByTestId('compras-menu-2').click()
    await expect(page).toHaveURL(/.*compras\/report/)
    await expect(page.locator('ion-title').filter({ hasText: 'Reporte por proveedor' })).toBeVisible()
  })

  test('3. Compras no puede acceder a páginas de Ventas (redirige a /dashboard)', async ({ page }) => {
    await loginAs(page, 'compras@test.com', 'Compras12345!', /.*compras/)

    await page.goto('/sales/quotations')
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('4. En las órdenes de compra Compras NO ve botón "Recibir" (solo Bodega registra entrada)', async ({ page }) => {
    await loginAs(page, 'compras@test.com', 'Compras12345!', /.*compras/)

    await page.goto('/compras/purchase-orders')
    await expect(page.locator('#main-content').getByText('Órdenes de compra', { exact: true })).toBeVisible()
    await expect(page.locator('#main-content').getByText(/OC-0001/)).toBeVisible()

    await expect(page.getByRole('button', { name: 'Recibir' })).toHaveCount(0)
  })
})
