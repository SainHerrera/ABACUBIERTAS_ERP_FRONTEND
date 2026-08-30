import { useCallback, useEffect, useState } from 'react'
import {
  IonText,
  IonPage,
  IonSpinner,
  IonButton,
  IonIcon,
  IonAlert,
} from '@ionic/react'
import { checkmarkCircleOutline, closeCircleOutline, refreshOutline } from 'ionicons/icons'
import {
  getPurchaseOrdersPendingApprovalApi,
  approvePurchaseOrderApi,
} from '../../api/purchaseOrderApi'
import type { PurchaseOrder } from '../../types/purchaseOrder'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export const PoApprovalsPage = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState<{ order: PurchaseOrder; action: 'approve' | 'reject' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const pending = await getPurchaseOrdersPendingApprovalApi()
      setOrders(pending)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totalOf = (order: PurchaseOrder) =>
    order.detalles.reduce((sum, d) => sum + d.cantidad_ordenada * d.precio_unitario, 0)

  const handleConfirm = async () => {
    if (!target) return
    await approvePurchaseOrderApi(target.order.id_orden_compra, target.action === 'approve')
    setTarget(null)
    await load()
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }} data-testid="po-approvals">
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>
            Aprobación de Órdenes de Compra
          </IonText>
          <IonButton fill="outline" size="small" onClick={load}>
            <IonIcon slot="start" icon={refreshOutline} />
            Actualizar
          </IonButton>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <IonSpinner />
          </div>
        ) : orders.length === 0 ? (
          <IonText color="medium" style={{ display: 'block', textAlign: 'center', marginTop: 48 }}>
            No hay órdenes de compra pendientes de aprobación.
          </IonText>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {orders.map((order) => (
              <div
                key={order.id_orden_compra}
                style={{ borderRadius: 12, border: '1px solid var(--app-border)', padding: 16 }}
                data-testid={`approval-${order.numero_oc}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <IonText style={{ fontWeight: 700 }}>{order.numero_oc}</IonText>
                  <span
                    style={{
                      background: 'rgba(220, 38, 38, 0.12)',
                      color: '#dc2626',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 999,
                    }}
                    data-testid="approval-state"
                  >
                    Pendiente de aprobación
                  </span>
                </div>
                <IonText style={{ display: 'block', color: 'var(--app-text-muted)', fontSize: 13, marginBottom: 4 }}>
                  Proveedor: {order.nombre_proveedor || `Proveedor ${order.id_proveedor}`}
                </IonText>
                <IonText style={{ display: 'block', color: 'var(--app-text-muted)', fontSize: 13, marginBottom: 12 }}>
                  Monto: <strong>{formatCurrency(totalOf(order))}</strong>
                </IonText>
                <div style={{ display: 'flex', gap: 12 }}>
                  <IonButton
                    expand="block"
                    size="small"
                    color="success"
                    onClick={() => setTarget({ order, action: 'approve' })}
                    data-testid={`approve-${order.numero_oc}`}
                  >
                    <IonIcon slot="start" icon={checkmarkCircleOutline} />
                    Aprobar
                  </IonButton>
                  <IonButton
                    expand="block"
                    size="small"
                    color="danger"
                    fill="outline"
                    onClick={() => setTarget({ order, action: 'reject' })}
                    data-testid={`reject-${order.numero_oc}`}
                  >
                    <IonIcon slot="start" icon={closeCircleOutline} />
                    Rechazar
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <IonAlert
        isOpen={!!target}
        header={target?.action === 'approve'
          ? 'Aprobar orden de compra'
          : 'Rechazar orden de compra'}
        message={
          target
            ? `${target.order.numero_oc} por ${formatCurrency(totalOf(target.order))}. ¿Desea ${target.action === 'approve' ? 'aprobar' : 'rechazar'} esta orden de compra?`
            : ''
        }
        buttons={[
          { text: 'Cancelar', role: 'cancel', handler: () => setTarget(null) },
          { text: target?.action === 'approve' ? 'Aprobar' : 'Rechazar', handler: handleConfirm },
        ]}
      />
    </div>
    </IonPage>
  )
}
