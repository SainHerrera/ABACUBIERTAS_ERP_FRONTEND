import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText, IonSelect, IonSelectOption,
} from '@ionic/react'
import type { Product } from '../../types/product'
import type { MovementType } from '../../types/movement'

interface MovementFormDialogProps {
  open: boolean
  movementType: MovementType
  products: Product[]
  onClose: () => void
  onSave: (data: { product_id: number; quantity: number; reference?: string; note?: string }) => void
  isLoading: boolean
  error: string | null
}

const typeLabels: Record<MovementType, string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  ajuste: 'Ajuste',
}

export const MovementFormDialog = ({
  open,
  movementType,
  products,
  onClose,
  onSave,
  isLoading,
  error,
}: MovementFormDialogProps) => {
  const [productId, setProductId] = useState<number | undefined>(undefined)
  const [quantity, setQuantity] = useState('')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setProductId(undefined)
      setQuantity('')
      setReference('')
      setNote('')
      setValidationError(null)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!productId) {
      setValidationError('Debe seleccionar un producto')
      return
    }

    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      setValidationError('La cantidad debe ser un número positivo')
      return
    }

    onSave({
      product_id: productId,
      quantity: qty,
      reference: reference || undefined,
      note: note || undefined,
    })
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>Registrar {typeLabels[movementType]}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: '#fff' }}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit} style={{ padding: 16 }}>
          {(validationError || error) && (
            <IonText color="danger" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
              {validationError || error}
            </IonText>
          )}

          <IonList style={{ background: 'transparent' }}>
            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Producto</IonLabel>
                <IonSelect
                  value={productId}
                  onIonChange={(e) => setProductId(e.detail.value)}
                  interface="popover"
                  required
                >
                  {products.map((p) => (
                    <IonSelectOption key={p.id_producto} value={p.id_producto}>
                      {p.nombre} (Stock: {p.stock_actual})
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Cantidad</IonLabel>
                <IonInput type="number" step="1" min="1" value={quantity} onIonChange={(e) => setQuantity(e.detail.value || '')} required />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Referencia</IonLabel>
                <IonInput value={reference} onIonChange={(e) => setReference(e.detail.value || '')} placeholder="Factura, pedido, etc." />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Nota</IonLabel>
                <IonInput value={note} onIonChange={(e) => setNote(e.detail.value || '')} />
              </IonItem>
            </div>
          </IonList>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : `Registrar ${typeLabels[movementType]}`}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}
