<template>
  <el-card>
    <h3 style="margin-bottom:8px">Borrow Request</h3>

    <el-form :model="form" label-width="140px">
      <el-form-item label="Device/Type">
        <el-input v-model="form.deviceType" placeholder="Device Type or Device ID"></el-input>
      </el-form-item>
      <el-form-item label="Applicant">
        <el-input v-model="form.user"></el-input>
      </el-form-item>
      <el-form-item label="Department">
        <el-input v-model="form.department"></el-input>
      </el-form-item>
      <el-form-item label="Expected Return">
        <el-date-picker v-model="form.expectedReturn" type="datetime" placeholder="Select Date Time"></el-date-picker>
      </el-form-item>
      <el-form-item label="Reason">
        <el-input type="textarea" v-model="form.reason"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">Submit Request</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { submitBorrowRequest } from '@/services/audit'

const form = reactive({ deviceType: '', user: '', department: '', expectedReturn: '', reason: '' })

const handleSubmit = async () => {
  const res = await submitBorrowRequest({ ...form, expectedReturn: form.expectedReturn as string })
  if (res.success) {
    // 简单提示
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ElMessage } = require('element-plus')
    ElMessage.success('Borrow request submitted successfully')
  }
}
</script>

<style scoped>
</style>
