import { describe, it, expect, vi, afterEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, fireEvent } from '@testing-library/react'
import { CsvExportButton } from '../components/reports/CsvExportButton'

vi.mock('@ionic/react', () => {
  return {
    IonButton: ({
      children,
      onClick,
      ...rest
    }: {
      children?: ReactNode
      onClick?: (e: unknown) => void
    } & Record<string, unknown>) => (
      <button onClick={onClick} {...rest}>{children}</button>
    ),
    IonIcon: () => <span>icon</span>,
  }
})

let capturedAnchor: HTMLAnchorElement | null = null

const readBlobText = async (blob: Blob): Promise<string> => {
  return await blob.text()
}

describe('CsvExportButton - Export CSV', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    capturedAnchor = null
  })

  const captureClick = () => {
    return vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias -- captura el anchor descargable generado
        capturedAnchor = this
      })
  }

  it('genera un archivo .csv con cabeceras y filas cuando se hace clic', async () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => 'blob:mock-url')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL')
    captureClick()

    const { getByTestId } = render(
      <CsvExportButton
        filename="reporte-sales"
        headers={['Vendedor', 'Total', 'N° Ventas']}
        rows={[
          ['Administrador ERP', 2023000, 1],
          ['Vendedor, Con Coma', 100, 2],
        ]}
      />,
    )

    fireEvent.click(getByTestId('csv-export'))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0][0] as Blob
    expect(blob.type).toBe('text/csv;charset=utf-8;')

    const text = await readBlobText(blob)
    const lines = text.replace('\uFEFF', '').trim().split('\n')

    expect(lines[0]).toBe('Vendedor,Total,N° Ventas')
    expect(lines[1]).toBe('Administrador ERP,2023000,1')
    // El valor con coma se escapa con comillas
    expect(lines[2]).toBe('"Vendedor, Con Coma",100,2')

    // El anchor de descarga se crea con el nombre correcto del archivo CSV
    expect(capturedAnchor).not.toBeNull()
    expect(capturedAnchor!.getAttribute('download')).toBe('reporte-sales.csv')
    expect(capturedAnchor!.href).toBe('blob:mock-url')
    expect(revokeObjectURL).toHaveBeenCalled()
  })

  it('incluye BOM UTF-8 y escapa comillas en los valores', async () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => 'blob:mock-url')
    captureClick()

    const { getByTestId } = render(
      <CsvExportButton
        filename="reporte-sales"
        headers={['Texto']}
        rows={[['dijo "hola"']]}
      />,
    )

    fireEvent.click(getByTestId('csv-export'))

    const blob = createObjectURL.mock.calls[0][0] as Blob
    // El BOM UTF-8 se escribe como los bytes EF BB BF al inicio del archivo
    const buf = new Uint8Array(await blob.arrayBuffer())
    expect(buf[0]).toBe(0xef)
    expect(buf[1]).toBe(0xbb)
    expect(buf[2]).toBe(0xbf)

    const text = await blob.text()
    expect(text).toContain('"dijo ""hola"""')
  })
})
