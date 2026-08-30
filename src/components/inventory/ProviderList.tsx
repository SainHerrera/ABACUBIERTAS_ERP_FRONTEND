import { IonText } from '@ionic/react'
import type { Provider } from '../../types/provider'

interface ProviderListProps {
  providers: Provider[]
  onEdit: (provider: Provider) => void
}

export const ProviderList = ({ providers, onEdit }: ProviderListProps) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>NIT</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.id_proveedor}>
              <td>
                <IonText style={{ fontWeight: 600 }}>{provider.nombre_empresa}</IonText>
              </td>
              <td>{provider.nit || '-'}</td>
              <td>{provider.contacto || '-'}</td>
              <td>{provider.telefono || '-'}</td>
              <td>{provider.email || '-'}</td>
              <td>
                <span className="chip chip-primary">
                  {provider.categoria_material}
                </span>
              </td>
              <td>
                <span className={provider.activo ? 'chip chip-success' : 'chip chip-danger'}>
                  {provider.estado || (provider.activo ? 'Activo' : 'Inactivo')}
                </span>
              </td>
              <td>
                <button className="btn-icon" onClick={() => onEdit(provider)} title="Editar">
                  ✏️
                </button>
              </td>
            </tr>
          ))}
          {providers.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--app-text-faint)' }}>
                No hay proveedores registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
