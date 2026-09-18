import type { User } from '../../types/auth'
import type { Product } from '../../types/product'
import type { Movement } from '../../types/movement'
import type { Provider } from '../../types/provider'
import type { Client, Quotation, Sale } from '../../types/sales'
import type { SystemSettings } from '../../types/settings'
import type { PurchaseOrder } from '../../types/purchaseOrder'
import type { StockRequest } from '../../types/stockRequest'
import type { ProviderQuotation } from '../../types/providerQuotation'
import type { AuditLogEntry } from '../../types/auditLog'
import { hashPassword } from '../../utils/password'

// Deterministic UUIDs for seed catalogs (mirrors the FASE 5 backend UUID contract)
export const SEED_PROVIDER_ACEROS = '00000000-0000-4000-8000-000000000001'
export const SEED_PROVIDER_PLASTICOS = '00000000-0000-4000-8000-000000000002'
export const SEED_PROVIDER_FIJACIONES = '00000000-0000-4000-8000-000000000003'

export const SEED_PRODUCT_CUBIERTA = '00000000-0000-4000-8000-000000000101'
export const SEED_PRODUCT_PERFIL = '00000000-0000-4000-8000-000000000102'
export const SEED_PRODUCT_TORNILLO = '00000000-0000-4000-8000-000000000103'
export const SEED_PRODUCT_LAMINA = '00000000-0000-4000-8000-000000000104'
export const SEED_PRODUCT_CABALLETE = '00000000-0000-4000-8000-000000000105'

export const SEED_CLIENT_ANDINAS = '00000000-0000-4000-8000-000000000201'
export const SEED_CLIENT_OCCIDENTE = '00000000-0000-4000-8000-000000000202'
export const SEED_CLIENT_CARLOS = '00000000-0000-4000-8000-000000000203'

export const SEED_MOVEMENT_1 = '00000000-0000-4000-8000-000000000301'
export const SEED_MOVEMENT_2 = '00000000-0000-4000-8000-000000000302'
export const SEED_MOVEMENT_3 = '00000000-0000-4000-8000-000000000303'
export const SEED_MOVEMENT_4 = '00000000-0000-4000-8000-000000000304'
export const SEED_MOVEMENT_5 = '00000000-0000-4000-8000-000000000305'
export const SEED_MOVEMENT_6 = '00000000-0000-4000-8000-000000000306'

export const SEED_SETTINGS: SystemSettings = {
  stockMinimoDefault: 15,
  margenUtilidadDefault: 30,
  catalogoInicialCargado: true,
  aprobacionOcHabilitada: false,
  aprobacionOcMontoMinimo: 5000000,
  updatedAt: undefined,
}

export const SEED_AUDIT_LOG: AuditLogEntry[] = []

export const SEED_PASSWORDS: Record<string, string> = {
  'admin@test.com': 'Admin12345!',
  'ventas@test.com': 'Ventas12345!',
  'compras@test.com': 'Compras12345!',
  'bodega@test.com': 'Bodega12345!',
  'gerencia@test.com': 'Gerencia12345!',
}

export const SEED_USERS: User[] = [
  {
    id_usuario: 1,
    email: 'admin@test.com',
    nombre: 'Administrador ERP',
    rol: 'admin',
    activo: true,
    creado_en: new Date().toISOString(),
    password_hash: hashPassword(SEED_PASSWORDS['admin@test.com']),
  },
  {
    id_usuario: 2,
    email: 'ventas@test.com',
    nombre: 'Asesor Comercial',
    rol: 'ventas',
    activo: true,
    creado_en: new Date().toISOString(),
    password_hash: hashPassword(SEED_PASSWORDS['ventas@test.com']),
  },
  {
    id_usuario: 3,
    email: 'compras@test.com',
    nombre: 'Encargado Compras',
    rol: 'compras',
    activo: true,
    creado_en: new Date().toISOString(),
    password_hash: hashPassword(SEED_PASSWORDS['compras@test.com']),
  },
  {
    id_usuario: 4,
    email: 'bodega@test.com',
    nombre: 'Encargado Bodega',
    rol: 'bodega',
    activo: true,
    creado_en: new Date().toISOString(),
    password_hash: hashPassword(SEED_PASSWORDS['bodega@test.com']),
  },
  {
    id_usuario: 5,
    email: 'gerencia@test.com',
    nombre: 'Gerencia General',
    rol: 'gerencia',
    activo: true,
    creado_en: new Date().toISOString(),
    password_hash: hashPassword(SEED_PASSWORDS['gerencia@test.com']),
  },
]

export const SEED_PROVIDERS: Provider[] = [
  {
    id_proveedor: SEED_PROVIDER_ACEROS,
    nombre_empresa: 'Aceros del Caribe S.A.S.',
    nit: '900123456-1',
    contacto: 'Carlos Mendoza',
    telefono: '3151234567',
    email: 'ventas@acerosdelcaribe.com',
    direccion: 'Av. Industrial 45 # 12-30',
    ciudad: 'Barranquilla',
    categoria_material: 'estructuras',
    condiciones_pago: '30 días',
    estado: 'preferente',
    observaciones: 'Proveedor principal de perfiles de acero',
    creado_en: '2026-01-10T08:00:00Z',
    actualizado_en: '2026-01-10T08:00:00Z',
  },
  {
    id_proveedor: SEED_PROVIDER_PLASTICOS,
    nombre_empresa: 'Plásticos & Cubiertas Polímeros',
    nit: '800654321-2',
    contacto: 'Lucía Gómez',
    telefono: '3109876543',
    email: 'contacto@plasticospolimeros.co',
    direccion: 'Zona Industrial Cazucá Manzana 4',
    ciudad: 'Bogotá',
    categoria_material: 'cubiertas',
    condiciones_pago: '15 días',
    estado: 'activo',
    observaciones: 'Distribuidor directo de tejas termoacústicas UPVC',
    creado_en: '2026-01-12T09:30:00Z',
    actualizado_en: '2026-01-12T09:30:00Z',
  },
  {
    id_proveedor: SEED_PROVIDER_FIJACIONES,
    nombre_empresa: 'Fijaciones & Tornillos Industriales',
    nit: '860777888-3',
    contacto: 'Andrés Torres',
    telefono: '3185551234',
    email: 'ventas@fijacionestornillos.com',
    direccion: 'Calle 13 # 68-45',
    ciudad: 'Bogotá',
    categoria_material: 'tornilleria',
    condiciones_pago: 'Contado',
    estado: 'activo',
    observaciones: 'Tornillería autoperforante y arandelas de neopreno',
    creado_en: '2026-01-15T11:00:00Z',
    actualizado_en: '2026-01-15T11:00:00Z',
  },
]

export const SEED_PRODUCTS: Product[] = [
  {
    id_producto: SEED_PRODUCT_CUBIERTA,
    nombre: 'Cubierta UPVC Termoacústica 3 Capas 2.44m',
    descripcion: 'Teja termoacústica UPVC color blanco/terracota de 2.44m de longitud',
    unidad_medida: 'unidad',
    precio_unitario: 85000,
    stock_actual: 45,
    stock_minimo: 20,
    id_proveedor: SEED_PROVIDER_PLASTICOS,
    nombre_proveedor: 'Plásticos & Cubiertas Polímeros',
    activo: true,
    status: 'normal',
    low_stock: false,
  },
  {
    id_producto: SEED_PRODUCT_PERFIL,
    nombre: 'Perfil C 100x50x2mm 6m Galvanizado',
    descripcion: 'Correa en acero galvanizado para soporte estructural de cubiertas',
    unidad_medida: 'unidad',
    precio_unitario: 62000,
    stock_actual: 8,
    stock_minimo: 15,
    id_proveedor: SEED_PROVIDER_ACEROS,
    nombre_proveedor: 'Aceros del Caribe S.A.S.',
    activo: true,
    status: 'low',
    low_stock: true,
  },
  {
    id_producto: SEED_PRODUCT_TORNILLO,
    nombre: 'Tornillo Autoperforante 2" Punta Broca con Arandela (Caja x 100)',
    descripcion: 'Tornillo galvanizado con arandela EPDM para fijación de cubiertas',
    unidad_medida: 'caja',
    precio_unitario: 28000,
    stock_actual: 5,
    stock_minimo: 10,
    id_proveedor: SEED_PROVIDER_FIJACIONES,
    nombre_proveedor: 'Fijaciones & Tornillos Industriales',
    activo: true,
    status: 'low',
    low_stock: true,
  },
  {
    id_producto: SEED_PRODUCT_LAMINA,
    nombre: 'Lámina Policarbonato Alveolar 6mm 2.10x5.80m Cristal',
    descripcion: 'Lámina traslúcida alveolar con protección UV',
    unidad_medida: 'unidad',
    precio_unitario: 175000,
    stock_actual: 30,
    stock_minimo: 10,
    id_proveedor: SEED_PROVIDER_PLASTICOS,
    nombre_proveedor: 'Plásticos & Cubiertas Polímeros',
    activo: true,
    status: 'normal',
    low_stock: false,
  },
  {
    id_producto: SEED_PRODUCT_CABALLETE,
    nombre: 'Caballete Articulado UPVC Blanco 1.05m',
    descripcion: 'Cumbrera articulada para remate superior de tejados UPVC',
    unidad_medida: 'unidad',
    precio_unitario: 34000,
    stock_actual: 2,
    stock_minimo: 12,
    id_proveedor: SEED_PROVIDER_PLASTICOS,
    nombre_proveedor: 'Plásticos & Cubiertas Polímeros',
    activo: true,
    status: 'low',
    low_stock: true,
  },
]

export const SEED_MOVEMENTS: Movement[] = [
  {
    id_movimiento: SEED_MOVEMENT_1,
    id_producto: SEED_PRODUCT_CUBIERTA,
    nombre_producto: 'Cubierta UPVC Termoacústica 3 Capas 2.44m',
    tipo: 'entrada',
    cantidad: 50,
    referencia: 'OC-1001',
    id_usuario: 1,
    nombre_usuario: 'Administrador ERP',
    fecha: '2026-02-01T10:00:00Z',
    nota: 'Recepción inicial de compra por contenedor',
  },
  {
    id_movimiento: SEED_MOVEMENT_2,
    id_producto: SEED_PRODUCT_CUBIERTA,
    nombre_producto: 'Cubierta UPVC Termoacústica 3 Capas 2.44m',
    tipo: 'salida',
    cantidad: 5,
    referencia: 'PED-501',
    id_usuario: 1,
    nombre_usuario: 'Administrador ERP',
    fecha: '2026-02-05T14:30:00Z',
    nota: 'Despacho obra bodega Guayabal',
  },
  {
    id_movimiento: SEED_MOVEMENT_3,
    id_producto: SEED_PRODUCT_PERFIL,
    nombre_producto: 'Perfil C 100x50x2mm 6m Galvanizado',
    tipo: 'entrada',
    cantidad: 20,
    referencia: 'OC-1002',
    id_usuario: 1,
    nombre_usuario: 'Administrador ERP',
    fecha: '2026-02-02T11:15:00Z',
    nota: 'Ingreso lote de perfiles',
  },
  {
    id_movimiento: SEED_MOVEMENT_4,
    id_producto: SEED_PRODUCT_PERFIL,
    nombre_producto: 'Perfil C 100x50x2mm 6m Galvanizado',
    tipo: 'salida',
    cantidad: 12,
    referencia: 'PED-502',
    id_usuario: 1,
    nombre_usuario: 'Administrador ERP',
    fecha: '2026-02-08T09:00:00Z',
    nota: 'Despacho proyecto estructuras',
  },
  {
    id_movimiento: SEED_MOVEMENT_5,
    id_producto: SEED_PRODUCT_TORNILLO,
    nombre_producto: 'Tornillo Autoperforante 2" Punta Broca con Arandela (Caja x 100)',
    tipo: 'entrada',
    cantidad: 15,
    referencia: 'OC-1003',
    id_usuario: 1,
    nombre_usuario: 'Administrador ERP',
    fecha: '2026-02-03T16:00:00Z',
    nota: 'Ingreso cajas de tornillos',
  },
  {
    id_movimiento: SEED_MOVEMENT_6,
    id_producto: SEED_PRODUCT_TORNILLO,
    nombre_producto: 'Tornillo Autoperforante 2" Punta Broca con Arandela (Caja x 100)',
    tipo: 'salida',
    cantidad: 10,
    referencia: 'PED-503',
    id_usuario: 1,
    nombre_usuario: 'Administrador ERP',
    fecha: '2026-02-10T12:00:00Z',
    nota: 'Salida a montaje',
  },
]

export const SEED_CLIENTS: Client[] = [
  {
    id_cliente: SEED_CLIENT_ANDINAS,
    tipo_cliente: 'empresa',
    nombre_razon_social: 'Construcciones & Cubiertas Andinas S.A.S.',
    nit_cc: '900555123-4',
    nombre_contacto: 'Ing. Fernando Castro',
    telefono: '3124567890',
    email: 'proyectos@cubiertasandinas.co',
    direccion: 'Calle 100 # 15-20',
    ciudad: 'Bogotá',
    observaciones: 'Cliente corporativo para obras industriales',
    estado: 'corporativo',
    activo: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
  },
  {
    id_cliente: SEED_CLIENT_OCCIDENTE,
    tipo_cliente: 'empresa',
    nombre_razon_social: 'Estructuras Metálicas de Occidente',
    nit_cc: '890987654-1',
    nombre_contacto: 'Arq. Marcela Ruiz',
    telefono: '3176543210',
    email: 'compras@estructurasoccidente.com',
    direccion: 'Carrera 43A # 1-50',
    ciudad: 'Medellín',
    observaciones: 'Fabricante de cerchas y galpones avícolas',
    estado: 'frecuente',
    activo: true,
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z',
  },
  {
    id_cliente: SEED_CLIENT_CARLOS,
    tipo_cliente: 'persona_natural',
    nombre_razon_social: 'Carlos Eduardo Ramírez Gómez',
    nit_cc: '79845123',
    nombre_contacto: 'Carlos Ramírez',
    telefono: '3009876543',
    email: 'carlos.ramirez@gmail.com',
    direccion: 'Calle 45 # 22-10',
    ciudad: 'Cali',
    observaciones: 'Cliente residencial para remodelación de vivienda',
    estado: 'activo',
    activo: true,
    created_at: '2026-01-20T11:00:00Z',
    updated_at: '2026-01-20T11:00:00Z',
  },
]

export const SEED_USER_ADMIN_UUID = '00000000-0000-4000-8000-000000000401'

export const SEED_QUOTATION_1 = '00000000-0000-4000-8000-000000000501'
export const SEED_QUOTATION_2 = '00000000-0000-4000-8000-000000000502'

export const SEED_SALE_1 = '00000000-0000-4000-8000-000000000601'
export const SEED_SALE_2 = '00000000-0000-4000-8000-000000000602'

export const SEED_PURCHASE_ORDER_1 = '00000000-0000-4000-8000-000000000701'
export const SEED_PURCHASE_ORDER_2 = '00000000-0000-4000-8000-000000000702'

export const SEED_QUOTATIONS: Quotation[] = [
  {
    id_cotizacion: SEED_QUOTATION_1,
    numero_consecutivo: 'COT-0001',
    id_cliente: SEED_CLIENT_ANDINAS,
    nombre_cliente: 'Construcciones & Cubiertas Andinas S.A.S.',
    id_usuario: SEED_USER_ADMIN_UUID,
    fecha_emision: '2026-02-15T08:00:00Z',
    fecha_vencimiento: '2026-03-15T08:00:00Z',
    estado: 'enviada',
    subtotal: 1700000,
    impuestos: 323000,
    descuento: 0,
    total: 2023000,
    observaciones: 'Cotización para proyecto bodega norte',
    detalles: [
      {
        id_detalle: 1,
        id_producto: SEED_PRODUCT_CUBIERTA,
        descripcion: 'Cubierta UPVC Termoacústica 3 Capas 2.44m',
        cantidad: 20,
        precio_unitario: 85000,
        descuento: 0,
        subtotal: 1700000,
      },
    ],
  },
  {
    id_cotizacion: SEED_QUOTATION_2,
    numero_consecutivo: 'COT-0002',
    id_cliente: SEED_CLIENT_OCCIDENTE,
    nombre_cliente: 'Cubiertas & Estructuras de Occidente S.A.S.',
    id_usuario: SEED_USER_ADMIN_UUID,
    fecha_emision: '2026-02-18T10:30:00Z',
    fecha_vencimiento: '2026-03-18T10:30:00Z',
    estado: 'borrador',
    subtotal: 620000,
    impuestos: 117800,
    descuento: 0,
    total: 737800,
    observaciones: 'Perfiles para estructura liviana',
    detalles: [
      {
        id_detalle: 2,
        id_producto: SEED_PRODUCT_PERFIL,
        descripcion: 'Perfil C 100x50x2mm 6m Galvanizado',
        cantidad: 10,
        precio_unitario: 62000,
        descuento: 0,
        subtotal: 620000,
      },
    ],
  },
]

export const SEED_SALES: Sale[] = [
  {
    id_orden_venta: SEED_SALE_1,
    numero_orden: 'PED-0001',
    id_cliente: SEED_CLIENT_ANDINAS,
    nombre_cliente: 'Construcciones & Cubiertas Andinas S.A.S.',
    id_cotizacion: SEED_QUOTATION_1,
    id_usuario: SEED_USER_ADMIN_UUID,
    fecha_venta: '2026-02-16T14:00:00Z',
    estado: 'en_proceso',
    subtotal: 1700000,
    impuestos: 323000,
    total: 2023000,
    observaciones: 'Pedido confirmado según cotización COT-0001',
    detalles: [
      {
        id_detalle_venta: 1,
        id_producto: SEED_PRODUCT_CUBIERTA,
        descripcion: 'Cubierta UPVC Termoacústica 3 Capas 2.44m',
        cantidad: 20,
        precio_unitario: 85000,
        descuento: 0,
        subtotal: 1700000,
      },
    ],
  },
]

export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id_orden_compra: SEED_PURCHASE_ORDER_1,
    numero_oc: 'OC-0001',
    id_proveedor: SEED_PROVIDER_PLASTICOS,
    nombre_proveedor: 'Plásticos & Cubiertas Polímeros',
    fecha_emision: '2026-08-20T10:00:00Z',
    estado: 'en_transito',
    observaciones: 'Mercancía en tránsito, pendiente de recepción por Bodega',
    total: 6720000,
    detalles: [
      {
        id_detalle_oc: 1,
        id_producto: SEED_PRODUCT_CUBIERTA,
        descripcion: 'Cubierta UPVC Termoacústica 3 Capas 2.44m',
        cantidad_ordenada: 60,
        cantidad_recibida: 0,
        precio_unitario: 82000,
        tiempo_entrega_dias: 10,
      },
      {
        id_detalle_oc: 2,
        id_producto: SEED_PRODUCT_PERFIL,
        descripcion: 'Perfil C 100x50x2mm 6m Galvanizado',
        cantidad_ordenada: 30,
        cantidad_recibida: 0,
        precio_unitario: 60000,
        tiempo_entrega_dias: 12,
      },
    ],
  },
  {
    id_orden_compra: SEED_PURCHASE_ORDER_2,
    numero_oc: 'OC-0002',
    id_proveedor: SEED_PROVIDER_PLASTICOS,
    nombre_proveedor: 'Plásticos & Cubiertas Polímeros',
    fecha_emision: '2026-08-25T09:00:00Z',
    estado: 'enviada',
    observaciones: 'Compra de accesorios para remate de cubiertas',
    total: 1600000,
    detalles: [
      {
        id_detalle_oc: 3,
        id_producto: SEED_PRODUCT_CABALLETE,
        descripcion: 'Caballete Articulado UPVC Blanco 1.05m',
        cantidad_ordenada: 50,
        cantidad_recibida: 0,
        precio_unitario: 32000,
        tiempo_entrega_dias: 8,
      },
    ],
  },
]

export const SEED_STOCK_REQUESTS: StockRequest[] = [
  {
    id_solicitud: '1',
    numero_solicitud: 'SOL-0001',
    id_producto: SEED_PRODUCT_PERFIL,
    descripcion: 'Perfil C 100x50x2mm 6m Galvanizado',
    cantidad_sugerida: 25,
    stock_actual: 8,
    stock_minimo: 15,
    estado: 'pendiente',
    fecha: '2026-08-26T09:00:00Z',
    id_usuario: '4',
    nombre_usuario: 'Encargado Bodega',
    observaciones: 'Stock bajo, requiere reposición de perfiles',
  },
  {
    id_solicitud: '2',
    numero_solicitud: 'SOL-0002',
    id_producto: SEED_PRODUCT_CABALLETE,
    descripcion: 'Caballete Articulado UPVC Blanco 1.05m',
    cantidad_sugerida: 40,
    stock_actual: 2,
    stock_minimo: 12,
    estado: 'pendiente',
    fecha: '2026-08-27T09:00:00Z',
    id_usuario: '4',
    nombre_usuario: 'Encargado Bodega',
    observaciones: 'Bajo inventario de caballetes',
  },
]

export const SEED_PROVIDER_QUOTATIONS: ProviderQuotation[] = [
  {
    id_cotizacion: '1',
    numero_cotizacion: 'COT-0001',
    id_solicitud: '1',
    id_producto: SEED_PRODUCT_PERFIL,
    id_proveedor: SEED_PROVIDER_ACEROS,
    nombre_proveedor: 'Aceros del Caribe S.A.S.',
    precio_unitario: 59000,
    tiempo_entrega_dias: 10,
    condiciones: 'Pago a 30 días, flete incluido',
    fecha: '2026-08-26T10:00:00Z',
    seleccionada: true,
  },
  {
    id_cotizacion: '2',
    numero_cotizacion: 'COT-0002',
    id_solicitud: '1',
    id_producto: SEED_PRODUCT_PERFIL,
    id_proveedor: SEED_PROVIDER_PLASTICOS,
    nombre_proveedor: 'Plásticos & Cubiertas Polímeros',
    precio_unitario: 62000,
    tiempo_entrega_dias: 15,
    condiciones: 'Pago contado, flete no incluido',
    fecha: '2026-08-26T11:00:00Z',
    seleccionada: false,
  },
  {
    id_cotizacion: '3',
    numero_cotizacion: 'COT-0003',
    id_solicitud: '2',
    id_producto: SEED_PRODUCT_CABALLETE,
    id_proveedor: SEED_PROVIDER_PLASTICOS,
    nombre_proveedor: 'Plásticos & Cubiertas Polímeros',
    precio_unitario: 33000,
    tiempo_entrega_dias: 7,
    condiciones: 'Pago a 15 días',
    fecha: '2026-08-27T10:00:00Z',
    seleccionada: false,
  },
  {
    id_cotizacion: '4',
    numero_cotizacion: 'COT-0004',
    id_solicitud: '2',
    id_producto: SEED_PRODUCT_CABALLETE,
    id_proveedor: SEED_PROVIDER_ACEROS,
    nombre_proveedor: 'Aceros del Caribe S.A.S.',
    precio_unitario: 35000,
    tiempo_entrega_dias: 9,
    condiciones: 'Pago a 30 días',
    fecha: '2026-08-27T11:00:00Z',
    seleccionada: false,
  },
]
