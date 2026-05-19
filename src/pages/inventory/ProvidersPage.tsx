import { useEffect, useState } from 'react'
import { IonText, IonButton, IonSearchbar } from '@ionic/react'
import { ProviderList } from '../../components/inventory/ProviderList'
import { ProviderFormDialog } from '../../components/inventory/ProviderFormDialog'
import { getLocalProviders, createLocalProvider, updateLocalProvider, seedLocalData, SEED_PROVIDERS } from '../../services/localData'
import type { Provider, ProviderCreate, ProviderUpdate } from '../../types/provider'

function loadProviders(search?: string): Provider[] {
  const data = getLocalProviders(search)
  if (!search && data.length === 0) return SEED_PROVIDERS
  return data
}

export const ProvidersPage = () => {
  const [providers, setProviders] = useState<Provider[]>(loadProviders)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

  useEffect(() => {
    seedLocalData()
    setProviders(loadProviders())
  }, [])

  useEffect(() => {
    setProviders(loadProviders(search))
  }, [search])

  const handleSave = (providerId: number | null, data: ProviderCreate | ProviderUpdate) => {
    if (providerId) {
      updateLocalProvider(providerId, data as ProviderUpdate)
    } else {
      createLocalProvider(data as ProviderCreate)
    }
    setFormOpen(false)
    setEditingProvider(null)
    setProviders(loadProviders(search))
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Proveedores</IonText>
          <IonButton onClick={() => { setEditingProvider(null); setFormOpen(true) }}>
            Nuevo Proveedor
          </IonButton>
        </div>

        <IonSearchbar value={search} onIonChange={(e) => setSearch(e.detail.value || '')} placeholder="Buscar proveedores..." style={{ marginBottom: 16 }} />

        <ProviderList
          providers={providers}
          onEdit={(provider) => { setEditingProvider(provider); setFormOpen(true) }}
        />

        <ProviderFormDialog
          open={formOpen}
          provider={editingProvider}
          onClose={() => { setFormOpen(false); setEditingProvider(null) }}
          onSave={handleSave}
          isLoading={false}
          error={null}
        />
      </div>
    </div>
  )
}
