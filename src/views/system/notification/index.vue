<template>
  <div class="notification-page art-full-height">
    <!-- 子路由渲染：例如 模版管理、记录查询 等 -->
    <RouterView />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Notification' })
</script>

<style lang="scss" scoped>
.notification-page {
  padding: 0;
}
</style>


