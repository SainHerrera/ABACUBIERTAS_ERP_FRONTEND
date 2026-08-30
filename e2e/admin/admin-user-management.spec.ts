import { test, expect } from '@playwright/test'

test.describe('Paquete Rol Administrador - Gestión de Usuarios (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  test('1. Inicia sesión exitosamente como Administrador', async ({ page }) => {
    await page.goto('/login')

    // Fill in admin credentials
    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')

    // Click submit button
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()

    // Should redirect to dashboard and display user info
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Panel Principal', { exact: true })).toBeVisible()
    await expect(page.locator('.info-value', { hasText: 'Administrador ERP' })).toBeVisible()
    await expect(page.locator('.info-value', { hasText: 'admin@test.com' })).toBeVisible()
  })

  test('2. Accede al panel de Administración de Usuarios desde el Sidebar o navegación', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)

    // Navigate to users
    await page.goto('/users')

    // Verify User Management page loads correctly
    await expect(page).toHaveURL(/.*users/)
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nuevo Usuario' })).toBeVisible()

    // Verify seed users are present in the table
    const table = page.locator('table.data-table')
    await expect(table.getByText('admin@test.com')).toBeVisible()
    await expect(table.getByText('ventas@test.com')).toBeVisible()
    await expect(table.getByText('compras@test.com')).toBeVisible()
  })

  test('3. Crea un nuevo usuario y verifica su persistencia en la tabla', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()

    // Navigate to users
    await page.goto('/users')
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()

    // Open "Nuevo Usuario" dialog
    await page.getByRole('button', { name: 'Nuevo Usuario' }).click()
    const modal = page.locator('ion-modal')
    await expect(modal.getByText('Nuevo Usuario')).toBeVisible()

    // Fill new user form
    await modal.locator('input').nth(0).fill('Laura Gerente E2E')
    await modal.locator('input[type="email"]').fill('laura.gerente@test.com')
    await modal.locator('input[type="password"]').fill('Password123!')

    // Submit user creation
    await modal.getByRole('button', { name: 'Crear Usuario' }).click()

    // Verify user appears in the table
    const table = page.locator('table.data-table')
    await expect(table.getByText('Laura Gerente E2E')).toBeVisible()
    await expect(table.getByText('laura.gerente@test.com')).toBeVisible()
  })

  test('4. Filtra usuarios por nombre mediante el buscador', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()

    await page.goto('/users')
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()

    // Search for "ventas"
    const searchbar = page.locator('ion-searchbar input')
    await searchbar.fill('ventas')

    const table = page.locator('table.data-table')
    // "ventas@test.com" should be visible in table, "admin@test.com" should not
    await expect(table.getByText('ventas@test.com')).toBeVisible()
    await expect(table.getByText('admin@test.com')).not.toBeVisible()

    // Clear search
    await searchbar.fill('')
    await expect(table.getByText('admin@test.com')).toBeVisible()
  })

  test('5. Desactiva y reactiva un usuario en tiempo real', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()

    await page.goto('/users')
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()

    // Locate the row for "Asesor Comercial" (ventas@test.com)
    const ventasRow = page.locator('tr:has-text("ventas@test.com")')
    await expect(ventasRow).toBeVisible()
    await expect(ventasRow.locator('text=Activo')).toBeVisible()

    // Click deactivate button on the row
    await ventasRow.locator('button[title*="Desactivar"]').click()

    // Verify status changed to Inactivo
    await expect(ventasRow.locator('text=Inactivo')).toBeVisible()

    // Reactivate user
    await ventasRow.locator('button[title*="Activar"]').click()
    await expect(ventasRow.locator('text=Activo')).toBeVisible()
  })

  test('6. Crea usuarios con rol asignado (Ventas/Bodega/Compras/Gerencia) y persiste en localStorage', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)

    await page.goto('/users')
    await expect(page.getByText('Administración de Usuarios')).toBeVisible()

    const roles: { value: string; label: string }[] = [
      { value: 'ventas', label: 'Ventas' },
      { value: 'bodega', label: 'Bodega' },
      { value: 'compras', label: 'Compras' },
      { value: 'gerencia', label: 'Gerencia' },
    ]

    for (let i = 0; i < roles.length; i++) {
      const { value, label } = roles[i]
      const nombre = `Usuario E2E ${label}`
      const email = `e2e.${value}.${Date.now()}.${i}@test.com`
      const password = 'TempE2E123!'

      await page.getByRole('button', { name: 'Nuevo Usuario' }).click()
      const modal = page.locator('ion-modal')
      await expect(modal.getByText('Nuevo Usuario')).toBeVisible()

      await modal.locator('input').nth(0).fill(nombre)
      await modal.locator('input[type="email"]').fill(email)
      await modal.locator('input[type="password"]').fill(password)

      // Select rol from the IonSelect popover
      await modal.locator('ion-select').click()
      await page
        .locator('ion-select-popover ion-radio')
        .filter({ hasText: label })
        .click()

      await modal.getByRole('button', { name: 'Crear Usuario' }).click()

      // Row appears with the correct role chip
      const row = page.locator(`tr:has-text("${email}")`)
      await expect(row.getByText(nombre)).toBeVisible()
      await expect(row.getByText(label, { exact: true })).toBeVisible()

      // Persistence in localStorage
      const stored = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) || '[]'),
        'abacubiertas_users',
      )
      const found = stored.find((u) => u.email === email)
      expect(found).toBeDefined()
      expect(found.nombre).toBe(nombre)
      expect(found.rol).toBe(value)
      expect(found.activo).toBe(true)

      // Wait for the success toast to appear and dismiss, so Ionic restores
      // the router-outlet aria state before starting the next iteration.
      const toast = page.locator('ion-toast')
      await expect(toast.first()).toBeAttached({ timeout: 10000 })
      await expect(toast).toHaveCount(0, { timeout: 10000 })
    }
  })
})

