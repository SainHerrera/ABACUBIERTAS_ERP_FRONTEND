import { useEffect, useState } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonText, IonSelect, IonSelectOption, IonItem, IonLabel,
} from '@ionic/react'
import type { Sale, SaleUpdate } from '../../types/sales'

interface SaleDetailDialogProps {
  sale: Sale | null
  clientName: (idCliente: string) => string
  onClose: () => void
  onSaveStatus: (saleId: string, data: SaleUpdate) => void
  isLoading: boolean
}

const formatMoney = (value: number | string) =>
  `$${Number(value || 0).toLocaleString('es-CO', { maximumFractionDigits: 2 })}`

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('es-CO') : '-'

export const SaleDetailDialog = ({ sale, clientName, onClose, onSaveStatus, isLoading }: SaleDetailDialogProps) => {
  const [estado, setEstado] = useState<Sale['estado']>('pendiente')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (sale) {
      setEstado(sale.estado)
      setObservaciones(sale.observaciones || '')
    }
  }, [sale])

  const allowedNextStates = (): Sale['estado'][] => {
    switch (sale?.estado) {
      case 'pendiente':
        return ['en_proceso']
      case 'en_proceso':
        return ['entregada']
      default:
        return []
    }
  }

  const nextStates = allowedNextStates()

  return (
    <IonModal isOpen={!!sale} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>{sale?.numero_orden ? `Pedido ${sale.numero_orden}` : 'Detalle del pedido'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: '#fff' }}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {sale && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12 }}>
                <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>Cliente</IonText>
                <IonText style={{ fontWeight: 600 }}>{clientName(sale.id_cliente)}</IonText>
              </div>
              <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12 }}>
                <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>Fecha de venta</IonText>
                <IonText style={{ fontWeight: 600 }}>{formatDate(sale.fecha_venta)}</IonText>
              </div>
              <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12 }}>
                <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>Estado actual</IonText>
                <IonText style={{ fontWeight: 600 }}>{sale.estado}</IonText>
              </div>
              {sale.id_cotizacion && (
                <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12 }}>
                  <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>Cotización origen</IonText>
                  <IonText style={{ fontWeight: 600 }}>Vinculada</IonText>
                </div>
              )}
            </div>

            {sale.detalles.length > 0 && (
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio unitario</th>
                      <th>Descuento (%)</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.detalles.map((d) => (
                      <tr key={d.id_detalle_venta}>
                        <td>{d.descripcion || `Producto ${d.id_producto}`}</td>
                        <td>{d.cantidad}</td>
                        <td>{formatMoney(d.precio_unitario)}</td>
                        <td>{Number(d.descuento)}</td>
                        <td style={{ fontWeight: 600 }}>{formatMoney(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              <span>Total del pedido</span>
              <span>{formatMoney(sale.total)}</span>
            </div>

            {sale.estado !== 'cancelada' ? (
              <>
                {nextStates.length > 0 ? (
                  <IonItem lines="none" style={{ '--background': 'var(--app-surface)', borderRadius: 8, marginBottom: 12 }}>
                    <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Cambiar estado</IonLabel>
                    <IonSelect
                      value={estado}
                      interface="popover"
                      onIonChange={(e) => setEstado(e.detail.value)}
                    >
                      {nextStates.map((s) => (
                        <IonSelectOption key={s} value={s}>
                          {s === 'en_proceso' ? 'En proceso' : s === 'entregada' ? 'Entregada' : s}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                ) : (
                  <IonText color="medium" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                    El pedido ya está en su estado final (entregada).
                  </IonText>
                )}

                <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: 12 }}>
                  <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Observaciones</IonLabel>
                  <IonInput value={observaciones} onIonChange={(e) => setObservaciones(e.detail.value || '')} />
                </IonItem>

                <IonButton
                  expand="block"
                  disabled={isLoading}
                  onClick={() => onSaveStatus(sale.id_orden_venta, { estado, observaciones: observaciones || undefined })}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </IonButton>
              </>
            ) : (
              <IonText color="danger">
                Este pedido está cancelado. El stock fue devuelto al inventario.
              </IonText>
            )}
          </div>
        )}
      </IonContent>
    </IonModal>
  )
}
