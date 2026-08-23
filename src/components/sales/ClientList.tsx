import { IonText } from '@ionic/react'
import type { Client } from '../../types/sales'

interface ClientListProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  canDelete: boolean
}

const estadoChipClass: Record<Client['estado'], string> = {
  activo: 'chip chip-success',
  inactivo: 'chip chip-danger',
  prospecto: 'chip chip-warning',
  frecuente: 'chip chip-secondary',
  corporativo: 'chip chip-primary',
}

const tipoLabel: Record<Client['tipo_cliente'], string> = {
  empresa: 'Empresa',
  persona_natural: 'Persona natural',
}

export const ClientList = ({ clients, onEdit, onDelete, canDelete }: ClientListProps) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre / Razón social</th>
            <th>NIT/CC</th>
            <th>Tipo</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Ciudad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id_cliente}>
              <td>
                <IonText style={{ fontWeight: 600 }}>{client.nombre_razon_social}</IonText>
              </td>
              <td>{client.nit_cc}</td>
              <td>{tipoLabel[client.tipo_cliente] || client.tipo_cliente}</td>
              <td>{client.nombre_contacto || '-'}</td>
              <td>{client.telefono || '-'}</td>
              <td>{client.email || '-'}</td>
              <td>{client.ciudad || '-'}</td>
              <td>
                <span className={estadoChipClass[client.estado] || 'chip chip-default'}>
                  {client.estado}
                </span>
              </td>
              <td>
                <button className="btn-icon" onClick={() => onEdit(client)} title="Editar">
                  ✏️
                </button>
                {canDelete && (
                  <button className="btn-icon" onClick={() => onDelete(client)} title="Eliminar">
                    🗑️
                  </button>
                )}
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                No hay clientes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
