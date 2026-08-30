import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText,
} from '@ionic/react'
import type { Product } from '../../types/product'

interface StockRequestDialogProps {
  open: boolean
  product: Product | null
  onClose: () => void
  onSave: (data: { id_producto: number; cantidad_sugerida: number; observaciones?: string }) => void
  isLoading: boolean
  error: string | null
}

export const StockRequestDialog = ({
  open,
  product,
  onClose,
  onSave,
  isLoading,
  error,
}: StockRequestDialogProps) => {
  const suggested = product ? Math.max(product.stock_minimo - product.stock_actual, 1) : 1

  const [quantity, setQuantity] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setQuantity(String(suggested))
      setObservaciones('')
      setValidationError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id_producto])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      setValidationError('La cantidad sugerida debe ser mayor a 0')
      return
    }

    if (!product) return

    onSave({
      id_producto: product.id_producto,
      cantidad_sugerida: qty,
      observaciones: observaciones || undefined,
    })
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>Solicitud de abastecimiento</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: '#fff' }}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit} style={{ padding: 16 }}>
          {product && (
            <>
              <IonText style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                {product.nombre}
              </IonText>
              <IonText style={{ fontSize: 13, color: 'var(--app-text-muted)', display: 'block', marginBottom: 16 }}>
                Stock actual <strong>{product.stock_actual}</strong> · Stock mínimo{' '}
                <strong>{product.stock_minimo}</strong> ({product.unidad_medida})
              </IonText>
            </>
          )}

          {(validationError || error) && (
            <IonText color="danger" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
              {validationError || error}
            </IonText>
          )}

          <IonList style={{ background: 'transparent' }}>
            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Cantidad sugerida</IonLabel>
                <IonInput
                  type="number"
                  step="1"
                  min="1"
                  value={quantity}
                  onIonChange={(e) => setQuantity(e.detail.value || '')}
                  required
                />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Observaciones para Compras</IonLabel>
                <IonInput value={observaciones} onIonChange={(e) => setObservaciones(e.detail.value || '')} placeholder="Justificación, urgencia, etc." />
              </IonItem>
            </div>
          </IonList>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Enviando...' : 'Enviar a Compras'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}
