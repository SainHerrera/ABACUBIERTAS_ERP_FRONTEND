import { useEffect, useState } from 'react'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonSpinner, IonToast, IonButtons, IonButton, IonIcon,
} from '@ionic/react'
import { arrowBack } from 'ionicons/icons'
import { getStockRequestsApi } from '../../api/stockRequestApi'
import {
  createProviderQuotationApi,
  getProviderQuotationsApi,
  selectProviderQuotationApi,
} from '../../api/providerQuotationApi'
import { createPurchaseOrderApi } from '../../api/purchaseOrderApi'
import { getProvidersApi } from '../../api/providerApi'
import type { ProviderQuotation } from '../../types/providerQuotation'
import type { Provider } from '../../types/provider'
import type { StockRequest } from '../../types/stockRequest'
import { QuotationCompare } from '../../components/compras/QuotationCompare'
import { QuotationFormDialog } from '../../components/compras/QuotationFormDialog'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManagePurchasing } from '../../utils/permissions'

export const RequestsPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canManage = canManagePurchasing(user?.rol)

  const [requests, setRequests] = useState<StockRequest[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [quotationsByRequest, setQuotationsByRequest] = useState<Record<number, ProviderQuotation[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false)
  const [activeRequest, setActiveRequest] = useState<StockRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadProviders = async () => {
    try {
      const res = await getProvidersApi(0, 100)
      setProviders(res.items)
    } catch {
      setProviders([])
    }
  }

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await getStockRequestsApi(0, 100, 'pendiente,aprobada')
      setRequests(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las solicitudes')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const loadQuotations = async (requestId: number) => {
    try {
      const res = await getProviderQuotationsApi(0, 100, requestId)
      setQuotationsByRequest((prev) => ({ ...prev, [requestId]: res.items }))
    } catch {
      setQuotationsByRequest((prev) => ({ ...prev, [requestId]: [] }))
    }
  }

  useEffect(() => {
    loadProviders()
    loadRequests()
  }, [])

  useEffect(() => {
    if (requests.length > 0) {
      requests.forEach((r) => loadQuotations(r.id_solicitud))
    }
  }, [requests])

  const handleOpenQuoteDialog = (request: StockRequest) => {
    setActiveRequest(request)
    setError(null)
    setQuoteDialogOpen(true)
  }

  const handleSaveQuotation = async (data: {
    id_solicitud: number
    id_producto: number
    id_proveedor: number
    precio_unitario: number
    tiempo_entrega_dias: number
    condiciones?: string
  }) => {
    setSaving(true)
    setError(null)
    try {
      await createProviderQuotationApi(data)
      setToast('Cotización registrada')
      setQuoteDialogOpen(false)
      await loadQuotations(data.id_solicitud)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar la cotización')
    } finally {
      setSaving(false)
    }
  }

  const handleSelect = async (quotationId: number) => {
    setSaving(true)
    setError(null)
    try {
      await selectProviderQuotationApi(quotationId)
      setToast('Proveedor seleccionado')
      const entry = Object.entries(quotationsByRequest).find(([, qs]) =>
        qs.some((q) => q.id_cotizacion === quotationId),
      )
      if (entry) await loadQuotations(Number(entry[0]))
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'No se pudo seleccionar')
    } finally {
      setSaving(false)
    }
  }

  const handleCreatePo = async (requestId: number) => {
    setSaving(true)
    setError(null)
    try {
      const quotes = quotationsByRequest[requestId] || []
      const selected = quotes.find((q) => q.seleccionada)
      const request = requests.find((r) => r.id_solicitud === requestId)
      if (!selected || !request) {
        setToast('Debe seleccionar un proveedor para generar la OC')
        return
      }
      await createPurchaseOrderApi({
        id_proveedor: selected.id_proveedor,
        id_solicitud: request.id_solicitud,
        id_cotizacion: selected.id_cotizacion,
        detalles: [
          {
            id_producto: request.id_producto,
            descripcion: request.descripcion,
            cantidad_ordenada: request.cantidad_sugerida,
            cantidad_recibida: 0,
            precio_unitario: selected.precio_unitario,
            tiempo_entrega_dias: selected.tiempo_entrega_dias,
          },
        ],
      })
      setToast('Orden de compra generada')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar la orden de compra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonButtons slot="start">
            <IonButton routerLink="/compras" style={{ color: '#fff' }}>
              <IonIcon icon={arrowBack} slot="start" />
              Menú
            </IonButton>
          </IonButtons>
          <IonTitle>Solicitudes de abastecimiento</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <IonSpinner />
          </div>
        ) : requests.length === 0 ? (
          <IonText color="medium" style={{ display: 'block', textAlign: 'center', marginTop: 48 }}>
            No hay solicitudes pendientes o aprobadas.
          </IonText>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            {requests.map((request) => (
              <div key={request.id_solicitud}>
                <IonText style={{ fontWeight: 700, fontSize: 13, color: 'var(--app-text-secondary)', display: 'block', margin: '8px 0 4px' }}>
                  {request.numero_solicitud} · {request.estado}
                </IonText>
                <QuotationCompare
                  requestId={request.id_solicitud}
                  productName={request.descripcion}
                  quantity={request.cantidad_sugerida}
                  quotations={quotationsByRequest[request.id_solicitud] || []}
                  onRegister={handleOpenQuoteDialog}
                  onSelect={handleSelect}
                  onCreatePo={handleCreatePo}
                  canManage={canManage}
                  isLoading={saving}
                  error={error}
                />
              </div>
            ))}
          </div>
        )}

        <QuotationFormDialog
          open={quoteDialogOpen}
          request={activeRequest}
          providers={providers}
          onClose={() => setQuoteDialogOpen(false)}
          onSave={handleSaveQuotation}
          isLoading={saving}
          error={null}
        />

        <IonToast isOpen={!!toast} message={toast || ''} duration={2500} onDidDismiss={() => setToast(null)} />
      </IonContent>
    </IonPage>
  )
}
