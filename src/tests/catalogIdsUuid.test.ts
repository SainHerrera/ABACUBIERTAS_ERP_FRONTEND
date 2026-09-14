import { beforeAll, describe, expect, it } from 'vitest'
import { StorageEngine } from '../services/localStorage/storageEngine'
import {
  SEED_PRODUCT_CUBIERTA,
  SEED_MOVEMENT_1,
} from '../services/localStorage/seedData'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

beforeAll(() => {
  StorageEngine.init(true)
})

describe('catálogo de ids UUID en el mock', () => {
  it('seed: todos los ids de catálogo y movimientos son UUID string', () => {
    const products = StorageEngine.getProducts(0, 1000)
    expect(products.items.length).toBeGreaterThan(0)
    for (const p of products.items) expect(p.id_producto).toMatch(UUID_RE)

    const providers = StorageEngine.getProviders(0, 1000)
    for (const pr of providers.items) expect(pr.id_proveedor).toMatch(UUID_RE)

    const clients = StorageEngine.getClients(0, 1000)
    for (const c of clients.items) expect(c.id_cliente).toMatch(UUID_RE)

    const movements = StorageEngine.getMovements(0, 1000)
    for (const m of movements.items) {
      expect(m.id_movimiento).toMatch(UUID_RE)
      expect(m.id_producto).toMatch(UUID_RE)
    }
  })

  it('createProduct genera un id_producto uuid y un movimiento inicial uuid', () => {
    const p = StorageEngine.createProduct({
      nombre: 'Test Uber',
      unidad_medida: 'unidad',
      precio_unitario: 100,
      stock_inicial: 5,
      stock_minimo: 1,
    })
    expect(p.id_producto).toMatch(UUID_RE)
    expect(p.stock_actual).toBe(5)

    const movements = StorageEngine.getMovements(0, 1000, p.id_producto)
    expect(movements.items.length).toBe(1)
    expect(movements.items[0].id_movimiento).toMatch(UUID_RE)
    expect(movements.items[0].id_producto).toBe(p.id_producto)
    expect(movements.items[0].tipo).toBe('entrada')
  })

  it('CICLO: getProduct/updateProduct/deleteProduct funcionan con el uuid generado', () => {
    const p = StorageEngine.createProduct({
      nombre: 'Test Ciclo UUID',
      unidad_medida: 'unidad',
      precio_unitario: 200,
      stock_inicial: 0,
      stock_minimo: 1,
    })
    const found = StorageEngine.getProduct(p.id_producto)
    expect(found.id_producto).toBe(p.id_producto)
    expect(found.nombre).toBe('Test Ciclo UUID')

    StorageEngine.updateProduct(p.id_producto, { precio_unitario: 250 })
    expect(StorageEngine.getProduct(p.id_producto).precio_unitario).toBe(250)

    StorageEngine.deleteProduct(p.id_producto)
    expect(() => StorageEngine.getProduct(p.id_producto)).toThrow()
  })

  it('createProvider y createClient generan ids uuid únicos', () => {
    const prov = StorageEngine.createProvider({
      nombre_empresa: 'Proveedor Test UUID',
      nit: '999888777-1',
      categoria_material: 'Fijaciones',
    })
    expect(prov.id_proveedor).toMatch(UUID_RE)

    const prov2 = StorageEngine.createProvider({
      nombre_empresa: 'Proveedor Test UUID 2',
      nit: '999888777-2',
      categoria_material: 'Fijaciones',
    })
    expect(prov2.id_proveedor).not.toBe(prov.id_proveedor)

    const cli = StorageEngine.createClient({
      tipo_cliente: 'empresa',
      nombre_razon_social: 'Cliente Test UUID',
      nit_cc: '111222333-4',
    })
    expect(cli.id_cliente).toMatch(UUID_RE)
    expect(StorageEngine.getClient(cli.id_cliente).nombre_razon_social).toBe(
      'Cliente Test UUID',
    )
  })

  it('createEntry genera un id_movimiento uuid distinto por movimiento', () => {
    const m1 = StorageEngine.createEntry({
      product_id: SEED_PRODUCT_CUBIERTA,
      quantity: 3,
      note: 'Entrada A',
    })
    const m2 = StorageEngine.createEntry({
      product_id: SEED_PRODUCT_CUBIERTA,
      quantity: 2,
      note: 'Entrada B',
    })
    expect(m1.id_movimiento).toMatch(UUID_RE)
    expect(m2.id_movimiento).toMatch(UUID_RE)
    expect(m1.id_movimiento).not.toBe(m2.id_movimiento)
    expect(m2.nota).toBe('Entrada B')
  })

  it('los movimientos seed referencian productos seed por uuid', () => {
    const movements = StorageEngine.getMovements(0, 1000, SEED_PRODUCT_CUBIERTA)
    expect(movements.items.length).toBeGreaterThanOrEqual(1)
    expect(movements.items.some((m) => m.id_movimiento === SEED_MOVEMENT_1)).toBe(true)
  })
})