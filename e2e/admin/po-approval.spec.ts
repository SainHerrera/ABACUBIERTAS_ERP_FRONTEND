import { test, expect, type Page } from '@playwright/test'

test.describe('Paquete Admin/Gerencia - Aprobación de Órdenes de Compra grandes (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  const login = async (page: Page, email: string, password: string, urlRe: RegExp) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(urlRe)
  }

  const waitForToastGone = async (page: Page) => {
    const toast = page.locator('ion-toast')
    await expect(toast.first()).toBeAttached({ timeout: 10000 })
    await expect(toast).toHaveCount(0, { timeout: 10000 })
  }

  // Admin activa la regla de aprobación con un umbral bajo ($1) y persiste.
  const enableApprovalRule = async (page: Page) => {
    await login(page, 'admin@test.com', 'Admin12345!', /.*dashboard/)
    await page.goto('/settings')
    await expect(page.getByText('Parámetros Generales del Sistema')).toBeVisible()

    const card = page.locator('ion-card').filter({ hasText: 'Aprobación de órdenes de compra grandes' })
    await card.getByTestId('toggle-aprobacion').click()
    await card.getByTestId('input-aprobacion-monto').locator('input').fill('1')
    await page.getByRole('button', { name: 'Guardar parámetros' }).click()
    await waitForToastGone(page)

    // Verificar persistencia en localStorage (con polling: el guardado puede no estar listo aún)
    await expect
      .poll(async () => {
        const s = await page.evaluate(
          () => JSON.parse(localStorage.getItem('abacubiertas_settings') || '{}'),
        )
        return s.aprobacionOcHabilitada === true && Number(s.aprobacionOcMontoMinimo) === 1
      })
      .toBe(true)

    // Cerrar sesión
    page.getByTitle('Cerrar sesión').click()
    await expect(page).toHaveURL(/.*login/)
  }

  // Compras genera la OC desde COT-0004; con la regla activa queda pendiente de aprobación.
  const createPendingOC = async (page: Page) => {
    await login(page, 'compras@test.com', 'Compras12345!', /.*compras/)
    await page.goto('/compras/requests')
    await expect(
      page.locator('#main-content').getByText('Solicitudes de abastecimiento', { exact: true }),
    ).toBeVisible()
    await page.getByTestId('select-COT-0004').click()
    await page.getByTestId('create-po').first().click()
    await expect(page.locator('ion-toast').getByText('Orden de compra generada')).toBeVisible()
  }

  test('1. Admin/Compras genera una OC que supera el umbral y queda pendiente de aprobación', async ({ page }) => {
    await enableApprovalRule(page)
    await createPendingOC(page)

    // La OC creada (OC-0003) debe quedar en estado pendiente de aprobación
    await expect
      .poll(async () => {
        const orders = await page.evaluate(
          () => JSON.parse(localStorage.getItem('abacubiertas_pos') || '[]'),
        )
        const oc = orders.find((o: { numero_oc: string }) => o.numero_oc === 'OC-0003')
        return oc?.estado
      })
      .toBe('pendiente_aprobacion')
  })

  test('2. Gerencia aprueba la OC pendiente y queda "Enviada"', async ({ page }) => {
    await enableApprovalRule(page)
    await createPendingOC(page)

    await login(page, 'gerencia@test.com', 'Gerencia12345!', /.*dashboard/)
    await page.goto('/approvals')
    await expect(page).toHaveURL(/.*approvals/)
    await expect(page.getByText('Aprobación de Órdenes de Compra', { exact: true })).toBeVisible()

    const approvalCard = page.getByTestId('approval-OC-0003')
    await expect(approvalCard).toBeVisible()
    await expect(approvalCard.getByText('Pendiente de aprobación')).toBeVisible()

    await page.getByTestId('approve-OC-0003').click()
    // Confirmar en el diálogo de aprobación
    await page.getByRole('button', { name: 'Aprobar', exact: true }).last().click()

    // Al recargar la lista ya no aparece pendiente
    await expect(page.getByTestId('approval-OC-0003')).toHaveCount(0, { timeout: 10000 })
    await expect(page.getByText('No hay órdenes de compra pendientes de aprobación.')).toBeVisible()

    // Verificar en localStorage que la OC quedó aprobada (envío)
    await expect
      .poll(async () => {
        const orders = await page.evaluate(
          () => JSON.parse(localStorage.getItem('abacubiertas_pos') || '[]'),
        )
        const oc = orders.find((o: { numero_oc: string }) => o.numero_oc === 'OC-0003')
        return oc?.estado
      })
      .toBe('enviada')
  })

  test('3. Gerencia rechaza la OC pendiente y queda "Rechazada"', async ({ page }) => {
    await enableApprovalRule(page)
    await createPendingOC(page)

    await login(page, 'gerencia@test.com', 'Gerencia12345!', /.*dashboard/)
    await page.goto('/approvals')
    await expect(page.getByText('Aprobación de Órdenes de Compra', { exact: true })).toBeVisible()

    await page.getByTestId('reject-OC-0003').click()
    await page.getByRole('button', { name: 'Rechazar', exact: true }).last().click()

    await expect(page.getByTestId('approval-OC-0003')).toHaveCount(0, { timeout: 10000 })

    // Verificar en localStorage que la OC quedó rechazada
    await expect
      .poll(async () => {
        const orders = await page.evaluate(
          () => JSON.parse(localStorage.getItem('abacubiertas_pos') || '[]'),
        )
        const oc = orders.find((o: { numero_oc: string }) => o.numero_oc === 'OC-0003')
        return oc?.estado
      })
      .toBe('rechazada')
  })

  test('4. Los audits de aprobación/rechazo quedan registrados en el log', async ({ page }) => {
    await enableApprovalRule(page)
    await createPendingOC(page)

    await login(page, 'gerencia@test.com', 'Gerencia12345!', /.*dashboard/)
    await page.goto('/approvals')
    await page.getByTestId('approve-OC-0003').click()
    await page.getByRole('button', { name: 'Aprobar', exact: true }).last().click()
    await expect(page.getByTestId('approval-OC-0003')).toHaveCount(0, { timeout: 10000 })

    await page.goto('/audit')
    await expect(page.getByText('Registro de Auditoría')).toBeVisible()
    await expect(page.locator('table.data-table').getByText('OC aprobada')).toBeVisible()
    await expect(
      page.locator('table.data-table').getByText('OC pendiente de aprobación'),
    ).toBeVisible()
  })

  test('5. Roles no directivos son redirigidos de /approvals', async ({ page }) => {
    await login(page, 'compras@test.com', 'Compras12345!', /.*compras/)

    await page.goto('/approvals')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Aprobación de Órdenes de Compra', { exact: true })).not.toBeVisible()

    await login(page, 'bodega@test.com', 'Bodega12345!', /.*dashboard/)
    await page.goto('/approvals')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Aprobación de Órdenes de Compra', { exact: true })).not.toBeVisible()
  })
})
