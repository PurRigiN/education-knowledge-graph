<template>
  <div class="secNavbar">
    <div class="title">{{ title }}</div>
    <!-- <div class="info">{{ info }}</div> -->
  </div>
</template>

<script>
  export default {
    name: 'secNavbar',
    data() {
      return {
        title: '教育知识图谱系统',
        // info: '选择任务输入文本并提交',
      }
    },
  }
</script>

<style scoped>
  .secNavbar {
    height: 30px;
    border-bottom: 2px solid #409eff; 
  }
  .title {
    margin-left: 50%;
    height: 100%;
    line-height: 30px;
    font-size: 25px;
    font-weight: bolder;
    display: inline-block;
    color: rgb(53, 54, 54);
  }
  .info {
    line-height: 70px;
    display: inline-block;
    margin-left: 20px;
  }
</style>