import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  IonButton,
  IonIcon,
  IonText,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonPage,
  useIonToast,
  type ToastOptions,
} from '@ionic/react'
import { addOutline, peopleOutline } from 'ionicons/icons'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { fetchUsers, updateUser } from '../store/slices/authSlice'
import { createUserApi } from '../api/authApi'
import { UserList } from '../components/users/UserList'
import { UserFormDialog } from '../components/users/UserFormDialog'
import { PageLoading } from '../components/shared/PageLoading'
import type { User, UserUpdateRequest } from '../types/auth'

export const UsersPage = () => {
  const dispatch = useAppDispatch()
  const [present] = useIonToast()

  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const loadUsers = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true)
      const result = await dispatch(fetchUsers({ skip: 0, limit: 100 }))
      if (fetchUsers.fulfilled.match(result)) {
        setUsers(result.payload)
      }
      setLoading(false)
    },
    [dispatch],
  )

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    let result = users

    if (search.trim()) {
      const term = search.toLowerCase().trim()
      result = result.filter(
        (u) =>
          u.nombre.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      )
    }

    if (roleFilter) {
      result = result.filter((u) => u.rol === roleFilter)
    }

    if (statusFilter === 'activo') {
      result = result.filter((u) => u.activo)
    } else if (statusFilter === 'inactivo') {
      result = result.filter((u) => !u.activo)
    }

    return result
  }, [users, search, roleFilter, statusFilter])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)
  const [toastQueue, setToastQueue] = useState<ToastOptions | null>(null)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setDialogError(null)
    setDialogOpen(true)
  }

  const handleDeactivate = async (user: User) => {
    const newStatus = !user.activo
    const result = await dispatch(
      updateUser({ userId: user.id_usuario, data: { activo: newStatus } }),
    )

    if (updateUser.fulfilled.match(result)) {
      present({
        message: `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`,
        duration: 3000,
        color: 'success',
        position: 'top',
      })
      loadUsers()
    } else {
      present({
        message: (result.payload as string) || 'Error al cambiar estado del usuario',
        duration: 3000,
        color: 'danger',
        position: 'top',
      })
    }
  }

  const handleSave = async (userId: number | null, data: UserUpdateRequest) => {
    setDialogLoading(true)
    setDialogError(null)

    if (userId) {
      const result = await dispatch(updateUser({ userId, data }))
      if (updateUser.fulfilled.match(result)) {
        setDialogError(null)
        setToastQueue({
          message: 'Usuario actualizado correctamente',
          duration: 3000,
          color: 'success',
          position: 'top',
        })
        setDialogOpen(false)
      } else {
        setDialogError((result.payload as string) || 'Error al actualizar usuario')
      }
    } else {
      try {
        await createUserApi(
          data as UserUpdateRequest & { email: string; nombre: string; password: string },
        )
        setDialogError(null)
        setToastQueue({
          message: 'Usuario creado correctamente',
          duration: 3000,
          color: 'success',
          position: 'top',
        })
        setDialogOpen(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al crear usuario'
        setDialogError(msg)
      }
    }

    setDialogLoading(false)
  }

  const flushToast = useCallback(() => {
    setDialogOpen(false)
    if (toastQueue) {
      present(toastQueue)
      setToastQueue(null)
      loadUsers(false)
    }
  }, [toastQueue, present, loadUsers])

  const handleOpenNew = () => {
    setSelectedUser(null)
    setDialogError(null)
    setDialogOpen(true)
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IonIcon
              icon={peopleOutline}
              style={{ fontSize: 24, color: 'var(--ion-color-primary)' }}
            />
            <IonText style={{ fontSize: 24, fontWeight: 700 }}>
              Administración de Usuarios
            </IonText>
          </div>
          <IonButton onClick={handleOpenNew}>
            <IonIcon slot="start" icon={addOutline} />
            Nuevo Usuario
          </IonButton>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value || '')}
            placeholder="Buscar por nombre o correo..."
            style={{ flex: 1, minWidth: 240, padding: 0 }}
          />
          <IonSelect
            value={roleFilter}
            placeholder="Todos los roles"
            interface="popover"
            style={{ background: 'var(--app-surface)', borderRadius: 8 }}
            onIonChange={(e) => setRoleFilter(e.detail.value)}
          >
            <IonSelectOption value="">Todos los roles</IonSelectOption>
            <IonSelectOption value="admin">Administrador</IonSelectOption>
            <IonSelectOption value="ventas">Ventas</IonSelectOption>
            <IonSelectOption value="compras">Compras</IonSelectOption>
            <IonSelectOption value="bodega">Bodega</IonSelectOption>
            <IonSelectOption value="gerencia">Gerencia</IonSelectOption>
          </IonSelect>
          <IonSelect
            value={statusFilter}
            placeholder="Todos los estados"
            interface="popover"
            style={{ background: 'var(--app-surface)', borderRadius: 8 }}
            onIonChange={(e) => setStatusFilter(e.detail.value)}
          >
            <IonSelectOption value="">Todos los estados</IonSelectOption>
            <IonSelectOption value="activo">Activos</IonSelectOption>
            <IonSelectOption value="inactivo">Inactivos</IonSelectOption>
          </IonSelect>
        </div>

        <UserList
          users={filteredUsers}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
        />
      </div>

      <UserFormDialog
        open={dialogOpen}
        user={selectedUser}
        onClose={flushToast}
        onSave={handleSave}
        isLoading={dialogLoading}
        error={dialogError}
      />

      {loading && !dialogOpen && <PageLoading message="Cargando usuarios..." />}
    </div>
    </IonPage>
  )
}
