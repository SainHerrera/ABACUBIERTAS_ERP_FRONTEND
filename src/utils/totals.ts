export const TAX_RATE = 0.19

export interface TotalsRow {
  cantidad: number
  precio_unitario: number
  descuento: number
}

export { formatCurrency, formatNumber } from './format'
export { formatCurrency as formatMoney } from './format'

export const lineSubtotal = ({ cantidad, precio_unitario, descuento }: TotalsRow) => {
  const gross = (Number(cantidad) || 0) * (Number(precio_unitario) || 0)
  return gross - gross * ((Number(descuento) || 0) / 100)
}

export const computeTotals = (rows: TotalsRow[], descuentoGlobal: number) => {
  const subtotal = rows.reduce((acc, row) => acc + lineSubtotal(row), 0)
  const descuentoValor = subtotal * ((Number(descuentoGlobal) || 0) / 100)
  const baseImponible = subtotal - descuentoValor
  const impuestos = baseImponible * TAX_RATE
  return { subtotal, impuestos, total: baseImponible + impuestos }
}
