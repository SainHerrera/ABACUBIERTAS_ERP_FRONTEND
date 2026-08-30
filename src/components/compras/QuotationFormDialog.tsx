import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText, IonSelect, IonSelectOption,
} from '@ionic/react'
import type { Provider } from '../../types/provider'
import type { StockRequest } from '../../types/stockRequest'

interface QuotationFormDialogProps {
  open: boolean
  request: StockRequest | null
  providers: Provider[]
  onClose: () => void
  onSave: (data: {
    id_solicitud: number
    id_producto: number
    id_proveedor: number
    precio_unitario: number
    tiempo_entrega_dias: number
    condiciones?: string
  }) => void
  isLoading: boolean
  error: string | null
}

export const QuotationFormDialog = ({
  open,
  request,
  providers,
  onClose,
  onSave,
  isLoading,
  error,
}: QuotationFormDialogProps) => {
  const [id_proveedor, setIdProveedor] = useState<number | undefined>(undefined)
  const [precio, setPrecio] = useState('')
  const [tiempo, setTiempo] = useState('')
  const [condiciones, setCondiciones] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setIdProveedor(undefined)
      setPrecio('')
      setTiempo('')
      setCondiciones('')
      setValidationError(null)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const price = Number(precio)
    const days = Number(tiempo)

    if (!id_proveedor) {
      setValidationError('Seleccione un proveedor')
      return
    }
    if (!price || price <= 0) {
      setValidationError('El precio unitario debe ser mayor a 0')
      return
    }
    if (!days || days <= 0) {
      setValidationError('El tiempo de entrega debe ser mayor a 0')
      return
    }
    if (!request) return

    onSave({
      id_solicitud: request.id_solicitud,
      id_producto: request.id_producto,
      id_proveedor,
      precio_unitario: price,
      tiempo_entrega_dias: days,
      condiciones: condiciones || undefined,
    })
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>Registrar cotización</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} style={{ color: '#fff' }}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={handleSubmit} style={{ padding: 16 }}>
          {request && (
            <>
              <IonText style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                {request.descripcion}
              </IonText>
              <IonText style={{ fontSize: 13, color: 'var(--app-text-muted)', display: 'block', marginBottom: 16 }}>
                Solicitud {request.numero_solicitud} · Cantidad sugerida: {request.cantidad_sugerida}
              </IonText>
            </>
          )}

          {(validationError || error) && (
            <IonText color="danger" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
              {validationError || error}
            </IonText>
          )}

          <IonList style={{ background: 'transparent' }}>
            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Proveedor</IonLabel>
              <IonSelect
                value={id_proveedor}
                placeholder="Seleccionar proveedor"
                interface="popover"
                onIonChange={(e) => setIdProveedor(e.detail.value)}
              >
                {providers.map((p) => (
                  <IonSelectOption key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre_empresa}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Precio unitario</IonLabel>
              <IonInput
                type="number"
                step="1"
                min="0"
                value={precio}
                onIonChange={(e) => setPrecio(e.detail.value || '')}
                required
              />
            </IonItem>

            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Tiempo de entrega (días)</IonLabel>
              <IonInput
                type="number"
                step="1"
                min="0"
                value={tiempo}
                onIonChange={(e) => setTiempo(e.detail.value || '')}
                required
              />
            </IonItem>

            <IonItem lines="none">
              <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Condiciones</IonLabel>
              <IonInput value={condiciones} onIonChange={(e) => setCondiciones(e.detail.value || '')} placeholder="Pago, flete, validez..." />
            </IonItem>
          </IonList>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : 'Guardar cotización'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}
