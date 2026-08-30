import { IonText } from '@ionic/react'
import type { Quotation } from '../../types/sales'

interface QuotationListProps {
  quotations: Quotation[]
  clientName: (idCliente: number) => string
  onView: (quotation: Quotation) => void
  onEdit: (quotation: Quotation) => void
  onStatusChange: (quotation: Quotation, estado: Quotation['estado']) => void
  onConvertToSale: (quotation: Quotation) => void
  onDelete: (quotation: Quotation) => void
}

const formatMoney = (value: number | string) =>
  `$${Number(value || 0).toLocaleString('es-CO', { maximumFractionDigits: 2 })}`

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('es-CO') : '-'

const estadoChipClass: Record<Quotation['estado'], string> = {
  borrador: 'chip chip-default',
  enviada: 'chip chip-primary',
  aprobada: 'chip chip-success',
  rechazada: 'chip chip-danger',
  vencida: 'chip chip-warning',
}

export const QuotationList = ({
  quotations,
  clientName,
  onView,
  onEdit,
  onStatusChange,
  onConvertToSale,
  onDelete,
}: QuotationListProps) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Emisión</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((q) => (
            <tr key={q.id_cotizacion}>
              <td>
                <IonText style={{ fontWeight: 600 }}>{q.numero_consecutivo || `COT-${q.id_cotizacion}`}</IonText>
              </td>
              <td>{clientName(q.id_cliente)}</td>
              <td>{formatDate(q.fecha_emision)}</td>
              <td>{formatDate(q.fecha_vencimiento)}</td>
              <td>
                <span className={estadoChipClass[q.estado] || 'chip chip-default'}>{q.estado}</span>
              </td>
              <td style={{ fontWeight: 600 }}>{formatMoney(q.total)}</td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button className="btn-icon" onClick={() => onView(q)} title="Ver detalle">
                    👁️
                  </button>
                  {q.estado === 'borrador' && (
                    <>
                      <button className="btn-icon" onClick={() => onEdit(q)} title="Editar">
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => onStatusChange(q, 'enviada')} title="Enviar al cliente">
                        📤
                      </button>
                      <button className="btn-icon" onClick={() => onDelete(q)} title="Eliminar">
                        🗑️
                      </button>
                    </>
                  )}
                  {q.estado === 'enviada' && (
                    <>
                      <button className="btn-icon" onClick={() => onStatusChange(q, 'aprobada')} title="Aprobar">
                        ✅
                      </button>
                      <button className="btn-icon" onClick={() => onStatusChange(q, 'rechazada')} title="Rechazar">
                        ❌
                      </button>
                    </>
                  )}
                  {q.estado === 'aprobada' && (
                    <button className="btn-icon" onClick={() => onConvertToSale(q)} title="Convertir en pedido">
                      🧾
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {quotations.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--app-text-faint)' }}>
                No hay cotizaciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
