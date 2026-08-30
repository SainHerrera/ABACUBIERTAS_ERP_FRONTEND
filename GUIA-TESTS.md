# Guía de ejecución de tests

Este documento explica cómo ejecutar cada grupo de tests del ERP Abacubiertas, **con audit** (reporte/auditoría) y **sin audit** (ejecución directa).

Todos los comandos se ejecutan desde la raíz del proyecto:

```bash
cd frontend-abacubiertas-erp
```

> **Nota**: los tests E2E (Playwright) levantan automáticamente el servidor de desarrollo a través del `webServer` de la configuración de Playwright; no es necesario lanzar `npm run dev` por separado.

---

## 1. Tests unit (Vitest)

Suites de lógica de negocio sin navegador (jsdom + localStorage).

| Comando | Descripción |
| --- | --- |
| `npm test` | Ejecuta **toda** la suite unit (146 tests). |
| `npm run test:watch` | Ejecuta en modo watch (recarga al guardar). |
| `npm run test:admin:unit` | Unit del paquete **Admin/Gerencia** (settings, audit log, users, aprobación OC, reportes, ventas). |
| `npm run test:bodega:unit` | Unit del paquete **Bodega/Inventario**. |
| `npm run test:compras:unit` | Unit del paquete **Compras** (cotizaciones proveedor, flujo de OC). |

---

## 2. Tests E2E (Playwright)

### Sin audit — ejecución directa

**Todos los paquetes (suite completa):**
```bash
npm run test:e2e
```

**Por paquete (headless):**
```bash
npm run test:e2e:admin       # Admin / Gerencia
npm run test:e2e:inventory   # Bodega / Inventario
npm run test:e2e:compras     # Compras
```

**Con ventana del navegador visible (config visual `playwright.visual.config.ts`):**
```bash
npm run test:e2e:headed            # todos los paquetes (visual)
npm run test:e2e:admin:headed      # solo Admin
npm run test:e2e:inventory:headed  # solo Bodega
npm run test:e2e:compras:headed    # solo Compras
```

> `test:e2e:admin:headed` == `test:admin:headed` (el mismo script).

**UI interactiva de Playwright:**
```bash
npm run test:e2e:ui
```

**Spec único o archivo concreto:** puedes pasar la ruta directamente:
```bash
npx playwright test e2e/admin/po-approval.spec.ts
npx playwright test e2e/admin/reports-dashboard.spec.ts --config=playwright.visual.config.ts
npx playwright test e2e/admin/po-approval.spec.ts e2e/admin/reports-dashboard.spec.ts
```

### Tests de archivos exportables (CSV y PDF/Imprimir)

Cubren la descarga de exportaciones del Centro de Reportes. **Nota:** solo se testea lo existente en el código — el CSV de reportes (`CsvExportButton`, Blob + BOM) y el PDF vía `window.print()` en `ReportCenterPage`; no existen exportaciones de "PDF de cotizaciones" ni "CSV de inventario" independientes.

- **Unit (Vitest):** `src/tests/csvExportButton.test.tsx` (mock de `@ionic/react`; verifica BOM UTF-8 vía `arrayBuffer()` y captura el anchor descargable con un spy en `HTMLAnchorElement.prototype.click`).
  ```bash
  npx vitest run src/tests/csvExportButton.test.tsx
  ```
- **E2E (Playwright):** tests 6–8 de `e2e/admin/reports-dashboard.spec.ts` — validan el **contenido real** del CSV (cabeceras/filas vía `download.createReadStream()`), que el CSV cambia según la pestaña (Valorización) y que el botón Imprimir dispara `window.print` (stub de `window.print`):
  ```bash
  npx playwright test e2e/admin/reports-dashboard.spec.ts --grep "descarga con contenido|Imprimir"
  ```
- Ambos se incluyen en la auditoría Admin: `npm run test:admin:audit`.

---

### Sin audit — combinado (unit + E2E del paquete)

Estos scripts ejecutan primero los unit y luego el E2E headless del paquete:

```bash
npm run test:admin      # unit Admin + E2E Admin
npm run test:bodega     # unit Bodega + E2E Inventory
npm run test:compras    # unit Compras + E2E Compras
```

---

### Con audit — scripts de auditoría

Los scripts de auditoría ejecutan la suite (headless), generan un **reporte** y los **resultados JSON**, y fallan (exit code ≠ 0) si hay cualquier test fallido.

**Admin/Gerencia** — ejecuta unit + E2E y genera el reporte:
```bash
npm run test:admin:audit
```
Reporte generado en `test-results/admin-audit/admin-audit-report.txt` (+ `results.json`).

**Bodega/Inventario** — ejecuta el E2E de inventario:
```bash
npm run test:bodega:audit
```
Reporte en `test-results/bodega-audit/bodega-audit-report.txt` (+ `results.json`).

**Compras** — ejecuta el E2E de compras:
```bash
npm run test:compras:audit
```
Reporte en `test-results/compras-audit/compras-audit-report.txt` (+ `results.json`).

> Los scripts `bodega-audit.mjs` y `compras-audit.mjs` corren **solo E2E** (no incluyen unit); el script `admin-audit.mjs` incluye **unit + E2E**. Si necesitas unit + E2E con audit para Bodega/Compras, puedes encadenarlos:
> ```bash
> npm run test:bodega:audit && npm run test:bodega:unit
> npm run test:compras:audit && npm run test:compras:unit
> ```

### Con audit — headed (solo E2E visual, caso puntual)

Existe un script puntual que corre un spec con el config visual:

```bash
npm run test:e2e:headed:audit   # e2e/admin/admin-audit.spec.ts (visual)
```

---

## 3. Resumen rápido por paquete

| Paquete | Sin audit (unit) | Sin audit (E2E) | Sin audit (unit+E2E) | Con audit |
| --- | --- | --- | --- | --- |
| **Admin/Gerencia** | `npm run test:admin:unit` | `npm run test:e2e:admin` | `npm run test:admin` | `npm run test:admin:audit` |
| **Bodega/Inventario** | `npm run test:bodega:unit` | `npm run test:e2e:inventory` | `npm run test:bodega` | `npm run test:bodega:audit` |
| **Compras** | `npm run test:compras:unit` | `npm run test:e2e:compras` | `npm run test:compras` | `npm run test:compras:audit` |
| **Todos** | `npm test` | `npm run test:e2e` | — | — |

---

## 4. Verificación de calidad (opcional)

```bash
npm run lint    # ESLint
npm run tsc     # NOTA: no hay script; usar "npx tsc --noEmit"
npm run build   # build de producción
```
