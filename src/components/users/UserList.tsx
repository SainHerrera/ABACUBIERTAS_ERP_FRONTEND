import { IonIcon } from '@ionic/react'
import { createOutline, banOutline } from 'ionicons/icons'
import type { User } from '../../types/auth'

interface UserListProps {
  users: User[]
  total: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onEdit: (user: User) => void
  onDeactivate: (user: User) => void
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  ventas: 'Ventas',
  compras: 'Compras',
}

const roleChipClass: Record<string, string> = {
  admin: 'chip chip-primary',
  ventas: 'chip chip-default',
  compras: 'chip chip-secondary',
}

export const UserList = ({
  users,
  onEdit,
  onDeactivate,
}: UserListProps) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id_usuario}>
              <td style={{ color: '#94a3b8', fontWeight: 500 }}>#{user.id_usuario}</td>
              <td style={{ fontWeight: 500 }}>{user.nombre}</td>
              <td>{user.email}</td>
              <td>
                <span className={roleChipClass[user.rol] || 'chip chip-default'}>
                  {roleLabels[user.rol] || user.rol}
                </span>
              </td>
              <td>
                <span className={user.activo ? 'chip chip-success' : 'chip chip-danger'}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <button
                  onClick={() => onEdit(user)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: '#64748b', verticalAlign: 'middle' }}
                  title="Editar"
                >
                  <IonIcon icon={createOutline} style={{ fontSize: 18 }} />
                </button>
                <button
                  onClick={() => onDeactivate(user)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: user.activo ? '#dc2626' : '#16a34a', verticalAlign: 'middle' }}
                  title={user.activo ? 'Desactivar' : 'Activar'}
                >
                  <IonIcon icon={banOutline} style={{ fontSize: 18 }} />
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                No hay usuarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
