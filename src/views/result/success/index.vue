<template>
  <ArtResultPage
    type="success"
    title="Submission Successful"
    message="The submission result page is used to provide feedback on the processing results of a series of operational tasks. If it is just a simple operation, use the Message global prompt for feedback. The gray area can display some supplementary information."
    iconCode="&#xe617;"
  >
    <template #content>
      <p>Application submitted, waiting for department review.</p>
    </template>
    <template #buttons>
      <el-button type="primary" v-ripple>Return to Edit</el-button>
      <el-button v-ripple>View</el-button>
      <el-button v-ripple>Print</el-button>
    </template>
  </ArtResultPage>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ResultSuccess' })
</script>
