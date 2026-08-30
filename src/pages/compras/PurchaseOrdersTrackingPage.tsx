import { useEffect, useState } from 'react'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonSpinner, IonToast, IonButtons, IonButton, IonIcon,
  IonCard, IonCardContent, IonItem, IonLabel, IonList,
} from '@ionic/react'
import { arrowBack, paperPlane } from 'ionicons/icons'
import { getPurchaseOrdersApi, markPoTransitApi } from '../../api/purchaseOrderApi'
import type { PurchaseOrder } from '../../types/purchaseOrder'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManagePurchasing } from '../../utils/permissions'
import { purchaseOrderStatusStyle } from '../../utils/purchaseOrderStatus'

export const PurchaseOrdersTrackingPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canManage = canManagePurchasing(user?.rol)

  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await getPurchaseOrdersApi(0, 100)
      setOrders(res.items)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleTransit = async (poId: number) => {
    setWorkingId(poId)
    try {
      await markPoTransitApi(poId)
      setToast('La orden pasó a estado en tránsito')
      await loadOrders()
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'No se pudo actualizar la orden')
    } finally {
      setWorkingId(null)
    }
  }

  const detailCount = (po: PurchaseOrder) =>
    po.detalles.reduce((acc, d) => acc + d.cantidad_recibida, 0)
  const totalOrdered = (po: PurchaseOrder) =>
    po.detalles.reduce((acc, d) => acc + d.cantidad_ordenada, 0)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonButtons slot="start">
            <IonButton routerLink="/compras" style={{ color: '#fff' }}>
              <IonIcon icon={arrowBack} slot="start" />
              Menú
            </IonButton>
          </IonButtons>
          <IonTitle>Órdenes de compra</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <IonSpinner />
          </div>
        ) : orders.length === 0 ? (
          <IonText color="medium" style={{ display: 'block', textAlign: 'center', marginTop: 48 }}>
            No hay órdenes de compra registradas.
          </IonText>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {orders.map((po) => {
              const allReceived = totalOrdered(po) > 0 && detailCount(po) >= totalOrdered(po)
              const canTransit = po.estado === 'enviada' && canManage
              return (
                <IonCard key={po.id_orden_compra} style={{ margin: 0 }}>
                  <IonCardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IonText style={{ fontWeight: 700, fontSize: 15 }}>
                        {po.numero_oc} · {po.nombre_proveedor}
                      </IonText>
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

                    <IonList style={{ margin: '8px 0 0', background: 'transparent' }}>
                      {po.detalles.map((d, i) => (
                        <IonItem key={i} lines="none" style={{ '--background': 'transparent' }}>
                          <IonLabel>
                            <h2>{d.descripcion}</h2>
                            <p>
                              {d.cantidad_recibida}/{d.cantidad_ordenada} · ${d.precio_unitario.toLocaleString()}
                              {d.tiempo_entrega_dias ? ` · ${d.tiempo_entrega_dias} días` : ''}
                            </p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>

                    {canTransit && !allReceived && (
                      <IonButton
                        expand="block"
                        size="small"
                        disabled={workingId === po.id_orden_compra}
                        onClick={() => handleTransit(po.id_orden_compra)}
                        data-testid={`transit-${po.numero_oc}`}
                        style={{ marginTop: 8 }}
                      >
                        <IonIcon icon={paperPlane} slot="start" />
                        {workingId === po.id_orden_compra ? 'Actualizando...' : 'Marcar en tránsito'}
                      </IonButton>
                    )}

                    {po.estado === 'en_transito' && (
                      <IonText style={{ fontSize: 12, color: 'var(--app-text-secondary)', display: 'block', marginTop: 8 }}>
                        Bodega registrará la entrada cuando llegue la mercancía.
                      </IonText>
                    )}

                    {po.estado === 'pendiente_aprobacion' && (
                      <IonText style={{ fontSize: 12, color: '#dc2626', display: 'block', marginTop: 8 }}>
                        Esta orden supera el umbral de aprobación y debe ser aprobada por
                        Gerencia/Administración antes de continuar.
                      </IonText>
                    )}

                    {po.estado === 'rechazada' && (
                      <IonText style={{ fontSize: 12, color: 'var(--app-text-muted)', display: 'block', marginTop: 8 }}>
                        Esta orden de compra fue rechazada.
                      </IonText>
                    )}
                  </IonCardContent>
                </IonCard>
              )
            })}
          </div>
        )}

        <IonToast isOpen={!!toast} message={toast || ''} duration={2500} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  )
}
