<template>
  <div class="card art-custom-card">
    <div class="card-header">
      <div class="title">
        <h4 class="box-title">Todo List</h4>
        <p class="subtitle">Pending <span class="text-danger">3</span></p>
      </div>
    </div>

    <div class="list">
      <div v-for="(item, index) in list" :key="index">
        <p class="title">{{ item.username }}</p>
        <p class="date subtitle">{{ item.date }}</p>
        <el-checkbox v-model="item.complate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue-demi'

  const list = reactive([
    {
      username: 'Review today\'s tasks',
      date: '09:30 AM',
      complate: true
    },
    {
      username: 'Reply to emails',
      date: '10:30 AM',
      complate: true
    },
    {
      username: 'Organize work report',
      date: '11:00 AM',
      complate: true
    },
    {
      username: 'Product requirements meeting',
      date: '02:00 PM',
      complate: false
    },
    {
      username: 'Summarize meeting notes',
      date: '03:30 PM',
      complate: false
    },
    {
      username: 'Plan tomorrow\'s tasks',
      date: '06:30 PM',
      complate: false
    }
  ])
</script>

<style lang="scss" scoped>
  .card {
    box-sizing: border-box;
    width: 100%;
    height: 510px;
    padding: 0 25px;

    .list {
      height: calc(100% - 90px);
      margin-top: 10px;
      overflow: hidden;

      > div {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 70px;
        overflow: hidden;
        border-bottom: 1px solid var(--art-border-color);

        p {
          font-size: 13px;
        }

        .title {
          font-size: 14px;
        }

        .date {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 400;
        }

        .el-checkbox {
          position: absolute;
          top: 0;
          right: 10px;
          bottom: 0;
          margin: auto;
        }
      }
    }
  }
</style>
