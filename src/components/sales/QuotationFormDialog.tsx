import { useState, useEffect } from 'react'
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonText, IonSelect, IonSelectOption,
} from '@ionic/react'
import type { Client, Quotation, QuotationCreate, QuotationUpdate } from '../../types/sales'
import type { Product } from '../../types/product'
import { formatMoney, TAX_RATE } from '../../utils/totals'

interface DetailRow {
  key: number
  id_producto: string | null
  descripcion: string
  cantidad: number
  precio_unitario: number
  descuento: number
}

interface QuotationFormDialogProps {
  open: boolean
  quotation: Quotation | null
  clients: Client[]
  products: Product[]
  onClose: () => void
  onSave: (quotationId: string | null, data: QuotationCreate | QuotationUpdate) => void
  isLoading: boolean
  error: string | null
}

let nextKey = 1

export const QuotationFormDialog = ({
  open,
  quotation,
  clients,
  products,
  onClose,
  onSave,
  isLoading,
  error,
}: QuotationFormDialogProps) => {
  const isEditing = !!quotation
  const readOnly = !!quotation && quotation.estado !== 'borrador'
  const [idCliente, setIdCliente] = useState<string | null>(null)
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [descuentoGlobal, setDescuentoGlobal] = useState(0)
  const [observaciones, setObservaciones] = useState('')
  const [rows, setRows] = useState<DetailRow[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (quotation) {
      setIdCliente(quotation.id_cliente)
      setFechaVencimiento(quotation.fecha_vencimiento ? quotation.fecha_vencimiento.slice(0, 10) : '')
      setDescuentoGlobal(Number(quotation.descuento) || 0)
      setObservaciones(quotation.observaciones || '')
      setRows(
        quotation.detalles.map((d) => ({
          key: nextKey++,
          id_producto: d.id_producto,
          descripcion: d.descripcion || '',
          cantidad: Number(d.cantidad),
          precio_unitario: Number(d.precio_unitario),
          descuento: Number(d.descuento),
        })),
      )
    } else {
      setIdCliente(null)
      setFechaVencimiento('')
      setDescuentoGlobal(0)
      setObservaciones('')
      setRows([{ key: nextKey++, id_producto: null, descripcion: '', cantidad: 1, precio_unitario: 0, descuento: 0 }])
    }
    setValidationError(null)
  }, [quotation, open])

  const updateRow = (key: number, patch: Partial<DetailRow>) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  const handleProductChange = (key: number, productId: string) => {
    const product = products.find((p) => p.id_producto === productId)
    updateRow(key, { id_producto: productId, descripcion: product?.nombre || '' })
  }

  const addRow = () => {
    setRows((prev) => [...prev, { key: nextKey++, id_producto: null, descripcion: '', cantidad: 1, precio_unitario: 0, descuento: 0 }])
  }

  const removeRow = (key: number) => {
    setRows((prev) => prev.filter((row) => row.key !== key))
  }

  const rowSubtotal = (row: DetailRow) =>
    Math.max(0, (Number(row.cantidad) || 0) * (Number(row.precio_unitario) || 0) - (Number(row.descuento) || 0))

  const computePreview = (rowsToPreview: DetailRow[], descuento: number) => {
    const subtotal = rowsToPreview.reduce((acc, row) => acc + rowSubtotal(row), 0)
    const base = Math.max(0, subtotal - (Number(descuento) || 0))
    const impuestos = Math.round(base * TAX_RATE)
    return { subtotal, impuestos, total: base + impuestos }
  }

  const totals = computePreview(rows, descuentoGlobal)

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

    const detalles = validRows.map((row, index) => {
      const cantidad = Math.max(1, Math.round(Number(row.cantidad)))
      const precio_unitario = Number(row.precio_unitario) || 0
      const descuento = Number(row.descuento) || 0
      return {
        id_detalle: index + 1,
        id_producto: row.id_producto!,
        descripcion: row.descripcion || '',
        cantidad,
        precio_unitario,
        descuento,
        subtotal: cantidad * precio_unitario - descuento,
      }
    })

    if (isEditing) {
      onSave(quotation!.id_cotizacion, {
        id_cliente: idCliente,
        fecha_vencimiento: fechaVencimiento ? `${fechaVencimiento}T12:00:00` : undefined,
        descuento: Number(descuentoGlobal) || 0,
        observaciones: observaciones || undefined,
        detalles,
      })
    } else {
      onSave(null, {
        id_cliente: idCliente,
        fecha_vencimiento: fechaVencimiento ? `${fechaVencimiento}T12:00:00` : undefined,
        descuento: Number(descuentoGlobal) || 0,
        observaciones: observaciones || undefined,
        detalles,
      })
    }
  }

  return (
    <IonModal isOpen={open} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>{isEditing ? `Editar Cotización ${quotation?.numero_consecutivo || ''}` : 'Nueva Cotización'}</IonTitle>
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
                  disabled={readOnly}
                  onIonChange={(e) => setIdCliente(e.detail.value || null)}
                >
                  {clients.map((c) => (
                    <IonSelectOption key={c.id_cliente} value={c.id_cliente}>{c.nombre_razon_social}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Fecha de vencimiento</IonLabel>
                <IonInput type="date" value={fechaVencimiento} disabled={readOnly} onIonChange={(e) => setFechaVencimiento(e.detail.value || '')} />
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
                    disabled={readOnly}
                    onIonChange={(e) => handleProductChange(row.key, e.detail.value)}
                  >
                    {products.map((p) => (
                      <IonSelectOption key={p.id_producto} value={p.id_producto}>{p.nombre}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                  <IonItem lines="none" style={{ '--background': 'transparent' }}>
                    <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Cantidad</IonLabel>
                    <IonInput type="number" min={1} value={row.cantidad} disabled={readOnly} onIonChange={(e) => updateRow(row.key, { cantidad: Number(e.detail.value) || 0 })} />
                  </IonItem>
                  <IonItem lines="none" style={{ '--background': 'transparent' }}>
                    <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Precio unitario (0 = margen)</IonLabel>
                    <IonInput type="number" min={0} value={row.precio_unitario} disabled={readOnly} onIonChange={(e) => updateRow(row.key, { precio_unitario: Number(e.detail.value) || 0 })} />
                  </IonItem>
                  <IonItem lines="none" style={{ '--background': 'transparent' }}>
                    <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Descuento ($)</IonLabel>
                    <IonInput type="number" min={0} value={row.descuento} disabled={readOnly} onIonChange={(e) => updateRow(row.key, { descuento: Number(e.detail.value) || 0 })} />
                  </IonItem>
                  <IonItem lines="none" style={{ '--background': 'transparent' }}>
                    <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Subtotal línea</IonLabel>
                    <IonText style={{ fontWeight: 600 }}>{formatMoney(rowSubtotal(row))}</IonText>
                  </IonItem>
                </div>
                {!readOnly && rows.length > 1 && (
                  <IonButton size="small" fill="clear" color="danger" onClick={() => removeRow(row.key)}>
                    Quitar producto
                  </IonButton>
                )}
              </div>
            ))}

            {!readOnly && (
              <IonButton size="small" fill="outline" onClick={addRow}>+ Agregar producto</IonButton>
            )}

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Descuento global ($)</IonLabel>
                <IonInput type="number" min={0} value={descuentoGlobal} disabled={readOnly} onIonChange={(e) => setDescuentoGlobal(Number(e.detail.value) || 0)} />
              </IonItem>
            </div>

            <div className="ion-input-wrapper">
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Observaciones</IonLabel>
                <IonInput value={observaciones} disabled={readOnly} onIonChange={(e) => setObservaciones(e.detail.value || '')} />
              </IonItem>
            </div>
          </IonList>

          <div style={{ background: 'var(--app-surface)', borderRadius: 8, padding: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(totals.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Descuento</span>
              <span style={{ fontWeight: 600 }}>-{formatMoney(descuentoGlobal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>IVA (19%)</span>
              <span style={{ fontWeight: 600 }}>{formatMoney(totals.impuestos)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span>{formatMoney(totals.total)}</span>
            </div>
            {!readOnly && (
              <IonText color="medium" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                Deja el precio unitario en 0 para que el sistema aplique automáticamente el margen del producto. El descuento se ingresa como valor en pesos.
              </IonText>
            )}
          </div>

          <IonButton expand="block" type="submit" disabled={isLoading || readOnly} style={{ marginTop: 24 }}>
            {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Cotización'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  )
}
