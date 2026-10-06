import { useState } from 'react'
import { IonItem, IonLabel, IonInput } from '@ionic/react'
import { formatNumber } from '../../utils/format'

interface BaseNumberFieldProps {
  label: string
  value: string
  onValueChange: (raw: string) => void
  disabled?: boolean
  required?: boolean
  className?: string
  dataTestId?: string
}

export const MoneyInput = ({
  label,
  value,
  onValueChange,
  disabled,
  required,
  className,
  dataTestId,
  step,
  min,
}: BaseNumberFieldProps & { step?: string; min?: string }) => (
  <div className={`ion-input-wrapper ${className || ''}`}>
    <IonItem lines="none" style={{ '--background': 'transparent' }}>
      <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{label}</IonLabel>
      <div className="input-prefixed-row">
        <span className="input-prefix">$</span>
        <IonInput
          type="number"
          step={step}
          min={min}
          value={value}
          disabled={disabled}
          required={required}
          data-testid={dataTestId}
          onIonChange={(e) => onValueChange(e.detail.value || '')}
        />
      </div>
    </IonItem>
  </div>
)

export const QuantityInput = ({
  label,
  value,
  onValueChange,
  disabled,
  required,
  className,
  dataTestId,
}: BaseNumberFieldProps) => {
  const [focused, setFocused] = useState(false)
  const display = focused ? value : value.trim() === '' ? '' : formatNumber(value)

  return (
    <div className={`ion-input-wrapper ${className || ''}`}>
      <IonItem lines="none" style={{ '--background': 'transparent' }}>
        <IonLabel position="stacked" style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{label}</IonLabel>
        <IonInput
          type="text"
          inputMode="numeric"
          value={display}
          disabled={disabled}
          required={required}
          data-testid={dataTestId}
          onIonFocus={() => setFocused(true)}
          onIonBlur={() => setFocused(false)}
          onIonChange={(e) => onValueChange((e.detail.value || '').replace(/\D/g, ''))}
        />
      </IonItem>
    </div>
  )
}
