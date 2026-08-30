import { test, expect } from '@playwright/test'

test.describe('Paquete Rol Administrador - Parámetros Generales del Sistema (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  const loginAsAdmin = async (page: import('@playwright/test').Page) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)
  }

  test('1. El administrador accede a los parámetros del sistema y ve los valores por defecto', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/settings')
    await expect(page).toHaveURL(/.*settings/)
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()

    // Valores seed por defecto cargados en los campos
    const card = page.locator('ion-card').filter({ hasText: 'Parámetros por defecto' })
    const inputs = card.locator('ion-input input')
    await expect(inputs).toHaveCount(2)
    await expect(inputs.nth(0)).toHaveValue('15')
    await expect(inputs.nth(1)).toHaveValue('30')

    // El catálogo inicial es visible
    await expect(page.getByText(/Productos:/)).toBeVisible()
    await expect(page.getByText(/Proveedores:/)).toBeVisible()
  })

  test('2. El administrador guarda parámetros y se persisten en abacubiertas_settings', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/settings')
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()

    const card = page.locator('ion-card').filter({ hasText: 'Parámetros por defecto' })
    const inputs = card.locator('ion-input input')
    await inputs.nth(0).fill('50')
    await inputs.nth(1).fill('35')

    await page.getByRole('button', { name: 'Guardar parámetros' }).click()

    // Verificar toast de éxito y esperar a que el guardado termine
    const toast = page.locator('ion-toast')
    await expect(toast.first()).toBeAttached({ timeout: 10000 })
    await expect(toast).toHaveCount(0, { timeout: 10000 })

    // Verificar persistencia en localStorage
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('abacubiertas_settings') || '{}'),
    )
    expect(stored.stockMinimoDefault).toBe(50)
    expect(stored.margenUtilidadDefault).toBe(35)
  })

  test('3. Los parámetros guardados persisten al recargar la página', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/settings')
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()

    const card = page.locator('ion-card').filter({ hasText: 'Parámetros por defecto' })
    const inputs = card.locator('ion-input input')
    await inputs.nth(0).fill('60')
    await inputs.nth(1).fill('45')
    await page.getByRole('button', { name: 'Guardar parámetros' }).click()
    await expect(page.locator('ion-toast')).toBeAttached({ timeout: 10000 })

    // Recargar y verificar que se mantienen
    await page.reload()
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()
    const reloadedCard = page.locator('ion-card').filter({ hasText: 'Parámetros por defecto' })
    const reloadedInputs = reloadedCard.locator('ion-input input')
    await expect(reloadedInputs.nth(0)).toHaveValue('60')
    await expect(reloadedInputs.nth(1)).toHaveValue('45')
  })

  test('4. Muestra el mensaje exacto al guardar un margen de utilidad inválido', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/settings')
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()

    const card = page.locator('ion-card').filter({ hasText: 'Parámetros por defecto' })
    const inputs = card.locator('ion-input input')
    await inputs.nth(1).fill('150')

    await page.getByRole('button', { name: 'Guardar parámetros' }).click()

    await expect(page.getByText('El margen de utilidad debe estar entre 0 y 100')).toBeVisible({
      timeout: 10000,
    })
  })

  test('5. Un usuario no administrador es redirigido al intentar acceder a /settings', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('ventas@test.com')
    await page.locator('input[type="password"]').fill('Ventas12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)

    await page.goto('/settings')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Parámetros Generales del Sistema')).not.toBeVisible()
  })

  test('6. Verifica la persistencia del catálogo inicial en abacubiertas_products y abacubiertas_providers', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/settings')
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()

    // El catálogo inicial seed ya está cargado por el StorageEngine
    const settings = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('abacubiertas_settings') || '{}'),
    )
    expect(settings.catalogoInicialCargado).toBe(true)

    const products = await page.evaluate(
      () => JSON.parse(localStorage.getItem('abacubiertas_products') || '[]').length,
    )
    const providers = await page.evaluate(
      () => JSON.parse(localStorage.getItem('abacubiertas_providers') || '[]').length,
    )
    expect(products).toBeGreaterThan(0)
    expect(providers).toBeGreaterThan(0)

    // El botón para cargar el catálogo inicial está presente
    await expect(page.getByRole('button', { name: 'Cargar catálogo inicial' })).toBeVisible()
  })
})
