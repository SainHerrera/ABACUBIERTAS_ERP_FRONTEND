import type { ApiProvider } from '../types/provider'
import type { Provider } from '../types/provider'
import type { ApiProduct } from '../types/product'
import type { Product } from '../types/product'
import type { ApiClient } from '../types/sales'
import type { Client } from '../types/sales'
import type { ApiMovement } from '../types/movement'
import type { Movement } from '../types/movement'

export function mapApiProvider(raw: ApiProvider): Provider {
  return {
    id_proveedor: raw.id_proveedor,
    nombre_empresa: raw.nombre_empresa,
    nit: raw.nit,
    contacto: raw.contacto ?? undefined,
    telefono: raw.telefono ?? undefined,
    email: raw.email ?? undefined,
    direccion: raw.direccion ?? undefined,
    ciudad: raw.ciudad ?? undefined,
    categoria_material: raw.categoria_material,
    condiciones_pago: raw.condiciones_pago ?? undefined,
    observaciones: raw.observaciones ?? undefined,
    estado: raw.estado ?? 'activo',
    activo: raw.activo ?? true,
  }
}

export function mapApiProduct(raw: ApiProduct): Product {
  return {
    id_producto: raw.id_producto,
    nombre: raw.nombre,
    descripcion: raw.descripcion ?? undefined,
    unidad_medida: raw.unidad_medida,
    precio_unitario: raw.precio_unitario,
    stock_actual: raw.stock_actual,
    stock_minimo: raw.stock_minimo,
    id_proveedor: raw.id_proveedor ?? undefined,
    nombre_proveedor: raw.nombre_proveedor ?? undefined,
    activo: raw.activo ?? true,
    status: raw.status ?? 'normal',
    low_stock: raw.low_stock ?? false,
  }
}

export function mapApiClient(raw: ApiClient): Client {
  return {
    id_cliente: raw.id_cliente,
    tipo_cliente: raw.tipo_cliente,
    nombre_razon_social: raw.nombre_razon_social,
    nit_cc: raw.nit_cc,
    nombre_contacto: raw.nombre_contacto ?? undefined,
    telefono: raw.telefono ?? undefined,
    email: raw.email ?? undefined,
    direccion: raw.direccion ?? undefined,
    ciudad: raw.ciudad ?? undefined,
    observaciones: raw.observaciones ?? undefined,
    estado: raw.estado,
    activo: raw.activo ?? true,
    created_at: raw.created_at ?? undefined,
    updated_at: raw.updated_at ?? undefined,
  }
}

export function mapApiMovement(raw: ApiMovement): Movement {
  return {
    id_movimiento: raw.id_movimiento,
    id_producto: raw.id_producto,
    tipo: raw.tipo,
    cantidad: raw.cantidad,
    referencia: raw.referencia ?? undefined,
    id_usuario: raw.id_usuario,
    fecha: raw.fecha,
    nota: raw.nota ?? undefined,
  }
}