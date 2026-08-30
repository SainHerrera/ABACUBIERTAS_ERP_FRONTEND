import { useEffect, useState, useCallback } from 'react'
import { IonPage, IonText, IonButton, IonToast, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { getPurchaseOrdersApi, receiveAgainstPoApi } from '../../api/purchaseOrderApi'
import { getProductsApi } from '../../api/productApi'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canRecordInventoryEntry } from '../../utils/permissions'
import { ReceiveFromPoDialog } from '../../components/inventory/ReceiveFromPoDialog'
import type { PurchaseOrder } from '../../types/purchaseOrder'
import type { Product } from '../../types/product'
import { purchaseOrderStatusStyle } from '../../utils/purchaseOrderStatus'

interface PendingReceive {
  po: PurchaseOrder
  productId: number
}

export const PurchaseOrdersPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canReceiveEntry = canRecordInventoryEntry(user?.rol)

  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receiveTarget, setReceiveTarget] = useState<PendingReceive | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        getPurchaseOrdersApi(0, 1000, estadoFilter || undefined),
        getProductsApi(0, 1000),
      ])
      setOrders(ordersResponse.items)
      setProducts(productsResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar órdenes de compra. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [estadoFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleReceive = async (data: { product_id: number; quantity: number; fecha?: string; note?: string }) => {
    if (!receiveTarget) return
    setSaving(true)
    setError(null)
    try {
      await receiveAgainstPoApi(receiveTarget.po.id_orden_compra, data)
      setToastMessage('Entrada registrada correctamente')
      setShowToast(true)
      setReceiveTarget(null)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la entrada. Verifica los datos.'
      setError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const openReceive = (po: PurchaseOrder, productId: number) => {
    setReceiveTarget({ po, productId })
  }

  const isProgressSymbol = (received: number, ordered: number) =>
    received >= ordered ? 'Completo' : `${received} / ${ordered}`

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Órdenes de Compra</IonText>
        </div>

        <IonItem lines="none" style={{ '--background': 'var(--app-surface)', borderRadius: 8, marginBottom: 16, maxWidth: 420 }}>
          <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Filtrar por estado</IonLabel>
          <IonSelect
            value={estadoFilter}
            placeholder="Todos los estados"
            interface="popover"
            onIonChange={(e) => setEstadoFilter(e.detail.value ? String(e.detail.value) : undefined)}
          >
            <IonSelectOption value={undefined}>Todos los estados</IonSelectOption>
            <IonSelectOption value="enviada">Enviada</IonSelectOption>
            <IonSelectOption value="en_transito">En tránsito</IonSelectOption>
            <IonSelectOption value="recibida">Recibida</IonSelectOption>
            <IonSelectOption value="pendiente_aprobacion">Pendiente de aprobación</IonSelectOption>
            <IonSelectOption value="rechazada">Rechazada</IonSelectOption>
          </IonSelect>
        </IonItem>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        {orders.length === 0 && !loading && (
          <IonText style={{ display: 'block', color: 'var(--app-text-muted)', padding: '24px 0' }}>
            No hay órdenes de compra registradas.
          </IonText>
        )}

        {orders.map((po) => (
          <div
            key={po.id_orden_compra}
            style={{ border: '1px solid var(--app-border)', borderRadius: 12, padding: 16, marginBottom: 16, background: 'var(--app-bg)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <div>
                <IonText style={{ fontSize: 18, fontWeight: 700 }}>{po.numero_oc}</IonText>
                <IonText style={{ color: 'var(--app-text-muted)', fontSize: 13, display: 'block' }}>
                  {po.nombre_proveedor || `Proveedor #${po.id_proveedor}`}
                </IonText>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: purchaseOrderStatusStyle(po.estado).background,
                  color: purchaseOrderStatusStyle(po.estado).color,
                }}
              >
                {purchaseOrderStatusStyle(po.estado).label}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {po.detalles.map((d) => {
                const received = d.cantidad_recibida
                const ordered = d.cantidad_ordenada
                const complete = received >= ordered
                const canReceive = po.estado === 'en_transito' && !complete && canReceiveEntry
                return (
                  <div key={d.id_detalle_oc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--app-surface-hover)' }}>
                    <div style={{ minWidth: 0 }}>
                      <IonText style={{ fontSize: 14, fontWeight: 500, display: 'block' }}>{d.descripcion}</IonText>
                      <IonText style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                        Recibido: {isProgressSymbol(received, ordered)} de {ordered}
                      </IonText>
                    </div>
                    {canReceive && (
                      <IonButton size="small" color="success" onClick={() => openReceive(po, d.id_producto)}>
                        Recibir
                      </IonButton>
                    )}
                  </div>
                )
              })}
            </div>

            {po.observaciones && (
              <IonText style={{ fontSize: 13, color: 'var(--app-text-muted)', display: 'block', marginTop: 10 }}>
                {po.observaciones}
              </IonText>
            )}
          </div>
        ))}

        {receiveTarget && (
          <ReceiveFromPoDialog
            open={!!receiveTarget}
            po={receiveTarget.po}
            productId={receiveTarget.productId}
            products={products}
            onClose={() => setReceiveTarget(null)}
            onSave={handleReceive}
            isLoading={saving}
            error={error}
          />
        )}

        {loading && <PageLoading message="Cargando órdenes de compra..." />}
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
