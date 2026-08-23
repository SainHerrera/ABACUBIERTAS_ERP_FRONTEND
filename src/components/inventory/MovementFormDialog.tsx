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

  const selectedProduct = products.find((p) => p.id_producto === productId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!productId) {
      setValidationError('Debe seleccionar un producto')
      return
    }

    const qty = Number(quantity)
    if (movementType === 'ajuste') {
      if (qty < 0 || isNaN(qty)) {
        setValidationError('La cantidad del ajuste no puede ser negativa')
        return
      }
    } else {
      if (!qty || qty <= 0) {
        setValidationError('La cantidad debe ser un número positivo mayor a 0')
        return
      }
    }

    if (movementType === 'salida' && selectedProduct && qty > selectedProduct.stock_actual) {
      setValidationError(
        `Stock insuficiente para "${selectedProduct.nombre}". Stock disponible: ${selectedProduct.stock_actual}, solicitado: ${qty}`,
      )
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
                  onIonChange={(e) => setProductId(e.detail.value ? Number(e.detail.value) : undefined)}
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

            {selectedProduct && (
              <div style={{ padding: '4px 16px 12px 16px', fontSize: 13, color: '#64748b' }}>
                Stock actual: <strong style={{ color: selectedProduct.low_stock ? '#dc2626' : '#16a34a' }}>{selectedProduct.stock_actual} {selectedProduct.unidad_medida}</strong> (Mínimo: {selectedProduct.stock_minimo})
              </div>
            )}

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>
                  {movementType === 'ajuste' ? 'Nuevo Stock Total' : 'Cantidad'}
                </IonLabel>
                <IonInput
                  type="number"
                  step="1"
                  min={movementType === 'ajuste' ? '0' : '1'}
                  value={quantity}
                  onIonChange={(e) => setQuantity(e.detail.value || '')}
                  required
                />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Referencia</IonLabel>
                <IonInput value={reference} onIonChange={(e) => setReference(e.detail.value || '')} placeholder="Factura, pedido, conteo físico..." />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: '#64748b' }}>Nota</IonLabel>
                <IonInput value={note} onIonChange={(e) => setNote(e.detail.value || '')} placeholder="Observaciones adicionales..." />
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
