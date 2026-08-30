import { useEffect, useState, useCallback } from 'react'
import { IonPage, IonText, IonButton, IonToast } from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { getSalesApi, confirmDispatchApi } from '../../api/saleApi'
import { getClientsApi } from '../../api/clientApi'
import { getProductsApi } from '../../api/productApi'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManageInventory } from '../../utils/permissions'
import type { Client, Product, Sale } from '../../types/sales'

export const DispatchesPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canManage = canManageInventory(user?.rol)

  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [salesResponse, clientsResponse, productsResponse] = await Promise.all([
        getSalesApi(0, 1000),
        getClientsApi(0, 1000),
        getProductsApi(0, 1000),
      ])
      setSales(salesResponse.items)
      setClients(clientsResponse.items)
      setProducts(productsResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los despachos. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const clientName = useCallback(
    (idCliente: number) =>
      clients.find((c) => c.id_cliente === idCliente)?.nombre_razon_social || `Cliente ${idCliente}`,
    [clients],
  )

  const productName = useCallback(
    (idProducto: number) => products.find((p) => p.id_producto === idProducto)?.nombre || `Producto ${idProducto}`,
    [products],
  )

  const pending = sales.filter((s) => s.estado === 'pendiente' || s.estado === 'en_proceso')
  const dispatched = sales.filter((s) => s.estado === 'entregada')

  const handleConfirm = async (sale: Sale) => {
    if (!canManage) return
    setSavingId(sale.id_orden_venta)
    setError(null)
    try {
      await confirmDispatchApi(sale.id_orden_venta)
      setToastMessage(`Despacho del pedido ${sale.numero_orden} confirmado`)
      setShowToast(true)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al confirmar el despacho. Verifica el stock.'
      setError(msg)
      console.error(err)
    } finally {
      setSavingId(null)
    }
  }

  const renderSale = (sale: Sale) => {
    const stockOk = sale.detalles.every((d) => {
      const prod = products.find((p) => p.id_producto === d.id_producto)
      const available = prod ? prod.stock_actual : 0
      return prod !== undefined && d.cantidad <= available
    })
    return (
      <div
        key={sale.id_orden_venta}
        style={{ border: '1px solid var(--app-border)', borderRadius: 12, padding: 16, marginBottom: 16, background: 'var(--app-bg)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div>
            <IonText style={{ fontSize: 18, fontWeight: 700 }}>{sale.numero_orden}</IonText>
            <IonText style={{ color: 'var(--app-text-muted)', fontSize: 13, display: 'block' }}>
              {clientName(sale.id_cliente)} · {sale.estado.replace('_', ' ')}
            </IonText>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!stockOk && (
              <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(220, 38, 38, 0.12)', color: '#dc2626' }}>
                Stock insuficiente
              </span>
            )}
            <IonButton
              size="small"
              color="success"
              disabled={!canManage || savingId === sale.id_orden_venta}
              onClick={() => handleConfirm(sale)}
            >
              {savingId === sale.id_orden_venta ? 'Confirmando...' : 'Confirmar despacho'}
            </IonButton>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sale.detalles.map((d) => {
            const prod = products.find((p) => p.id_producto === d.id_producto)
            const available = prod ? prod.stock_actual : 0
            const enough = prod !== undefined && d.cantidad <= available
            return (
              <div key={d.id_detalle_venta} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--app-surface-hover)' }}>
                <IonText style={{ fontSize: 13 }}>{d.descripcion || productName(d.id_producto)}</IonText>
                <IonText style={{ fontSize: 13, color: enough ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                  {d.cantidad} / Stock: {prod ? available : '—'}
                </IonText>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Despachos por confirmar</IonText>
        </div>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        {pending.length === 0 && !loading && (
          <IonText style={{ display: 'block', color: 'var(--app-text-muted)', padding: '24px 0' }}>
            No hay pedidos pendientes de despacho. La salida de stock se genera al confirmar el despacho físico.
          </IonText>
        )}

        {pending.map(renderSale)}

        {dispatched.length > 0 && (
          <>
            <p className="section-label" style={{ marginTop: 24, marginBottom: 8 }}>Despachos confirmados</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dispatched.map((sale) => (
                <div key={sale.id_orden_venta} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, border: '1px solid var(--app-border)', borderRadius: 12, padding: '12px 16px' }}>
                  <div>
                    <IonText style={{ fontSize: 15, fontWeight: 600, display: 'block' }}>{sale.numero_orden}</IonText>
                    <IonText style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>{clientName(sale.id_cliente)}</IonText>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a' }}>
                    Entregada
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {loading && <PageLoading message="Cargando despachos..." />}
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
