import { test, expect, type Page } from '@playwright/test'

test.describe('Cierre de sesión - Logout (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
      localStorage.setItem('abacubiertas_mock_auth', '1')
    })
    await page.reload()
  })

  const loginAs = async (page: Page, email: string, password: string) => {
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await page.waitForURL(/.*dashboard/, { timeout: 10000 })
  }

  test('1. Click en "Cerrar sesión" redirige a /login y limpia tokens', async ({
    page,
  }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')
    await expect(page).toHaveURL(/.*dashboard/)

    await page.getByTitle('Cerrar sesión').click()

    await expect(page).toHaveURL(/.*login/, { timeout: 10000 })

    const tokens = await page.evaluate(() => ({
      access: localStorage.getItem('accessToken'),
      refresh: localStorage.getItem('refreshToken'),
    }))
    expect(tokens.access).toBeNull()
    expect(tokens.refresh).toBeNull()
  })

  test('2. Tras logout, acceder a /dashboard redirige a /login', async ({
    page,
  }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    await page.getByTitle('Cerrar sesión').click()
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 })

    await page.goto('/dashboard')

    await expect(page).toHaveURL(/.*login/)
  })

  test('3. Se puede volver a iniciar sesión después de hacer logout', async ({
    page,
  }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    await page.getByTitle('Cerrar sesión').click()
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 })

    await page.locator('input[type="email"]').fill('admin@test.com')
    await page.locator('input[type="password"]').fill('Admin12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
  })
})