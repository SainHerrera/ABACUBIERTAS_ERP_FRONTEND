import { IonText, IonIcon } from '@ionic/react'
import { peopleOutline, cubeOutline, cartOutline, trendingUpOutline } from 'ionicons/icons'
import { useAppSelector } from '../hooks/useAppSelector'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  ventas: 'Ventas',
  compras: 'Compras',
}

const metrics = [
  { label: 'Productos', value: '—', icon: cubeOutline, color: '#2563eb', bg: '#eff6ff' },
  { label: 'Clientes', value: '—', icon: peopleOutline, color: '#7c3aed', bg: '#f5f3ff' },
  { label: 'Ventas del Mes', value: '—', icon: cartOutline, color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Crecimiento', value: '—', icon: trendingUpOutline, color: '#f59e0b', bg: '#fffbeb' },
]

export const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <IonText style={{ fontSize: 24, fontWeight: 700, display: 'block', marginBottom: 24 }}>
          Panel Principal
        </IonText>
            <IonText color="medium">
              Panel principal de Abacubiertas ERP — Rol: {roleLabels[user?.rol || ''] || user?.rol}
            </IonText>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <div className="metric-icon" style={{ background: metric.bg, color: metric.color }}>
                  <IonIcon icon={metric.icon} style={{ fontSize: 24 }} />
                </div>
                <div>
                  <p className="metric-value">{metric.value}</p>
                  <p className="metric-label">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <IonText style={{ fontSize: 18, fontWeight: 600, display: 'block', marginBottom: 16 }}>
              Información del Usuario
            </IonText>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <p className="info-label">Nombre</p>
                <p className="info-value">{user?.nombre}</p>
              </div>
              <div>
                <p className="info-label">Email</p>
                <p className="info-value">{user?.email}</p>
              </div>
              <div>
                <p className="info-label">Rol</p>
                <p className="info-value" style={{ color: 'var(--ion-color-primary)', fontWeight: 600 }}>
                  {roleLabels[user?.rol || ''] || user?.rol}
                </p>
              </div>
              <div>
                <p className="info-label">ID Usuario</p>
                <p className="info-value">#{user?.id_usuario}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
