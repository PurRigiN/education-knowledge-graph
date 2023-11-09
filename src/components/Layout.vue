<template>
  <el-container>
    <div class="flex-item1">
      <el-header>
        <secNavbar></secNavbar>
      </el-header>
    </div>
    <div class="flex-item2">
      <el-aside>
        <course-table></course-table>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </div>
  </el-container>
</template>

<script>
import secNavbar from '../pages/pubChildren/secNavbar.vue'
import CourseTable from '../pages/CourseTable.vue'
export default {
  components: { secNavbar, CourseTable },
  name: 'Layout',
}
</script>

<style scoped>
.el-container {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: wrap;
  align-content: center;
  /* background-color: #00367d; */
}

.flex-item1 {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  align-content: center;
  width: 100%;
  height: 35px;
  /* background-color: #b5d0f4; */
}

.el-header {
  flex: 1;
  width: 100%;
  /* background-color: rgb(155, 162, 164); */
}

.flex-item2 {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  align-content: center;
  width: 100%;
  /* background-color: #b5d0f4; */
}

.el-aside {
  color: #333;
  flex: 3;
  /* background-color: aqua; */
  height: 100%;
  padding: 5px;
}

.el-main {
  flex: 10;
  padding: 5px;
  /* background-color: antiquewhite; */
}
</style>