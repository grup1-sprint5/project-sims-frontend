<script setup lang="ts">
import { onMounted } from 'vue';

const positionUserWay = (el: HTMLElement) => {
  const bottom = window.innerWidth >= 640 ? 88 : 144
  el.style.setProperty('position', 'fixed', 'important')
  el.style.setProperty('bottom', bottom + 'px', 'important')
  el.style.setProperty('right', '16px', 'important')
  el.style.setProperty('top', 'auto', 'important')
  el.style.setProperty('left', 'auto', 'important')
}

const applyUserWayPosition = () => {
  const selectors = ['#userwayAccessibilityIcon', '[id^="userway"]', '[class*="userway"]']
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement | null
    if (el) { positionUserWay(el); return true }
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

  if (!applyUserWayPosition()) {
    const observer = new MutationObserver(() => {
      if (applyUserWayPosition()) observer.disconnect()
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

<style>
/* Fallback CSS per si el JS no arriba a temps */
#userwayAccessibilityIcon,
[id^="userway"].uwy {
  position: fixed !important;
  bottom: 144px !important;
  right: 16px !important;
  top: auto !important;
  left: auto !important;
}

@media (min-width: 640px) {
  #userwayAccessibilityIcon,
  [id^="userway"].uwy {
    bottom: 88px !important;
  }
}
</style>
