import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GeofenceEventBadge from './GeofenceEventBadge.vue'

describe('GeofenceEventBadge', () => {
  it('renders violation style', () => {
    const wrapper = mount(GeofenceEventBadge, {
      props: { eventType: 'violation' },
    })

    expect(wrapper.text()).toContain('violation')
    expect(wrapper.classes().join(' ')).toContain('text-red-700')
  })

  it('renders enter style', () => {
    const wrapper = mount(GeofenceEventBadge, {
      props: { eventType: 'enter' },
    })

    expect(wrapper.text()).toContain('enter')
    expect(wrapper.classes().join(' ')).toContain('text-green-700')
  })
})
