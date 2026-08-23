import { IonContent, IonMenu, IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonText, IonButton } from '@ionic/react'
import { gridOutline, peopleOutline, cubeOutline, swapHorizontalOutline, businessOutline, calculatorOutline, logOutOutline, flaskOutline } from 'ionicons/icons'
import { useLocation, useHistory } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { logout } from '../../store/slices/authSlice'

export const Sidebar = () => {
  const location = useLocation()
  const navigateFn = useHistory()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const navigate = (path: string) => {
    navigateFn.push(path)
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const isSelected = (path: string) => location.pathname === path

  return (
    <IonMenu contentId="main-content" className="sidebar-menu">
      <IonContent className="sidebar-menu" style={{ '--background': '#0f172a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--ion-color-primary)',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IonIcon icon={cubeOutline} style={{ fontSize: 20 }} />
          </div>
          <div>
            <IonText style={{ color: '#fff', fontWeight: 700, fontSize: 16, display: 'block' }}>Abacubiertas</IonText>
            <IonText style={{ color: '#64748b', fontSize: 11 }}>ERP</IonText>
          </div>
        </div>

        <p className="section-label">Principal</p>
        <IonList lines="none">
          <IonItem
            button
            className={isSelected('/dashboard') ? 'selected' : ''}
            onClick={() => navigate('/dashboard')}
          >
            <IonIcon slot="start" icon={gridOutline} />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>
        </IonList>

        <p className="section-label">Inventario</p>
        <IonList lines="none">
          <IonItem
            button
            className={isSelected('/inventory') ? 'selected' : ''}
            onClick={() => navigate('/inventory')}
          >
            <IonIcon slot="start" icon={cubeOutline} />
            <IonLabel>Panel</IonLabel>
          </IonItem>
          <IonItem
            button
            className={isSelected('/inventory/products') ? 'selected' : ''}
            onClick={() => navigate('/inventory/products')}
          >
            <IonIcon slot="start" icon={cubeOutline} />
            <IonLabel>Productos</IonLabel>
          </IonItem>
          <IonItem
            button
            className={isSelected('/inventory/movements') ? 'selected' : ''}
            onClick={() => navigate('/inventory/movements')}
          >
            <IonIcon slot="start" icon={swapHorizontalOutline} />
            <IonLabel>Movimientos</IonLabel>
          </IonItem>
          <IonItem
            button
            className={isSelected('/inventory/providers') ? 'selected' : ''}
            onClick={() => navigate('/inventory/providers')}
          >
            <IonIcon slot="start" icon={businessOutline} />
            <IonLabel>Proveedores</IonLabel>
          </IonItem>
          <IonItem
            button
            className={isSelected('/inventory/seed') ? 'selected' : ''}
            onClick={() => navigate('/inventory/seed')}
          >
            <IonIcon slot="start" icon={flaskOutline} />
            <IonLabel>Demo</IonLabel>
          </IonItem>
        </IonList>

        <p className="section-label">Ventas</p>
        <IonList lines="none">
          <IonItem
            button
            className={isSelected('/sales/customers') ? 'selected' : ''}
            onClick={() => navigate('/sales/customers')}
          >
            <IonIcon slot="start" icon={peopleOutline} />
            <IonLabel>Clientes</IonLabel>
          </IonItem>
          <IonItem
            button
            className={isSelected('/sales/quotations') ? 'selected' : ''}
            onClick={() => navigate('/sales/quotations')}
          >
            <IonIcon slot="start" icon={calculatorOutline} />
            <IonLabel>Cotizaciones</IonLabel>
          </IonItem>
          <IonItem
            button
            className={isSelected('/sales/orders') ? 'selected' : ''}
            onClick={() => navigate('/sales/orders')}
          >
            <IonIcon slot="start" icon={gridOutline} />
            <IonLabel>Pedidos</IonLabel>
          </IonItem>
        </IonList>

        {user?.rol === 'admin' && (
          <>
            <p className="section-label">Administración</p>
            <IonList lines="none">
              <IonItem
                button
                className={isSelected('/users') ? 'selected' : ''}
                onClick={() => navigate('/users')}
              >
                <IonIcon slot="start" icon={peopleOutline} />
                <IonLabel>Usuarios</IonLabel>
              </IonItem>
            </IonList>
          </>
        )}

        <div style={{ flexGrow: 1 }} />

        <div
          style={{
            borderTop: '1px solid #1e293b',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: 'auto',
          }}
        >
          <IonAvatar style={{ width: 34, height: 34, background: 'var(--ion-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
          </IonAvatar>
          <div style={{ overflow: 'hidden', flexGrow: 1, minWidth: 0 }}>
            <IonText style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nombre || 'Usuario'}
            </IonText>
            <IonText style={{ color: '#64748b', fontSize: 11, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </IonText>
          </div>
          <IonButton fill="clear" onClick={handleLogout} style={{ color: '#64748b', flexShrink: 0, minWidth: 36, height: 36, '--padding-start': 0, '--padding-end': 0 }} title="Cerrar sesión">
            <IonIcon icon={logOutOutline} style={{ fontSize: 20 }} />
          </IonButton>
        </div>
      </IonContent>
    </IonMenu>
  )
}
