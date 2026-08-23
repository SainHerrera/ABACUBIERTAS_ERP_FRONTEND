import { useEffect, useState, useCallback } from 'react'
import { IonText, IonButton, IonSearchbar, IonLoading, IonToast, IonSelect, IonSelectOption } from '@ionic/react'
import { ClientList } from '../../components/sales/ClientList'
import { ClientFormDialog } from '../../components/sales/ClientFormDialog'
import { getClientsApi, createClientApi, updateClientApi, deleteClientApi } from '../../api/clientApi'
import { useAppSelector } from '../../hooks/useAppSelector'
import { isAdmin } from '../../utils/permissions'
import type { Client, ClientCreate, ClientUpdate } from '../../types/sales'

const ESTADO_FILTER_OPTIONS = ['activo', 'inactivo', 'prospecto', 'frecuente', 'corporativo'] as const

export const CustomersPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canDelete = isAdmin(user?.rol)

  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getClientsApi(0, 1000, search || undefined, estadoFilter)
      setClients(response.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar clientes. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, estadoFilter])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const handleSave = async (clientId: number | null, data: ClientCreate | ClientUpdate) => {
    setSaving(true)
    setError(null)
    try {
      if (clientId) {
        await updateClientApi(clientId, data as ClientUpdate)
        setToastMessage('Cliente actualizado correctamente')
      } else {
        await createClientApi(data as ClientCreate)
        setToastMessage('Cliente creado correctamente')
      }
      setShowToast(true)
      setFormOpen(false)
      setEditingClient(null)
      await loadClients()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el cliente. Verifica los datos.'
      setError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`¿Estás seguro de eliminar el cliente "${client.nombre_razon_social}"?`)) return
    setLoading(true)
    setError(null)
    try {
      await deleteClientApi(client.id_cliente)
      setToastMessage('Cliente eliminado correctamente')
      setShowToast(true)
      await loadClients()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el cliente.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Clientes</IonText>
          <IonButton onClick={() => { setEditingClient(null); setFormOpen(true) }}>
            Nuevo Cliente
          </IonButton>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <IonSearchbar
            value={search}
            onIonChange={(e) => setSearch(e.detail.value || '')}
            placeholder="Buscar por nombre o NIT/CC..."
            style={{ flex: 1, minWidth: 240, padding: 0 }}
          />
          <IonSelect
            value={estadoFilter}
            placeholder="Todos los estados"
            interface="popover"
            style={{ background: '#f8fafc', borderRadius: 8 }}
            onIonChange={(e) => setEstadoFilter(e.detail.value || undefined)}
          >
            <IonSelectOption value="">Todos los estados</IonSelectOption>
            {ESTADO_FILTER_OPTIONS.map((opt) => (
              <IonSelectOption key={opt} value={opt}>{opt}</IonSelectOption>
            ))}
          </IonSelect>
        </div>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        <ClientList
          clients={clients}
          onEdit={(client) => { setEditingClient(client); setFormOpen(true) }}
          onDelete={handleDelete}
          canDelete={canDelete}
        />

        <ClientFormDialog
          open={formOpen}
          client={editingClient}
          onClose={() => { setFormOpen(false); setEditingClient(null) }}
          onSave={handleSave}
          isLoading={saving}
          error={error}
        />

        <IonLoading isOpen={loading && !formOpen} message="Cargando clientes..." />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          color="success"
        />
      </div>
    </div>
  )
}
