import { useEffect, useState } from 'react'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonSpinner, IonButtons, IonButton, IonIcon,
  IonCard, IonCardContent, IonSegment, IonSegmentButton, IonLabel,
} from '@ionic/react'
import { arrowBack } from 'ionicons/icons'
import { getProviderExpenseReportApi, getProviderDeliveryReportApi } from '../../api/purchaseOrderApi'

interface ExpenseRow {
  nombre_proveedor: string
  gasto_total: number
  numero_oc: number
}

interface DeliveryRow {
  nombre_proveedor: string
  tiempo_promedio_dias: number
  cotizaciones: number
}

export const ProviderReportPage = () => {
  const [segment, setSegment] = useState<'expense' | 'delivery'>('expense')
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [exp, del] = await Promise.all([
          getProviderExpenseReportApi(),
          getProviderDeliveryReportApi(),
        ])
        setExpenses(exp)
        setDeliveries(del)
      } catch {
        setExpenses([])
        setDeliveries([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonButtons slot="start">
            <IonButton routerLink="/compras" style={{ color: '#fff' }}>
              <IonIcon icon={arrowBack} slot="start" />
              Menú
            </IonButton>
          </IonButtons>
          <IonTitle>Reporte por proveedor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSegment
          value={segment}
          onIonChange={(e) => setSegment(e.detail.value as 'expense' | 'delivery')}
          style={{ marginBottom: 16 }}
        >
          <IonSegmentButton value="expense">
            <IonLabel>Gasto</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="delivery" data-testid="segment-delivery">
            <IonLabel>Tiempos de entrega</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <IonSpinner />
          </div>
        ) : segment === 'expense' ? (
          expenses.length === 0 ? (
            <IonText color="medium" style={{ display: 'block', textAlign: 'center', marginTop: 48 }}>
              No hay gastos registrados.
            </IonText>
          ) : (
            <IonCard style={{ margin: 0 }}>
              <IonCardContent>
                {expenses.map((e) => (
                  <div
                    key={e.nombre_proveedor}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--app-border)' }}
                    data-testid="expense-row"
                  >
                    <div>
                      <IonText style={{ fontWeight: 600, display: 'block' }}>{e.nombre_proveedor}</IonText>
                      <IonText style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{e.numero_oc} orden(es)</IonText>
                    </div>
                    <IonText style={{ fontWeight: 700 }}>${e.gasto_total.toLocaleString()}</IonText>
                  </div>
                ))}
              </IonCardContent>
            </IonCard>
          )
        ) : deliveries.length === 0 ? (
          <IonText color="medium" style={{ display: 'block', textAlign: 'center', marginTop: 48 }}>
            No hay tiempos de entrega registrados.
          </IonText>
        ) : (
          <IonCard style={{ margin: 0 }}>
            <IonCardContent>
              {deliveries.map((d) => (
                <div
                  key={d.nombre_proveedor}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--app-border)' }}
                  data-testid="delivery-row"
                >
                  <div>
                    <IonText style={{ fontWeight: 600, display: 'block' }}>{d.nombre_proveedor}</IonText>
                    <IonText style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{d.cotizaciones} registro(s)</IonText>
                  </div>
                  <IonText style={{ fontWeight: 700 }}>{d.tiempo_promedio_dias.toFixed(1)} días</IonText>
                </div>
              ))}
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  )
}
