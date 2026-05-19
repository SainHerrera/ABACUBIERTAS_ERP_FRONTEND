import { useState, useEffect, useCallback } from 'react'
import { IonButton, IonIcon, IonText, useIonToast } from '@ionic/react'
import { addOutline, peopleOutline } from 'ionicons/icons'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { fetchUsers, updateUser } from '../store/slices/authSlice'
import { createUserApi } from '../api/authApi'
import { UserList } from '../components/users/UserList'
import { UserFormDialog } from '../components/users/UserFormDialog'
import type { User, UserUpdateRequest } from '../types/auth'

export const UsersPage = () => {
  const dispatch = useAppDispatch()
  const [present] = useIonToast()

  const [users, setUsers] = useState<User[]>([])

  const loadUsers = useCallback(async () => {
    const result = await dispatch(fetchUsers({ skip: 0, limit: 100 }))
    if (fetchUsers.fulfilled.match(result)) {
      setUsers(result.payload)
    }
  }, [dispatch])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setDialogError(null)
    setDialogOpen(true)
  }

  const handleDeactivate = async (user: User) => {
    const newStatus = !user.activo
    const result = await dispatch(updateUser({ userId: user.id_usuario, data: { activo: newStatus } }))

    if (updateUser.fulfilled.match(result)) {
      present({ message: `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`, duration: 3000, color: 'success', position: 'top' })
      loadUsers()
    } else {
      present({ message: 'Error al cambiar estado del usuario', duration: 3000, color: 'danger', position: 'top' })
    }
  }

  const handleSave = async (userId: number | null, data: UserUpdateRequest) => {
    setDialogLoading(true)
    setDialogError(null)

    if (userId) {
      const result = await dispatch(updateUser({ userId, data }))
      if (updateUser.fulfilled.match(result)) {
        setDialogOpen(false)
        present({ message: 'Usuario actualizado correctamente', duration: 3000, color: 'success', position: 'top' })
        loadUsers()
      } else {
        setDialogError('Error al actualizar usuario')
      }
    } else {
      try {
        await createUserApi(data as UserUpdateRequest & { email: string; nombre: string; password: string })
        setDialogOpen(false)
        present({ message: 'Usuario creado correctamente', duration: 3000, color: 'success', position: 'top' })
        loadUsers()
      } catch {
        setDialogError('Error al crear usuario')
      }
    }

    setDialogLoading(false)
  }

  const handleOpenNew = () => {
    setSelectedUser(null)
    setDialogError(null)
    setDialogOpen(true)
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24, paddingTop: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <IonIcon icon={peopleOutline} style={{ fontSize: 24, color: 'var(--ion-color-primary)' }} />
              <IonText style={{ fontSize: 20, fontWeight: 700 }}>Usuarios</IonText>
            </div>
            <IonButton onClick={handleOpenNew}>
              <IonIcon slot="start" icon={addOutline} />
              Nuevo Usuario
            </IonButton>
          </div>

          <UserList
            users={users}
            total={users.length}
            page={0}
            rowsPerPage={100}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
          />
        </div>

        <UserFormDialog
          open={dialogOpen}
          user={selectedUser}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          isLoading={dialogLoading}
          error={dialogError}
        />
      </div>
  )
}
