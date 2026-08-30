import {
  IonCard, IonCardContent, IonText, IonButton, IonIcon,
} from '@ionic/react'
import { checkmarkCircle, ribbonOutline } from 'ionicons/icons'
import type { ProviderQuotation } from '../../types/providerQuotation'

interface QuotationCompareProps {
  requestId: number
  productName: string
  quantity: number
  quotations: ProviderQuotation[]
  onRegister: (requestId: number) => void
  onSelect: (quotationId: number) => void
  onCreatePo: (requestId: number) => void
  canManage: boolean
  isLoading: boolean
  error: string | null
}

export const QuotationCompare = ({
  requestId,
  productName,
  quantity,
  quotations,
  onRegister,
  onSelect,
  onCreatePo,
  canManage,
  isLoading,
  error,
}: QuotationCompareProps) => {
  const hasTwo = quotations.length >= 2
  const selected = quotations.find((q) => q.seleccionada)

  return (
    <IonCard style={{ margin: '8px 0' }}>
      <IonCardContent>
        <IonText style={{ fontWeight: 600, fontSize: 15, display: 'block', marginBottom: 4 }}>
          {productName} · Cantidad: {quantity}
        </IonText>
        {quotations.length === 0 ? (
          <IonText style={{ fontSize: 13, color: 'var(--app-text-muted)', display: 'block', marginBottom: 8 }}>
            Aún no hay cotizaciones para esta solicitud. Registre al menos dos para comparar.
          </IonText>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {quotations.map((q) => (
              <div
                key={q.id_cotizacion}
                style={{
                  border: `1px solid ${q.seleccionada ? 'var(--ion-color-primary)' : 'var(--app-border)'}`,
                  borderRadius: 8,
                  padding: 10,
                  background: q.seleccionada ? 'rgba(124, 58, 237, 0.12)' : 'var(--app-bg)',
                }}
                data-testid={`quotation-${q.numero_cotizacion}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <IonText style={{ fontWeight: 600, fontSize: 14, display: 'block' }}>
                      {q.nombre_proveedor}
                    </IonText>
                    <IonText style={{ fontSize: 13, color: 'var(--app-text-muted)', display: 'block' }}>
                      Precio: <strong>${q.precio_unitario.toLocaleString()}</strong> · Entrega: {q.tiempo_entrega_dias} días
                    </IonText>
                    {q.condiciones && (
                      <IonText style={{ fontSize: 12, color: 'var(--app-text-muted)', display: 'block' }}>
                        {q.condiciones}
                      </IonText>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {q.seleccionada && (
                      <IonIcon icon={checkmarkCircle} color="success" data-testid="selected-badge" />
                    )}
                    {canManage && !q.seleccionada && !selected && (
                      <IonButton
                        size="small"
                        fill="outline"
                        disabled={!hasTwo || isLoading}
                        onClick={() => onSelect(q.id_cotizacion)}
                        data-testid={`select-${q.numero_cotizacion}`}
                      >
                        Elegir
                      </IonButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {canManage && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <IonButton size="small" onClick={() => onRegister(requestId)} disabled={isLoading}>
              Registrar cotización
            </IonButton>
            <IonButton
              size="small"
              onClick={() => onCreatePo(requestId)}
              disabled={!hasTwo || !selected || isLoading}
              data-testid="create-po"
            >
              Generar OC{selected ? '' : ' (elige proveedor)'}
            </IonButton>
          </div>
        )}

        {!hasTwo && quotations.length > 0 && (
          <IonText style={{ fontSize: 12, color: 'var(--ion-color-warning)', display: 'block', marginTop: 8 }}>
            <IonIcon icon={ribbonOutline} /> Necesita al menos dos cotizaciones para elegir proveedor.
          </IonText>
        )}

        {error && (
          <IonText color="danger" style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
            {error}
          </IonText>
        )}
      </IonCardContent>
    </IonCard>
  )
}
