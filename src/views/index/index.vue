<template>
  <div class="app-layout">
    <aside class="app-sidebar">
      <ArtSidebarMenu />
    </aside>

    <main id="app-main">
      <div class="app-header">
        <ArtHeaderBar />
      </div>
      <div class="app-content">
        <ArtPageContent />
      </div>
    </main>

    <div class="app-global">
      <ArtGlobalComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
  import ArtWebsocketStatusBar from '@/components/core/layouts/art-websocket-status-bar/index.vue'
  
  defineOptions({ name: 'AppLayout' })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
