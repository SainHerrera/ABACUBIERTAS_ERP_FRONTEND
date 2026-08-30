import { useEffect, useState, useCallback } from 'react'
import { IonPage, IonText, IonButton, IonToast, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/react'
import { PageLoading } from '../../components/shared/PageLoading'
import { MovementList } from '../../components/inventory/MovementList'
import { MovementFormDialog } from '../../components/inventory/MovementFormDialog'
import { getMovementsApi, createEntryApi, createOutputApi, createAdjustmentApi } from '../../api/movementApi'
import { getProductsApi } from '../../api/productApi'
import { useAppSelector } from '../../hooks/useAppSelector'
import { canManageInventory } from '../../utils/permissions'
import type { Movement, MovementType } from '../../types/movement'
import type { Product } from '../../types/product'

export const MovementsPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const canRegister = canManageInventory(user?.rol)

  const [movements, setMovements] = useState<Movement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productFilter, setProductFilter] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [movementType, setMovementType] = useState<MovementType>('entrada')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [movementsResponse, productsResponse] = await Promise.all([
        getMovementsApi(0, 1000, productFilter),
        getProductsApi(0, 1000),
      ])
      setMovements(movementsResponse.items)
      setProducts(productsResponse.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar movimientos. Intenta de nuevo.'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [productFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openForm = (type: MovementType) => {
    setMovementType(type)
    setFormOpen(true)
  }

  const handleSave = async (data: { product_id: number; quantity: number; reference?: string; note?: string; fecha?: string }) => {
    setSaving(true)
    setError(null)
    try {
      if (movementType === 'entrada') {
        await createEntryApi(data)
      } else if (movementType === 'salida') {
        await createOutputApi(data)
      } else {
        await createAdjustmentApi(data)
      }
      setToastMessage('Movimiento registrado correctamente')
      setShowToast(true)
      setFormOpen(false)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el movimiento. Verifica el stock disponible.'
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
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Movimientos de Inventario</IonText>
          {canRegister && (
            <div style={{ display: 'flex', gap: 8 }}>
              <IonButton onClick={() => openForm('entrada')} color="success">
                Entrada
              </IonButton>
              <IonButton onClick={() => openForm('salida')} color="danger">
                Salida
              </IonButton>
              <IonButton onClick={() => openForm('ajuste')} color="warning">
                Ajuste
              </IonButton>
            </div>
          )}
        </div>

        {error && (
          <IonText color="danger" style={{ display: 'block', marginBottom: 16 }}>
            {error}
          </IonText>
        )}

        <IonItem lines="none" style={{ '--background': 'var(--app-surface)', borderRadius: 8, marginBottom: 16, maxWidth: 420 }}>
          <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Filtrar por producto</IonLabel>
          <IonSelect
            value={productFilter}
            placeholder="Todos los productos"
            interface="popover"
            onIonChange={(e) => setProductFilter(e.detail.value ? Number(e.detail.value) : undefined)}
          >
            <IonSelectOption value={undefined}>Todos los productos</IonSelectOption>
            {products.map((p) => (
              <IonSelectOption key={p.id_producto} value={p.id_producto}>{p.nombre}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <MovementList movements={movements} />

        <MovementFormDialog
          open={formOpen}
          movementType={movementType}
          products={products}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          isLoading={saving}
          error={error}
        />

        {loading && !formOpen && <PageLoading message="Cargando movimientos..." />}
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
