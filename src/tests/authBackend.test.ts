import { describe, it, expect, beforeEach } from 'vitest'
import { loginApi, refreshApi, getUsersApi } from '../api/authApi'
import { getCurrentUserFromToken } from '../utils/jwt'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { SEED_PASSWORDS } from '../services/localStorage/seedData'

describe('AUTH BACKEND - Integration with Real API', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Login with Different Roles', () => {
    it('should login with admin role via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'admin@test.com',
        password: SEED_PASSWORDS['admin@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
      expect(typeof tokenRes.access_token).toBe('string')
    })

    it('should login with ventas role via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'ventas@test.com',
        password: SEED_PASSWORDS['ventas@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })

    it('should login with bodega role via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'bodega@test.com',
        password: SEED_PASSWORDS['bodega@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })

    it('should login with compras role via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'compras@test.com',
        password: SEED_PASSWORDS['compras@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })

    it('should login with gerencia role via backend API', async () => {
      const tokenRes = await loginApi({
        email: 'gerencia@test.com',
        password: SEED_PASSWORDS['gerencia@test.com'],
      })

      expect(tokenRes.access_token).toBeDefined()
      expect(tokenRes.refresh_token).toBeDefined()
    })
  })

  describe('2. Token Refresh via Backend API', () => {
    it('should refresh access token via backend', async () => {
      // Login primero
      const loginRes = await loginApi({
        email: 'admin@test.com',
        password: SEED_PASSWORDS['admin@test.com'],
      })

      // Refresh el token con el refresh_token devuelto por el login
      const refreshRes = await refreshApi(loginRes.refresh_token)

      expect(refreshRes.access_token).toBeDefined()
      expect(refreshRes.refresh_token).toBeDefined()

      const refreshedUser = getCurrentUserFromToken(refreshRes.access_token)
      expect(refreshedUser?.email).toBe('admin@test.com')
      expect(refreshedUser?.rol).toBe('admin')
    })
  })

  describe('3. User Management via Backend API', () => {
    it('should get users list via backend', async () => {
      const users = await getUsersApi()
      expect(users.length).toBeGreaterThanOrEqual(5)

      const adminUser = users.find((u) => u.email === 'admin@test.com')
      expect(adminUser).toBeDefined()
      expect(adminUser?.rol).toBe('admin')
    })
  })
})