import { useEffect, useState } from 'react'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonSpinner, IonCard, IonCardContent, IonIcon, IonButton,
} from '@ionic/react'
import {
  documentTextOutline, cartOutline, barChartOutline, paperPlaneOutline,
} from 'ionicons/icons'
import { getStockRequestsApi } from '../../api/stockRequestApi'
import { getPurchaseOrdersApi } from '../../api/purchaseOrderApi'
import { useAppSelector } from '../../hooks/useAppSelector'

export const PurchasingPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const requests = await getStockRequestsApi(0, 100, 'pendiente,aprobada')
        const orders = await getPurchaseOrdersApi(0, 100)
        setPendingRequests(requests.total)
        setPendingOrders(
          orders.items.filter((o) => o.estado === 'enviada' || o.estado === 'en_transito').length,
        )
      } catch {
        setPendingRequests(0)
        setPendingOrders(0)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const menu = [
    {
      title: 'Solicitudes de abastecimiento',
      desc: `${pendingRequests} pendientes o aprobadas`,
      icon: documentTextOutline,
      route: '/compras/requests',
      color: '#2563eb',
    },
    {
      title: 'Órdenes de compra',
      desc: `${pendingOrders} en curso`,
      icon: paperPlaneOutline,
      route: '/compras/purchase-orders',
      color: '#7c3aed',
    },
    {
      title: 'Reporte por proveedor',
      desc: 'Gasto y tiempos de entrega',
      icon: barChartOutline,
      route: '/compras/report',
      color: '#0d9488',
    },
  ]

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--ion-color-primary)', '--color': '#fff' }}>
          <IonTitle>Panel de Compras</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText style={{ fontWeight: 700, fontSize: 18, display: 'block', marginBottom: 4 }}>
          ¡Hola{user?.nombre ? `, ${user.nombre}` : ''}!
        </IonText>
        <IonText style={{ color: 'var(--app-text-muted)', fontSize: 14, display: 'block', marginBottom: 20 }}>
          Gestiona las solicitudes de abastecimiento, cotizaciones y órdenes de compra.
        </IonText>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <IonSpinner />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {menu.map((m, i) => (
              <IonButton
                key={m.title}
                routerLink={m.route}
                fill="clear"
                style={{ '--padding-start': 0, '--padding-end': 0, '--border-radius': 12, margin: 0 }}
                data-testid={`compras-menu-${i}`}
              >
                <IonCard style={{ margin: 0, width: '100%', textAlign: 'left' }}>
                  <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${m.color}1a`,
                      }}
                    >
                      <IonIcon icon={m.icon} style={{ color: m.color, fontSize: 22 }} />
                    </div>
                    <div>
                      <IonText style={{ fontWeight: 700, fontSize: 15, display: 'block' }}>{m.title}</IonText>
                      <IonText style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>{m.desc}</IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonButton>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--app-text-muted)', fontSize: 13, marginTop: 8 }}>
              <IonIcon icon={cartOutline} />
              Coordina con Bodega la entrada de mercancía cuando el pedido llegue.
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  )
}
