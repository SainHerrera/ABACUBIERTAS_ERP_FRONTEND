import { useEffect, useState, useCallback } from 'react'
import {
  IonPage, IonText, IonButton, IonToast, IonSelect, IonSelectOption,
} from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { SaleList } from '../../components/sales/SaleList'
import { SaleDetailDialog } from '../../components/sales/SaleDetailDialog'
import { SaleFormDialog } from '../../components/sales/SaleFormDialog'
import { getSalesApi, createSaleApi, cancelSaleApi, updateSaleApi } from '../../api/saleApi'
import { getClientsApi } from '../../api/clientApi'
import { getProductsApi } from '../../api/productApi'
import type { Client, Product, Sale, SaleCreate, SaleUpdate } from '../../types/sales'

const ESTADO_FILTER_OPTIONS = ['pendiente', 'en_proceso', 'entregada', 'cancelada'] as const

export const OrdersPage = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>(undefined)
  const [clienteFilter, setClienteFilter] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [detailSale, setDetailSale] = useState<Sale | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [salesResponse, clientsResponse, productsResponse] = await Promise.all([
        getSalesApi(0, 1000, clienteFilter, estadoFilter),
        getClientsApi(0, 1000),
        getProductsApi(0, 1000),
      ])
      setSales(salesResponse.items)
      setClients(clientsResponse.items)
      setProducts(productsResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar pedidos. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [estadoFilter, clienteFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const clientName = useCallback(
    (idCliente: number) => clients.find((c) => c.id_cliente === idCliente)?.nombre_razon_social || `Cliente ${idCliente}`,
    [clients],
  )

  const handleCreate = async (data: SaleCreate) => {
    setSaving(true)
    setError(null)
    try {
      await createSaleApi(data)
      setToastMessage('Pedido creado correctamente')
      setShowToast(true)
      setFormOpen(false)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear el pedido. Verifica que haya stock suficiente.'
      setError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveStatus = async (saleId: number, data: SaleUpdate) => {
    setLoading(true)
    setError(null)
    try {
      await updateSaleApi(saleId, data)
      setDetailSale(null)
      setToastMessage('Pedido actualizado correctamente')
      setShowToast(true)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el pedido.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (sale: Sale) => {
    if (!window.confirm(`¿Estás seguro de cancelar el pedido ${sale.numero_orden || sale.id_orden_venta}? El stock será devuelto al inventario.`)) return
    setLoading(true)
    setError(null)
    try {
      await cancelSaleApi(sale.id_orden_venta)
      setToastMessage('Pedido cancelado correctamente')
      setShowToast(true)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cancelar el pedido.'
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
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Pedidos</IonText>
          <IonButton onClick={() => setFormOpen(true)}>
            Nuevo Pedido
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
              <IonSelectOption key={opt} value={opt}>{opt.replace('_', ' ')}</IonSelectOption>
            ))}
          </IonSelect>
          <IonSelect
            value={clienteFilter}
            placeholder="Todos los clientes"
            interface="popover"
            style={{ background: 'var(--app-surface)', borderRadius: 8 }}
            onIonChange={(e) => setClienteFilter(e.detail.value ? Number(e.detail.value) : undefined)}
          >
            <IonSelectOption value="">Todos los clientes</IonSelectOption>
            {clients.map((c) => (
              <IonSelectOption key={c.id_cliente} value={c.id_cliente}>{c.nombre_razon_social}</IonSelectOption>
            ))}
          </IonSelect>
        </div>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        <SaleList
          sales={sales}
          clientName={clientName}
          onView={(s) => setDetailSale(s)}
          onCancel={handleCancel}
        />

        <SaleFormDialog
          open={formOpen}
          clients={clients}
          products={products}
          onClose={() => setFormOpen(false)}
          onSave={handleCreate}
          isLoading={saving}
          error={error}
        />

        <SaleDetailDialog
          sale={detailSale}
          clientName={clientName}
          onClose={() => setDetailSale(null)}
          onSaveStatus={handleSaveStatus}
          isLoading={loading}
        />

        {loading && !formOpen && <PageLoading message="Cargando pedidos..." />}
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
