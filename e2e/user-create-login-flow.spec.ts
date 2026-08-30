import { test, expect, type Page } from '@playwright/test'

const SEED_LOGINS: Record<string, string> = {
  'admin@test.com': 'Admin12345!',
  'ventas@test.com': 'Ventas12345!',
  'compras@test.com': 'Compras12345!',
  'bodega@test.com': 'Bodega12345!',
  'gerencia@test.com': 'Gerencia12345!',
}

test.describe('Creación de usuarios y login con contraseña temporal (E2E)', () => {
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

  const logoutAndReload = async (page: Page) => {
    await page.evaluate(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    })
    await page.reload()
  }

  const waitForToastGone = async (page: Page) => {
    await page
      .locator('ion-toast')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {})
    await expect(page.locator('ion-toast')).toHaveCount(0, { timeout: 10000 })
  }

  const createUser = async (
    page: Page,
    nombre: string,
    email: string,
    password: string,
    rolLabel: string,
  ) => {
    await page.getByRole('button', { name: 'Nuevo Usuario' }).click()
    const modal = page.locator('ion-modal')
    await expect(modal.getByText('Nuevo Usuario')).toBeVisible()

    await modal.locator('input').nth(0).fill(nombre)
    await modal.locator('input[type="email"]').fill(email)
    await modal.locator('input[type="password"]').fill(password)

    await modal.locator('ion-select').click()
    await page
      .locator('ion-select-popover ion-radio')
      .filter({ hasText: rolLabel })
      .click()

    await modal.getByRole('button', { name: 'Crear Usuario' }).click()
  }

  const getTokenRol = async (page: Page): Promise<string> => {
    const token = await page.evaluate(() => localStorage.getItem('accessToken'))
    if (!token) throw new Error('No hay accessToken')
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.rol as string
  }

  test('1. Crea un usuario (Bodega); entra con la contraseña temporal y su rol queda en el token', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')
    await expect(page).toHaveURL(/.*dashboard/)
    await page.goto('/users')

    const email = `bodega.e2e.${Date.now()}@test.com`
    await createUser(page, 'Bodega E2E', email, 'TempE2E123!', 'Bodega')

    // Aparece en la tabla con el chip del rol
    const row = page.locator(`tr:has-text("${email}")`)
    await expect(row.getByText('Bodega E2E')).toBeVisible()
    await expect(row.getByText('Bodega', { exact: true })).toBeVisible()

    // Persistencia en localStorage: password_hash definido y nunca en claro
    const stored = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) || '[]'),
      'abacubiertas_users',
    )
    const found = stored.find((u) => u.email === email)
    expect(found).toBeDefined()
    expect(found.rol).toBe('bodega')
    expect(found.activo).toBe(true)
    expect(found.password_hash).toBeDefined()
    expect(found.password_hash).not.toBe('TempE2E123!')
    await waitForToastGone(page)

    // Logout simulado y login con la contraseña temporal
    await logoutAndReload(page)
    await loginAs(page, email, 'TempE2E123!')

    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('.info-value', { hasText: 'Bodega E2E' })).toBeVisible()
    await expect(page.locator('.info-value', { hasText: email })).toBeVisible()
    expect(await getTokenRol(page)).toBe('bodega')
  })

  test('2. Crea usuarios de los 4 roles y todos entran con su contraseña temporal', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')
    await expect(page).toHaveURL(/.*dashboard/)
    await page.goto('/users')
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()

    const roles = [
      { value: 'ventas', label: 'Ventas' },
      { value: 'bodega', label: 'Bodega' },
      { value: 'compras', label: 'Compras' },
      { value: 'gerencia', label: 'Gerencia' },
    ]
    const ts = Date.now()

    // Crear uno por rol
    for (let i = 0; i < roles.length; i++) {
      const { value, label } = roles[i]
      const email = `rol.${value}.${ts}.${i}@test.com`
      await createUser(page, `Rol ${label}`, email, 'TempE2E123!', label)

      const row = page.locator(`tr:has-text("${email}")`)
      await expect(row.getByText(label, { exact: true })).toBeVisible()
      await waitForToastGone(page)
    }

    // Cada rol entra con su contraseña temporal y su rol queda en el token
    for (let i = 0; i < roles.length; i++) {
      const { value, label } = roles[i]
      const email = `rol.${value}.${ts}.${i}@test.com`

      await logoutAndReload(page)
      await loginAs(page, email, 'TempE2E123!')

      const landing = value === 'compras' ? /.*compras/ : /.*dashboard/
      await expect(page).toHaveURL(landing)
      expect(await getTokenRol(page)).toBe(value)
      if (value !== 'compras') {
        await expect(page.locator('.info-value', { hasText: `Rol ${label}` })).toBeVisible()
      }
    }
  })

  test('3. Valida los datos obligatorios del formulario de creación', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')
    await expect(page).toHaveURL(/.*dashboard/)
    await page.goto('/users')
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()

    await page.getByRole('button', { name: 'Nuevo Usuario' }).click()
    const modal = page.locator('ion-modal')
    await expect(modal.getByText('Nuevo Usuario')).toBeVisible()

    // Los campos required bloquean el submit nativo → se fuerza el submit
    // real del formulario (React handleSubmit) con noValidate.
    const submitModalForm = () =>
      modal
        .locator('form')
        .evaluate((form) => {
          const f = form as HTMLFormElement
          f.noValidate = true
          f.requestSubmit()
        })

    // Sin datos
    await submitModalForm()
    await expect(modal.getByText('Nombre y email son obligatorios')).toBeVisible()

    // Sin contraseña
    await modal.locator('input').nth(0).fill('Sin Clave')
    await modal.locator('input[type="email"]').fill('sin.clave.e2e@test.com')
    await submitModalForm()
    await expect(
      modal.getByText('La contraseña es obligatoria para nuevos usuarios'),
    ).toBeVisible()

    // Contraseña demasiado corta
    await modal.locator('input[type="password"]').fill('corta')
    await submitModalForm()
    await expect(
      modal.getByText('La contraseña debe tener al menos 8 caracteres'),
    ).toBeVisible()
  })

  test('4. Las cuentas seed migran y obtienen su password_hash (sin contraseña en claro)', async ({ page }) => {
    // Quitar password_hash de todas las cuentas para simular datos pre-migración
    await page.evaluate(() => {
      const key = 'abacubiertas_users'
      const users = JSON.parse(localStorage.getItem(key) || '[]')
      for (const u of users) delete u.password_hash
      localStorage.setItem(key, JSON.stringify(users))
    })

    // El login dispara la migración (backfill) en getUsersRaw
    await loginAs(page, 'admin@test.com', 'Admin12345!')
    await expect(page).toHaveURL(/.*dashboard/)

    const migrated = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) || '[]'),
      'abacubiertas_users',
    )
    for (const [seedEmail, seedPassword] of Object.entries(SEED_LOGINS)) {
      const user = migrated.find((u) => u.email === seedEmail)
      expect(user, `la cuenta seed ${seedEmail} debería existir`).toBeDefined()
      expect(user.password_hash, `${seedEmail} debería tener password_hash`).toBeDefined()
      expect(user.password_hash).not.toBe(seedPassword)
    }
  })
})