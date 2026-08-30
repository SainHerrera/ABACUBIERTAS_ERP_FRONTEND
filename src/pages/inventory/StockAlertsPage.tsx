import { useEffect, useState, useCallback } from 'react'
import { IonPage, IonText, IonButton, IonToast, IonIcon } from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { useHistory } from 'react-router-dom'
import { bookOutline } from 'ionicons/icons'
import { getProductsApi } from '../../api/productApi'
import { getStockRequestsApi, createStockRequestApi } from '../../api/stockRequestApi'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManageInventory } from '../../utils/permissions'
import { StockRequestDialog } from '../../components/inventory/StockRequestDialog'
import type { Product } from '../../types/product'
import type { StockRequest } from '../../types/stockRequest'

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  atendida: 'Atendida',
  rechazada: 'Rechazada',
}

export const StockAlertsPage = () => {
  const history = useHistory()
  const { user } = useAppSelector((state) => state.auth)
  const canRequest = canManageInventory(user?.rol)

  const [products, setProducts] = useState<Product[]>([])
  const [requests, setRequests] = useState<StockRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestProduct, setRequestProduct] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsResponse, requestsResponse] = await Promise.all([
        getProductsApi(0, 1000),
        getStockRequestsApi(0, 1000),
      ])
      setProducts(productsResponse.items.filter((p) => p.low_stock))
      setRequests(requestsResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las alertas. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const hasPendingRequest = (productId: number) =>
    requests.some((r) => r.id_producto === productId && r.estado === 'pendiente')

  const handleCreateRequest = async (data: { id_producto: number; cantidad_sugerida: number; observaciones?: string }) => {
    setSaving(true)
    setError(null)
    try {
      await createStockRequestApi(data)
      setToastMessage('Solicitud de abastecimiento enviada a Compras')
      setShowToast(true)
      setRequestProduct(null)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar la solicitud. Verifica los datos.'
      setError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const statusColor: Record<string, string> = {
    pendiente: '#f59e0b',
    aprobada: '#3b82f6',
    atendida: '#16a34a',
    rechazada: '#dc2626',
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Alertas de Stock Bajo</IonText>
        </div>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        <section style={{ marginBottom: 28 }}>
          <p className="section-label" style={{ marginBottom: 10 }}>Productos por debajo del stock mínimo</p>
          {products.length === 0 && !loading ? (
            <IonText color="medium">No hay productos con stock bajo en este momento.</IonText>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {products.map((p) => {
                const pending = hasPendingRequest(p.id_producto)
                return (
                  <div key={p.id_producto} style={{ border: '1px solid var(--app-border)', borderRadius: 12, padding: 16, background: 'rgba(220, 38, 38, 0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <IonText style={{ fontSize: 15, fontWeight: 600, display: 'block' }}>{p.nombre}</IonText>
                        <IonText style={{ fontSize: 13, color: '#dc2626' }}>
                          Stock: <strong>{p.stock_actual}</strong> / Mínimo: {p.stock_minimo}
                        </IonText>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {pending && (
                          <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                            Solicitud pendiente
                          </span>
                        )}
                        {canRequest && !pending && (
                          <IonButton size="small" color="primary" onClick={() => setRequestProduct(p)}>
                            Generar solicitud
                          </IonButton>
                        )}
                        <IonButton size="small" fill="outline" onClick={() => history.push(`/inventory/products/${p.id_producto}`)}>
                          <IonIcon slot="start" icon={bookOutline} />
                          Kardex
                        </IonButton>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <p className="section-label" style={{ marginBottom: 10 }}>Solicitudes de abastecimiento</p>
          {requests.length === 0 ? (
            <IonText color="medium">Aún no se han generado solicitudes de abastecimiento.</IonText>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requests.map((r) => (
                <div key={r.id_solicitud} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, border: '1px solid var(--app-border)', borderRadius: 12, padding: '12px 16px', background: 'var(--app-bg)' }}>
                  <div style={{ minWidth: 0 }}>
                    <IonText style={{ fontSize: 14, fontWeight: 600, display: 'block' }}>
                      {r.numero_solicitud} · {r.descripcion}
                    </IonText>
                    <IonText style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                      Cantidad sugerida: {r.cantidad_sugerida} · {r.numero_solicitud ? '' : ''}
                      {r.observaciones || 'Sin observaciones'}
                    </IonText>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'var(--app-surface-hover)', color: statusColor[r.estado] || 'var(--app-text-muted)', whiteSpace: 'nowrap' }}>
                    {ESTADO_LABELS[r.estado] || r.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <StockRequestDialog
          open={!!requestProduct}
          product={requestProduct}
          onClose={() => setRequestProduct(null)}
          onSave={handleCreateRequest}
          isLoading={saving}
          error={error}
        />

        {loading && <PageLoading message="Cargando alertas..." />}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          color="success"
        />
      </div>
    </div>
    </IonPage>
  )
}
