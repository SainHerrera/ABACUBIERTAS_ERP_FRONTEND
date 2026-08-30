import { useEffect, useState } from 'react'
import { IonPage, IonText, IonCard, IonCardContent, IonButton } from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { useHistory } from 'react-router-dom'
import { getProductsApi } from '../../api/productApi'
import { getProvidersApi } from '../../api/providerApi'
import { getMovementsApi } from '../../api/movementApi'
import type { Product } from '../../types/product'
import type { Movement } from '../../types/movement'

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  totalProviders: number
  totalMovements: number
}

export const InventoryDashboardPage = () => {
  const history = useHistory()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalProviders: 0,
    totalMovements: 0,
  })
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [recentMovements, setRecentMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [productsResponse, providersResponse, movementsResponse] = await Promise.all([
          getProductsApi(0, 1000),
          getProvidersApi(0, 1000),
          getMovementsApi(0, 10),
        ])

        const products = productsResponse.items
        const lowStock = products.filter((p) => p.low_stock)

        setStats({
          totalProducts: productsResponse.total,
          lowStockProducts: lowStock.length,
          totalProviders: providersResponse.total,
          totalMovements: movementsResponse.total,
        })
        setLowStockProducts(lowStock.slice(0, 5))
        setRecentMovements(movementsResponse.items)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al cargar el panel de inventario.'
        setError(msg)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const navigate = (path: string) => history.push(path)

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Panel de Inventario</IonText>
          <div style={{ display: 'flex', gap: 8 }}>
            <IonButton onClick={() => navigate('/inventory/products')}>Productos</IonButton>
            <IonButton onClick={() => navigate('/inventory/movements')}>Movimientos</IonButton>
            <IonButton onClick={() => navigate('/inventory/providers')}>Proveedores</IonButton>
            <IonButton onClick={() => navigate('/inventory/alerts')} color="warning">Alertas de Stock</IonButton>
          </div>
        </div>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <IonCard>
            <IonCardContent>
              <IonText color="medium" style={{ fontSize: 14 }}>Total Productos</IonText>
              <IonText style={{ fontSize: 32, fontWeight: 700, display: 'block' }}>{stats.totalProducts}</IonText>
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardContent>
              <IonText color="medium" style={{ fontSize: 14 }}>Stock Bajo</IonText>
              <IonText style={{ fontSize: 32, fontWeight: 700, display: 'block', color: stats.lowStockProducts > 0 ? '#dc2626' : undefined }}>
                {stats.lowStockProducts}
              </IonText>
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardContent>
              <IonText color="medium" style={{ fontSize: 14 }}>Proveedores</IonText>
              <IonText style={{ fontSize: 32, fontWeight: 700, display: 'block' }}>{stats.totalProviders}</IonText>
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardContent>
              <IonText color="medium" style={{ fontSize: 14 }}>Total Movimientos</IonText>
              <IonText style={{ fontSize: 32, fontWeight: 700, display: 'block' }}>{stats.totalMovements}</IonText>
            </IonCardContent>
          </IonCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <IonCard>
            <IonCardContent>
              <IonText style={{ fontSize: 18, fontWeight: 700, display: 'block', marginBottom: 12 }}>Alertas de Stock Bajo</IonText>
              {lowStockProducts.length === 0 ? (
                <IonText color="medium">No hay productos con stock bajo</IonText>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {lowStockProducts.map((p) => (
                    <div key={p.id_producto} onClick={() => navigate(`/inventory/products/${p.id_producto}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(220, 38, 38, 0.12)', borderRadius: 8, cursor: 'pointer' }}>
                      <IonText>{p.nombre}</IonText>
                      <IonText style={{ fontWeight: 600, color: '#dc2626' }}>{p.stock_actual} / {p.stock_minimo}</IonText>
                    </div>
                  ))}
                  {lowStockProducts.length > 0 && (
                    <IonButton size="small" fill="outline" onClick={() => navigate('/inventory/alerts')} style={{ marginTop: 8 }}>
                      Ver todas y generar solicitud
                    </IonButton>
                  )}
                </div>
              )}
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardContent>
              <IonText style={{ fontSize: 18, fontWeight: 700, display: 'block', marginBottom: 12 }}>Últimos Movimientos</IonText>
              {recentMovements.length === 0 ? (
                <IonText color="medium">No hay movimientos recientes</IonText>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentMovements.map((m) => (
                    <div key={m.id_movimiento} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--app-surface)', borderRadius: 8 }}>
                      <div>
                        <IonText style={{ fontWeight: 600 }}>{m.nombre_producto || `Producto ${m.id_producto}`}</IonText>
                        <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>{m.tipo} · {m.referencia || 'Sin referencia'}</IonText>
                      </div>
                      <IonText style={{ fontWeight: 600 }}>{m.cantidad}</IonText>
                    </div>
                  ))}
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {loading && <PageLoading message="Cargando panel..." />}
      </div>
    </div>
    </IonPage>
  )
}
