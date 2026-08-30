import { IonPage, IonContent, IonText, IonButton, IonIcon } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import { homeOutline } from 'ionicons/icons'

export const NotFoundPage = () => {
  const history = useHistory()

  return (
    <IonPage>
      <IonContent className="ion-padding" style={{ '--background': 'var(--ion-background-color)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', gap: 16 }}>
          <IonText style={{ fontSize: 72, fontWeight: 800, color: 'var(--ion-color-primary)' }}>404</IonText>
          <IonText style={{ fontSize: 20, color: 'var(--app-text-muted)' }}>Página no encontrada</IonText>
          <IonButton onClick={() => history.push('/dashboard')}>
            <IonIcon slot="start" icon={homeOutline} />
            Volver al Dashboard
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  )
}
