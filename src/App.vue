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
  <router-view />
</template>

<style scoped></style>
