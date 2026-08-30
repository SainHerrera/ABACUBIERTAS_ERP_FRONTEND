import { describe, it, expect, beforeEach } from 'vitest'
import { StorageEngine } from '../services/localStorage/storageEngine'
import { SEED_SETTINGS } from '../services/localStorage/seedData'
import { getSettingsApi, updateSettingsApi, resetSettingsApi, loadInitialCatalogApi } from '../api/settingsApi'
import { createQuoteApi, updateQuoteApi } from '../api/quotationApi'
import { getClientsApi } from '../api/clientApi'
import type { SystemSettings } from '../types/settings'

describe('Settings - Parámetros Generales del Sistema (LocalStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
    StorageEngine.init(true)
  })

  describe('1. Lectura de parámetros por defecto', () => {
    it('debe leer los parámetros seed desde abacubiertas_settings', () => {
      const settings = StorageEngine.getSettings()
      expect(settings.stockMinimoDefault).toBe(SEED_SETTINGS.stockMinimoDefault)
      expect(settings.margenUtilidadDefault).toBe(SEED_SETTINGS.margenUtilidadDefault)
      expect(settings.catalogoInicialCargado).toBe(true)
    })

    it('debe persistir los parámetros en la clave abacubiertas_settings', () => {
      const stored = JSON.parse(
        localStorage.getItem('abacubiertas_settings') || '{}',
      ) as SystemSettings
      expect(stored.stockMinimoDefault).toBe(SEED_SETTINGS.stockMinimoDefault)
      expect(stored.margenUtilidadDefault).toBe(SEED_SETTINGS.margenUtilidadDefault)
      expect(stored.catalogoInicialCargado).toBe(true)
    })

    it('debe obtener los parámetros a través de la API', async () => {
      const settings = await getSettingsApi()
      expect(settings.stockMinimoDefault).toBe(SEED_SETTINGS.stockMinimoDefault)
      expect(settings.margenUtilidadDefault).toBe(SEED_SETTINGS.margenUtilidadDefault)
    })
  })

  describe('2. Actualización y persistencia de parámetros', () => {
    it('debe actualizar stock mínimo y margen y persistirlos', async () => {
      const updated = await updateSettingsApi({
        stockMinimoDefault: 25,
        margenUtilidadDefault: 40,
      })

      expect(updated.stockMinimoDefault).toBe(25)
      expect(updated.margenUtilidadDefault).toBe(40)
      expect(updated.updatedAt).toBeDefined()

      const stored = JSON.parse(
        localStorage.getItem('abacubiertas_settings') || '{}',
      ) as SystemSettings
      expect(stored.stockMinimoDefault).toBe(25)
      expect(stored.margenUtilidadDefault).toBe(40)
    })

    it('debe conservar los valores tras re-leerlos (persistencia real)', () => {
      StorageEngine.updateSettings({
        stockMinimoDefault: 12,
        margenUtilidadDefault: 35,
      })
      const reRead = StorageEngine.getSettings()
      expect(reRead.stockMinimoDefault).toBe(12)
      expect(reRead.margenUtilidadDefault).toBe(35)
    })

    it.each([
      { stockMinimoDefault: -1 },
      { stockMinimoDefault: -50 },
    ])('debe rechazar stock mínimo negativo (%j)', (data) => {
      expect(() => StorageEngine.updateSettings(data)).toThrow(
        'El stock mínimo por defecto no puede ser negativo',
      )
    })

    it.each([
      { margenUtilidadDefault: -1 },
      { margenUtilidadDefault: 101 },
      { margenUtilidadDefault: 150 },
    ])('debe rechazar margen fuera del rango 0-100 (%j)', (data) => {
      expect(() => StorageEngine.updateSettings(data)).toThrow(
        'El margen de utilidad debe estar entre 0 y 100',
      )
    })

    it('no debe cambiar valores si la actualización es inválida', () => {
      expect(() => StorageEngine.updateSettings({ margenUtilidadDefault: 500 })).toThrow(
        'El margen de utilidad debe estar entre 0 y 100',
      )
      const settings = StorageEngine.getSettings()
      expect(settings.margenUtilidadDefault).toBe(SEED_SETTINGS.margenUtilidadDefault)
    })
  })

  describe('3. Migración / backfill de la clave de parámetros', () => {
    it('debe crear abacubiertas_settings si no existe tras un init previo', () => {
      localStorage.removeItem('abacubiertas_settings')
      StorageEngine.init()
      const stored = JSON.parse(
        localStorage.getItem('abacubiertas_settings') || 'null',
      )
      expect(stored).not.toBeNull()
      expect(stored.stockMinimoDefault).toBe(SEED_SETTINGS.stockMinimoDefault)
    })
  })

  describe('4. Aplicación del margen de utilidad por defecto en cotizaciones', () => {
    it.each([
      { margen: 20, base: 85000, esperado: 102000 },
      { margen: 30, base: 85000, esperado: 110500 },
      { margen: 50, base: 85000, esperado: 127500 },
    ])(
      'aplica el margen %j al precio de la cotización',
      async ({ margen, esperado }) => {
        StorageEngine.updateSettings({ margenUtilidadDefault: margen })
        const client = (await getClientsApi(0, 1)).items[0]

        const quote = await createQuoteApi({
          id_cliente: client.id_cliente,
          descuento: 0,
          detalles: [
            {
              id_detalle: 1,
              id_producto: 1,
              descripcion: 'Producto sin precio explícito',
              cantidad: 2,
              precio_unitario: 0,
              descuento: 0,
              subtotal: 0,
            },
          ],
        })

        expect(quote.detalles[0].precio_unitario).toBe(esperado)
        expect(quote.subtotal).toBe(esperado * 2)
      },
    )

    it('respeta el precio explícito del usuario y no aplica el margen', async () => {
      StorageEngine.updateSettings({ margenUtilidadDefault: 40 })
      const client = (await getClientsApi(0, 1)).items[0]

      const quote = await createQuoteApi({
        id_cliente: client.id_cliente,
        descuento: 0,
        detalles: [
          {
            id_detalle: 1,
            id_producto: 1,
            descripcion: 'Precio fijo del usuario',
            cantidad: 3,
            precio_unitario: 200000,
            descuento: 0,
            subtotal: 600000,
          },
        ],
      })

      expect(quote.detalles[0].precio_unitario).toBe(200000)
      expect(quote.subtotal).toBe(600000)
    })

    it('aplica el margen vigente al actualizar una cotización sin precio explícito', async () => {
      StorageEngine.updateSettings({ margenUtilidadDefault: 25 })
      const client = (await getClientsApi(0, 1)).items[0]

      const quote = await createQuoteApi({
        id_cliente: client.id_cliente,
        descuento: 0,
        detalles: [
          {
            id_detalle: 1,
            id_producto: 1,
            descripcion: 'Sin precio',
            cantidad: 1,
            precio_unitario: 0,
            descuento: 0,
            subtotal: 0,
          },
        ],
      })
      expect(quote.detalles[0].precio_unitario).toBe(Math.round(85000 * 1.25))

      const updated = await updateQuoteApi(quote.id_cotizacion, {
        detalles: [
          {
            id_detalle: 1,
            id_producto: 1,
            descripcion: 'Sin precio',
            cantidad: 4,
            precio_unitario: 0,
            descuento: 0,
            subtotal: 0,
          },
        ],
      })
      const expectedPrice = Math.round(85000 * 1.25)
      expect(updated.detalles[0].precio_unitario).toBe(expectedPrice)
      expect(updated.subtotal).toBe(expectedPrice * 4)
    })
  })

  describe('5. Catálogo inicial y restablecimiento', () => {
    it('debe reportar el catálogo inicial de productos y proveedores', async () => {
      const result = await loadInitialCatalogApi()
      expect(result.products).toBeGreaterThan(0)
      expect(result.providers).toBeGreaterThan(0)

      const settings = await getSettingsApi()
      expect(settings.catalogoInicialCargado).toBe(true)
    })

    it('debe restablecer los parámetros a los valores seed', async () => {
      await updateSettingsApi({ stockMinimoDefault: 99, margenUtilidadDefault: 80 })
      const reset = await resetSettingsApi()
      expect(reset.stockMinimoDefault).toBe(SEED_SETTINGS.stockMinimoDefault)
      expect(reset.margenUtilidadDefault).toBe(SEED_SETTINGS.margenUtilidadDefault)
    })
  })
})
