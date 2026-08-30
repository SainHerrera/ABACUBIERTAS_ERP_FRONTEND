import { IonContent, IonMenu, IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonText, IonButton } from '@ionic/react'
import { gridOutline, peopleOutline, cubeOutline, swapHorizontalOutline, businessOutline, calculatorOutline, logOutOutline, settingsOutline, documentTextOutline, receiptOutline, checkmarkDoneOutline, warningOutline, cartOutline, analyticsOutline, checkmarkDoneCircleOutline, moonOutline, sunnyOutline } from 'ionicons/icons'
import { useLocation, useHistory } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { logout } from '../../store/slices/authSlice'
import { useTheme } from '../../hooks/useTheme'
import { canAccessSales, canManagePurchasing } from '../../utils/permissions'

export const Sidebar = () => {
  const location = useLocation()
  const navigateFn = useHistory()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { theme, toggleTheme } = useTheme()

  const navigate = (path: string) => {
    navigateFn.push(path)
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const isSelected = (path: string) => location.pathname === path

  return (
    <IonMenu contentId="main-content" className="sidebar-menu">
      <IonContent className="sidebar-menu" style={{ '--background': 'var(--app-sidebar-bg)', display: 'flex', flexDirection: 'column' }}>
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
            <IonText style={{ color: 'var(--app-text-muted)', fontSize: 11 }}>ERP</IonText>
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
            className={isSelected('/inventory/purchases') ? 'selected' : ''}
            onClick={() => navigate('/inventory/purchases')}
          >
            <IonIcon slot="start" icon={receiptOutline} />
            <IonLabel>Órdenes de Compra</IonLabel>
          </IonItem>
          <IonItem
            button
            className={isSelected('/inventory/dispatches') ? 'selected' : ''}
            onClick={() => navigate('/inventory/dispatches')}
          >
            <IonIcon slot="start" icon={checkmarkDoneOutline} />
            <IonLabel>Despachos</IonLabel>
          </IonItem>
          <IonItem
            button
            className={isSelected('/inventory/alerts') ? 'selected' : ''}
            onClick={() => navigate('/inventory/alerts')}
          >
            <IonIcon slot="start" icon={warningOutline} />
            <IonLabel>Alertas de Stock</IonLabel>
          </IonItem>
        </IonList>

        {canManagePurchasing(user?.rol) && (
          <>
            <p className="section-label">Compras</p>
            <IonList lines="none">
              <IonItem
                button
                className={isSelected('/compras') ? 'selected' : ''}
                onClick={() => navigate('/compras')}
              >
                <IonIcon slot="start" icon={cartOutline} />
                <IonLabel>Panel</IonLabel>
              </IonItem>
              <IonItem
                button
                className={isSelected('/compras/requests') ? 'selected' : ''}
                onClick={() => navigate('/compras/requests')}
              >
                <IonIcon slot="start" icon={documentTextOutline} />
                <IonLabel>Solicitudes</IonLabel>
              </IonItem>
              <IonItem
                button
                className={isSelected('/compras/purchase-orders') ? 'selected' : ''}
                onClick={() => navigate('/compras/purchase-orders')}
              >
                <IonIcon slot="start" icon={receiptOutline} />
                <IonLabel>Órdenes de Compra</IonLabel>
              </IonItem>
              <IonItem
                button
                className={isSelected('/compras/report') ? 'selected' : ''}
                onClick={() => navigate('/compras/report')}
              >
                <IonIcon slot="start" icon={calculatorOutline} />
                <IonLabel>Reporte por proveedor</IonLabel>
              </IonItem>
            </IonList>
          </>
        )}

        {canAccessSales(user?.rol) && (
          <>
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
          </>
        )}

        {(user?.rol === 'admin' || user?.rol === 'gerencia') && (
          <>
            <p className="section-label">Reportes</p>
            <IonList lines="none">
              <IonItem
                button
                className={isSelected('/reports') ? 'selected' : ''}
                onClick={() => navigate('/reports')}
              >
                <IonIcon slot="start" icon={analyticsOutline} />
                <IonLabel>Dashboard y reportes</IonLabel>
              </IonItem>
              <IonItem
                button
                className={isSelected('/approvals') ? 'selected' : ''}
                onClick={() => navigate('/approvals')}
              >
                <IonIcon slot="start" icon={checkmarkDoneCircleOutline} />
                <IonLabel>Aprobaciones</IonLabel>
              </IonItem>
            </IonList>
          </>
        )}

        {(user?.rol === 'admin' || user?.rol === 'gerencia') && (
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
              <IonItem
                button
                className={isSelected('/audit') ? 'selected' : ''}
                onClick={() => navigate('/audit')}
              >
                <IonIcon slot="start" icon={documentTextOutline} />
                <IonLabel>Log de Auditoría</IonLabel>
              </IonItem>
              {user?.rol === 'admin' && (
                <IonItem
                  button
                  className={isSelected('/settings') ? 'selected' : ''}
                  onClick={() => navigate('/settings')}
                >
                  <IonIcon slot="start" icon={settingsOutline} />
                  <IonLabel>Parámetros del sistema</IonLabel>
                </IonItem>
              )}
            </IonList>
          </>
        )}

        <div style={{ flexGrow: 1 }} />

        <div
          style={{
            borderTop: '1px solid var(--app-border)',
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
            <IonText style={{ color: 'var(--app-border)', fontSize: 13, fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nombre || 'Usuario'}
            </IonText>
            <IonText style={{ color: 'var(--app-text-muted)', fontSize: 11, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </IonText>
          </div>
          <IonButton fill="clear" onClick={toggleTheme} style={{ color: 'var(--app-text-muted)', flexShrink: 0, minWidth: 36, height: 36, '--padding-start': 0, '--padding-end': 0 }} title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            <IonIcon icon={theme === 'dark' ? sunnyOutline : moonOutline} style={{ fontSize: 20 }} />
          </IonButton>
          <IonButton fill="clear" onClick={handleLogout} style={{ color: 'var(--app-text-muted)', flexShrink: 0, minWidth: 36, height: 36, '--padding-start': 0, '--padding-end': 0 }} title="Cerrar sesión">
            <IonIcon icon={logOutOutline} style={{ fontSize: 20 }} />
          </IonButton>
        </div>
      </IonContent>
    </IonMenu>
  )
}
