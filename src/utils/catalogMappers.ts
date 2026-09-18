import type { ApiProvider } from '../types/provider'
import type { Provider } from '../types/provider'
import type { ApiProduct } from '../types/product'
import type { Product } from '../types/product'
import type { ApiClient } from '../types/sales'
import type { Client } from '../types/sales'
import type { ApiMovement } from '../types/movement'
import type { Movement } from '../types/movement'
import type { ApiQuotation } from '../types/sales'
import type { Quotation } from '../types/sales'
import type { ApiSale } from '../types/sales'
import type { Sale } from '../types/sales'
import type { ApiPurchaseOrder } from '../types/purchaseOrder'
import type { PurchaseOrder } from '../types/purchaseOrder'
import type { ApiStockRequest } from '../types/stockRequest'
import type { StockRequest } from '../types/stockRequest'
import type { ApiProviderQuotation } from '../types/providerQuotation'
import type { ProviderQuotation } from '../types/providerQuotation'

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

export function mapApiQuotation(raw: ApiQuotation): Quotation {
  return {
    id_cotizacion: raw.id_cotizacion,
    numero_consecutivo: raw.numero_consecutivo,
    id_cliente: raw.id_cliente,
    nombre_cliente: raw.nombre_cliente ?? undefined,
    id_usuario: raw.id_usuario ?? '',
    fecha_emision: raw.fecha_emision,
    fecha_vencimiento: raw.fecha_vencimiento ?? undefined,
    estado: raw.estado,
    subtotal: Number(raw.subtotal) || 0,
    impuestos: Number(raw.impuestos) || 0,
    descuento: Number(raw.descuento) || 0,
    total: Number(raw.total) || 0,
    observaciones: raw.observaciones ?? undefined,
    detalles: (raw.detalles ?? []).map((d) => ({
      id_detalle: d.id_detalle,
      id_producto: d.id_producto,
      descripcion: d.descripcion ?? null,
      cantidad: Number(d.cantidad) || 0,
      precio_unitario: Number(d.precio_unitario) || 0,
      descuento: Number(d.descuento) || 0,
      subtotal: Number(d.subtotal) || 0,
    })),
  }
}

export function mapApiSale(raw: ApiSale): Sale {
  return {
    id_orden_venta: raw.id_orden_venta,
    numero_orden: raw.numero_orden,
    id_cliente: raw.id_cliente,
    nombre_cliente: raw.nombre_cliente ?? undefined,
    id_cotizacion: raw.id_cotizacion ?? undefined,
    id_usuario: raw.id_usuario ?? undefined,
    fecha_venta: raw.fecha_venta,
    estado: raw.estado,
    subtotal: Number(raw.subtotal) || 0,
    impuestos: Number(raw.impuestos) || 0,
    total: Number(raw.total) || 0,
    observaciones: raw.observaciones ?? undefined,
    detalles: (raw.detalles ?? []).map((d) => ({
      id_detalle_venta: d.id_detalle,
      id_producto: d.id_producto,
      descripcion: d.descripcion ?? '',
      cantidad: Number(d.cantidad) || 0,
      precio_unitario: Number(d.precio_unitario) || 0,
      descuento: Number(d.descuento) || 0,
      subtotal: Number(d.subtotal) || 0,
    })),
  }
}

export function mapApiPurchaseOrder(raw: ApiPurchaseOrder): PurchaseOrder {
  return {
    id_orden_compra: raw.id_orden_compra,
    numero_oc: raw.numero_oc,
    id_proveedor: raw.id_proveedor,
    nombre_proveedor: raw.nombre_proveedor ?? undefined,
    fecha_emision: raw.fecha_emision,
    estado: raw.estado,
    observaciones: raw.observaciones ?? undefined,
    id_solicitud: raw.id_solicitud ?? undefined,
    numero_solicitud: raw.numero_solicitud ?? undefined,
    id_cotizacion: raw.id_cotizacion ?? undefined,
    total: Number(raw.total) || 0,
    detalles: (raw.detalles ?? []).map((d) => ({
      id_detalle_oc: d.id_detalle,
      id_producto: d.id_producto,
      descripcion: d.descripcion ?? '',
      cantidad_ordenada: Number(d.cantidad_ordenada) || 0,
      cantidad_recibida: Number(d.cantidad_recibida) || 0,
      precio_unitario: Number(d.precio_unitario) || 0,
      tiempo_entrega_dias: d.tiempo_entrega_dias ?? undefined,
    })),
  }
}

export function mapApiStockRequest(raw: ApiStockRequest): StockRequest {
  return {
    id_solicitud: raw.id_solicitud,
    numero_solicitud: raw.numero_solicitud,
    id_producto: raw.id_producto,
    descripcion: raw.descripcion ?? '',
    cantidad_sugerida: Number(raw.cantidad_sugerida) || 0,
    stock_actual: Number(raw.stock_actual) || 0,
    stock_minimo: Number(raw.stock_minimo) || 0,
    estado: raw.estado,
    fecha: raw.fecha,
    id_usuario: raw.id_usuario,
    nombre_usuario: raw.nombre_usuario ?? undefined,
    observaciones: raw.observaciones ?? undefined,
  }
}

export function mapApiProviderQuotation(raw: ApiProviderQuotation): ProviderQuotation {
  return {
    id_cotizacion: raw.id_cotizacion,
    numero_cotizacion: raw.numero_cotizacion,
    id_solicitud: raw.id_solicitud,
    id_producto: raw.id_producto,
    id_proveedor: raw.id_proveedor,
    nombre_proveedor: raw.nombre_proveedor ?? undefined,
    precio_unitario: Number(raw.precio_unitario) || 0,
    tiempo_entrega_dias: raw.tiempo_entrega_dias,
    condiciones: raw.condiciones ?? undefined,
    fecha: raw.fecha,
    seleccionada: raw.seleccionada,
  }
}