import { useEffect, useState, useCallback } from 'react'
import {
  IonPage, IonText, IonButton, IonToast, IonSelect, IonSelectOption,
} from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { QuotationList } from '../../components/sales/QuotationList'
import { QuotationFormDialog } from '../../components/sales/QuotationFormDialog'
import { QuotationDetailDialog } from '../../components/sales/QuotationDetailDialog'
import { getQuotesApi, createQuoteApi, updateQuoteApi, updateQuoteStatusApi, deleteQuoteApi } from '../../api/quotationApi'
import { convertQuoteToSaleApi } from '../../api/saleApi'
import { getClientsApi } from '../../api/clientApi'
import { getProductsApi } from '../../api/productApi'
import type { Client, Product, Quotation, QuotationCreate, QuotationUpdate } from '../../types/sales'

const ESTADO_FILTER_OPTIONS = ['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'] as const

export const QuotationsPage = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)
  const [detailQuotation, setDetailQuotation] = useState<Quotation | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [quotationsResponse, clientsResponse, productsResponse] = await Promise.all([
        getQuotesApi(0, 1000, undefined, estadoFilter),
        getClientsApi(0, 1000),
        getProductsApi(0, 1000),
      ])
      setQuotations(quotationsResponse.items)
      setClients(clientsResponse.items)
      setProducts(productsResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar cotizaciones. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [estadoFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const clientName = useCallback(
    (idCliente: number) => clients.find((c) => c.id_cliente === idCliente)?.nombre_razon_social || `Cliente ${idCliente}`,
    [clients],
  )

  const handleSave = async (quotationId: number | null, data: QuotationCreate | QuotationUpdate) => {
    setSaving(true)
    setError(null)
    try {
      if (quotationId) {
        await updateQuoteApi(quotationId, data as QuotationUpdate)
        setToastMessage('Cotización actualizada correctamente')
      } else {
        await createQuoteApi(data as QuotationCreate)
        setToastMessage('Cotización creada correctamente')
      }
      setShowToast(true)
      setFormOpen(false)
      setEditingQuotation(null)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la cotización.'
      setError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (quotation: Quotation, estado: Quotation['estado']) => {
    setLoading(true)
    setError(null)
    try {
      await updateQuoteStatusApi(quotation.id_cotizacion, { estado })
      setToastMessage(`Cotización marcada como ${estado}`)
      setShowToast(true)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Error al cambiar el estado a ${estado}.`
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToSale = async (quotation: Quotation) => {
    if (!window.confirm(`¿Convertir la cotización ${quotation.numero_consecutivo || quotation.id_cotizacion} en un pedido? El stock será descontado.`)) return
    setLoading(true)
    setError(null)
    try {
      await convertQuoteToSaleApi(quotation.id_cotizacion)
      setToastMessage('Cotización convertida en pedido correctamente')
      setShowToast(true)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al convertir la cotización en pedido.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (quotation: Quotation) => {
    if (!window.confirm(`¿Estás seguro de eliminar la cotización ${quotation.numero_consecutivo || quotation.id_cotizacion}?`)) return
    setLoading(true)
    setError(null)
    try {
      await deleteQuoteApi(quotation.id_cotizacion)
      setToastMessage('Cotización eliminada correctamente')
      setShowToast(true)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la cotización.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Cotizaciones</IonText>
          <IonButton onClick={() => { setEditingQuotation(null); setFormOpen(true) }}>
            Nueva Cotización
          </IonButton>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <IonSelect
            value={estadoFilter}
            placeholder="Todos los estados"
            interface="popover"
            style={{ background: 'var(--app-surface)', borderRadius: 8 }}
            onIonChange={(e) => setEstadoFilter(e.detail.value || undefined)}
          >
            <IonSelectOption value="">Todos los estados</IonSelectOption>
            {ESTADO_FILTER_OPTIONS.map((opt) => (
              <IonSelectOption key={opt} value={opt}>{opt}</IonSelectOption>
            ))}
          </IonSelect>
          <IonText color="medium" style={{ fontSize: 13 }}>
            Flujo: borrador → enviada → aprobada → pedido. Usa los íconos de cada fila.
          </IonText>
        </div>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        <QuotationList
          quotations={quotations}
          clientName={clientName}
          onView={(q) => setDetailQuotation(q)}
          onEdit={(q) => { setEditingQuotation(q); setFormOpen(true) }}
          onStatusChange={handleStatusChange}
          onConvertToSale={handleConvertToSale}
          onDelete={handleDelete}
        />

        <QuotationFormDialog
          open={formOpen}
          quotation={editingQuotation}
          clients={clients}
          products={products}
          onClose={() => { setFormOpen(false); setEditingQuotation(null) }}
          onSave={handleSave}
          isLoading={saving}
          error={error}
        />

        <QuotationDetailDialog
          quotation={detailQuotation}
          clientName={clientName}
          onClose={() => setDetailQuotation(null)}
        />

        {loading && !formOpen && <PageLoading message="Cargando cotizaciones..." />}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          color="success"
        />
      </div>
    </div>
    </IonPage>
  )
}
