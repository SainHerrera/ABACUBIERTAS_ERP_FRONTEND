import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { getApiErrorMessage } from '../utils/apiError'

describe('getApiErrorMessage', () => {
  it('returns the FastAPI detail string for a backend error', () => {
    const error = new AxiosError('Request failed')
    ;(error as { response?: unknown }).response = {
      data: { detail: 'El proveedor ya se encuentra registrado' },
    }
    expect(getApiErrorMessage(error, 'Error al guardar')).toBe(
      'El proveedor ya se encuentra registrado',
    )
  })

  it('returns the first msg for a FastAPI validation detail array', () => {
    const error = new AxiosError('Request failed')
    ;(error as { response?: unknown }).response = {
      data: {
        detail: [{ loc: ['body', 'nit'], msg: 'El campo nit es obligatorio', type: 'string_too_short' }],
      },
    }
    expect(getApiErrorMessage(error, 'Error al guardar')).toBe(
      'El campo nit es obligatorio',
    )
  })

  it('falls back when detail is empty string or missing', () => {
    const error = new AxiosError('Request failed')
    ;(error as { response?: unknown }).response = { data: {} }
    expect(getApiErrorMessage(error, 'Error al guardar')).toBe('Error al guardar')

    const emptyDetail = new AxiosError('Request failed')
    ;(emptyDetail as { response?: unknown }).response = { data: { detail: '' } }
    expect(getApiErrorMessage(emptyDetail, 'Error al guardar')).toBe('Error al guardar')
  })

  it('returns the message for a plain Error', () => {
    expect(getApiErrorMessage(new Error('La contraseña es incorrecta'), 'fallback')).toBe(
      'La contraseña es incorrecta',
    )
  })

  it('returns the fallback for unknown values', () => {
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback')
    expect(getApiErrorMessage(undefined, 'fallback')).toBe('fallback')
    expect(getApiErrorMessage('mensaje plano', 'fallback')).toBe('fallback')
  })
})