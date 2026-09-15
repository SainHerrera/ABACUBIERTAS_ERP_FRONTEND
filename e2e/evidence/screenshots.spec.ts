import { test, expect, type Page } from '@playwright/test'
import path from 'node:path'
import { prepareE2E, setMockAuth, SEED_USERS } from '../helpers/mode'

const OUT_DIR = path.resolve(process.cwd(), 'evidencias')

const admin = SEED_USERS.find((u) => u.rol === 'admin')
const bodega = SEED_USERS.find((u) => u.rol === 'bodega')

if (!admin || !bodega) throw new Error('SEED_USERS no contiene roles admin/bodega')

let loggedIn = false

test.beforeAll(async () => {
  // Evidencia sobre datos reales del backend: reset + seed una sola vez.
  await prepareE2E()
})

const shot = async (page: Page, name: string) => {
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true })
}

const gotoPage = async (page: Page, route: string) => {
  await page.goto(route)
  await expect(page.locator('#main-content')).toBeVisible()
  await page.waitForTimeout(600)
}

const loginAs = async (page: Page, email: string, password: string) => {
  await setMockAuth(page)
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
  await expect(page).toHaveURL(/.*dashboard/)
}

const ensureLoggedIn = async (page: Page) => {
  if (!loggedIn) {
    await loginAs(page, admin.email, admin.password)
    loggedIn = true
  }
}

const modalShot = async (page: Page, trigger: string, name: string) => {
  const button = page.getByRole('button', { name: trigger })
  if ((await button.count()) === 0) return
  await button.click()
  const modal = page.locator('ion-modal').last()
  await modal.waitFor({ state: 'visible' })
  await shot(page, name)
  const close = modal.getByRole('button', { name: 'Cerrar' })
  if ((await close.count()) > 0) {
    await close.click()
    await expect(modal).toBeHidden()
  }
}

test('00. Pantalla de login', async ({ page }) => {
  await setMockAuth(page)
  await shot(page, '00-login.png')
})

test('01-15. Evidencia rol Administrador', async ({ page }) => {
  await ensureLoggedIn(page)
  await shot(page, '01-dashboard.png')

  await gotoPage(page, '/inventory/products')
  await shot(page, '02-productos.png')
  await modalShot(page, 'Nuevo Producto', '03-nuevo-producto.png')

  await gotoPage(page, '/inventory/movements')
  await shot(page, '04-movimientos.png')
  await modalShot(page, 'Entrada', '05-registrar-entrada.png')

  await gotoPage(page, '/inventory/providers')
  await shot(page, '06-proveedores.png')
  await modalShot(page, 'Nuevo Proveedor', '07-nuevo-proveedor.png')

  await gotoPage(page, '/sales/customers')
  await shot(page, '08-clientes.png')
  await modalShot(page, 'Nuevo Cliente', '09-nuevo-cliente.png')

  await gotoPage(page, '/sales/quotations')
  await shot(page, '10-cotizaciones.png')
  await modalShot(page, 'Nueva Cotización', '11-nueva-cotizacion.png')

  await gotoPage(page, '/sales/orders')
  await shot(page, '12-pedidos.png')

  await gotoPage(page, '/inventory/purchases')
  await shot(page, '13-ordenes-compra.png')

  await gotoPage(page, '/inventory/dispatches')
  await shot(page, '14-despachos.png')

  await gotoPage(page, '/inventory/alerts')
  await shot(page, '15-alertas-stock.png')

  await gotoPage(page, '/inventory')
  await shot(page, '16-panel-inventario.png')

  await gotoPage(page, '/settings')
  await shot(page, '17-settings.png')

  await gotoPage(page, '/users')
  await shot(page, '18-usuarios.png')
}, 300000)

test('19-22. Evidencia rol Bodega', async ({ page }) => {
  await loginAs(page, bodega.email, bodega.password)

  await gotoPage(page, '/inventory/products')
  await shot(page, '19-productos-bodega.png')

  await gotoPage(page, '/inventory/movements')
  await shot(page, '20-movimientos-bodega.png')

  await gotoPage(page, '/inventory/purchases')
  await shot(page, '21-ordenes-compra-bodega.png')

  await gotoPage(page, '/inventory/dispatches')
  await shot(page, '22-despachos-bodega.png')
}, 300000)