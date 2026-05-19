import { useEffect, useState } from 'react'
import { IonText, IonIcon } from '@ionic/react'
import { cubeOutline, swapHorizontalOutline, peopleOutline, alertCircleOutline } from 'ionicons/icons'
import { seedLocalData, getLocalProducts, getLocalMovements, getLocalProviders, SEED_PRODUCTS, SEED_MOVEMENTS, SEED_PROVIDERS } from '../../services/localData'

export const InventoryDashboardPage = () => {
  const [products, setProducts] = useState(getLocalProducts().length > 0 ? getLocalProducts() : SEED_PRODUCTS)
  const [movements, setMovements] = useState(getLocalMovements().length > 0 ? getLocalMovements() : SEED_MOVEMENTS)
  const [providers, setProviders] = useState(getLocalProviders().length > 0 ? getLocalProviders() : SEED_PROVIDERS)

  useEffect(() => {
    seedLocalData()
    setProducts(getLocalProducts())
    setMovements(getLocalMovements())
    setProviders(getLocalProviders())
  }, [])

  const lowStockProducts = products.filter((p) => p.low_stock)

  const metrics = [
    { label: 'Productos', value: String(products.length), icon: cubeOutline, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Movimientos', value: String(movements.length), icon: swapHorizontalOutline, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Proveedores', value: String(providers.length), icon: peopleOutline, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Stock Bajo', value: String(lowStockProducts.length), icon: alertCircleOutline, color: '#dc2626', bg: '#fef2f2' },
  ]

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <IonText style={{ fontSize: 24, fontWeight: 700, display: 'block', marginBottom: 24 }}>
          Panel de Inventario
        </IonText>

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <div key={metric.label} className="metric-card" style={{ background: metric.bg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: metric.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IonIcon icon={metric.icon} style={{ color: '#fff', fontSize: 22 }} />
                </div>
                <div>
                  <IonText style={{ fontSize: 24, fontWeight: 700, color: metric.color }}>
                    {metric.value}
                  </IonText>
                  <IonText style={{ fontSize: 13, color: '#64748b', display: 'block' }}>
                    {metric.label}
                  </IonText>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lowStockProducts.length > 0 && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: '#fef2f2',
              borderRadius: 12,
              border: '1px solid #fecaca',
            }}
          >
            <IonText style={{ fontWeight: 600, color: '#dc2626', display: 'block', marginBottom: 8 }}>
              Productos con stock bajo
            </IonText>
            {lowStockProducts.slice(0, 5).map((p) => (
              <div key={p.id_producto} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{p.nombre}</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{p.stock_actual} / {p.stock_minimo}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
