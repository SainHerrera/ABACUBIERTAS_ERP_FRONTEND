import { test, expect, type Page } from '@playwright/test'

test.describe('Paquete Rol Bodega - Inventario y Restricción de Ventas (E2E)', () => {
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
  }

  const getTokenRol = async (page: Page): Promise<string> => {
    const token = await page.evaluate(() => localStorage.getItem('accessToken'))
    if (!token) throw new Error('No hay accessToken')
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.rol as string
  }

  test('1. Bodega entra al sistema y su rol queda en el token', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('.info-value', { hasText: 'Encargado Bodega' })).toBeVisible()
    expect(await getTokenRol(page)).toBe('bodega')
  })

  test('2. Bodega consulta el catálogo de productos y ve el stock', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')
    await expect(page).toHaveURL(/.*dashboard/)

    await page.goto('/inventory/products')
    await expect(page.locator('#main-content').getByText('Productos', { exact: true })).toBeVisible()

    const table = page.locator('table.data-table')
    await expect(table).toBeVisible()
    await expect(table.getByRole('columnheader', { name: 'Stock', exact: true })).toBeVisible()
    // header + 5 productos seed
    await expect(table.locator('tr')).toHaveCount(6)
    await expect(table.getByText('Cubierta UPVC Termoacústica 3 Capas 2.44m')).toBeVisible()
  })

  test('3. Bodega puede crear un producto (gestión de inventario)', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')
    await expect(page).toHaveURL(/.*dashboard/)

    await page.goto('/inventory/products')
    await expect(page.locator('#main-content').getByText('Productos', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Nuevo Producto' }).click()
    const modal = page.locator('ion-modal')
    await expect(modal.getByText('Nuevo Producto')).toBeVisible()

    await modal.locator('input').nth(0).fill('Caballete Bodega E2E')
    // precio (primer number) y stock mínimo (segundo number)
    await modal.locator('input[type="number"]').nth(0).fill('30000')
    await modal.locator('input[type="number"]').nth(1).fill('10')
    await modal.getByRole('button', { name: 'Crear Producto' }).click()

    const row = page.locator('tr:has-text("Caballete Bodega E2E")')
    await expect(row).toBeVisible()
  })

  test('4. Bodega registra un movimiento de entrada', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')
    await expect(page).toHaveURL(/.*dashboard/)

    await page.goto('/inventory/movements')
    await expect(page.getByText('Movimientos de Inventario')).toBeVisible()

    await page.getByRole('button', { name: 'Entrada' }).click()
    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Registrar Entrada')).toBeVisible()

    await modal.locator('ion-select').click()
    await page
      .locator('ion-select-popover ion-radio')
      .filter({ hasText: 'Cubierta UPVC Termoacústica 3 Capas 2.44m' })
      .click()

    await modal.locator('input[type="number"]').fill('5')

    // El campo de referencia tiene placeholder "Factura, pedido, conteo físico..."
    await modal.locator('input[placeholder*="Factura"]').fill('RECIBO-E2E')

    await modal.getByRole('button', { name: 'Registrar Entrada' }).click()

    // El movimiento de entrada aparece en la tabla (referencia RECIBO-E2E)
    await expect(page.getByText('RECIBO-E2E')).toBeVisible()
  })

  test('5. Bodega NO ve la sección Ventas en el menú lateral', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')
    await expect(page).toHaveURL(/.*dashboard/)

    // El sidebar (ion-menu) condiciona el render de la sección Ventas por rol.
    // Al no estar Bodega en SALES_ROLES, la sección Ventas no aparece en el DOM.
    const menu = page.locator('ion-menu')
    await expect(menu).toBeVisible()
    await expect(page.getByText('Cotizaciones', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Pedidos', { exact: true })).toHaveCount(0)
    // El menú de inventario sí está presente
    await expect(page.getByText('Inventario', { exact: true })).toBeVisible()
  })

  test('6. Bodega es bloqueado de las rutas de ventas (cotizaciones y pedidos)', async ({ page }) => {
    await loginAs(page, 'bodega@test.com', 'Bodega12345!')
    await expect(page).toHaveURL(/.*dashboard/)

    await page.goto('/sales/quotations')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Panel Principal', { exact: true })).toBeVisible()

    await page.goto('/sales/orders')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Panel Principal', { exact: true })).toBeVisible()

    await page.goto('/sales/customers')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Panel Principal', { exact: true })).toBeVisible()
  })
})
