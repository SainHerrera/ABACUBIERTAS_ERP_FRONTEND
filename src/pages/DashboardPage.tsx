import { useCallback, useEffect, useState } from 'react'
import { IonText, IonIcon, IonPage } from '@ionic/react'
import {
  peopleOutline,
  cubeOutline,
  cartOutline,
  trendingUpOutline,
  cashOutline,
  documentTextOutline,
  warningOutline,
  checkmarkDoneCircleOutline,
} from 'ionicons/icons'
import { useAppSelector } from '../hooks/useAppSelector'
import { useHistory } from 'react-router-dom'

import { roleLabels } from '../components/users/roleConfig'
import { getDashboardKpisApi } from '../api/reportApi'

interface Kpi {
  label: string
  value: string
  icon: string
  color: string
  bg: string
  path?: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

const isLeadership = (rol?: string) => rol === 'admin' || rol === 'gerencia'

const genericMetrics = [
  { label: 'Productos', value: '—', icon: cubeOutline, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  { label: 'Clientes', value: '—', icon: peopleOutline, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  { label: 'Ventas del Mes', value: '—', icon: cartOutline, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)' },
  { label: 'Crecimiento', value: '—', icon: trendingUpOutline, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
]

export const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const navigate = useHistory()
  const [kpis, setKpis] = useState<{
    ventasDelMes: number
    cotizacionesPendientes: number
    stockCritico: number
    comprasPendientes: number
    aprobacionesPendientes: number
  } | null>(null)

  const loadKpis = useCallback(async () => {
    if (!isLeadership(user?.rol)) return
    const data = await getDashboardKpisApi()
    setKpis(data)
  }, [user?.rol])

  useEffect(() => {
    loadKpis()
  }, [loadKpis])

  const leadershipMetrics: Kpi[] = [
    {
      label: 'Ventas del Mes',
      value: kpis ? formatCurrency(kpis.ventasDelMes) : '—',
      icon: cashOutline,
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.1)',
      path: '/reports',
    },
    {
      label: 'Cotizaciones Pendientes',
      value: kpis ? String(kpis.cotizacionesPendientes) : '—',
      icon: documentTextOutline,
      color: '#2563eb',
      bg: 'rgba(37, 99, 235, 0.1)',
      path: '/sales/quotations',
    },
    {
      label: 'Stock Crítico',
      value: kpis ? String(kpis.stockCritico) : '—',
      icon: warningOutline,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      path: '/inventory/alerts',
    },
    {
      label: 'Compras Pendientes de Recibir',
      value: kpis ? String(kpis.comprasPendientes) : '—',
      icon: cartOutline,
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.1)',
      path: '/inventory/purchases',
    },
    {
      label: 'OC Pendientes de Aprobación',
      value: kpis ? String(kpis.aprobacionesPendientes) : '—',
      icon: checkmarkDoneCircleOutline,
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.12)',
      path: '/approvals',
    },
  ]

  const metrics: Kpi[] = isLeadership(user?.rol) ? leadershipMetrics : genericMetrics

  const formatMetric = (m: Kpi) => (
    <div
      key={m.label}
      className="metric-card"
      data-testid={`kpi-${m.label}`}
      style={m.path ? { cursor: 'pointer' } : undefined}
      onClick={m.path ? () => navigate.push(m.path!) : undefined}
    >
      <div className="metric-icon" style={{ background: m.bg, color: m.color }}>
        <IonIcon icon={m.icon} style={{ fontSize: 24 }} />
      </div>
      <div>
        <p className="metric-value">{m.value}</p>
        <p className="metric-label">{m.label}</p>
      </div>
    </div>
  )

  return (
    <IonPage>
      <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: 24 }}>
        <IonText style={{ fontSize: 24, fontWeight: 700, display: 'block', marginBottom: 24 }}>
          Panel Principal
        </IonText>
        <IonText color="medium" style={{ display: 'block', marginBottom: 24 }}>
          Panel principal de Abacubiertas ERP — Rol:{' '}
          {roleLabels[user?.rol || ''] || user?.rol}
        </IonText>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {metrics.map(formatMetric)}
        </div>

        <div style={{ borderRadius: 12, border: '1px solid var(--app-border)', padding: 24 }}>
          <IonText style={{ fontSize: 18, fontWeight: 600, display: 'block', marginBottom: 16 }}>
            Información del Usuario
          </IonText>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            <div>
              <p className="info-label">Nombre</p>
              <p className="info-value">{user?.nombre}</p>
            </div>
            <div>
              <p className="info-label">Email</p>
              <p className="info-value">{user?.email}</p>
            </div>
            <div>
              <p className="info-label">Rol</p>
              <p className="info-value" style={{ color: 'var(--ion-color-primary)', fontWeight: 600 }}>
                {roleLabels[user?.rol || ''] || user?.rol}
              </p>
            </div>
            <div>
              <p className="info-label">ID Usuario</p>
              <p className="info-value">#{user?.id_usuario}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </IonPage>
  )
}
