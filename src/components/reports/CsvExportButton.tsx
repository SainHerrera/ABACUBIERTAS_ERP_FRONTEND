import { IonButton, IonIcon } from '@ionic/react'
import { downloadOutline } from 'ionicons/icons'

interface CsvExportButtonProps {
  filename: string
  headers: string[]
  rows: (string | number)[][]
  label?: string
}

const escapeCsv = (value: string | number) => {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export const CsvExportButton = ({
  filename,
  headers,
  rows,
  label = 'Exportar CSV',
}: CsvExportButtonProps) => {
  const handleExport = () => {
    const headerRow = headers.map(escapeCsv).join(',')
    const body = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    const csv = `\uFEFF${headerRow}\n${body}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <IonButton fill="outline" size="small" onClick={handleExport} data-testid="csv-export">
      <IonIcon slot="start" icon={downloadOutline} />
      {label}
    </IonButton>
  )
}
