import { useEffect, useState } from 'react'
import { IonText, IonButton } from '@ionic/react'
import { useAppSelector } from '../../hooks/useAppSelector'
import { getLocalMovements, getLocalProducts, createLocalEntry, createLocalOutput, createLocalAdjustment, seedLocalData, SEED_MOVEMENTS, SEED_PRODUCTS } from '../../services/localData'
import { MovementList } from '../../components/inventory/MovementList'
import { MovementFormDialog } from '../../components/inventory/MovementFormDialog'
import type { Movement, MovementType } from '../../types/movement'

const canManageInventory = (rol?: string) => rol === 'admin' || rol === 'compras'

function loadMovements(): Movement[] {
  const data = getLocalMovements()
  return data.length > 0 ? data : SEED_MOVEMENTS
}

export const MovementsPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [movements, setMovements] = useState<Movement[]>(loadMovements)
  const [products, setProducts] = useState(getLocalProducts().length > 0 ? getLocalProducts() : SEED_PRODUCTS)
  const [formOpen, setFormOpen] = useState(false)
  const [movementType, setMovementType] = useState<MovementType>('entrada')

  useEffect(() => {
    seedLocalData()
    setMovements(loadMovements())
    setProducts(getLocalProducts().length > 0 ? getLocalProducts() : SEED_PRODUCTS)
  }, [])

  const handleSave = (data: { product_id: number; quantity: number; reference?: string; note?: string }) => {
    if (movementType === 'entrada') createLocalEntry(data)
    else if (movementType === 'salida') createLocalOutput(data)
    else createLocalAdjustment(data)
    setFormOpen(false)
    setMovements(getLocalMovements())
    setProducts(getLocalProducts())
  }

  const manageable = canManageInventory(user?.rol)

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <IonText style={{ fontSize: 24, fontWeight: 700 }}>Movimientos</IonText>
          {manageable && (
            <div style={{ display: 'flex', gap: 8 }}>
              <IonButton onClick={() => { setMovementType('entrada'); setFormOpen(true) }} style={{ '--background': '#16a34a' }}>
                + Entrada
              </IonButton>
              <IonButton onClick={() => { setMovementType('salida'); setFormOpen(true) }} style={{ '--background': '#dc2626' }}>
                - Salida
              </IonButton>
              <IonButton onClick={() => { setMovementType('ajuste'); setFormOpen(true) }} style={{ '--background': '#f59e0b' }}>
                Ajuste
              </IonButton>
            </div>
          )}
        </div>

        <MovementList movements={movements} />

        <MovementFormDialog
          open={formOpen}
          movementType={movementType}
          products={products}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          isLoading={false}
          error={null}
        />
      </div>
    </div>
  )
}
