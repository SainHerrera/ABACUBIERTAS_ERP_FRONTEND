import { IonText } from '@ionic/react'
import type { Movement } from '../../types/movement'

interface MovementListProps {
  movements: Movement[]
}

const typeLabels: Record<string, string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  ajuste: 'Ajuste',
}

const typeChipClass: Record<string, string> = {
  entrada: 'chip chip-success',
  salida: 'chip chip-danger',
  ajuste: 'chip chip-warning',
}

export const MovementList = ({ movements }: MovementListProps) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Referencia</th>
            <th>Usuario</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((mov) => (
            <tr key={mov.id_movimiento}>
              <td style={{ whiteSpace: 'nowrap' }}>
                {new Date(mov.fecha).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td>
                <IonText style={{ fontWeight: 600 }}>{mov.nombre_producto || `ID ${mov.id_producto}`}</IonText>
              </td>
              <td>
                <span className={typeChipClass[mov.tipo] || 'chip chip-default'}>
                  {typeLabels[mov.tipo] || mov.tipo}
                </span>
              </td>
              <td style={{ fontWeight: 600 }}>{mov.cantidad}</td>
              <td>{mov.referencia || '-'}</td>
              <td>{mov.nombre_usuario || '-'}</td>
              <td>
                <IonText color="medium" style={{ fontSize: 13 }}>{mov.nota || '-'}</IonText>
              </td>
            </tr>
          ))}
          {movements.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--app-text-faint)' }}>
                No hay movimientos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
