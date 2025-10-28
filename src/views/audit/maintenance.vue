<template>
  <div class="audit-maintenance-page art-full-height">
    <el-card>
      <template #header>
        <h3 style="margin:0">Maintenance Audit</h3>
      </template>

      <el-row style="margin-top:12px">
        <el-col :span="24">
          <maintenance-stats />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MaintenanceStats from '@/components/audit/MaintenanceStats.vue'
// MaintenanceStats component fetches its own data
</script>

<style scoped>
.audit-maintenance-page { padding: 12px }
</style>
