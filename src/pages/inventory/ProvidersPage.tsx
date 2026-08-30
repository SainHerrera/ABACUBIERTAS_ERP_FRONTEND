import { useEffect, useState, useCallback } from 'react'
import { IonPage, IonText, IonButton, IonSearchbar, IonToast } from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { ProviderList } from '../../components/inventory/ProviderList'
import { ProviderFormDialog } from '../../components/inventory/ProviderFormDialog'
import { getProvidersApi, createProviderApi, updateProviderApi } from '../../api/providerApi'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManageInventory } from '../../utils/permissions'
import type { Provider, ProviderCreate, ProviderUpdate } from '../../types/provider'

export const ProvidersPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canEdit = canManageInventory(user?.rol)

  const [providers, setProviders] = useState<Provider[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadProviders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getProvidersApi(0, 1000, search || undefined)
      setProviders(response.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar proveedores. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadProviders()
  }, [loadProviders])

  const handleSave = async (providerId: number | null, data: ProviderCreate | ProviderUpdate) => {
    setSaving(true)
    setError(null)
    try {
      if (providerId) {
        await updateProviderApi(providerId, data as ProviderUpdate)
        setToastMessage('Proveedor actualizado correctamente')
      } else {
        await createProviderApi(data as ProviderCreate)
        setToastMessage('Proveedor creado correctamente')
      }
      setShowToast(true)
      setFormOpen(false)
      setEditingProvider(null)
      await loadProviders()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el proveedor. Verifica los datos.'
      setError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Proveedores</IonText>
          {canEdit && (
            <IonButton onClick={() => { setEditingProvider(null); setFormOpen(true) }}>
              Nuevo Proveedor
            </IonButton>
          )}
        </div>

        <IonSearchbar
          value={search}
          onIonChange={(e) => setSearch(e.detail.value || '')}
          placeholder="Buscar proveedores..."
          style={{ marginBottom: 16 }}
        />

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        <ProviderList
          providers={providers}
          onEdit={(provider) => { setEditingProvider(provider); setFormOpen(true) }}
        />

        <ProviderFormDialog
          open={formOpen}
          provider={editingProvider}
          onClose={() => { setFormOpen(false); setEditingProvider(null) }}
          onSave={handleSave}
          isLoading={saving}
          error={error}
        />

        {loading && !formOpen && <PageLoading message="Cargando proveedores..." />}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          color="success"
        />
      </div>
    </div>
    </IonPage>
  )
}
