import { IonText } from '@ionic/react'
import type { Product } from '../../types/product'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: number) => void
  canEdit?: boolean
}

export const ProductList = ({ products, onEdit, onDelete, canEdit = true }: ProductListProps) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Unidad</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Stock Mínimo</th>
            <th>Estado</th>
            <th>Proveedor</th>
            {canEdit && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id_producto}>
              <td>
                <IonText style={{ fontWeight: 600 }}>{product.nombre}</IonText>
                {product.descripcion && (
                  <IonText color="medium" style={{ fontSize: 12, display: 'block' }}>
                    {product.descripcion}
                  </IonText>
                )}
              </td>
              <td>{product.unidad_medida}</td>
              <td>${Number(product.precio_unitario).toFixed(2)}</td>
              <td>
                <span className={product.low_stock ? 'chip chip-warning' : 'chip chip-success'}>
                  {product.stock_actual}
                </span>
              </td>
              <td>{product.stock_minimo}</td>
              <td>
                <span className={product.activo ? 'chip chip-success' : 'chip chip-danger'}>
                  {product.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>{product.nombre_proveedor || '-'}</td>
              {canEdit && (
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-icon" onClick={() => onEdit(product)} title="Editar">
                      ✏️
                    </button>
                    <button className="btn-icon" onClick={() => onDelete(product.id_producto)} title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={canEdit ? 8 : 7} style={{ textAlign: 'center', padding: 24, color: 'var(--app-text-faint)' }}>
                No hay productos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
