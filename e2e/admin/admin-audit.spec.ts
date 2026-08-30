import { test, expect } from '@playwright/test'

test.describe('Paquete Rol Administrador - Log de Auditoría y Desactivación de Usuarios (E2E)', () => {
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

  const createUser = async (
    page: import('@playwright/test').Page,
    nombre: string,
    email: string,
    rolLabel: string,
  ) => {
    await page.getByRole('button', { name: 'Nuevo Usuario' }).click()
    const modal = page.locator('ion-modal')
    await expect(modal.getByText('Nuevo Usuario')).toBeVisible()
    await modal.locator('input').nth(0).fill(nombre)
    await modal.locator('input[type="email"]').fill(email)
    await modal.locator('input[type="password"]').fill('TempE2E123!')
    await modal.locator('ion-select').click()
    await page.locator('ion-select-popover ion-radio').filter({ hasText: rolLabel }).click()
    await modal.getByRole('button', { name: 'Crear Usuario' }).click()
    const toast = page.locator('ion-toast')
    await expect(toast.first()).toBeAttached({ timeout: 10000 })
    await expect(toast).toHaveCount(0, { timeout: 10000 })
  }

  test('1. El administrador accede al registro de auditoría y ve el inicio de sesión', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/audit')
    await expect(page).toHaveURL(/.*audit/)
    await expect(page.getByText('Registro de Auditoría')).toBeVisible()

    // El login del admin quedó registrado (columna de detalle única)
    const table = page.locator('table.data-table')
    await expect(table.getByText('Inicio de sesión de Administrador ERP')).toBeVisible()
    await expect(table.getByText('admin@test.com')).toBeVisible()
  })

  test('2. Las acciones de usuarios y sistema quedan registradas en el log', async ({ page }) => {
    await loginAsAdmin(page)

    // Crear un usuario
    await page.goto('/users')
    const email = `audit.${Date.now()}@test.com`
    await createUser(page, 'Audit E2E', email, 'Ventas')

    // Desactivar y reactivar al usuario recién creado
    const row = page.locator(`tr:has-text("${email}")`)
    await row.locator('button[title*="Desactivar"]').click()
    await expect(row.locator('text=Inactivo')).toBeVisible()
    await row.locator('button[title*="Activar"]').click()
    await expect(row.locator('text=Activo')).toBeVisible()

    // Cambiar parámetros del sistema
    await page.goto('/settings')
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()
    const card = page.locator('ion-card').filter({ hasText: 'Parámetros por defecto' })
    await card.locator('ion-input input').nth(0).fill('40')
    await page.getByRole('button', { name: 'Guardar parámetros' }).click()
    await expect(page.locator('ion-toast')).toBeAttached({ timeout: 10000 })

    // Consultar el registro de auditoría
    await page.goto('/audit')
    await expect(page.getByText('Registro de Auditoría')).toBeVisible()
    const table = page.locator('table.data-table')
    await expect(table.getByText('Parámetros actualizados')).toBeVisible()
    await expect(table.getByText('Usuario activado')).toBeVisible()
    await expect(table.getByText('Usuario desactivado')).toBeVisible()
    await expect(table.getByText('Usuario creado')).toBeVisible()
    await expect(table.getByText('Inicio de sesión de Administrador ERP')).toBeVisible()
  })

  test('3. El log de auditoría persiste en abacubiertas_audit_log al recargar', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/settings')
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()
    const card = page.locator('ion-card').filter({ hasText: 'Parámetros por defecto' })
    await card.locator('ion-input input').nth(1).fill('55')
    await page.getByRole('button', { name: 'Guardar parámetros' }).click()
    await expect(page.locator('ion-toast')).toBeAttached({ timeout: 10000 })

    // El log guarda la acción en localStorage
    const stored = await page.evaluate(
      () => JSON.parse(localStorage.getItem('abacubiertas_audit_log') || '[]'),
    )
    expect(stored.length).toBeGreaterThan(0)
    expect(stored.map((e: { accion: string }) => e.accion)).toContain('settings_updated')

    // Tras recargar, la entrada sigue presente
    await page.reload()
    await page.goto('/audit')
    await expect(page.getByText('Registro de Auditoría')).toBeVisible()
    await expect(page.locator('table.data-table').getByText('Parámetros actualizados')).toBeVisible()
  })

  test('4. El administrador puede borrar el registro de auditoría', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Guardar parámetros' }).click()
    const toast = page.locator('ion-toast')
    await expect(toast.first()).toBeAttached({ timeout: 10000 })
    await expect(toast).toHaveCount(0, { timeout: 10000 })

    await page.goto('/audit')
    await expect(page.getByText('Registro de Auditoría')).toBeVisible()
    await expect(page.locator('table.data-table')).toBeVisible()

    await page.getByRole('button', { name: 'Borrar log' }).click()
    await expect(page.getByText('Log de auditoría borrado correctamente')).toBeVisible({
      timeout: 10000,
    })

    const stored = await page.evaluate(
      () => JSON.parse(localStorage.getItem('abacubiertas_audit_log') || '[]'),
    )
    expect(stored).toEqual([])
  })

  test('5. Gerencia puede consultar el log y gestionar usuarios (desactivar)', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('gerencia@test.com')
    await page.locator('input[type="password"]').fill('Gerencia12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)

    // Gerencia accede al registro de auditoría
    await page.goto('/audit')
    await expect(page).toHaveURL(/.*audit/)
    await expect(page.getByText('Registro de Auditoría')).toBeVisible()

    // Gerencia accede a /users y desactiva un usuario (CRUD completo)
    await page.goto('/users')
    await expect(page).toHaveURL(/.*users/)
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nuevo Usuario' })).toBeVisible()

    const row = page.locator('tr:has-text("ventas@test.com")')
    await expect(row).toBeVisible()
    await row.locator('button[title*="Desactivar"]').click()
    await expect(row.locator('text=Inactivo')).toBeVisible()
  })

  test('6. Roles no directivos son redirigidos de /audit y /users', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('ventas@test.com')
    await page.locator('input[type="password"]').fill('Ventas12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)

    await page.goto('/audit')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Registro de Auditoría')).not.toBeVisible()

    await page.goto('/users')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Administración de Usuarios')).not.toBeVisible()
  })
})
