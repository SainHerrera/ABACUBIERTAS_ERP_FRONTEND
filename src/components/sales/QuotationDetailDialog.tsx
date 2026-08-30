import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonText,
} from '@ionic/react'
import type { Quotation } from '../../types/sales'

interface QuotationDetailDialogProps {
  quotation: Quotation | null
  clientName: (idCliente: number) => string
  onClose: () => void
}

const formatMoney = (value: number | string) =>
  `$${Number(value || 0).toLocaleString('es-CO', { maximumFractionDigits: 2 })}`

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('es-CO') : '-'

export const QuotationDetailDialog = ({ quotation, clientName, onClose }: QuotationDetailDialogProps) => {
  return (
    <IonModal isOpen={!!quotation} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>
            Cotización {quotation?.numero_consecutivo || `COT-${quotation?.id_cotizacion ?? ''}`}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: '#fff' }}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {quotation && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12 }}>
                <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>Cliente</IonText>
                <IonText style={{ fontWeight: 600 }}>{clientName(quotation.id_cliente)}</IonText>
              </div>
              <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12 }}>
                <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>Estado</IonText>
                <IonText style={{ fontWeight: 600 }}>{quotation.estado}</IonText>
              </div>
              <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12 }}>
                <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>Emisión</IonText>
                <IonText style={{ fontWeight: 600 }}>{formatDate(quotation.fecha_emision)}</IonText>
              </div>
              <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12 }}>
                <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>Vencimiento</IonText>
                <IonText style={{ fontWeight: 600 }}>{formatDate(quotation.fecha_vencimiento)}</IonText>
              </div>
            </div>

            {quotation.observaciones && (
              <IonText color="medium" style={{ display: 'block', marginBottom: 16 }}>
                Observaciones: {quotation.observaciones}
              </IonText>
            )}

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
                  {quotation.detalles.map((d) => (
                    <tr key={d.id_detalle}>
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

            <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatMoney(quotation.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Descuento ({Number(quotation.descuento)}%)</span>
                <span style={{ fontWeight: 600 }}>-{formatMoney(Number(quotation.subtotal) * (Number(quotation.descuento) / 100))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>IVA (19%)</span>
                <span style={{ fontWeight: 600 }}>{formatMoney(quotation.impuestos)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                <span>Total</span>
                <span>{formatMoney(quotation.total)}</span>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonModal>
  )
}
