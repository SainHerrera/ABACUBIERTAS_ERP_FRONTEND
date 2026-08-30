import { useCallback, useEffect, useState } from 'react'
import {
  IonText,
  IonPage,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonIcon,
} from '@ionic/react'
import { printOutline } from 'ionicons/icons'
import { CsvExportButton } from '../../components/reports/CsvExportButton'
import {
  getSalesBySellerReportApi,
  getSalesMonthlyTrendApi,
  getInventoryValuationReportApi,
} from '../../api/reportApi'
import {
  getProviderExpenseReportApi,
  getProviderDeliveryReportApi,
} from '../../api/purchaseOrderApi'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

type Segment = 'sales' | 'trend' | 'valuation' | 'expense' | 'delivery'

interface SellerRow {
  vendedor: string
  total: number
  ventas: number
}

interface ValuationRow {
  nombre: string
  stock_actual: number
  precio_unitario: number
  valor: number
}

interface ExpenseRow {
  nombre_proveedor: string
  gasto_total: number
  numero_oc: number
}

interface DeliveryRow {
  nombre_proveedor: string
  tiempo_promedio_dias: number
  cotizaciones: number
}

export const ReportCenterPage = () => {
  const [segment, setSegment] = useState<Segment>('sales')
  const [loading, setLoading] = useState(true)
  const [sellers, setSellers] = useState<SellerRow[]>([])
  const [trend, setTrend] = useState<{ mes: string; total: number }[]>([])
  const [valuation, setValuation] = useState<{
    valorTotal: number
    porProducto: ValuationRow[]
  }>({ valorTotal: 0, porProducto: [] })
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, t, v, e, d] = await Promise.all([
        getSalesBySellerReportApi(),
        getSalesMonthlyTrendApi(),
        getInventoryValuationReportApi(),
        getProviderExpenseReportApi(),
        getProviderDeliveryReportApi(),
      ])
      setSellers(s)
      setTrend(t)
      setValuation(v)
      setExpenses(e)
      setDeliveries(d)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isTableSegment = segment !== 'trend'

  useEffect(() => {
    if (isTableSegment) {
      document.body.classList.add('has-print-area')
    } else {
      document.body.classList.remove('has-print-area')
    }
    return () => document.body.classList.remove('has-print-area')
  }, [isTableSegment])

  const maxTrend = trend.length > 0 ? Math.max(...trend.map((t) => t.total)) : 0

  const renderTrend = () => (
    <div data-testid="trend-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 220, padding: '16px 8px 0' }}>
      {trend.length === 0 ? (
        <IonText color="medium">No hay ventas registradas.</IonText>
      ) : (
        trend.map((t) => {
          const height = maxTrend > 0 ? Math.max(8, (t.total / maxTrend) * 180) : 8
          return (
            <div key={t.mes} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <IonText style={{ fontSize: 11, color: 'var(--app-text-secondary)', fontWeight: 600 }} data-testid={`trend-bar-${t.mes}`}>
                {formatCurrency(t.total)}
              </IonText>
              <div
                style={{
                  width: '100%',
                  maxWidth: 64,
                  height,
                  background: 'var(--ion-color-primary)',
                  borderRadius: '6px 6px 0 0',
                  marginTop: 4,
                }}
              />
              <IonText style={{ fontSize: 12, color: 'var(--app-text-muted)', marginTop: 6, textTransform: 'capitalize' }}>
                {t.mes}
              </IonText>
            </div>
          )
        })
      )}
    </div>
  )

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }} data-testid="report-center">
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Centro de Reportes</IonText>
        </div>

        <IonSegment
          value={segment}
          onIonChange={(e) => setSegment(e.detail.value as Segment)}
          style={{ marginBottom: 20 }}
        >
          <IonSegmentButton value="sales">
            <IonLabel>Ventas por vendedor</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="trend" data-testid="segment-trend">
            <IonLabel>Tendencia de ventas</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="valuation">
            <IonLabel>Valorización</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="expense" data-testid="segment-expense">
            <IonLabel>Gasto por proveedor</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="delivery" data-testid="segment-delivery">
            <IonLabel>Tiempos de entrega</IonLabel>
          </IonSegmentButton>
        </IonSegment>

{loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <IonSpinner />
      </div>
    ) : (
      <div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {segment !== 'trend' && (
                <CsvExportButton
                  filename={`reporte-${segment}`}
                  headers={
                    segment === 'sales'
                      ? ['Vendedor', 'Total', 'N° Ventas']
                      : segment === 'valuation'
                        ? ['Producto', 'Stock', 'Precio', 'Valor']
                        : segment === 'expense'
                          ? ['Proveedor', 'Gasto total', 'N° OC']
                          : ['Proveedor', 'Tiempo promedio (días)', 'Registros']
                  }
                  rows={
                    segment === 'sales'
                      ? sellers.map((s) => [s.vendedor, s.total, s.ventas])
                      : segment === 'valuation'
                        ? valuation.porProducto.map((p) => [
                            p.nombre,
                            p.stock_actual,
                            p.precio_unitario,
                            p.valor,
                          ])
                        : segment === 'expense'
                          ? expenses.map((e) => [e.nombre_proveedor, e.gasto_total, e.numero_oc])
                          : deliveries.map((d) => [
                              d.nombre_proveedor,
                              d.tiempo_promedio_dias.toFixed(1),
                              d.cotizaciones,
                            ])
                  }
                />
              )}
              <IonButton fill="outline" size="small" onClick={() => window.print()} data-testid="print-report">
                <IonIcon slot="start" icon={printOutline} />
                Imprimir / PDF
              </IonButton>
            </div>

            <div id="print-area">
            {segment === 'sales' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vendedor</th>
                    <th>N° Ventas</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--app-text-muted)' }}>
                        No hay ventas registradas.
                      </td>
                    </tr>
                  ) : (
                    sellers.map((s) => (
                      <tr key={s.vendedor} data-testid="seller-row">
                        <td>{s.vendedor}</td>
                        <td>{s.ventas}</td>
                        <td>{formatCurrency(s.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {segment === 'trend' && renderTrend()}

            {segment === 'valuation' && (
              <div>
                <IonText style={{ fontSize: 18, fontWeight: 700, display: 'block', marginBottom: 16 }}>
                  Valor total del inventario: {formatCurrency(valuation.valorTotal)}
                </IonText>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock</th>
                      <th>Precio</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valuation.porProducto.map((p) => (
                      <tr key={p.nombre} data-testid="valuation-row">
                        <td>{p.nombre}</td>
                        <td>{p.stock_actual}</td>
                        <td>{formatCurrency(p.precio_unitario)}</td>
                        <td>{formatCurrency(p.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {segment === 'expense' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>N° OC</th>
                    <th>Gasto total</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: 'var(--app-text-muted)' }}>
                        No hay gastos registrados.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr key={e.nombre_proveedor} data-testid="expense-row">
                        <td>{e.nombre_proveedor}</td>
                        <td>{e.numero_oc}</td>
                        <td>{formatCurrency(e.gasto_total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {segment === 'delivery' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Registros</th>
                    <th>Tiempo promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.nombre_proveedor} data-testid="delivery-row">
                      <td>{d.nombre_proveedor}</td>
                      <td>{d.cotizaciones}</td>
                      <td>{d.tiempo_promedio_dias.toFixed(1)} días</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
    </IonPage>
  )
}
