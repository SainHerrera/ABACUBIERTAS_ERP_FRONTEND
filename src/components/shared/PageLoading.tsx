import { IonText } from '@ionic/react'

interface PageLoadingProps {
  message: string
}

export const PageLoading = ({ message }: PageLoadingProps) => {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      style={{
        position: 'sticky',
        top: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div className="app-progress-bar" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 999,
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          }}
        >
          <span className="app-progress-dot" />
          <IonText style={{ fontSize: 12, fontWeight: 500 }}>{message}</IonText>
        </div>
      </div>
    </div>
  )
}