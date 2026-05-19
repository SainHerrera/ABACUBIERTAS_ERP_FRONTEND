import {
  IonPage,
  IonContent,
  IonIcon,
} from '@ionic/react'
import { cubeOutline } from 'ionicons/icons'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <IonPage className="auth-page">
      <IonContent scrollY={false} className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <IonIcon icon={cubeOutline} style={{ fontSize: 28 }} />
              </div>
              <h1 className="auth-title">{title}</h1>
              {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
