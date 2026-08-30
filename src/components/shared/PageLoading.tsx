import { IonSpinner, IonText } from '@ionic/react'

interface PageLoadingProps {
  message: string
}

export const PageLoading = ({ message }: PageLoadingProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 22px',
          borderRadius: 12,
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <IonSpinner name="crescent" />
        <IonText style={{ fontSize: 14 }}>{message}</IonText>
      </div>
    </div>
  )
}