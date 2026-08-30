import { test, expect, type Page } from '@playwright/test'

test.describe('Paquete Rol Bodega - Alertas de Stock y Solicitud de Abastecimiento (E2E)', () => {
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

  test('1. Bodega ve las alertas de stock bajo y genera una solicitud de abastecimiento a Compras', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')

    // Desde el Panel de Inventario existe el acceso a la página de alertas
    await expect(page.getByRole('button', { name: 'Alertas de Stock' }).first()).toBeVisible()
    await page.getByRole('button', { name: 'Alertas de Stock' }).first().click()
    await expect(page).toHaveURL(/.*inventory\/alerts/)

    await expect(page.locator('#main-content').getByText('Alertas de Stock Bajo', { exact: true })).toBeVisible()

    // El Tornillo (id 3) está en stock bajo y NO tiene solicitud seed -> puedo generar una
    const tornilloAlert = page
      .locator('#main-content')
      .locator('div', { hasText: 'Tornillo Autoperforante 2" Punta Broca con Arandela' })
      .first()
    await expect(tornilloAlert.getByRole('button', { name: 'Generar solicitud' })).toBeVisible()
    await tornilloAlert.getByRole('button', { name: 'Generar solicitud' }).click()

    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Solicitud de abastecimiento')).toBeVisible()

    await modal.locator('input[type="number"]').fill('10')
    await modal.locator('ion-item', { hasText: 'Observaciones para Compras' }).locator('input').fill('Reposición urgente de tornillería')
    await modal.getByRole('button', { name: 'Enviar a Compras' }).click()

    // Toast de confirmación
    await expect(page.getByText('Solicitud de abastecimiento enviada a Compras')).toBeVisible()

    // La solicitud aparece en la lista "Solicitudes de abastecimiento" con estado Pendiente
    await expect(page.locator('#main-content').getByText('Solicitudes de abastecimiento', { exact: true })).toBeVisible()
    await expect(page.locator('#main-content').getByText(/SOL-0003/).first()).toBeVisible()
    await expect(page.locator('#main-content').getByText('Pendiente').first()).toBeVisible()
  })

  test('2. Bodega consulta el kardex de un producto desde la alerta (historial de movimientos)', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')

    await page.goto('/inventory/alerts')
    await expect(page.locator('#main-content').getByText('Alertas de Stock Bajo', { exact: true })).toBeVisible()

    const perfilCard = page
      .locator('#main-content')
      .locator('div')
      .filter({ has: page.getByText('Perfil C 100x50x2mm 6m Galvanizado', { exact: true }) })
      .filter({ has: page.getByRole('button', { name: 'Kardex' }) })
      .last()
    await expect(perfilCard.getByRole('button', { name: 'Kardex' })).toBeVisible()
    await perfilCard.getByRole('button', { name: 'Kardex' }).click()

    // El kardex es la página de detalle del producto con su Historial de Movimientos
    await expect(page).toHaveURL(/inventory\/products\/2/)
    await expect(page.getByText('Perfil C 100x50x2mm 6m Galvanizado', { exact: true }).last()).toBeVisible()
    await expect(page.getByText('Historial de Movimientos', { exact: true })).toBeVisible()
  })
})
