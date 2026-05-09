<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  if (!document.getElementById('userway-widget-script')) {
    const script = document.createElement('script');
    script.id = 'userway-widget-script';
    script.src = 'https://cdn.userway.org/widget.js';
    script.setAttribute('data-account', 'k5lLyDk8Vk');
    script.async = true;
    document.body.appendChild(script);
  }
});
</script>

<template>
  <div class="app-theme">
    <router-view />
  </div>
</template>

<!-- Posiciona el contenidor extern de UserWay (.uwy) sobre el chatbot -->
<style>
.uwy {
  bottom: 144px !important;
  right: 16px !important;
  left: auto !important;
  top: auto !important;
}

@media (min-width: 640px) {
  .uwy {
    bottom: 88px !important;
  }
}
</style>
