---
name: feature-testing
description: Use ONLY when implementing or modifying a feature in this repo (UI, páginas, APIs, storage, auth) so the matching tests are generated the same way as existing ones. Trigger keywords to front-load: generar tests, escribir tests, tests E2E, Playwright, Vitest, cobertura de tests, unit tests, feature testing.
---

# Regla de oro: toda feature incluye sus tests

Cuando implementes o modifiques cualquier feature de este proyecto (página,
componente, slice, API, regla de negocio o autenticación), DEBES generar
obligatoriamente sus tests con este patrón. Sin tests, la feature NO se
considera terminada.

## Niveles de tests obligatorios

1. **Unitarios / integración (Vitest)** en `src/tests/<modulo>.test.ts`:
   - Ejecutan directo contra `StorageEngine` (`src/services/localStorage/storageEngine.ts`) y `authApi`, o contra slices (`src/store/slices/authSlice.ts`).
   - Cubren: happy path, errores/validaciones con mensajes exactos, persistencia en claves localStorage `abacubiertas_*`, migraciones/backfill, loops por rol con `it.each`.
   - `beforeEach`: `StorageEngine.init(true)` para datos seed limpios.
2. **E2E (Playwright)** en `e2e/<rol>/<feature>.spec.ts`:
   - Se agrupan por **paquete de rol** en subcarpetas (p. ej. `e2e/admin/`, `e2e/ventas/`). Ver sección "Organización por paquete de rol (E2E)".
   - Cubren flujos de usuario completos: éxito, error, validación, persistencia en localStorage, login correcto/incorrecto, usuario desactivado, login con contraseña temporal, rol en el JWT.

## Datos seed y contraseñas

Contraseñas estándar (exportadas en `SEED_PASSWORDS`, usar SIEMPRE las mismas):

| Email             | Password         | Rol       |
| ----------------- | ---------------- | --------- |
| admin@test.com    | Admin12345!      | admin     |
| ventas@test.com   | Ventas12345!     | ventas    |
| compras@test.com  | Compras12345!    | compras   |
| bodega@test.com   | Bodega12345!     | bodega    |
| gerencia@test.com | Gerencia12345!   | gerencia  |

Claves localStorage: `abacubiertas_users`, `abacubiertas_products`, `abacubiertas_movements`, `abacubiertas_providers`, `abacubiertas_clients`, `abacubiertas_quotations`, `abacubiertas_sales`, `abacubiertas_settings`, `abacubiertas_audit_log`, `abacubiertas_initialized`.

## Convenciones E2E (helpers estándar)

```ts
test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

// Login con credenciales seed o de usuario creado
const loginAs = async (page: Page, email: string, password: string) => {
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click()
}

// Simular logout: quitar tokens y recargar (no hay botón de logout aún)
const logoutAndReload = async (page: Page) => {
  await page.evaluate(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  })
  await page.reload()
}

// Esperar que desaparezcan los toasts ANTES de usar role queries de nuevo
const waitForToastGone = async (page: Page) => {
  await page.locator('ion-toast').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
  await expect(page.locator('ion-toast')).toHaveCount(0, { timeout: 10000 })
}
```

Creación de usuarios en el diálogo:

```ts
await page.getByRole('button', { name: 'Nuevo Usuario' }).click()
const modal = page.locator('ion-modal')
await expect(modal.getByText('Nuevo Usuario')).toBeVisible() // scoped al modal (evita strict mode con el botón header)
await modal.locator('input').nth(0).fill(nombre)             // nombre
await modal.locator('input[type="email"]').fill(email)
await modal.locator('input[type="password"]').fill(password)
await modal.locator('ion-select').click()
await page.locator('ion-select-popover ion-radio').filter({ hasText: rolLabel }).click()
await modal.getByRole('button', { name: 'Crear Usuario' }).click()
```

## Gotchas de Ionic (bug conocido en este repo)

- Mientras hay un overlay (toast/modal/loading), Ionic pone `aria-hidden="true"` en `ion-router-outlet` → las **role queries resuelven 0** y `click()` hace timeout.
  - Regla: asserts de toasts con `getByText` (no role). Esperar el detache del toast antes del siguiente click por rol (`waitForToastGone`).
- Al superponer modal + `IonLoading` + toast, el `aria-hidden` puede QUEDAR PEGADO aunque se cierren. Se corrigió serializando overlays (toast presentado en `onDidDismiss` del modal). Mantén esa serialización y en tests espera al toast detach tras cada acción que lo dispare.
- En E2E: si un click por rol falla de forma inexplicable tras una acción con toast, primero revisa/dump `ion-router-outlet` (`aria-hidden`) antes que el selector.

## Formularios con `required` nativo

Los inputs con `required` hacen que el navegador BLOQUEE el submit → React `onSubmit`/validación inline nunca se dispara. Para probar validaciones inline vacías usa:

```ts
await page.locator('form').evaluate((form) => {
  const f = form as HTMLFormElement
  f.noValidate = true
  f.requestSubmit()
})
```

## Selectores conocidos

- Tabla: `page.locator('table.data-table')`, fila `tr:has-text("email")`, chip de rol `row.getByText(label, { exact: true })`.
- Dashboard: `page.getByText('Panel Principal', { exact: true })`, info del usuario en `.info-value` (nombre/email/rol).
- Desactivar/activar: `row.locator('button[title*="Desactivar"]')` / `'button[title*="Activar"]'`.

## Verificación de JWT y persistencia

```ts
// Rol desde el token guardado en localStorage
const token = await page.evaluate(() => localStorage.getItem('accessToken'))
const payload = JSON.parse(atob(token.split('.')[1]))
expect(payload.rol).toBe('bodega')

// Persistencia + seguridad: password_hash definido y nunca el password en claro
const stored = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), 'abacubiertas_users')
const found = stored.find((u) => u.email === email)
expect(found.password_hash).toBeDefined()
expect(found.password_hash).not.toBe(password)
```

## Mensajes exactos (usa estos strings en los asserts)

- `Credenciales incorrectas. Verifique su correo y contraseña.` (password inválida)
- `Credenciales incorrectas. Usuario no encontrado.` (email inexistente)
- `El usuario se encuentra desactivado. Contacte al administrador.` (usuario inactivo)
- `La contraseña debe tener al menos 8 caracteres`
- `El correo ${email} ya se encuentra registrado` (duplicado en register)
- Validación login: `Todos los campos son obligatorios`
- Validación del diálogo de usuario: `Nombre y email son obligatorios`, `La contraseña es obligatoria para nuevos usuarios`, `La contraseña debe tener al menos 8 caracteres`

## Aislamiento y determinismo

- Los E2E se ejecutan con 1 worker y `fullyParallel: false`; no dependas del orden entre tests.
- Emails únicos por iteración con `Date.now()` (p. ej. `e2e.${rol}.${ts}.${i}@test.com`).
- Cada test re-sembra datos con el `beforeEach` (clear + reload).
- En loops por rol en E2E: un solo test que itera (no `it.each` en Playwright); en Vitest sí usa `it.each`.

## Organización por paquete de rol (E2E)

- Los specs E2E se agrupan por **rol** en subcarpetas bajo `e2e/<rol>/` (p. ej. `e2e/admin/`, `e2e/ventas/`).
- `playwright.config.ts` usa `testDir: './e2e'` (recursivo), así que NO hace falta tocar la config al crear una subcarpeta nueva; Playwright encuentra los specs automáticamente.
- Convención de `test.describe`: prefijar con `Paquete Rol <Rol> - <Feature> (E2E)`, p. ej. `test.describe('Paquete Rol Administrador - Gestión de Usuarios (E2E)', ...)`.
- Para mover specs existentes que aún no están versionados en git, usa `New-Item -ItemType Directory` + `Move-Item` (NO `git mv`, que falla con archivos sin trackear).
- Scripts por paquete: `test:e2e:admin` (headless) / `test:e2e:admin:headed` (visible). Agregar el equivalente por cada rol nuevo.

## Pregunta obligatoria: tests visibles / no visibles / ambos

AL GENERAR o MODIFICAR tests de una feature, SIEMPRE preguntar al usuario con la herramienta de pregunta (`question`) antes de ejecutar/crear la verificación, ofreciendo:

1. **No visibles (headless)** → `npm run test:e2e` (config por defecto).
2. **Visibles (headed / Chromium en ventana)** → `npm run test:e2e:headed` o `--config=playwright.visual.config.ts` (define `headless: false`).
3. **Ambos** → ejecutar primero este último y luego la configuración por defecto.

Esta pregunta aplica SOLO al momento de generar nuevos tests de features (no en cada ejecución reiterada). Según la respuesta, se corre la config/script correspondiente.

## Verificación obligatoria (todo debe quedar en verde)

```bash
npm run test            # Vitest (unit/integración) — excluye e2e/ automáticamente
npm run lint            # ESLint
npm run build           # Vite build
npm run test:e2e        # Playwright headless (levanta el dev server solo, puerto 5173)
# Opcional (si el usuario pidió tests visibles o ambos):
npm run test:e2e:headed # Playwright con Chromium visible (playwright.visual.config.ts)
```

## Checklist de entrega

- [ ] Test unitario/integración agregado o actualizado en `src/tests/`.
- [ ] Spec E2E agregado o actualizado en `e2e/<rol>/` (paquete de rol, p. ej. `e2e/admin/`).
- [ ] Se preguntó al usuario si quiere tests visibles / no visibles / ambos (al generar la feature).
- [ ] Happy path, errores/validaciones y persistencia cubiertos.
- [ ] `npm run test`, `npm run lint`, `npm run build`, `npm run test:e2e` pasan (más `test:e2e:headed` si pidió visibles/ambos).