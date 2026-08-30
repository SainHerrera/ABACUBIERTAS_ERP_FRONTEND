import { test, expect, type Page } from '@playwright/test'

test.describe('Validación de contraseña en el login (E2E)', () => {
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

  const waitForToastGone = async (page: Page) => {
    await page
      .locator('ion-toast')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {})
    await expect(page.locator('ion-toast')).toHaveCount(0, { timeout: 10000 })
  }

  test('1. Rechaza el login con contraseña incorrecta (admin)', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'WrongPass123!')

    await expect(
      page.getByText('Credenciales incorrectas. Verifique su correo y contraseña.'),
    ).toBeVisible()
    await expect(page).toHaveURL(/.*login/)

    const token = await page.evaluate(() => localStorage.getItem('accessToken'))
    expect(token).toBeNull()
  })

  test('2. Rechaza el login con un correo inexistente', async ({ page }) => {
    await loginAs(page, 'nobody@test.com', 'SomePass123!')

    await expect(page.getByText('Credenciales incorrectas. Usuario no encontrado.')).toBeVisible()
    await expect(page).toHaveURL(/.*login/)

    const token = await page.evaluate(() => localStorage.getItem('accessToken'))
    expect(token).toBeNull()
  })

  test('3. El usuario seed de ventas inicia sesión con su contraseña', async ({ page }) => {
    await loginAs(page, 'ventas@test.com', 'Ventas12345!')

    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Panel Principal', { exact: true })).toBeVisible()
    await expect(page.locator('.info-value', { hasText: 'Asesor Comercial' })).toBeVisible()
    await expect(page.locator('.info-value', { hasText: 'ventas@test.com' })).toBeVisible()
  })

  test('4. Rechaza a un usuario seed con contraseña equivocada', async ({ page }) => {
    await loginAs(page, 'compras@test.com', 'WrongPass123!')

    await expect(
      page.getByText('Credenciales incorrectas. Verifique su correo y contraseña.'),
    ).toBeVisible()
    await expect(page).toHaveURL(/.*login/)
  })

  test('5. Un usuario desactivado no puede iniciar sesión; al reactivarlo sí', async ({ page }) => {
    // Login como admin y desactivar a compras@test.com
    await loginAs(page, 'admin@test.com', 'Admin12345!')
    await expect(page).toHaveURL(/.*dashboard/)

    await page.goto('/users')
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()

    const row = page.locator('tr:has-text("compras@test.com")')
    await row.locator('button[title*="Desactivar"]').click()
    await expect(row.locator('text=Inactivo')).toBeVisible()
    await waitForToastGone(page)

    // Simular logout
    await page.evaluate(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    })
    await page.reload()

    // El usuario desactivado no debe poder entrar
    await loginAs(page, 'compras@test.com', 'Compras12345!')
    await expect(
      page.getByText('El usuario se encuentra desactivado. Contacte al administrador.'),
    ).toBeVisible()
    await expect(page).toHaveURL(/.*login/)
    await waitForToastGone(page)

    // Reactivar como admin
    await loginAs(page, 'admin@test.com', 'Admin12345!')
    await expect(page).toHaveURL(/.*dashboard/)
    await page.goto('/users')

    const row2 = page.locator('tr:has-text("compras@test.com")')
    await row2.locator('button[title*="Activar"]').click()
    await expect(row2.locator('text=Activo')).toBeVisible()
    await waitForToastGone(page)

    // Simular logout de nuevo
    await page.evaluate(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    })
    await page.reload()

    // Ahora sí puede iniciar sesión
    await loginAs(page, 'compras@test.com', 'Compras12345!')
    await expect(page).toHaveURL(/.*compras/)
    await expect(page.getByText('Panel de Compras', { exact: true })).toBeVisible()
  })

  test('6. Campos vacíos muestran validación sin llamar al login', async ({ page }) => {
    // El navegador bloquea el submit por los campos required → con noValidate
    // se fuerza el flujo real del formulario (React handleSubmit).
    await page
      .locator('form')
      .evaluate((form) => {
        const f = form as HTMLFormElement
        f.noValidate = true
        f.requestSubmit()
      })

    await expect(page.getByText('Todos los campos son obligatorios')).toBeVisible()
    await expect(page).toHaveURL(/.*login/)

    const token = await page.evaluate(() => localStorage.getItem('accessToken'))
    expect(token).toBeNull()
  })
})