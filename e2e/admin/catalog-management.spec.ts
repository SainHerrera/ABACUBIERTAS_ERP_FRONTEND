import { test, expect, type Locator, type Page } from '@playwright/test'

const MAIN = '#main-content'

// IonInput de Ionic 8: fill() no propaga su estado a React, así que se escribe el valor
// en el input nativo y se reemiten los eventos (input/ionInput/ionChange) que el
// componente traduce a onIonChange y actualiza el estado controlado.
const setIonInput = async (ionInput: Locator, value: string) => {
  const input = ionInput.locator('input').first()
  await input.evaluate((el, v) => {
    const inputEl = el as HTMLInputElement
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    nativeSetter?.call(inputEl, v)
    inputEl.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: v, inputType: 'insertText' }))
    const component = inputEl.closest('ion-input') as HTMLElement | null
    component?.dispatchEvent(new CustomEvent('ionInput', { bubbles: true, composed: true, detail: { value: v } }))
    component?.dispatchEvent(new CustomEvent('ionChange', { bubbles: true, composed: true, detail: { value: v } }))
  }, value)
  await expect(input).toHaveValue(value)
}

const pickSelect = async (page: Page, ionSelect: Locator, optionText: string) => {
  await ionSelect.click()
  await page.locator('ion-select-popover ion-radio').filter({ hasText: optionText }).click()
}

test.describe('Paquete Rol Administrador - Gestión de Catálogos (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
      localStorage.setItem('abacubiertas_mock_auth', '1')
    })
    await page.reload()
  })

  const loginAsAdmin = async (page: Page) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)
  }

  test('1. Admin recorre los 4 catálogos y ve los datos seed con ids UUID', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/inventory/providers')
    await expect(page.locator(MAIN).getByText('Proveedores', { exact: true })).toBeVisible()
    await expect(page.locator(MAIN).getByText('Aceros del Caribe S.A.S.', { exact: true })).toBeVisible()
    await expect(page.locator(MAIN).getByText('Plásticos & Cubiertas Polímeros', { exact: true })).toBeVisible()

    await page.goto('/inventory/products')
    await expect(page.locator(MAIN).getByText('Productos', { exact: true })).toBeVisible()
    await expect(page.locator(MAIN).getByText('Cubierta UPVC Termoacústica 3 Capas 2.44m', { exact: true })).toBeVisible()
    await expect(page.locator(MAIN).getByText('Caballete Articulado UPVC Blanco 1.05m', { exact: true })).toBeVisible()

    await page.goto('/inventory/movements')
    await expect(page.locator(MAIN).getByText('Movimientos de Inventario', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrada' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Salida' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ajuste' })).toBeVisible()

    await page.goto('/sales/customers')
    await expect(page.locator(MAIN).getByText('Clientes', { exact: true })).toBeVisible()
    await expect(page.locator(MAIN).getByText('Construcciones & Cubiertas Andinas S.A.S.', { exact: true })).toBeVisible()
  })

  test('2. Admin crea un proveedor y lo ve en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/inventory/providers')
    await page.getByRole('button', { name: 'Nuevo Proveedor' }).click()

    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Nuevo Proveedor')).toBeVisible()

    const inputs = modal.locator('ion-input')
    await setIonInput(inputs.nth(0), 'Metales Andinos E2E')
    await setIonInput(inputs.nth(1), '901234567-8')
    await setIonInput(inputs.nth(3), '3112223344')
    await setIonInput(inputs.nth(4), 'ventas@metalesandinos-e2e.co')
    await setIonInput(inputs.nth(6), 'Medellín')

    await modal.getByRole('button', { name: 'Crear Proveedor' }).click()

    await expect(page.locator('ion-toast').getByText('Proveedor creado correctamente')).toBeVisible({ timeout: 20000 })
    await expect(modal).toBeHidden()
    await expect(page.locator(MAIN).getByText('Metales Andinos E2E', { exact: true })).toBeVisible()
  })

  test('3. Admin crea un producto asignando proveedor y lo ve en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/inventory/products')
    await page.getByRole('button', { name: 'Nuevo Producto' }).click()

    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Nuevo Producto')).toBeVisible()

    const inputs = modal.locator('ion-input')
    await setIonInput(inputs.nth(0), 'Caballete Termoacústico E2E')
    await setIonInput(inputs.nth(2), '45000')
    await setIonInput(inputs.nth(3), '10')

    await pickSelect(page, modal.locator('ion-select').nth(1), 'Fijaciones & Tornillos Industriales')

    await modal.getByRole('button', { name: 'Crear Producto' }).click()

    await expect(page.locator('ion-toast').getByText('Producto creado correctamente')).toBeVisible({ timeout: 20000 })
    await expect(modal).toBeHidden()
    await expect(page.locator(MAIN).getByText('Caballete Termoacústico E2E', { exact: true })).toBeVisible()
  })

  test('4. Admin crea un cliente y lo ve en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/sales/customers')
    await page.getByRole('button', { name: 'Nuevo Cliente' }).click()

    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Nuevo Cliente')).toBeVisible()

    const inputs = modal.locator('ion-input')
    await setIonInput(inputs.nth(0), 'Constructora Urbana E2E')
    await setIonInput(inputs.nth(1), '900123456-7')
    await setIonInput(inputs.nth(4), 'proyectos@constructoraurbana-e2e.com')

    await modal.getByRole('button', { name: 'Crear Cliente' }).click()

    await expect(page.locator('ion-toast').getByText('Cliente creado correctamente')).toBeVisible({ timeout: 20000 })
    await expect(modal).toBeHidden()
    await expect(page.locator(MAIN).getByText('Constructora Urbana E2E', { exact: true })).toBeVisible()
  })

  test('5. Admin registra una entrada de inventario y la referencia aparece en la lista', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/inventory/movements')
    await page.getByRole('button', { name: 'Entrada' }).click()

    const modal = page.locator('ion-modal')
    await expect(modal.locator('ion-title').getByText('Registrar Entrada')).toBeVisible()

    await pickSelect(page, modal.locator('ion-select').first(), 'Cubierta UPVC Termoacústica 3 Capas 2.44m')

    const inputs = modal.locator('ion-input')
    await setIonInput(inputs.nth(0), '5')
    await setIonInput(inputs.nth(2), 'E2E-ENTRADA-001')
    await setIonInput(inputs.nth(3), 'Entrada prueba automatizada E2E')

    await modal.getByRole('button', { name: 'Registrar Entrada' }).click()

    await expect(page.locator('ion-toast').getByText('Movimiento registrado correctamente')).toBeVisible({ timeout: 20000 })
    await expect(modal).toBeHidden()
    await expect(page.locator(MAIN).getByText('E2E-ENTRADA-001', { exact: true })).toBeVisible()
  })
})