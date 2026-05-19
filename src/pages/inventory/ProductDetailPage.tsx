import { useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { IonText, IonButton, IonSpinner, IonIcon } from '@ionic/react'
import { arrowBack, createOutline } from 'ionicons/icons'
import { useAppSelector } from '../../hooks/useAppSelector'
import { getLocalProduct, getLocalMovements, getLocalProviders, updateLocalProduct, seedLocalData } from '../../services/localData'
import { ProductFormDialog } from '../../components/inventory/ProductFormDialog'
import { MovementList } from '../../components/inventory/MovementList'
import type { ProductUpdate } from '../../types/product'

const canManageProducts = (rol?: string) => rol === 'admin' || rol === 'compras'

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { user } = useAppSelector((state) => state.auth)
  const [product, setProduct] = useState(getLocalProduct(Number(id)))
  const [movements, setMovements] = useState(getLocalMovements({ product_id: Number(id) }))
  const [providers, setProviders] = useState(getLocalProviders())
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    seedLocalData()
    setProduct(getLocalProduct(Number(id)))
    setMovements(getLocalMovements({ product_id: Number(id) }))
    setProviders(getLocalProviders())
  }, [id])

  const handleSave = (productId: number | null, data: ProductUpdate) => {
    updateLocalProduct(productId!, data)
    setFormOpen(false)
    setProduct(getLocalProduct(Number(id)))
    setProviders(getLocalProviders())
  }

  const manageable = canManageProducts(user?.rol)

  if (!product) {
    return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <IonSpinner />
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <IonButton fill="clear" onClick={() => history.goBack()}>
          <IonIcon icon={arrowBack} slot="start" />
          Volver
        </IonButton>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 24 }}>
          <div>
            <IonText style={{ fontSize: 24, fontWeight: 700 }}>{product.nombre}</IonText>
            {product.descripcion && (
              <IonText color="medium" style={{ display: 'block', marginTop: 4 }}>{product.descripcion}</IonText>
            )}
          </div>
          {manageable && (
            <IonButton onClick={() => setFormOpen(true)}>
              <IonIcon icon={createOutline} slot="start" />
              Editar
            </IonButton>
          )}
        </div>

        <div className="metrics-grid" style={{ marginBottom: 24 }}>
          <div className="metric-card">
            <IonText style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Precio Unitario</IonText>
            <IonText style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>
              ${Number(product.precio_unitario).toFixed(2)}
            </IonText>
          </div>
          <div className="metric-card">
            <IonText style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Stock Actual</IonText>
            <IonText style={{ fontSize: 22, fontWeight: 700, color: product.low_stock ? '#dc2626' : '#16a34a' }}>
              {product.stock_actual}
            </IonText>
          </div>
          <div className="metric-card">
            <IonText style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Stock Mínimo</IonText>
            <IonText style={{ fontSize: 22, fontWeight: 700 }}>{product.stock_minimo}</IonText>
          </div>
          <div className="metric-card">
            <IonText style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Unidad</IonText>
            <IonText style={{ fontSize: 22, fontWeight: 700 }}>{product.unidad_medida}</IonText>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div>
            <IonText style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Proveedor</IonText>
            <IonText style={{ fontWeight: 600 }}>{product.nombre_proveedor || 'Sin proveedor'}</IonText>
          </div>
          <div>
            <IonText style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Estado</IonText>
            <span className={product.activo ? 'chip chip-success' : 'chip chip-danger'}>
              {product.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <IonText style={{ fontSize: 18, fontWeight: 700, display: 'block', marginBottom: 16 }}>
          Movimientos Recientes
        </IonText>
        <MovementList movements={movements} />

        {manageable && (
          <ProductFormDialog
            open={formOpen}
            product={product}
            providers={providers}
            onClose={() => setFormOpen(false)}
            onSave={handleSave}
            isLoading={false}
            error={null}
          />
        )}
      </div>
    </div>
  )
}
