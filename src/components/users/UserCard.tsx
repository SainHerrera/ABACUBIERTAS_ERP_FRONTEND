import { IonCard, IonCardContent, IonAvatar, IonText } from '@ionic/react'
import type { User } from '../../types/auth'

interface UserCardProps {
  user: User
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  ventas: 'Ventas',
  compras: 'Compras',
}

const roleChipClass: Record<string, string> = {
  admin: 'chip chip-primary',
  ventas: 'chip chip-default',
  compras: 'chip chip-secondary',
}

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <IonCard style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <IonAvatar style={{ width: 48, height: 48, background: user.rol === 'admin' ? 'var(--ion-color-primary)' : 'var(--ion-color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff', fontWeight: 700, fontSize: 18 }}>
          {user.nombre.charAt(0).toUpperCase()}
        </IonAvatar>
        <div style={{ flexGrow: 1 }}>
          <IonText style={{ fontWeight: 600, display: 'block' }}>{user.nombre}</IonText>
          <IonText color="medium" style={{ fontSize: 14 }}>{user.email}</IonText>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={roleChipClass[user.rol] || 'chip chip-default'}>
            {roleLabels[user.rol] || user.rol}
          </span>
          <span className={user.activo ? 'chip chip-success' : 'chip chip-danger'}>
            {user.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </IonCardContent>
    </IonCard>
  )
}
