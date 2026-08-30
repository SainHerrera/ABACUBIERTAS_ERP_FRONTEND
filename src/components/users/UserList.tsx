import { IonText } from '@ionic/react'
import type { User } from '../../types/auth'
import { roleLabels, roleChipClass } from './roleConfig'

interface UserListProps {
  users: User[]
  total?: number
  page?: number
  rowsPerPage?: number
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  onEdit: (user: User) => void
  onDeactivate: (user: User) => void
}

export const UserList = ({
  users,
  onEdit,
  onDeactivate,
}: UserListProps) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id_usuario}>
              <td style={{ color: 'var(--app-text-faint)', fontWeight: 500 }}>#{user.id_usuario}</td>
              <td>
                <IonText style={{ fontWeight: 600 }}>{user.nombre}</IonText>
              </td>
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
              <td>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-icon"
                    onClick={() => onEdit(user)}
                    title="Editar usuario"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onDeactivate(user)}
                    title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                    style={{ color: user.activo ? '#dc2626' : '#16a34a' }}
                  >
                    {user.activo ? '🚫' : '✅'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--app-text-faint)' }}>
                No hay usuarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
