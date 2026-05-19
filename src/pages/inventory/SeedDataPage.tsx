import { useState } from 'react'
import { IonText, IonButton, IonIcon } from '@ionic/react'
import { checkmarkCircle, refreshOutline, cubeOutline, swapHorizontalOutline, businessOutline } from 'ionicons/icons'
import { SEED_PRODUCTS, SEED_PROVIDERS, SEED_MOVEMENTS, seedLocalData, resetLocalData, hasLocalData, getLocalProducts, getLocalProviders, getLocalMovements } from '../../services/localData'

const typeLabels: Record<string, string> = { entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste' }
const typeChipClass: Record<string, string> = { entrada: 'chip chip-success', salida: 'chip chip-danger', ajuste: 'chip chip-warning' }

export const SeedDataPage = () => {
  const [loaded, setLoaded] = useState(hasLocalData())
  const [products, setProducts] = useState(getLocalProducts())
  const [providers, setProviders] = useState(getLocalProviders())
  const [movements, setMovements] = useState(getLocalMovements())

  const handleSeed = () => {
    resetLocalData()
    seedLocalData()
    setLoaded(true)
    setProducts(getLocalProducts())
    setProviders(getLocalProviders())
    setMovements(getLocalMovements())
  }

  const handleReset = () => {
    resetLocalData()
    setLoaded(false)
    setProducts([])
    setProviders([])
    setMovements([])
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <IonText style={{ fontSize: 24, fontWeight: 700, display: 'block' }}>Datos de Demostración</IonText>
            <IonText color="medium" style={{ fontSize: 14 }}>{loaded ? 'Datos cargados en localStorage' : 'No hay datos cargados'}</IonText>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {loaded && (
              <IonButton fill="outline" color="danger" onClick={handleReset}>
                <IonIcon icon={refreshOutline} slot="start" />
                Limpiar datos
              </IonButton>
            )}
            <IonButton onClick={handleSeed}>
              <IonIcon icon={checkmarkCircle} slot="start" />
              {loaded ? 'Recargar datos demo' : 'Cargar datos demo'}
            </IonButton>
          </div>
        </div>

        {loaded && (
          <div style={{ marginBottom: 20, padding: 12, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IonIcon icon={checkmarkCircle} style={{ color: '#16a34a', fontSize: 20 }} />
            <IonText style={{ fontSize: 13, color: '#166534' }}>
              Datos almacenados en localStorage — {products.length} productos, {providers.length} proveedores, {movements.length} movimientos
            </IonText>
          </div>
        )}

        {/* Proveedores demo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IonIcon icon={businessOutline} style={{ color: 'var(--ion-color-primary)', fontSize: 20 }} />
            <IonText style={{ fontSize: 18, fontWeight: 700 }}>Proveedores ({SEED_PROVIDERS.length})</IonText>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {SEED_PROVIDERS.map((p) => (
              <div key={p.id_proveedor} style={{ borderRadius: 10, border: '1px solid #e2e8f0', padding: 14, background: '#fff' }}>
                <IonText style={{ fontWeight: 600, display: 'block' }}>{p.nombre_empresa}</IonText>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 12, color: '#64748b' }}>
                  <span>NIT: {p.nit}</span>
                  <span>·</span>
                  <span>{p.ciudad}</span>
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <span className="chip chip-primary">{p.categoria_material}</span>
                  <span className="chip chip-success">{p.estado}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productos demo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IonIcon icon={cubeOutline} style={{ color: 'var(--ion-color-primary)', fontSize: 20 }} />
            <IonText style={{ fontSize: 18, fontWeight: 700 }}>Productos ({SEED_PRODUCTS.length})</IonText>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {SEED_PRODUCTS.map((p) => (
              <div key={p.id_producto} style={{ borderRadius: 10, border: '1px solid #e2e8f0', padding: 14, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <IonText style={{ fontWeight: 600, display: 'block' }}>{p.nombre}</IonText>
                    {p.descripcion && <IonText style={{ fontSize: 12, color: '#64748b', display: 'block' }}>{p.descripcion}</IonText>}
                  </div>
                  <span className={p.low_stock ? 'chip chip-warning' : 'chip chip-success'}>{p.stock_actual}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 13 }}>
                  <span>${Number(p.precio_unitario).toLocaleString('es-CO')}</span>
                  <span style={{ color: '#94a3b8' }}>|</span>
                  <span>Mín: {p.stock_minimo}</span>
                  <span style={{ color: '#94a3b8' }}>|</span>
                  <span>{p.unidad_medida}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className="chip chip-secondary" style={{ fontSize: 11 }}>{p.nombre_proveedor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movimientos demo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IonIcon icon={swapHorizontalOutline} style={{ color: 'var(--ion-color-primary)', fontSize: 20 }} />
            <IonText style={{ fontSize: 18, fontWeight: 700 }}>Movimientos ({SEED_MOVEMENTS.length})</IonText>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Referencia</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {SEED_MOVEMENTS.map((m) => (
                  <tr key={m.id_movimiento}>
                    <td style={{ fontWeight: 600 }}>{m.nombre_producto}</td>
                    <td><span className={typeChipClass[m.tipo]}>{typeLabels[m.tipo]}</span></td>
                    <td>{m.cantidad}</td>
                    <td>{m.referencia}</td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>{m.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
