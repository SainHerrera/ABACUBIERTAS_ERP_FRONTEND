import { useEffect, useState } from 'react'
import { IonText, IonButton, IonSearchbar } from '@ionic/react'
import { ProductList } from '../../components/inventory/ProductList'
import { ProductFormDialog } from '../../components/inventory/ProductFormDialog'
import { getLocalProducts, getLocalProviders, createLocalProduct, updateLocalProduct, deleteLocalProduct, seedLocalData, SEED_PRODUCTS, SEED_PROVIDERS } from '../../services/localData'
import type { Product, ProductCreate, ProductUpdate } from '../../types/product'
import { useAppSelector } from '../../hooks/useAppSelector'

const canManageProducts = (rol?: string) => rol === 'admin' || rol === 'compras'

function loadProducts(search?: string): Product[] {
  const data = getLocalProducts(search)
  if (!search && data.length === 0) return SEED_PRODUCTS
  return data
}

export const ProductsPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [products, setProducts] = useState<Product[]>(loadProducts)
  const [providers, setProviders] = useState(getLocalProviders().length > 0 ? getLocalProviders() : SEED_PROVIDERS)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    seedLocalData()
    setProducts(loadProducts())
  }, [])

  useEffect(() => {
    setProducts(loadProducts(search))
  }, [search])

  const handleSave = (productId: number | null, data: ProductCreate | ProductUpdate) => {
    if (productId) {
      updateLocalProduct(productId, data as ProductUpdate)
    } else {
      createLocalProduct(data as ProductCreate)
    }
    setFormOpen(false)
    setEditingProduct(null)
    setProducts(getLocalProducts(search))
    setProviders(getLocalProviders())
  }

  const handleDelete = (productId: number) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      deleteLocalProduct(productId)
      setProducts(getLocalProducts(search))
    }
  }

  const manageable = canManageProducts(user?.rol)

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Productos</IonText>
          {manageable && (
            <IonButton onClick={() => { setEditingProduct(null); setFormOpen(true) }}>
              Nuevo Producto
            </IonButton>
          )}
        </div>

        <IonSearchbar value={search} onIonChange={(e) => setSearch(e.detail.value || '')} placeholder="Buscar productos..." style={{ marginBottom: 16 }} />

        <ProductList
          products={products}
          onEdit={(product) => { setEditingProduct(product); setFormOpen(true) }}
          onDelete={handleDelete}
          canEdit={manageable}
        />

        <ProductFormDialog
          open={formOpen}
          product={editingProduct}
          providers={providers}
          onClose={() => { setFormOpen(false); setEditingProduct(null) }}
          onSave={handleSave}
          isLoading={false}
          error={null}
        />
      </div>
    </div>
  )
}
