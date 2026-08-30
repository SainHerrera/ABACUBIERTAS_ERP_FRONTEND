import { useState, useEffect, useCallback } from 'react'
import {
  IonButton,
  IonIcon,
  IonText,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToggle,
  IonPage,
  useIonToast,
} from '@ionic/react'
import { settingsOutline, cubeOutline, businessOutline } from 'ionicons/icons'
import { useAppDispatch } from '../hooks/useAppDispatch'
import {
  updateSettings,
  loadInitialCatalog,
} from '../store/slices/settingsSlice'
import { getProvidersApi } from '../api/providerApi'
import { getProductsApi } from '../api/productApi'
import { StorageEngine } from '../services/localStorage/storageEngine'

export const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const [present] = useIonToast()

  const [stockMinimo, setStockMinimo] = useState(() =>
    String(StorageEngine.getSettings().stockMinimoDefault),
  )
  const [margen, setMargen] = useState(() =>
    String(StorageEngine.getSettings().margenUtilidadDefault),
  )
  const [aprobacionHabilitada, setAprobacionHabilitada] = useState(() =>
    StorageEngine.getSettings().aprobacionOcHabilitada,
  )
  const [aprobacionMonto, setAprobacionMonto] = useState(() =>
    String(StorageEngine.getSettings().aprobacionOcMontoMinimo),
  )
  const [saving, setSaving] = useState(false)
  const [catalogProducts, setCatalogProducts] = useState(0)
  const [catalogProviders, setCatalogProviders] = useState(0)

  const loadCatalogCounts = useCallback(async () => {
    const [products, providers] = await Promise.all([
      getProductsApi(0, 1),
      getProvidersApi(0, 1),
    ])
    setCatalogProducts(products.total)
    setCatalogProviders(providers.total)
  }, [])

  useEffect(() => {
    loadCatalogCounts()
  }, [loadCatalogCounts])

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      stockMinimoDefault: Number(stockMinimo),
      margenUtilidadDefault: Number(margen),
      aprobacionOcHabilitada: aprobacionHabilitada,
      aprobacionOcMontoMinimo: Number(aprobacionMonto),
    }
    const result = await dispatch(updateSettings(payload))
    if (updateSettings.fulfilled.match(result)) {
      present({
        message: 'Parámetros guardados correctamente',
        duration: 3000,
        color: 'success',
        position: 'top',
      })
    } else {
      const msg = (result.payload as string) || 'Error al guardar parámetros'
      present({
        message: msg,
        duration: 3500,
        color: 'danger',
        position: 'top',
      })
    }
    setSaving(false)
  }

  const handleLoadCatalog = async () => {
    const result = await dispatch(loadInitialCatalog())
    if (loadInitialCatalog.fulfilled.match(result)) {
      const { products, providers } = result.payload
      setCatalogProducts(products)
      setCatalogProviders(providers)
      present({
        message: `Catálogo inicial cargado (${products} productos, ${providers} proveedores)`,
        duration: 3500,
        color: 'success',
        position: 'top',
      })
    } else {
      const msg = (result.payload as string) || 'Error al cargar catálogo inicial'
      present({ message: msg, duration: 3500, color: 'danger', position: 'top' })
    }
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <IonIcon
            icon={settingsOutline}
            style={{ fontSize: 24, color: 'var(--ion-color-primary)' }}
          />
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>
            Parámetros Generales del Sistema
          </IonText>
        </div>

        <IonCard style={{ marginBottom: 20 }}>
          <IonCardHeader>
            <IonCardTitle>Parámetros por defecto</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList style={{ background: 'transparent' }}>
              <div className="ion-input-wrapper">
                <IonItem lines="none" style={{ '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                    Stock mínimo por defecto
                  </IonLabel>
                  <IonInput
                    type="number"
                    step="1"
                    min={0}
                    value={stockMinimo}
                    onIonInput={(e) => setStockMinimo(e.detail.value || '')}
                  />
                </IonItem>
              </div>

              <div className="ion-input-wrapper">
                <IonItem lines="none" style={{ '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                    Margen de utilidad por defecto (%)
                  </IonLabel>
                  <IonInput
                    type="number"
                    step="0.01"
                    min={0}
                    value={margen}
                    onIonInput={(e) => setMargen(e.detail.value || '')}
                  />
                </IonItem>
              </div>

              <IonButton expand="block" onClick={handleSave} disabled={saving} style={{ marginTop: 24 }}>
                {saving ? 'Guardando...' : 'Guardar parámetros'}
              </IonButton>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard style={{ marginBottom: 20 }}>
          <IonCardHeader>
            <IonCardTitle>Aprobación de órdenes de compra grandes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList style={{ background: 'transparent' }}>
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonLabel style={{ fontSize: 14, color: 'var(--app-text-secondary)' }}>
                  Activar regla de aprobación
                </IonLabel>
                <IonToggle
                  slot="end"
                  checked={aprobacionHabilitada}
                  onIonChange={(e) => setAprobacionHabilitada(e.detail.checked)}
                  data-testid="toggle-aprobacion"
                />
              </IonItem>
              <div className="ion-input-wrapper">
                <IonItem lines="none" style={{ '--background': 'transparent' }}>
                  <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
                    Monto mínimo para aprobación ($)
                  </IonLabel>
                  <IonInput
                    type="number"
                    step="1"
                    min={0}
                    value={aprobacionMonto}
                    onIonInput={(e) => setAprobacionMonto(e.detail.value || '')}
                    data-testid="input-aprobacion-monto"
                  />
                </IonItem>
              </div>
              <IonText style={{ fontSize: 12, color: 'var(--app-text-muted)', display: 'block', marginTop: 8 }}>
                Las órdenes de compra cuyo monto sea mayor o igual al umbral quedarán
                pendientes de aprobación por Gerencia/Administración.
              </IonText>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Catálogo inicial</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IonIcon icon={cubeOutline} style={{ color: 'var(--ion-color-primary)' }} />
                <IonText>Productos: {catalogProducts}</IonText>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IonIcon icon={businessOutline} style={{ color: 'var(--ion-color-primary)' }} />
                <IonText>Proveedores: {catalogProviders}</IonText>
              </div>
            </div>
            <IonButton expand="block" fill="outline" onClick={handleLoadCatalog}>
              Cargar catálogo inicial
            </IonButton>
          </IonCardContent>
        </IonCard>
      </div>
    </div>
    </IonPage>
  )
}
