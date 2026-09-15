import { resetAndSeedBackend } from './backend-seed'

export default async function globalSetup(): Promise<void> {
  try {
    await resetAndSeedBackend()
    console.log('[backend-setup] Base de datos del backend restablecida y sembrada')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(
      '[backend-setup] No se pudo preparar la BD del backend. ' +
        '¿Está el backend arriba (docker compose up) con el contenedor backend-erp-db-1? ' +
        `Error: ${msg}`,
    )
    throw err
  }
}