import { describe, expect, it } from 'vitest'
import { validateGeofenceForm } from './useGeofenceValidation'
import type { GeofenceFormModel } from '../interfaces/geofencing.interface'

const basePolygonForm = (): GeofenceFormModel => ({
  name: 'Test area',
  type: 'polygon',
  rule_type: 'allow',
  active: true,
  hysteresis_m: 10,
  polygonPoints: [
    { lng: 2.17, lat: 41.38 },
    { lng: 2.18, lat: 41.39 },
    { lng: 2.19, lat: 41.4 },
    { lng: 2.17, lat: 41.38 },
  ],
  center: { lat: null, lng: null },
  radius_m: null,
  scheduleEnabled: false,
  schedule: {
    timezone: 'Europe/Madrid',
    days: [1, 2],
    start: '08:00',
    end: '18:00',
  },
})

describe('validateGeofenceForm', () => {
  it('accepts valid polygon form', () => {
    const errors = validateGeofenceForm(basePolygonForm())
    expect(errors).toEqual({})
  })

  it('rejects polygon with less than 4 points', () => {
    const form = basePolygonForm()
    form.polygonPoints = [{ lng: 2.17, lat: 41.38 }, { lng: 2.18, lat: 41.39 }]
    const errors = validateGeofenceForm(form)
    expect(errors.polygonPoints).toBeTruthy()
  })

  it('rejects non-closed polygon ring', () => {
    const form = basePolygonForm()
    form.polygonPoints = [
      { lng: 2.17, lat: 41.38 },
      { lng: 2.18, lat: 41.39 },
      { lng: 2.19, lat: 41.4 },
      { lng: 2.2, lat: 41.41 },
    ]

    const errors = validateGeofenceForm(form)
    expect(errors.polygonPoints).toBeTruthy()
  })

  it('rejects invalid circle radius', () => {
    const form = basePolygonForm()
    form.type = 'circle'
    form.center = { lat: 41.38, lng: 2.17 }
    form.radius_m = 0
    const errors = validateGeofenceForm(form)
    expect(errors.radius_m).toBeTruthy()
  })
})
