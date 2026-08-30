import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText, IonSelect, IonSelectOption,
} from '@ionic/react'
import type { Product, ProductCreate, ProductUpdate } from '../../types/product'
import type { Provider } from '../../types/provider'

interface ProductFormDialogProps {
  open: boolean
  product: Product | null
  providers: Provider[]
  onClose: () => void
  onSave: (productId: number | null, data: ProductCreate | ProductUpdate) => void
  isLoading: boolean
  error: string | null
}

export const ProductFormDialog = ({
  open,
  product,
  providers,
  onClose,
  onSave,
  isLoading,
  error,
}: ProductFormDialogProps) => {
  const isEditing = !!product
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [unidadMedida, setUnidadMedida] = useState('unidad')
  const [precioUnitario, setPrecioUnitario] = useState('')
  const [stockMinimo, setStockMinimo] = useState('0')
  const [idProveedor, setIdProveedor] = useState<number | undefined>(undefined)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setNombre(product.nombre)
      setDescripcion(product.descripcion || '')
      setUnidadMedida(product.unidad_medida)
      setPrecioUnitario(String(product.precio_unitario))
      setStockMinimo(String(product.stock_minimo))
      setIdProveedor(product.id_proveedor)
    } else {
      setNombre('')
      setDescripcion('')
      setUnidadMedida('unidad')
      setPrecioUnitario('')
      setStockMinimo('0')
      setIdProveedor(undefined)
    }
    setValidationError(null)
  }, [product, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!nombre) {
      setValidationError('El nombre del producto es obligatorio')
      return
    }

    if (isEditing) {
      onSave(product!.id_producto, {
        nombre,
        descripcion: descripcion || undefined,
        unidad_medida: unidadMedida,
        precio_unitario: precioUnitario ? Number(precioUnitario) : undefined,
        stock_minimo: Number(stockMinimo),
        id_proveedor: idProveedor || undefined,
      } as ProductUpdate)
    } else {
      onSave(null, {
        nombre,
        descripcion: descripcion || undefined,
        unidad_medida: unidadMedida,
        precio_unitario: precioUnitario ? Number(precioUnitario) : 0,
        stock_minimo: Number(stockMinimo),
        id_proveedor: idProveedor || undefined,
      } as ProductCreate)
    }
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</IonTitle>
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
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Nombre del producto</IonLabel>
                <IonInput value={nombre} onIonChange={(e) => setNombre(e.detail.value || '')} required />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Descripción</IonLabel>
                <IonInput value={descripcion} onIonChange={(e) => setDescripcion(e.detail.value || '')} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Unidad de medida</IonLabel>
                <IonSelect value={unidadMedida} onIonChange={(e) => setUnidadMedida(e.detail.value)} interface="popover">
                  <IonSelectOption value="unidad">Unidad</IonSelectOption>
                  <IonSelectOption value="kg">Kilogramo</IonSelectOption>
                  <IonSelectOption value="g">Gramo</IonSelectOption>
                  <IonSelectOption value="l">Litro</IonSelectOption>
                  <IonSelectOption value="ml">Mililitro</IonSelectOption>
                  <IonSelectOption value="m">Metro</IonSelectOption>
                  <IonSelectOption value="m2">Metro cuadrado</IonSelectOption>
                  <IonSelectOption value="caja">Caja</IonSelectOption>
                  <IonSelectOption value="paquete">Paquete</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Precio unitario</IonLabel>
                <IonInput type="number" step="0.01" value={precioUnitario} onIonChange={(e) => setPrecioUnitario(e.detail.value || '')} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Stock mínimo</IonLabel>
                <IonInput type="number" step="1" value={stockMinimo} onIonChange={(e) => setStockMinimo(e.detail.value || '0')} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Proveedor</IonLabel>
                <IonSelect
                  value={idProveedor}
                  onIonChange={(e) => setIdProveedor(e.detail.value)}
                  interface="popover"
                >
                  <IonSelectOption value={undefined}>Sin proveedor</IonSelectOption>
                  {providers.map((p) => (
                    <IonSelectOption key={p.id_proveedor} value={p.id_proveedor}>{p.nombre_empresa}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>
          </IonList>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}
