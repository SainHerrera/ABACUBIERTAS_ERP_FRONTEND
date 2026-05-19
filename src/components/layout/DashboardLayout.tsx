import { IonSplitPane } from '@ionic/react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <IonSplitPane contentId="main-content" when="md">
      <Sidebar />
      <div id="main-content" style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
        {children}
      </div>
    </IonSplitPane>
  )
}
