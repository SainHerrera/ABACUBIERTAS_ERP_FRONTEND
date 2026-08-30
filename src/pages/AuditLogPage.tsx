import { useState, useEffect, useCallback } from 'react'
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
import { documentTextOutline, trashOutline } from 'ionicons/icons'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { fetchAuditLog, clearAuditLog } from '../store/slices/auditLogSlice'
import type { AuditAction, AuditLogEntry } from '../types/auditLog'
import { roleLabels } from '../components/users/roleConfig'
import { PageLoading } from '../components/shared/PageLoading'

const actionLabels: Record<AuditAction, string> = {
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  user_created: 'Usuario creado',
  user_updated: 'Usuario actualizado',
  user_deactivated: 'Usuario desactivado',
  user_activated: 'Usuario activado',
  role_changed: 'Cambio de rol',
  settings_updated: 'Parámetros actualizados',
  settings_reset: 'Parámetros restablecidos',
  catalog_loaded: 'Catálogo cargado',
  purchase_order_pending_approval: 'OC pendiente de aprobación',
  purchase_order_approved: 'OC aprobada',
  purchase_order_rejected: 'OC rechazada',
}

const actionOptions: { value: string; label: string }[] = Object.entries(
  actionLabels,
).map(([value, label]) => ({ value, label }))

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export const AuditLogPage = () => {
  const dispatch = useAppDispatch()
  const [present] = useIonToast()

  const [items, setItems] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [toastQueue, setToastQueue] = useState<ToastOptions | null>(null)

  const loadLog = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true)
      const result = await dispatch(
        fetchAuditLog({
          skip: 0,
          limit: 200,
          usuario: search || undefined,
          accion: actionFilter || undefined,
        }),
      )
      if (fetchAuditLog.fulfilled.match(result)) {
        setItems(result.payload.items)
      }
      setLoading(false)
    },
    [dispatch, search, actionFilter],
  )

  useEffect(() => {
    loadLog()
  }, [loadLog])

  const handleClear = async () => {
    const result = await dispatch(clearAuditLog())
    if (clearAuditLog.fulfilled.match(result)) {
      setToastQueue({
        message: 'Log de auditoría borrado correctamente',
        duration: 3000,
        color: 'success',
        position: 'top',
      })
    }
  }

  useEffect(() => {
    if (toastQueue) {
      present(toastQueue)
      setToastQueue(null)
      setItems([])
    }
  }, [toastQueue, present])

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
              icon={documentTextOutline}
              style={{ fontSize: 24, color: 'var(--ion-color-primary)' }}
            />
            <IonText style={{ fontSize: 24, fontWeight: 700 }}>
              Registro de Auditoría
            </IonText>
          </div>
          <IonButton fill="outline" color="danger" onClick={handleClear}>
            <IonIcon slot="start" icon={trashOutline} />
            Borrar log
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
            placeholder="Buscar por usuario o correo..."
            style={{ flex: 1, minWidth: 240, padding: 0 }}
          />
          <IonSelect
            value={actionFilter}
            placeholder="Todas las acciones"
            interface="popover"
            style={{ background: 'var(--app-surface)', borderRadius: 8 }}
            onIonChange={(e) => setActionFilter(e.detail.value)}
          >
            <IonSelectOption value="">Todas las acciones</IonSelectOption>
            {actionOptions.map((opt) => (
              <IonSelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>

        {items.length === 0 && !loading ? (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <IonText color="medium">
              No hay entradas en el log de auditoría.
            </IonText>
          </div>
        ) : (
          <div style={{ borderRadius: 12, border: '1px solid var(--app-border)', padding: 20, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--app-border)' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--app-border)' }}>Usuario</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--app-border)' }}>Rol</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--app-border)' }}>Acción</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--app-border)' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {items.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-surface-hover)', whiteSpace: 'nowrap' }}>
                      {formatDate(entry.fecha)}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-surface-hover)' }}>
                      <span style={{ fontWeight: 600 }}>{entry.nombre_usuario}</span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--app-text-muted)' }}>
                        {entry.email_usuario}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-surface-hover)' }}>
                      <span className="chip chip-secondary">
                        {roleLabels[entry.rol_usuario as keyof typeof roleLabels] || entry.rol_usuario}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-surface-hover)', whiteSpace: 'nowrap' }}>
                      {actionLabels[entry.accion] || entry.accion}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--app-surface-hover)' }}>
                      {entry.detalle}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading && <PageLoading message="Cargando log de auditoría..." />}
    </div>
    </IonPage>
  )
}
