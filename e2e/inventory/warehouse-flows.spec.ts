import { test, expect, type Page } from '@playwright/test'

test.describe('Paquete Rol Bodega - Flujos de Compra, Despacho y Ajuste (E2E)', () => {
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

  test('1. Bodega recibe mercancía de una orden de compra en tránsito y el stock sube', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')

    await page.goto('/inventory/purchases')
    await expect(page.locator('#main-content').getByText('Órdenes de Compra', { exact: true })).toBeVisible()

    // La OC-0001 seed está en tránsito y muestra "Recibir" para el producto 1
    await expect(page.locator('#main-content').getByText('OC-0001', { exact: true })).toBeVisible()
    const poCard = page.locator('#main-content').locator('div', { hasText: 'OC-0001' }).filter({ hasText: 'En tránsito' }).first()
    await expect(poCard.getByRole('button', { name: 'Recibir' }).first()).toBeVisible()

    await poCard.getByRole('button', { name: 'Recibir' }).first().click()

    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Recibir mercancía')).toBeVisible()

    await modal.locator('input[type="number"]').fill('20')
    await modal.locator('input[placeholder*="Notas"]').fill('Recepción E2E')
    await modal.getByRole('button', { name: 'Registrar entrada' }).click()

    // La entrada de 20 se refleja en el progreso de la OC
    await expect(page.locator('#main-content').getByText('Recibido: 20 / 60')).toBeVisible()
  })

  test('2. Ajuste manual sin motivo muestra el error obligatorio', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')

    await page.goto('/inventory/movements')
    await expect(page.getByText('Movimientos de Inventario')).toBeVisible()

    await page.getByRole('button', { name: 'Ajuste' }).click()
    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Registrar Ajuste')).toBeVisible()

    await modal.locator('ion-select').click()
    await page
      .locator('ion-select-popover ion-radio')
      .filter({ hasText: 'Cubierta UPVC Termoacústica 3 Capas 2.44m' })
      .click()

    await modal.locator('input[type="number"]').fill('30')

    // No se llena el motivo -> debe mostrar el error y NO guardar
    await modal.getByRole('button', { name: 'Registrar Ajuste' }).click()

    await expect(modal.getByText('El motivo del ajuste es obligatorio')).toBeVisible()
  })

  test('3. Ajuste manual con motivo obligatorio se guarda correctamente', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')

    await page.goto('/inventory/movements')
    await expect(page.getByText('Movimientos de Inventario')).toBeVisible()

    await page.getByRole('button', { name: 'Ajuste' }).click()
    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Registrar Ajuste')).toBeVisible()

    await modal.locator('ion-select').click()
    await page
      .locator('ion-select-popover ion-radio')
      .filter({ hasText: 'Cubierta UPVC Termoacústica 3 Capas 2.44m' })
      .click()

    // Ajuste a nuevo stock total 30
    await modal.locator('input[type="number"]').fill('30')
    await modal.locator('input[placeholder*="motivo"]').fill('Diferencia detectada en conteo físico')
    await modal.getByRole('button', { name: 'Registrar Ajuste' }).click()

    await expect(page.getByText('Movimiento registrado correctamente')).toBeVisible()
    await expect(page.getByText('Ajuste (anterior: 45)')).toBeVisible()
  })

  test('4. Bodega confirma el despacho físico de un pedido desde inventario', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')

    // El seed PED-0001 está en estado en_proceso con 20 unidades de la Cubierta (stock 45)
    await page.goto('/inventory/dispatches')
    await expect(page.locator('#main-content').getByText('Despachos por confirmar', { exact: true })).toBeVisible()

    await expect(page.locator('#main-content').getByText('PED-0001', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Confirmar despacho' }).first().click()

    // El pedido se mueve a "Despachos confirmados" y desaparece de los pendientes
    await expect(page.locator('#main-content').getByText('Despachos confirmados', { exact: true })).toBeVisible()
    const confirmed = page.locator('#main-content').locator('div', { hasText: 'PED-0001' }).filter({ hasText: 'Entregada' })
    await expect(confirmed.first()).toBeVisible()
    await expect(page.locator('#main-content').getByText('No hay pedidos pendientes de despacho.')).toBeVisible()
  })
})
