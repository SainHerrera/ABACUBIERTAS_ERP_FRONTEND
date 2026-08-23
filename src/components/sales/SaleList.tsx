import { IonText } from '@ionic/react'
import type { Sale } from '../../types/sales'

interface SaleListProps {
  sales: Sale[]
  clientName: (idCliente: number) => string
  onView: (sale: Sale) => void
  onCancel: (sale: Sale) => void
}

const formatMoney = (value: number | string) =>
  `$${Number(value || 0).toLocaleString('es-CO', { maximumFractionDigits: 2 })}`

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('es-CO') : '-'

const estadoChipClass: Record<Sale['estado'], string> = {
  pendiente: 'chip chip-warning',
  en_proceso: 'chip chip-primary',
  entregada: 'chip chip-success',
  cancelada: 'chip chip-danger',
}

export const SaleList = ({ sales, clientName, onView, onCancel }: SaleListProps) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Número de orden</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id_orden_venta}>
              <td>
                <IonText style={{ fontWeight: 600 }}>{s.numero_orden || `OV-${s.id_orden_venta}`}</IonText>
              </td>
              <td>{clientName(s.id_cliente)}</td>
              <td>{formatDate(s.fecha_venta)}</td>
              <td>
                <span className={estadoChipClass[s.estado] || 'chip chip-default'}>{s.estado}</span>
              </td>
              <td style={{ fontWeight: 600 }}>{formatMoney(s.total)}</td>
              <td>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => onView(s)} title="Ver detalle">
                    👁️
                  </button>
                  {s.estado !== 'cancelada' && (
                    <button className="btn-icon" onClick={() => onCancel(s)} title="Cancelar pedido">
                      🚫
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {sales.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                No hay pedidos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
