<script setup lang="ts">
import { onMounted } from 'vue';

const makeDraggable = (el: HTMLElement) => {
  let startX = 0, startY = 0, originLeft = 0, originTop = 0
  let dragged = false

  el.style.cursor = 'grab'
  el.style.touchAction = 'none'

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

  const onMove = (e: PointerEvent) => {
    dragged = true
    const rect = el.getBoundingClientRect()
    const left = clamp(originLeft + (e.clientX - startX), 0, window.innerWidth - rect.width)
    const top = clamp(originTop + (e.clientY - startY), 0, window.innerHeight - rect.height)
    el.style.left = left + 'px'
    el.style.top = top + 'px'
    el.style.right = 'auto'
    el.style.bottom = 'auto'
  }

  const onUp = (e: PointerEvent) => {
    el.releasePointerCapture(e.pointerId)
    el.style.cursor = 'grab'
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onUp)
    // If it was just a tap (not a drag), let the click through
    if (!dragged) el.click()
  }

  el.addEventListener('pointerdown', (e: PointerEvent) => {
    dragged = false
    e.preventDefault()
    el.setPointerCapture(e.pointerId)
    const rect = el.getBoundingClientRect()
    startX = e.clientX
    startY = e.clientY
    originLeft = rect.left
    originTop = rect.top
    el.style.position = 'fixed'
    el.style.cursor = 'grabbing'
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
  })
}

const attachDragToUserWay = () => {
  const selectors = ['#userwayAccessibilityIcon', '[id^="userway"]', '[class*="userway"]']
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement | null
    if (el) { makeDraggable(el); return true }
  }
  return false
}

onMounted(() => {
  if (!document.getElementById('userway-widget-script')) {
    const script = document.createElement('script');
    script.id = 'userway-widget-script';
    script.src = 'https://cdn.userway.org/widget.js';
    script.setAttribute('data-account', 'k5lLyDk8Vk');
    script.async = true;
    document.body.appendChild(script);
  }

  if (!attachDragToUserWay()) {
    const observer = new MutationObserver(() => {
      if (attachDragToUserWay()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    setTimeout(() => observer.disconnect(), 15000)
  }
});
</script>

<template>
  <div class="app-theme">
    <router-view />
  </div>
</template>

<style scoped></style>
