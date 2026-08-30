import { test, expect, type Page } from '@playwright/test'

const readStream = async (stream: NodeJS.ReadableStream): Promise<string> => {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

test.describe('Paquete Admin/Gerencia - Dashboard de KPI y Centro de Reportes (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  const loginAs = async (page: Page, email: string, password: string) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*dashboard/)
  }

  test('1. El dashboard muestra KPI reales (no "—") para Admin y le llevan a /reports', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    await expect(page.getByText('Panel Principal', { exact: true })).toBeVisible()
    // Admin conserva los datos de usuario
    await expect(page.locator('.info-value', { hasText: 'Administrador ERP' })).toBeVisible()
    await expect(page.locator('.info-value', { hasText: 'admin@test.com' })).toBeVisible()

    // KPI Ventas del Mes con valor real (formato de moneda COP), no "—"
    const kpi = page.getByTestId('kpi-Ventas del Mes')
    await expect(kpi).toBeVisible()
    await expect(kpi.locator('.metric-value')).not.toHaveText('—')

    // Stock crítico y demás KPIs presentes
    await expect(page.getByTestId('kpi-Stock Crítico')).toBeVisible()
    await expect(page.getByTestId('kpi-Cotizaciones Pendientes')).toBeVisible()
    await expect(page.getByTestId('kpi-Compras Pendientes de Recibir')).toBeVisible()
    await expect(page.getByTestId('kpi-OC Pendientes de Aprobación')).toBeVisible()

    // Al hacer clic en un KPI navega al centro de reportes
    await kpi.click()
    await expect(page).toHaveURL(/.*reports/)
    await expect(page.getByText('Centro de Reportes')).toBeVisible()
  })

  test('2. Gerencia también ve KPIs reales en el dashboard', async ({ page }) => {
    await loginAs(page, 'gerencia@test.com', 'Gerencia12345!')

    await expect(page.getByText('Panel Principal', { exact: true })).toBeVisible()
    const kpi = page.getByTestId('kpi-Ventas del Mes')
    await expect(kpi).toBeVisible()
    await expect(kpi.locator('.metric-value')).not.toHaveText('—')
  })

  test('3. El Centro de Reportes muestra ventas por vendedor con filas reales', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    await page.goto('/reports')
    await expect(page).toHaveURL(/.*reports/)
    await expect(page.getByText('Centro de Reportes', { exact: true })).toBeVisible()

    // Tabla ventas por vendedor: al menos una fila con datos (hay ventas seed)
    const table = page.locator('table.data-table')
    await expect(page.getByTestId('seller-row').first()).toBeVisible()
    await expect(table).toBeVisible()
  })

  test('4. La tendencia de ventas por mes se muestra en la gráfica de barras', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    await page.goto('/reports')
    await expect(page.getByText('Centro de Reportes', { exact: true })).toBeVisible()

    await page.getByTestId('segment-trend').click()
    await expect(page.getByTestId('trend-chart')).toBeVisible()

    // Las ventas seed (agosto 2026) producen al menos una barra de tendencia
    const bar = page.locator('[data-testid^="trend-bar-"]').first()
    await expect(bar).toBeVisible()
  })

  test('5. La valorización del inventario muestra el total y filas por producto', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    await page.goto('/reports')
    await expect(page.getByText('Centro de Reportes', { exact: true })).toBeVisible()

    await page.locator('ion-segment-button').filter({ hasText: 'Valorización' }).click()
    await expect(page.getByText(/Valor total del inventario/)).toBeVisible()
    await expect(page.getByTestId('valuation-row').first()).toBeVisible()
  })

  const downloadCsvText = async (page: Page): Promise<string> => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('csv-export').click()
    const download = await downloadPromise
    const stream = await download.createReadStream()
    if (!stream) throw new Error('No se pudo leer el stream de la descarga CSV')
    return await readStream(stream)
  }

  test('6. El reporte CSV se descarga con contenido real (cabeceras y datos)', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    await page.goto('/reports')
    await expect(page.getByText('Centro de Reportes', { exact: true })).toBeVisible()

    // Leer el CSV descargado y validar su contenido (no solo el nombre del archivo)
    const csv = await downloadCsvText(page)

    // Cabeceras de la tabla "Ventas por vendedor"
    expect(csv).toContain('Vendedor,Total,N° Ventas')
    // La venta seed pertenece a Administrador ERP por 2.023.000
    expect(csv).toContain('Administrador ERP')
    expect(csv).toContain('2023000')
  })

  test('7. El CSV cambia su contenido según el reporte seleccionado (Valorización)', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    await page.goto('/reports')
    await expect(page.getByText('Centro de Reportes', { exact: true })).toBeVisible()

    // Cambiar a la pestaña Valorización y exportar
    await page.locator('ion-segment-button').filter({ hasText: 'Valorización' }).click()
    await expect(page.getByText(/Valor total del inventario/)).toBeVisible()

    const csv = await downloadCsvText(page)
    expect(csv).toContain('Producto,Stock,Precio,Valor')
  })

  test('8. El botón Imprimir/PDF dispara window.print', async ({ page }) => {
    await loginAs(page, 'admin@test.com', 'Admin12345!')

    type PrintWindow = Window & { __printed: boolean }

    // Stub de window.print para detectar la invocación
    await page.addInitScript(() => {
      const w = window as unknown as PrintWindow
      w.__printed = false
      window.print = () => {
        w.__printed = true
      }
    })

    await page.goto('/reports')
    await expect(page.getByText('Centro de Reportes', { exact: true })).toBeVisible()

    await expect(page.getByTestId('print-report')).toBeVisible()
    await page.getByTestId('print-report').click()

    await expect
      .poll(() => page.evaluate(() => (window as unknown as PrintWindow).__printed))
      .toBe(true)
  })

  test('9. Roles no directivos son redirigidos de /reports', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('compras@test.com')
    await page.locator('input[type="password"]').fill('Compras12345!')
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
    await expect(page).toHaveURL(/.*compras/)

    await page.goto('/reports')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.getByText('Centro de Reportes', { exact: true })).not.toBeVisible()
  })
})
