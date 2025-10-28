<template>
  <ArtResultPage
    type="fail"
    title="Submission Failed"
    message="Please verify and modify the following information before resubmitting."
    iconCode="&#xe665;"
  >
    <template #content>
      <p>Your submission has the following errors:</p>
      <p><i class="icon iconfont-sys">&#xe71a;</i>Your account has been frozen</p>
      <p><i class="icon iconfont-sys">&#xe71a;</i>Your account is not yet eligible to apply</p>
    </template>
    <template #buttons>
      <el-button type="primary" v-ripple>Return to Edit</el-button>
      <el-button v-ripple>View</el-button>
    </template>
  </ArtResultPage>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ResultFail' })
</script>
