import type { GeofenceFormModel, GeofenceValidationErrors } from '../interfaces/geofencing.interface'
import { useI18n } from '@/i18n'

const DAYS = [1, 2, 3, 4, 5, 6, 7]

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isValidLat = (value: number) => value >= -90 && value <= 90
const isValidLng = (value: number) => value >= -180 && value <= 180

export function validateGeofenceForm(form: GeofenceFormModel): GeofenceValidationErrors {
  const { m } = useI18n()
  const errors: GeofenceValidationErrors = {}

  if (!form.name.trim()) {
    errors.name = m.value.adminGeofenceValidationUi.nameRequired
  }

  if (!isFiniteNumber(form.hysteresis_m) || form.hysteresis_m < 0) {
    errors.hysteresis_m = m.value.adminGeofenceValidationUi.hysteresisInvalid
  }

  if (form.type === 'polygon') {
    const normalizedPoints = form.polygonPoints
      .filter((point) => isFiniteNumber(point.lng) && isFiniteNumber(point.lat))
      .map((point) => ({ lng: point.lng as number, lat: point.lat as number }))

    if (normalizedPoints.length < 4) {
      errors.polygonPoints = m.value.adminGeofenceValidationUi.polygonMinPoints
    }

    const firstPoint = normalizedPoints[0]
    const lastPoint = normalizedPoints[normalizedPoints.length - 1]
    const isClosed =
      firstPoint !== undefined &&
      lastPoint !== undefined &&
      firstPoint.lng === lastPoint.lng &&
      firstPoint.lat === lastPoint.lat

    if (normalizedPoints.length >= 4 && !isClosed) {
      errors.polygonPoints = m.value.adminGeofenceValidationUi.polygonNotClosed
    }

    const hasInvalidRange = normalizedPoints.some((point) => !isValidLng(point.lng) || !isValidLat(point.lat))
    if (hasInvalidRange) {
      errors.polygonPoints = m.value.adminGeofenceValidationUi.polygonRangeInvalid
    }
  }

  if (form.type === 'circle') {
    if (!isFiniteNumber(form.center.lat) || !isFiniteNumber(form.center.lng)) {
      errors.center = m.value.adminGeofenceValidationUi.centerRequired
    } else if (!isValidLat(form.center.lat) || !isValidLng(form.center.lng)) {
      errors.center = m.value.adminGeofenceValidationUi.centerRangeInvalid
    }

    if (!isFiniteNumber(form.radius_m) || form.radius_m <= 0) {
      errors.radius_m = m.value.adminGeofenceValidationUi.radiusInvalid
    }
  }

  if (form.scheduleEnabled) {
    const hasTimezone = Boolean(form.schedule.timezone?.trim())
    const hasDays = form.schedule.days.length > 0 && form.schedule.days.every((day) => DAYS.includes(day))
    const hasStart = /^\d{2}:\d{2}$/.test(form.schedule.start)
    const hasEnd = /^\d{2}:\d{2}$/.test(form.schedule.end)

    if (!hasTimezone || !hasDays || !hasStart || !hasEnd) {
      errors.schedule = m.value.adminGeofenceValidationUi.scheduleInvalid
    }
  }

  return errors
}

export function hasValidationErrors(errors: GeofenceValidationErrors): boolean {
  return Object.values(errors).some(Boolean)
}
