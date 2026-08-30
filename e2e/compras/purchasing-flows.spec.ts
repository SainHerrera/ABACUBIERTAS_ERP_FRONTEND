import { test, expect, type Page } from '@playwright/test'

test.describe('Paquete Rol Compras - Flujos de Cotización, OC y Reporte (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  const loginAsCompras = async (page: Page) => {
    await page.locator('input[type="email"]').fill('compras@test.com')
    await page.locator('input[type="password"]').fill('Compras12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*compras/)
  }

  test('1. Compras selecciona el mejor proveedor de SOL-0002 y genera la OC', async ({ page }) => {
    await loginAsCompras(page)

    await page.goto('/compras/requests')
    await expect(page.locator('#main-content').getByText('Solicitudes de abastecimiento', { exact: true })).toBeVisible()

    // SOL-0002 tiene 2 cotizaciones sin seleccionar: se pueden elegir
    const quotation = page.getByTestId('quotation-COT-0004')
    await expect(quotation).toBeVisible()

    await page.getByTestId('select-COT-0004').click()
    await expect(page.getByTestId('selected-badge').first()).toBeVisible()

    // Generar la OC desde la cotización seleccionada
    await page.getByTestId('create-po').first().click()
    await expect(page.locator('ion-toast').getByText('Orden de compra generada')).toBeVisible()
  })

  test('2. La OC generada aparece "Enviada" y Compras la marca "En tránsito"', async ({ page }) => {
    await loginAsCompras(page)

    await page.goto('/compras/requests')
    await expect(page.locator('#main-content').getByText('Solicitudes de abastecimiento', { exact: true })).toBeVisible()
    await page.getByTestId('select-COT-0004').click()
    await page.getByTestId('create-po').first().click()
    await expect(page.locator('ion-toast').getByText('Orden de compra generada')).toBeVisible()

    await page.goto('/compras/purchase-orders')
    await expect(page.locator('#main-content').getByText(/OC-0003/)).toBeVisible()
    const ocCard = page.locator('#main-content').locator('div', { hasText: 'OC-0003' }).filter({ hasText: 'Enviada' }).first()
    await expect(ocCard).toBeVisible()

    await page.getByTestId('transit-OC-0003').click()
    const transitCard = page.locator('#main-content').locator('div', { hasText: 'OC-0003' }).filter({ hasText: 'En tránsito' }).first()
    await expect(transitCard).toBeVisible()
  })

  test('3. El reporte por proveedor muestra gasto y tiempos de entrega', async ({ page }) => {
    await loginAsCompras(page)

    await page.goto('/compras/report')
    await expect(page.locator('#main-content').getByText('Reporte por proveedor', { exact: true })).toBeVisible()

    // En el reporte de gasto aparece el proveedor de las OC seed (proveedor 2)
    await expect(page.getByTestId('expense-row').first()).toBeVisible()
    await expect(page.getByText('Plásticos & Cubiertas Polímeros', { exact: true }).first()).toBeVisible()

    // En tiempos de entrega aparece el proveedor con cotizaciones (Aceros del Caribe)
    await page.getByTestId('segment-delivery').click()
    await expect(page.getByTestId('delivery-row').first()).toBeVisible()
    await expect(page.getByText('Aceros del Caribe S.A.S.', { exact: true }).first()).toBeVisible()
  })
})
