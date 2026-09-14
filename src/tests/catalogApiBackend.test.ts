import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import axiosInstance from '../api/axiosInstance'
import {
  getProvidersApi,
  getProviderApi,
  createProviderApi,
  updateProviderApi,
  deleteProviderApi,
} from '../api/providerApi'
import {
  getProductsApi,
  getProductApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from '../api/productApi'
import {
  getClientsApi,
  getClientApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
} from '../api/clientApi'
import {
  getMovementsApi,
  createEntryApi,
} from '../api/movementApi'

const mockGet = () => vi.mocked(axiosInstance.get)
const mockPost = () => vi.mocked(axiosInstance.post)
const mockPatch = () => vi.mocked(axiosInstance.patch)
const mockDelete = () => vi.mocked(axiosInstance.delete)

const activeProvider = {
  id_proveedor: 'p-1-active',
  nombre_empresa: 'Aceros del Caribe S.A.S.',
  nit: '900123456-7',
  categoria_material: 'Estructura',
  estado: 'activo',
  activo: true,
}
const inactiveProvider = {
  id_proveedor: 'p-2-inactive',
  nombre_empresa: 'Inactivo SAS',
  nit: '900999888-1',
  categoria_material: 'Fijaciones',
  estado: 'inactivo',
  activo: false,
}

const activeProduct = {
  id_producto: 'prod-1',
  nombre: 'Cubierta',
  unidad_medida: 'unidad',
  precio_unitario: 85000,
  stock_actual: 10,
  stock_minimo: 2,
  id_proveedor: 'p-1-active',
  nombre_proveedor: 'Aceros del Caribe S.A.S.',
  activo: true,
  status: 'normal',
  low_stock: false,
}
const inactiveProduct = {
  id_producto: 'prod-2',
  nombre: 'Inactivo',
  unidad_medida: 'unidad',
  precio_unitario: 1,
  stock_actual: 0,
  stock_minimo: 1,
  id_proveedor: null,
  nombre_proveedor: null,
  activo: false,
  status: 'low',
  low_stock: true,
}

const activeClient = {
  id_cliente: 'cl-1',
  tipo_cliente: 'empresa',
  nombre_razon_social: 'Andinas',
  nit_cc: '900200300-1',
  estado: 'activo',
  activo: true,
}
const inactiveClient = {
  id_cliente: 'cl-2',
  tipo_cliente: 'persona_natural',
  nombre_razon_social: 'Inactivo',
  nit_cc: '1000',
  estado: 'inactivo',
  activo: false,
}

const movementRow = {
  id_movimiento: 'mv-1',
  id_producto: 'prod-1',
  tipo: 'entrada',
  cantidad: 5,
  id_usuario: 'u-1',
  fecha: '2026-01-01T10:00:00Z',
}

beforeEach(() => {
  localStorage.setItem('abacubiertas_mock_auth', '0')
  vi.clearAllMocks()
})

describe('CATALOG API - Rama backend (mock de axiosInstance)', () => {
  it('getProvidersApi pasa search y filtra proveedores inactivos', async () => {
    mockGet().mockResolvedValueOnce({
      data: { items: [activeProvider, inactiveProvider], total: 2, skip: 0, limit: 50 },
    } as never)

    const res = await getProvidersApi(0, 50, 'acero')

    expect(mockGet()).toHaveBeenCalledWith('/providers', {
      params: { skip: 0, limit: 50, search: 'acero' },
    })
    expect(res.items).toHaveLength(1)
    expect(res.items[0].nombre_empresa).toBe('Aceros del Caribe S.A.S.')
    expect(res.total).toBe(1)
  })

  it('getProvidersApi omite search cuando no viene', async () => {
    mockGet().mockResolvedValueOnce({
      data: { items: [activeProvider], total: 1, skip: 0, limit: 50 },
    } as never)

    await getProvidersApi()

    expect(mockGet()).toHaveBeenCalledWith('/providers', { params: { skip: 0, limit: 50 } })
  })

  it('getProviderApi busca por uuid', async () => {
    mockGet().mockResolvedValueOnce({ data: activeProvider } as never)
    const provider = await getProviderApi('p-1-active')
    expect(mockGet()).toHaveBeenCalledWith('/providers/p-1-active')
    expect(provider.id_proveedor).toBe('p-1-active')
  })

  it('createProviderApi/update/delete usan POST/PATCH/DELETE con el uuid', async () => {
    mockPost().mockResolvedValueOnce({ data: activeProvider } as never)
    const created = await createProviderApi({
      nombre_empresa: 'Aceros del Caribe S.A.S.',
      nit: '900123456-7',
      categoria_material: 'Estructura',
    })
    expect(mockPost()).toHaveBeenCalledWith('/providers', expect.objectContaining({ nit: '900123456-7' }))
    expect(created.id_proveedor).toBe('p-1-active')

    mockPatch().mockResolvedValueOnce({ data: { ...activeProvider, nombre_empresa: 'Renombrada' } } as never)
    const updated = await updateProviderApi('p-1-active', { nombre_empresa: 'Renombrada' })
    expect(mockPatch()).toHaveBeenCalledWith('/providers/p-1-active', { nombre_empresa: 'Renombrada' })
    expect(updated.nombre_empresa).toBe('Renombrada')

    mockDelete().mockResolvedValueOnce(undefined as never)
    await deleteProviderApi('p-1-active')
    expect(mockDelete()).toHaveBeenCalledWith('/providers/p-1-active')
  })

  it('getProductsApi filtra productos inactivos y normaliza id_proveedor null', async () => {
    mockGet().mockResolvedValueOnce({
      data: { items: [activeProduct, inactiveProduct], total: 2, skip: 0, limit: 50 },
    } as never)

    const res = await getProductsApi(0, 50)

    expect(mockGet()).toHaveBeenCalledWith('/products', { params: { skip: 0, limit: 50 } })
    expect(res.items).toHaveLength(1)
    expect(res.items[0].id_proveedor).toBe('p-1-active')
  })

  it('getProductApi/create/update/delete de productos usan el uuid', async () => {
    mockGet().mockResolvedValueOnce({ data: activeProduct } as never)
    const product = await getProductApi('prod-1')
    expect(mockGet()).toHaveBeenCalledWith('/products/prod-1')
    expect(product.id_producto).toBe('prod-1')

    mockPost().mockResolvedValueOnce({ data: activeProduct } as never)
    await createProductApi({ nombre: 'Cubierta', unidad_medida: 'unidad' })
    expect(mockPost()).toHaveBeenCalledWith('/products', { nombre: 'Cubierta', unidad_medida: 'unidad' })

    mockPatch().mockResolvedValueOnce({ data: { ...activeProduct, precio_unitario: 9 } } as never)
    await updateProductApi('prod-1', { precio_unitario: 9 })
    expect(mockPatch()).toHaveBeenCalledWith('/products/prod-1', { precio_unitario: 9 })

    mockDelete().mockResolvedValueOnce(undefined as never)
    await deleteProductApi('prod-1')
    expect(mockDelete()).toHaveBeenCalledWith('/products/prod-1')
  })

  it('getClientsApi pasa estado/tipo y filtra clientes inactivos', async () => {
    mockGet().mockResolvedValueOnce({
      data: { items: [activeClient, inactiveClient], total: 2, skip: 0, limit: 500 },
    } as never)

    const res = await getClientsApi(0, 500, undefined, 'activo', 'empresa')

    expect(mockGet()).toHaveBeenCalledWith('/clients', {
      params: { skip: 0, limit: 500, estado: 'activo', tipo: 'empresa' },
    })
    expect(res.items).toHaveLength(1)
    expect(res.items[0].nombre_razon_social).toBe('Andinas')
  })

  it('getClientApi/create/update/delete de clientes usan el uuid', async () => {
    mockGet().mockResolvedValueOnce({ data: activeClient } as never)
    const client = await getClientApi('cl-1')
    expect(mockGet()).toHaveBeenCalledWith('/clients/cl-1')
    expect(client.id_cliente).toBe('cl-1')

    mockPost().mockResolvedValueOnce({ data: activeClient } as never)
    await createClientApi({ tipo_cliente: 'empresa', nombre_razon_social: 'Andinas', nit_cc: '900200300-1' })
    expect(mockPost()).toHaveBeenCalledWith('/clients', expect.objectContaining({ nit_cc: '900200300-1' }))

    mockPatch().mockResolvedValueOnce({ data: { ...activeClient, nombre_razon_social: 'Renombrada' } } as never)
    const updated = await updateClientApi('cl-1', { nombre_razon_social: 'Renombrada' })
    expect(mockPatch()).toHaveBeenCalledWith('/clients/cl-1', { nombre_razon_social: 'Renombrada' })
    expect(updated.nombre_razon_social).toBe('Renombrada')

    mockDelete().mockResolvedValueOnce(undefined as never)
    await deleteClientApi('cl-1')
    expect(mockDelete()).toHaveBeenCalledWith('/clients/cl-1')
  })

  it('getMovementsApi pasa filtros y enriquece con nombre de producto y usuario', async () => {
    mockGet()
      .mockResolvedValueOnce({
        data: { items: [movementRow], total: 1, skip: 0, limit: 50 },
      } as never)
      .mockResolvedValueOnce({
        data: { items: [activeProduct], total: 1, skip: 0, limit: 500 },
      } as never)
      .mockResolvedValueOnce({
        data: [{ id: 'u-1', name: 'Bodega User', email: 'b@test.com', rol: 'bodega', status: true }],
      } as never)

    const res = await getMovementsApi(0, 50, 'prod-1', '2026-01-01', '2026-01-31')

    expect(mockGet()).toHaveBeenNthCalledWith(1, '/movements', {
      params: { skip: 0, limit: 50, product_id: 'prod-1', date_from: '2026-01-01', date_to: '2026-01-31' },
    })
    expect(res.items).toHaveLength(1)
    expect(res.items[0].nombre_producto).toBe('Cubierta')
    expect(res.items[0].nombre_usuario).toBe('Bodega User')
  })

  it('createEntryApi publica el movimiento y lo devuelve enriquecido', async () => {
    mockPost().mockResolvedValueOnce({ data: movementRow } as never)
    mockGet()
      .mockResolvedValueOnce({
        data: { items: [activeProduct], total: 1, skip: 0, limit: 500 },
      } as never)
      .mockResolvedValueOnce({
        data: [{ id: 'u-1', name: 'Bodega User', email: 'b@test.com', rol: 'bodega', status: true }],
      } as never)

    const created = await createEntryApi({ product_id: 'prod-1', quantity: 5, note: 'Entrada' })

    expect(mockPost()).toHaveBeenCalledWith('/movements/entry', {
      product_id: 'prod-1',
      quantity: 5,
      note: 'Entrada',
    })
    expect(created.id_movimiento).toBe('mv-1')
    expect(created.nombre_producto).toBe('Cubierta')
    expect(created.nombre_usuario).toBe('Bodega User')
  })
})