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
import { formatCurrency, formatMonthLabel, formatNumber } from '../../utils/format'
import { BarChart } from '../../components/reports/BarChart'

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
    } catch {
      setSellers([])
      setTrend([])
      setValuation({ valorTotal: 0, porProducto: [] })
      setExpenses([])
      setDeliveries([])
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

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }} data-testid="report-center">
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Reportes y gráficos</IonText>
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
            <IonLabel>Ingresos mensuales</IonLabel>
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
                        <td>{formatNumber(s.ventas)}</td>
                        <td>{formatCurrency(s.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {segment === 'trend' && (
              <BarChart
                data={trend.map((t) => ({ label: formatMonthLabel(t.mes), value: t.total }))}
                formatValue={formatCurrency}
                testId="trend-chart"
              />
            )}

            {segment === 'valuation' && (
              <div>
                {valuation.porProducto.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <IonText style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Top productos por valor de inventario
                    </IonText>
                    <BarChart
                      data={valuation.porProducto.slice(0, 10).map((p) => ({ label: p.nombre, value: p.valor }))}
                      formatValue={formatCurrency}
                      height={200}
                      maxBars={10}
                    />
                  </div>
                )}
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
                        <td>{formatNumber(p.stock_actual)}</td>
                        <td>{formatCurrency(p.precio_unitario)}</td>
                        <td>{formatCurrency(p.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {segment === 'expense' && (
              <div>
                {expenses.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <IonText style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      Gasto por proveedor
                    </IonText>
                    <BarChart
                      data={expenses.map((e) => ({ label: e.nombre_proveedor, value: e.gasto_total }))}
                      formatValue={formatCurrency}
                      height={200}
                      testId="expense-chart"
                    />
                  </div>
                )}
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
              </div>
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
                      <td>{formatNumber(d.cotizaciones)}</td>
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
