import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText, IonSelect, IonSelectOption,
} from '@ionic/react'
import type { Client, Product, SaleCreate } from '../../types/sales'
import { TAX_RATE, formatMoney } from '../../utils/totals'

interface DetailRow {
  key: number
  id_producto: number | null
  descripcion: string
  cantidad: number
  precio_unitario: number
}

interface SaleFormDialogProps {
  open: boolean
  clients: Client[]
  products: Product[]
  onClose: () => void
  onSave: (data: SaleCreate) => void
  isLoading: boolean
  error: string | null
}

let nextKey = 1

export const SaleFormDialog = ({
  open,
  clients,
  products,
  onClose,
  onSave,
  isLoading,
  error,
}: SaleFormDialogProps) => {
  const [idCliente, setIdCliente] = useState<number | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [rows, setRows] = useState<DetailRow[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setIdCliente(null)
      setObservaciones('')
      setRows([{ key: nextKey++, id_producto: null, descripcion: '', cantidad: 1, precio_unitario: 0 }])
      setValidationError(null)
    }
  }, [open])

  const updateRow = (key: number, patch: Partial<DetailRow>) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const handleProductChange = (key: number, productId: number) => {
    const product = products.find((p) => p.id_producto === productId)
    updateRow(key, { id_producto: productId, descripcion: product?.nombre || '', precio_unitario: Number(product?.precio_unitario ?? 0) })
  }

  const addRow = () => {
    setRows((prev) => [...prev, { key: nextKey++, id_producto: null, descripcion: '', cantidad: 1, precio_unitario: 0 }])
  }

  const removeRow = (key: number) => {
    setRows((prev) => prev.filter((row) => row.key !== key))
  }

  const subtotal = rows.reduce(
    (acc, row) => acc + (Number(row.cantidad) || 0) * (Number(row.precio_unitario) || 0),
    0,
  )
  const impuestos = subtotal * TAX_RATE

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!idCliente) {
      setValidationError('Debes seleccionar un cliente')
      return
    }

    const validRows = rows.filter((row) => row.id_producto && Number(row.cantidad) > 0)

    if (validRows.length === 0) {
      setValidationError('Agrega al menos un producto con cantidad mayor a cero')
      return
    }

    onSave({
      id_cliente: idCliente,
      observaciones: observaciones || undefined,
      detalles: validRows.map((row) => ({
        id_producto: row.id_producto!,
        descripcion: row.descripcion || undefined,
        cantidad: Math.max(1, Math.round(Number(row.cantidad))),
        precio_unitario: Number(row.precio_unitario) || 0,
        descuento: 0,
      })),
    })
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>Nuevo Pedido</IonTitle>
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
              <IonItem lines="none" style={{ '--background': 'var(--app-surface)', borderRadius: 8 }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Cliente</IonLabel>
                <IonSelect
                  value={idCliente}
                  placeholder="Selecciona un cliente"
                  interface="popover"
                  onIonChange={(e) => setIdCliente(e.detail.value ? Number(e.detail.value) : null)}
                >
                  {clients.map((c) => (
                    <IonSelectOption key={c.id_cliente} value={c.id_cliente}>{c.nombre_razon_social}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, margin: '16px 0 8px' }}>Productos</div>

            {rows.map((row) => (
              <div key={row.key} style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <IonItem lines="none" style={{ '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Producto</IonLabel>
                  <IonSelect
                    value={row.id_producto}
                    placeholder="Selecciona un producto"
                    interface="popover"
                    onIonChange={(e) => handleProductChange(row.key, Number(e.detail.value))}
                  >
                    {products.map((p) => (
                      <IonSelectOption key={p.id_producto} value={p.id_producto}>
                        {p.nombre} (stock: {p.stock_actual})
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                  <IonItem lines="none" style={{ '--background': 'transparent' }}>
                    <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Cantidad</IonLabel>
                    <IonInput type="number" min={1} value={row.cantidad} onIonChange={(e) => updateRow(row.key, { cantidad: Number(e.detail.value) || 0 })} />
                  </IonItem>
                  <IonItem lines="none" style={{ '--background': 'transparent' }}>
                    <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Precio unitario</IonLabel>
                    <IonInput type="number" min={0} value={row.precio_unitario} onIonChange={(e) => updateRow(row.key, { precio_unitario: Number(e.detail.value) || 0 })} />
                  </IonItem>
                </div>
                {rows.length > 1 && (
                  <IonButton size="small" fill="clear" color="danger" onClick={() => removeRow(row.key)}>
                    Quitar producto
                  </IonButton>
                )}
              </div>
            ))}

            <IonButton size="small" fill="outline" onClick={addRow}>+ Agregar producto</IonButton>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Observaciones</IonLabel>
                <IonInput value={observaciones} onIonChange={(e) => setObservaciones(e.detail.value || '')} />
              </IonItem>
            </div>
          </IonList>

          <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>IVA (19%)</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(impuestos)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span>{formatMoney(subtotal + impuestos)}</span>
            </div>
          </div>

          <IonText color="medium" style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
            Al crear el pedido el stock se descuenta automáticamente del inventario.
          </IonText>

          <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : 'Crear Pedido'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}
