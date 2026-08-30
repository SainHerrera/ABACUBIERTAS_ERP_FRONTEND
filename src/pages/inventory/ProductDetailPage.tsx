import { useEffect, useState, useCallback } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { IonPage, IonText, IonButton, IonToast, IonCard, IonCardContent } from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { ProductFormDialog } from '../../components/inventory/ProductFormDialog'
import { MovementList } from '../../components/inventory/MovementList'
import { getProductApi, updateProductApi } from '../../api/productApi'
import { getMovementsApi } from '../../api/movementApi'
import { getProvidersApi } from '../../api/providerApi'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManageInventory } from '../../utils/permissions'
import type { Product, ProductUpdate } from '../../types/product'
import type { Movement } from '../../types/movement'
import type { Provider } from '../../types/provider'

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { user } = useAppSelector((state) => state.auth)
  const canEdit = canManageInventory(user?.rol)

  const productId = Number(id)

  const [product, setProduct] = useState<Product | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadData = useCallback(async () => {
    if (Number.isNaN(productId)) return
    setLoading(true)
    setError(null)
    try {
      const [productData, movementsResponse, providersResponse] = await Promise.all([
        getProductApi(productId),
        getMovementsApi(0, 1000, productId),
        getProvidersApi(0, 1000),
      ])
      setProduct(productData)
      setMovements(movementsResponse.items)
      setProviders(providersResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el detalle del producto.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async (_productId: number | null, data: ProductUpdate) => {
    setSaving(true)
    setError(null)
    try {
      await updateProductApi(productId, data)
      setToastMessage('Producto actualizado correctamente')
      setShowToast(true)
      setFormOpen(false)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el producto.'
      setError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (Number.isNaN(productId)) {
    return (
      <div style={{ padding: 24 }}>
        <IonText color="danger">ID de producto inválido</IonText>
      </div>
    )
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonButton fill="outline" onClick={() => history.push('/inventory/products')}>
            ← Volver
          </IonButton>
          {canEdit && product && (
            <IonButton onClick={() => setFormOpen(true)}>Editar Producto</IonButton>
          )}
        </div>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        {product && (
          <>
            <IonText style={{ fontSize: 24, fontWeight: 700, display: 'block', marginBottom: 8 }}>
              {product.nombre}
            </IonText>
            <IonText color="medium" style={{ display: 'block', marginBottom: 20 }}>
              {product.descripcion || 'Sin descripción'}
            </IonText>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              <IonCard>
                <IonCardContent>
                  <IonText color="medium" style={{ fontSize: 14 }}>Precio unitario</IonText>
                  <IonText style={{ fontSize: 24, fontWeight: 700, display: 'block' }}>
                    ${Number(product.precio_unitario).toLocaleString('es-CO')}
                  </IonText>
                </IonCardContent>
              </IonCard>
              <IonCard>
                <IonCardContent>
                  <IonText color="medium" style={{ fontSize: 14 }}>Stock actual</IonText>
                  <IonText style={{ fontSize: 24, fontWeight: 700, display: 'block', color: product.low_stock ? '#dc2626' : '#16a34a' }}>
                    {product.stock_actual}
                  </IonText>
                </IonCardContent>
              </IonCard>
              <IonCard>
                <IonCardContent>
                  <IonText color="medium" style={{ fontSize: 14 }}>Stock mínimo</IonText>
                  <IonText style={{ fontSize: 24, fontWeight: 700, display: 'block' }}>{product.stock_minimo}</IonText>
                </IonCardContent>
              </IonCard>
              <IonCard>
                <IonCardContent>
                  <IonText color="medium" style={{ fontSize: 14 }}>Proveedor</IonText>
                  <IonText style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>{product.nombre_proveedor || '-'}</IonText>
                </IonCardContent>
              </IonCard>
            </div>

            <IonText style={{ fontSize: 18, fontWeight: 700, display: 'block', marginBottom: 12 }}>Historial de Movimientos</IonText>
            <MovementList movements={movements} />

            <ProductFormDialog
              open={formOpen}
              product={product}
              providers={providers}
              onClose={() => setFormOpen(false)}
              onSave={handleSave}
              isLoading={saving}
              error={error}
            />
          </>
        )}

        {loading && <PageLoading message="Cargando producto..." />}
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
