import { useEffect } from 'react'
import { IonSplitPane } from '@ionic/react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface IonicOverlay extends HTMLElement {
  presented?: boolean
  dismiss?: (data?: unknown, role?: string, id?: string) => Promise<boolean>
}

const OVERLAY_SELECTOR =
  'ion-modal, ion-popover, ion-alert, ion-action-sheet, ion-picker-overlay, ion-loading'

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation()

  useEffect(() => {
    // Solo se descartan los overlays realmente presentados. React renderiza el
    // <ion-modal> aunque isOpen sea false, y llamar dismiss() a uno que nunca
    // se presentó deja el bloqueo global de Ionic (modal-open sobre ion-app)
    // en un estado inconsistente, lo que desactiva los clics de toda la app.
    document
      .querySelectorAll<IonicOverlay>(OVERLAY_SELECTOR)
      .forEach((overlay) => {
        if (overlay.presented === true && typeof overlay.dismiss === 'function') {
          void overlay.dismiss()
        }
      })
  }, [location.pathname])

  return (
    <IonSplitPane contentId="main-content" when="md">
      <Sidebar />
      <div id="main-content" style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
        {children}
      </div>
    </IonSplitPane>
  )
}
