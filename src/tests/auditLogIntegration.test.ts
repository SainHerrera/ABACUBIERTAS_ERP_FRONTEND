import { describe, it, expect, beforeEach } from 'vitest'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { getAuditLogApi } from '../api/auditLogApi'
import { createUserApi, deleteUserApi, loginApi } from '../api/authApi'
import type { AuditAction } from '../types/auditLog'

describe('Audit Log - Registro y consulta de auditoría (LocalStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Inicialización de la clave', () => {
    it('debe crear la clave abacubiertas_audit_log vacía tras el init', () => {
      const stored = JSON.parse(
        localStorage.getItem('abacubiertas_audit_log') || 'null',
      )
      expect(stored).toEqual([])
    })

    it('debe devolver un log vacío a través de la API inicialmente', async () => {
      const result = await getAuditLogApi()
      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('2. Registro de acciones de autenticación', () => {
    it('registra el inicio de sesión con el actor que ingresó', async () => {
      const tokens = await loginApi({
        email: 'ventas@test.com',
        password: 'Ventas12345!',
      })
      expect(tokens.access_token).toBeDefined()

      const { items } = await getAuditLogApi()
      expect(items).toHaveLength(1)
      expect(items[0].accion).toBe('login')
      expect(items[0].email_usuario).toBe('ventas@test.com')
      expect(items[0].id_usuario).toBe(2)
    })

    it('registra la creación de un usuario con rol user_created', () => {
      const created = StorageEngine.register({
        email: 'nuevo@test.com',
        nombre: 'Nuevo Usuario',
        password: 'Clave12345!',
        rol: 'bodega',
      })
      expect(created.id_usuario).toBeDefined()

      const { items } = StorageEngine.getAuditLog(0, 50)
      expect(items[0].accion).toBe('user_created')
      expect(items[0].detalle).toContain('Nuevo Usuario')
      expect(items[0].detalle).toContain('nuevo@test.com')
      expect(items[0].email_usuario).toBe('admin@test.com')
    })

    it('registra la creación vía createUserApi (usado por admins)', async () => {
      await createUserApi({
        email: 'comprador@test.com',
        nombre: 'Comprador',
        password: 'Clave12345!',
        rol: 'compras',
      })
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('user_created')
    })
  })

  describe('3. Registro de acciones de usuarios', () => {
    it('registra user_deactivated al desactivar un usuario', () => {
      StorageEngine.updateUser(2, { activo: false })
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('user_deactivated')
      expect(items[0].detalle).toContain('Asesor Comercial')
    })

    it('registra user_activated al reactivar un usuario', () => {
      StorageEngine.updateUser(2, { activo: false })
      StorageEngine.updateUser(2, { activo: true })
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('user_activated')
    })

    it('registra role_changed al cambiar el rol de un usuario', () => {
      StorageEngine.updateUser(2, { rol: 'gerencia' })
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('role_changed')
      expect(items[0].detalle).toContain('ventas → gerencia')
    })

    it('registra user_updated al editar otros campos', () => {
      StorageEngine.updateUser(2, { nombre: 'Asesor Renombrado' })
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('user_updated')
    })

    it('registra user_deactivated al eliminar un usuario (soft delete)', () => {
      StorageEngine.deleteUser(3)
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('user_deactivated')
    })

    it('registra a través de las APIs de gestión', async () => {
      await deleteUserApi(4)
      const { items } = await getAuditLogApi()
      expect(items[0].accion).toBe('user_deactivated')
    })
  })

  describe('4. Registro de acciones del sistema', () => {
    it('registra settings_updated al actualizar parámetros', () => {
      StorageEngine.updateSettings({ stockMinimoDefault: 25 })
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('settings_updated')
      expect(items[0].detalle).toContain('25')
    })

    it('registra settings_reset al restablecer parámetros', () => {
      StorageEngine.resetSettings()
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('settings_reset')
    })

    it('registra catalog_loaded al cargar el catálogo inicial', () => {
      StorageEngine.loadInitialCatalog()
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('catalog_loaded')
      expect(items[0].detalle).toContain('productos')
    })
  })

  describe('5. Consulta, filtrado y limpieza', () => {
    it('mantiene las entradas ordenadas de la más reciente a la más antigua', () => {
      StorageEngine.updateSettings({ stockMinimoDefault: 1 })
      StorageEngine.recordAuditLog('login', 'Entrada manual')
      const { items } = StorageEngine.getAuditLog()
      expect(items[0].accion).toBe('login')
      expect(items[1].accion).toBe('settings_updated')
    })

    it('filtra por usuario (nombre o correo)', () => {
      StorageEngine.updateSettings({ stockMinimoDefault: 5 })
      const byUser = StorageEngine.getAuditLog(0, 50, { usuario: 'admin' })
      expect(byUser.total).toBeGreaterThan(0)
      expect(
        byUser.items.every(
          (e) =>
            e.nombre_usuario.toLowerCase().includes('admin') ||
            e.email_usuario.toLowerCase().includes('admin'),
        ),
      ).toBe(true)
    })

    it('filtra por acción', () => {
      StorageEngine.updateSettings({ stockMinimoDefault: 6 })
      StorageEngine.updateSettings({ margenUtilidadDefault: 70 })
      const byAction = StorageEngine.getAuditLog(0, 50, { accion: 'settings_updated' })
      expect(byAction.total).toBe(2)
      expect(byAction.items.every((e) => e.accion === 'settings_updated')).toBe(true)
    })

    it('persiste las entradas en abacubiertas_audit_log', () => {
      StorageEngine.recordAuditLog('login', 'Persistencia')
      const stored = JSON.parse(
        localStorage.getItem('abacubiertas_audit_log') || '[]',
      ) as { accion: AuditAction }[]
      expect(stored[0].accion).toBe('login')
    })

    it('limpia el log con clearAuditLog', () => {
      StorageEngine.recordAuditLog('login', 'Entrada a borrar')
      expect(StorageEngine.getAuditLog().total).toBeGreaterThan(0)
      StorageEngine.clearAuditLog()
      const { items, total } = StorageEngine.getAuditLog()
      expect(items).toEqual([])
      expect(total).toBe(0)
    })
  })
})
