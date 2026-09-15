import { execSync } from 'node:child_process'

const API = 'http://localhost:8000/api/v1'
const DB_CONTAINER = 'backend-erp-db-1'
const DB_USER = 'erpdb'
const DB_NAME = 'erpdatabase'

const KEEP_USERS = "'admin_user@abacubiertas.com','jhonhdzb123@gmail.com'"

export const E2E_USERS = [
  { name: 'Administrador ERP', email: 'admin@test.com', password: 'Admin12345!', rol: 'admin' },
  { name: 'Asesor Comercial', email: 'ventas@test.com', password: 'Ventas12345!', rol: 'ventas' },
  { name: 'Encargado Compras', email: 'compras@test.com', password: 'Compras12345!', rol: 'compras' },
  { name: 'Encargado Bodega', email: 'bodega@test.com', password: 'Bodega12345!', rol: 'bodega' },
  { name: 'Gerencia General', email: 'gerencia@test.com', password: 'Gerencia12345!', rol: 'gerencia' },
]

const SEED_PROVIDERS = [
  {
    nombre_empresa: 'Aceros del Caribe S.A.S.',
    nit: '900123456-1',
    contacto: 'Carlos Mendoza',
    telefono: '3151234567',
    email: 'ventas@acerosdelcaribe.com',
    direccion: 'Av. Industrial 45 # 12-30',
    ciudad: 'Barranquilla',
    categoria_material: 'estructuras',
    condiciones_pago: '30 días',
    observaciones: 'Proveedor principal de perfiles de acero',
    estado: 'preferente',
  },
  {
    nombre_empresa: 'Plásticos & Cubiertas Polímeros',
    nit: '800654321-2',
    contacto: 'Lucía Gómez',
    telefono: '3109876543',
    email: 'contacto@plasticospolimeros.co',
    direccion: 'Zona Industrial Cazucá Manzana 4',
    ciudad: 'Bogotá',
    categoria_material: 'cubiertas',
    condiciones_pago: '15 días',
    observaciones: 'Distribuidor directo de tejas termoacústicas UPVC',
    estado: 'activo',
  },
  {
    nombre_empresa: 'Fijaciones & Tornillos Industriales',
    nit: '860777888-3',
    contacto: 'Andrés Torres',
    telefono: '3185551234',
    email: 'ventas@fijacionestornillos.com',
    direccion: 'Calle 13 # 68-45',
    ciudad: 'Bogotá',
    categoria_material: 'tornilleria',
    condiciones_pago: 'Contado',
    observaciones: 'Tornillería autoperforante y arandelas de neopreno',
    estado: 'activo',
  },
]

const SEED_PRODUCTS = [
  {
    nombre: 'Cubierta UPVC Termoacústica 3 Capas 2.44m',
    descripcion: 'Teja termoacústica UPVC color blanco/terracota de 2.44m de longitud',
    unidad_medida: 'unidad',
    precio_unitario: 85000,
    stock_inicial: 45,
    stock_minimo: 20,
  },
  {
    nombre: 'Perfil C 100x50x2mm 6m Galvanizado',
    descripcion: 'Correa en acero galvanizado para soporte estructural de cubiertas',
    unidad_medida: 'unidad',
    precio_unitario: 62000,
    stock_inicial: 8,
    stock_minimo: 15,
  },
  {
    nombre: 'Tornillo Autoperforante 2" Punta Broca con Arandela (Caja x 100)',
    descripcion: 'Tornillo galvanizado con arandela EPDM para fijación de cubiertas',
    unidad_medida: 'caja',
    precio_unitario: 28000,
    stock_inicial: 5,
    stock_minimo: 10,
  },
  {
    nombre: 'Lámina Policarbonato Alveolar 6mm 2.10x5.80m Cristal',
    descripcion: 'Lámina traslúcida alveolar con protección UV',
    unidad_medida: 'unidad',
    precio_unitario: 175000,
    stock_inicial: 30,
    stock_minimo: 10,
  },
  {
    nombre: 'Caballete Articulado UPVC Blanco 1.05m',
    descripcion: 'Cumbrera articulada para remate superior de tejados UPVC',
    unidad_medida: 'unidad',
    precio_unitario: 34000,
    stock_inicial: 2,
    stock_minimo: 12,
  },
]

const SEED_CLIENTS = [
  {
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
  },
  {
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
  },
  {
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
  },
]

const resetDatabase = (): void => {
  // system_settings es una fila singleton que no se borra con TRUNCATE:
  // se restaura a sus valores por defecto para determinismo entre tests.
  const sql =
    `TRUNCATE TABLE purchase_orders, sales, quotations, movements, products, providers, clients, revoked_tokens CASCADE; ` +
    `DELETE FROM users WHERE email NOT IN (${KEEP_USERS}); ` +
    `UPDATE system_settings SET stock_minimo_default=15, margen_utilidad_default=30, ` +
    `catalogo_inicial_cargado=TRUE, aprobacion_oc_habilitada=FALSE, aprobacion_oc_monto_minimo=5000000`
  execSync(
    `docker exec ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME} -v ON_ERROR_STOP=1 -c "${sql}"`,
    { stdio: 'pipe' },
  )
}

const loginAdmin = async (): Promise<string> => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jhonhdzb123@gmail.com', password: 'prueba' }),
  })
  if (!res.ok) {
    throw new Error(`Login del usuario admin de seed falló (${res.status}): ${await res.text()}`)
  }
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

const api = async <T = unknown>(
  token: string,
  path: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: unknown,
): Promise<T> => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`[seed] ${method} ${path} → ${res.status}: ${await res.text()}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

const registerUsers = async (token: string): Promise<void> => {
  for (const u of E2E_USERS) {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(u),
    })
    if (!res.ok && res.status !== 409) {
      throw new Error(`[seed] register ${u.email} falló (${res.status}): ${await res.text()}`)
    }
  }
}

const seedBusinessData = async (token: string): Promise<void> => {
  const providers = await Promise.all(
    SEED_PROVIDERS.map((p) => api(token, '/providers', 'POST', p) as Promise<{ id_proveedor: string }>),
  )
  const byName = (name: string) =>
    providers.find((p) => p.nombre_empresa === name)!.id_proveedor

  const productSeed = SEED_PRODUCTS.map((p, i) => {
    const proveedor =
      i === 1
        ? byName('Aceros del Caribe S.A.S.')
        : i === 2
          ? byName('Fijaciones & Tornillos Industriales')
          : byName('Plásticos & Cubiertas Polímeros')
    return { ...p, id_proveedor: proveedor }
  })
  const products = await Promise.all(
    productSeed.map((p) => api(token, '/products', 'POST', p) as Promise<{ id_producto: string; nombre: string }>),
  )
  const productByName = (name: string) => products.find((p) => p.nombre === name)!.id_producto

  const clients = await Promise.all(
    SEED_CLIENTS.map(
      (c) => api(token, '/clients', 'POST', c) as Promise<{ id_cliente: string; nombre_razon_social: string }>,
    ),
  )
  const clientByName = (name: string) => clients.find((c) => c.nombre_razon_social === name)!.id_cliente

  // COT-0001 (enviada) + COT-0002 (borrador)
  const cot1 = await api(token, '/quotations', 'POST', {
    id_cliente: clientByName('Construcciones & Cubiertas Andinas S.A.S.'),
    observaciones: 'Cotización para proyecto bodega norte',
    descuento: 0,
    detalles: [
      {
        id_producto: productByName('Cubierta UPVC Termoacústica 3 Capas 2.44m'),
        cantidad: 20,
        precio_unitario: 85000,
        descuento: 0,
      },
    ],
  })
  await api(token, `/quotations/${cot1.id_cotizacion}/estado`, 'PATCH', { estado: 'enviada' })

  await api(token, '/quotations', 'POST', {
    id_cliente: clientByName('Estructuras Metálicas de Occidente'),
    observaciones: 'Perfiles para estructura liviana',
    descuento: 0,
    detalles: [
      {
        id_producto: productByName('Perfil C 100x50x2mm 6m Galvanizado'),
        cantidad: 10,
        precio_unitario: 62000,
        descuento: 0,
      },
    ],
  })

  // PED-0001 (en_proceso)
  const sale = await api(token, '/sales', 'POST', {
    id_cliente: clientByName('Construcciones & Cubiertas Andinas S.A.S.'),
    observaciones: 'Pedido confirmado según cotización COT-0001',
    detalles: [
      {
        id_producto: productByName('Cubierta UPVC Termoacústica 3 Capas 2.44m'),
        cantidad: 20,
        precio_unitario: 85000,
        descuento: 0,
      },
    ],
  })
  await api(token, `/sales/${sale.id_orden_venta}`, 'PATCH', { estado: 'en_proceso' })

  // OC-0001 (en_tránsito) + OC-0002 (enviada)
  const oc1 = await api(token, '/purchase-orders', 'POST', {
    id_proveedor: byName('Plásticos & Cubiertas Polímeros'),
    observaciones: 'Mercancía en tránsito, pendiente de recepción por Bodega',
    detalles: [
      {
        id_producto: productByName('Cubierta UPVC Termoacústica 3 Capas 2.44m'),
        cantidad_ordenada: 60,
        precio_unitario: 82000,
        tiempo_entrega_dias: 10,
      },
      {
        id_producto: productByName('Perfil C 100x50x2mm 6m Galvanizado'),
        cantidad_ordenada: 30,
        precio_unitario: 60000,
        tiempo_entrega_dias: 12,
      },
    ],
  })
  await api(token, `/purchase-orders/${oc1.id_orden_compra}/mark-transit`, 'POST')

  await api(token, '/purchase-orders', 'POST', {
    id_proveedor: byName('Plásticos & Cubiertas Polímeros'),
    observaciones: 'Compra de accesorios para remate de cubiertas',
    detalles: [
      {
        id_producto: productByName('Caballete Articulado UPVC Blanco 1.05m'),
        cantidad_ordenada: 50,
        precio_unitario: 32000,
        tiempo_entrega_dias: 8,
      },
    ],
  })
}

export const resetAndSeedBackend = async (): Promise<void> => {
  resetDatabase()
  const token = await loginAdmin()
  await registerUsers(token)
  await seedBusinessData(token)
}