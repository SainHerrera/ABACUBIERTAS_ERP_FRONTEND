import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText,
} from '@ionic/react'
import type { Product } from '../../types/product'
import type { PurchaseOrder } from '../../types/purchaseOrder'

interface ReceiveFromPoDialogProps {
  open: boolean
  po: PurchaseOrder
  productId: number
  products: Product[]
  onClose: () => void
  onSave: (data: { product_id: number; quantity: number; fecha?: string; note?: string }) => void
  isLoading: boolean
  error: string | null
}

export const ReceiveFromPoDialog = ({
  open,
  po,
  productId,
  products,
  onClose,
  onSave,
  isLoading,
  error,
}: ReceiveFromPoDialogProps) => {
  const detail = po.detalles.find((d) => d.id_producto === productId)
  const product = products.find((p) => p.id_producto === productId)

  const [quantity, setQuantity] = useState('')
  const [fecha, setFecha] = useState('')
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setQuantity('')
      setFecha('')
      setNote('')
      setValidationError(null)
    }
  }, [open])

  const maxReceive = detail ? detail.cantidad_ordenada - detail.cantidad_recibida : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      setValidationError('La cantidad a recibir debe ser mayor a 0')
      return
    }
    if (qty > maxReceive) {
      setValidationError(
        `No puede recibir más de lo pendiente (${maxReceive}) de "${detail?.descripcion}"`,
      )
      return
    }

    onSave({
      product_id: productId,
      quantity: qty,
      fecha: fecha ? new Date(fecha).toISOString() : undefined,
      note: note || undefined,
    })
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>Recibir mercancía</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: '#fff' }}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit} style={{ padding: 16 }}>
          <IonText style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 4 }}>
            {po.numero_oc} · {detail?.descripcion}
          </IonText>
          <IonText style={{ fontSize: 13, color: 'var(--app-text-muted)', display: 'block', marginBottom: 16 }}>
            Pendiente por recibir: <strong>{maxReceive}</strong> · Stock actual del producto:{' '}
            <strong>{product ? `${product.stock_actual} ${product.unidad_medida}` : '—'}</strong>
          </IonText>

          {(validationError || error) && (
            <IonText color="danger" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
              {validationError || error}
            </IonText>
          )}

          <IonList style={{ background: 'transparent' }}>
            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Cantidad recibida</IonLabel>
                <IonInput
                  type="number"
                  step="1"
                  min="1"
                  max={maxReceive}
                  value={quantity}
                  onIonChange={(e) => setQuantity(e.detail.value || '')}
                  required
                />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Fecha (opcional)</IonLabel>
                <IonInput type="datetime-local" value={fecha} onIonChange={(e) => setFecha(e.detail.value || '')} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Observaciones</IonLabel>
                <IonInput value={note} onIonChange={(e) => setNote(e.detail.value || '')} placeholder="Notas de la recepción..." />
              </IonItem>
            </div>
          </IonList>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : 'Registrar entrada'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}
