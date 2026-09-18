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
import { useAppSelector } from '../../hooks/useAppSelector'
import { canWriteQuotations } from '../../utils/permissions'
import type { Client, Quotation, QuotationCreate, QuotationUpdate } from '../../types/sales'
import type { Product } from '../../types/product'

const ESTADO_FILTER_OPTIONS = ['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'] as const
const PAGE_SIZE = 25

export const QuotationsPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canWrite = canWriteQuotations(user?.rol)

  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
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
        getQuotesApi(page * PAGE_SIZE, PAGE_SIZE, undefined, estadoFilter),
        getClientsApi(0, 1000),
        getProductsApi(0, 1000),
      ])
      setQuotations(quotationsResponse.items)
      setTotal(quotationsResponse.total)
      setClients(clientsResponse.items)
      setProducts(productsResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar cotizaciones. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [estadoFilter, page])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const clientName = useCallback(
    (idCliente: string) => clients.find((c) => c.id_cliente === idCliente)?.nombre_razon_social || `Cliente ${idCliente}`,
    [clients],
  )

  const handleSave = async (quotationId: string | null, data: QuotationCreate | QuotationUpdate) => {
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
    if (!window.confirm(`¿Convertir la cotización ${quotation.numero_consecutivo || quotation.id_cotizacion} en un pedido? El stock no se descuenta; se descontará al confirmar el despacho del pedido.`)) return
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
          {canWrite && (
            <IonButton onClick={() => { setEditingQuotation(null); setFormOpen(true) }}>
              Nueva Cotización
            </IonButton>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <IonSelect
            value={estadoFilter}
            placeholder="Todos los estados"
            interface="popover"
            style={{ background: 'var(--app-surface)', borderRadius: 8 }}
            onIonChange={(e) => { setEstadoFilter(e.detail.value || undefined); setPage(0) }}
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
          canWrite={canWrite}
          onView={(q) => setDetailQuotation(q)}
          onEdit={(q) => { setEditingQuotation(q); setFormOpen(true) }}
          onStatusChange={handleStatusChange}
          onConvertToSale={handleConvertToSale}
          onDelete={handleDelete}
        />

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 16 }}>
          <IonButton size="small" fill="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            Anterior
          </IonButton>
          <IonText color="medium" style={{ fontSize: 13 }}>
            Página {page + 1} de {totalPages} · {total} cotizaciones
          </IonText>
          <IonButton size="small" fill="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
            Siguiente
          </IonButton>
        </div>

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