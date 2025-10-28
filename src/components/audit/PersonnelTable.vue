<template>
  <el-card>
    <el-table :data="personnel" stripe style="width:100%">
      <el-table-column prop="user" label="User" width="160" />
      <el-table-column prop="department" label="Department" width="140" />
      <el-table-column prop="borrowCount" label="Borrow Count" width="120" />
      <el-table-column prop="overdueCount" label="Overdue Count" width="120" />
      <el-table-column prop="lastBorrow" label="Last Borrow" width="180">
        <template #default="{ row }">{{ formatDate(row.lastBorrow) }}</template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import type { Ref } from 'vue'

const props = defineProps<{ personnel: Array<any> }>()

const formatDate = (t?: string) => (t ? format(new Date(t), 'yyyy-MM-dd HH:mm') : '-')
</script>

<style scoped>
.el-card { padding: 8px }
</style>
