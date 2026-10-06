import { IonText } from '@ionic/react'

export interface BarChartItem {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartItem[]
  formatValue: (value: number) => string
  color?: string
  maxBars?: number
  testId?: string
  height?: number
}

export const BarChart = ({
  data,
  formatValue,
  color = 'var(--ion-color-primary)',
  maxBars = 12,
  testId,
  height = 220,
}: BarChartProps) => {
  const items = data.slice(0, maxBars)
  const max = items.length > 0 ? Math.max(...items.map((d) => d.value)) : 0
  const barMax = height - 32

  return (
    <div data-testid={testId} style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height, padding: '16px 8px 0' }}>
      {items.length === 0 ? (
        <IonText color="medium">No hay datos.</IonText>
      ) : (
        items.map((item) => {
          const barHeight = max > 0 ? Math.max(8, (item.value / max) * barMax) : 8
          return (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <IonText
                style={{
                  fontSize: 11,
                  color: 'var(--app-text-secondary)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {formatValue(item.value)}
              </IonText>
              <div
                style={{
                  width: '100%',
                  maxWidth: 64,
                  height: barHeight,
                  background: color,
                  borderRadius: '6px 6px 0 0',
                  marginTop: 4,
                }}
              />
              <IonText
                style={{
                  fontSize: 12,
                  color: 'var(--app-text-muted)',
                  marginTop: 6,
                  textTransform: 'capitalize',
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.label}
              </IonText>
            </div>
          )
        })
      )}
    </div>
  )
}