import { describe, it, expect } from 'vitest'
import {
  mapApiProvider,
  mapApiProduct,
  mapApiClient,
  mapApiMovement,
} from '../utils/catalogMappers'
import type { ApiProvider } from '../types/provider'
import type { ApiProduct } from '../types/product'
import type { ApiClient } from '../types/sales'
import type { ApiMovement } from '../types/movement'

describe('mapApiProvider', () => {
  it('maps a backend provider keeping the UUID id and optional fields', () => {
    const raw: ApiProvider = {
      id_proveedor: '3f4c0a2c-9c1a-4f9e-8d63-8f8f0f0f0f0f',
      nombre_empresa: 'Aceros del Caribe S.A.S.',
      nit: '900123456-7',
      contacto: 'María Pérez',
      categoria_material: 'Estructura',
      estado: 'activo',
      activo: true,
      created_at: '2026-01-01T10:00:00Z',
      updated_at: '2026-01-01T10:00:00Z',
    }
    const m = mapApiProvider(raw)
    expect(m.id_proveedor).toBe(raw.id_proveedor)
    expect(m.nombre_empresa).toBe('Aceros del Caribe S.A.S.')
    expect(m.contacto).toBe('María Pérez')
    expect(m.telefono).toBeUndefined()
    expect(m.estado).toBe('activo')
    expect(m.activo).toBe(true)
  })

  it('normalizes missing optional fields to undefined', () => {
    const raw: ApiProvider = {
      id_proveedor: 'a-b-c',
      nombre_empresa: 'X',
      nit: '1',
      categoria_material: 'Plásticos',
      estado: 'activo',
      activo: true,
    }
    const m = mapApiProvider(raw)
    expect(m.observaciones).toBeUndefined()
    expect(m.condiciones_pago).toBeUndefined()
    expect(m.ciudad).toBeUndefined()
  })
})

describe('mapApiProduct', () => {
  it('maps nullable provider fields to undefined', () => {
    const raw: ApiProduct = {
      id_producto: 'p-1',
      nombre: 'Lamina',
      unidad_medida: 'unidad',
      precio_unitario: 15000,
      stock_actual: 10,
      stock_minimo: 2,
      id_proveedor: null,
      nombre_proveedor: null,
      activo: true,
      status: 'low',
      low_stock: true,
    }
    const m = mapApiProduct(raw)
    expect(m.id_proveedor).toBeUndefined()
    expect(m.nombre_proveedor).toBeUndefined()
    expect(m.status).toBe('low')
    expect(m.low_stock).toBe(true)
    expect(m.activo).toBe(true)
  })

  it('keeps a present provider id and computed fields', () => {
    const raw: ApiProduct = {
      id_producto: 'p-2',
      nombre: 'Perfil',
      unidad_medida: 'unidad',
      precio_unitario: 25000,
      stock_actual: 50,
      stock_minimo: 10,
      id_proveedor: 'prov-9',
      nombre_proveedor: 'Plasticos del Norte',
      activo: true,
      status: 'normal',
      low_stock: false,
    }
    const m = mapApiProduct(raw)
    expect(m.id_proveedor).toBe('prov-9')
    expect(m.nombre_proveedor).toBe('Plasticos del Norte')
  })
})

describe('mapApiClient', () => {
  it('maps a backend client passing through estado and timestamps', () => {
    const raw: ApiClient = {
      id_cliente: 'cl-9',
      tipo_cliente: 'empresa',
      nombre_razon_social: 'Andinas',
      nit_cc: '900200300-1',
      nombre_contacto: 'Juan',
      estado: 'activo',
      activo: true,
      created_at: '2026-01-01T10:00:00Z',
    }
    const m = mapApiClient(raw)
    expect(m.id_cliente).toBe('cl-9')
    expect(m.nombre_contacto).toBe('Juan')
    expect(m.estado).toBe('activo')
    expect(m.created_at).toBe('2026-01-01T10:00:00Z')
  })
})

describe('mapApiMovement', () => {
  it('maps a backend movement with a UUID id_usuario', () => {
    const raw: ApiMovement = {
      id_movimiento: 'mv-1',
      id_producto: 'p-1',
      tipo: 'salida',
      cantidad: 5,
      referencia: 'OC-0003',
      id_usuario: '0c5f2be4-8a0c-4a4b-a7fe-f3f8b0a0c0d0',
      fecha: '2026-05-02T10:00:00Z',
      nota: 'Salida por OC',
    }
    const m = mapApiMovement(raw)
    expect(m.id_usuario).toBe('0c5f2be4-8a0c-4a4b-a7fe-f3f8b0a0c0d0')
    expect(m.tipo).toBe('salida')
    expect(m.referencia).toBe('OC-0003')
    expect(m.nota).toBe('Salida por OC')
    expect(m.nombre_producto).toBeUndefined()
  })
})