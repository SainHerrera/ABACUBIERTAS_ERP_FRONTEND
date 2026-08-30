import { useEffect, useState, useCallback } from 'react'
import { IonPage, IonText, IonButton, IonSearchbar, IonToast } from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { ProductList } from '../../components/inventory/ProductList'
import { ProductFormDialog } from '../../components/inventory/ProductFormDialog'
import { getProductsApi, createProductApi, updateProductApi, deleteProductApi } from '../../api/productApi'
import { getProvidersApi } from '../../api/providerApi'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManageInventory } from '../../utils/permissions'
import type { Product, ProductCreate, ProductUpdate } from '../../types/product'
import type { Provider } from '../../types/provider'

export const ProductsPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canEdit = canManageInventory(user?.rol)

  const [products, setProducts] = useState<Product[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsResponse, providersResponse] = await Promise.all([
        getProductsApi(0, 1000, search || undefined),
        getProvidersApi(0, 1000),
      ])
      setProducts(productsResponse.items)
      setProviders(providersResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar productos. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleSave = async (productId: number | null, data: ProductCreate | ProductUpdate) => {
    setSaving(true)
    setError(null)
    try {
      if (productId) {
        await updateProductApi(productId, data as ProductUpdate)
        setToastMessage('Producto actualizado correctamente')
      } else {
        await createProductApi(data as ProductCreate)
        setToastMessage('Producto creado correctamente')
      }
      setShowToast(true)
      setFormOpen(false)
      setEditingProduct(null)
      await loadProducts()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el producto. Verifica los datos.'
      setError(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (productId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return
    setLoading(true)
    try {
      await deleteProductApi(productId)
      setToastMessage('Producto eliminado correctamente')
      setShowToast(true)
      await loadProducts()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el producto.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Productos</IonText>
          {canEdit && (
            <IonButton onClick={() => { setEditingProduct(null); setFormOpen(true) }}>
              Nuevo Producto
            </IonButton>
          )}
        </div>

        <IonSearchbar
          value={search}
          onIonChange={(e) => setSearch(e.detail.value || '')}
          placeholder="Buscar productos..."
          style={{ marginBottom: 16 }}
        />

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        <ProductList
          products={products}
          onEdit={(product) => { setEditingProduct(product); setFormOpen(true) }}
          onDelete={handleDelete}
          canEdit={canEdit}
        />

        <ProductFormDialog
          open={formOpen}
          product={editingProduct}
          providers={providers}
          onClose={() => { setFormOpen(false); setEditingProduct(null) }}
          onSave={handleSave}
          isLoading={saving}
          error={error}
        />

        {loading && !formOpen && <PageLoading message="Cargando productos..." />}
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
