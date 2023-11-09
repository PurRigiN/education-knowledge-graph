<template>
    <el-card shadow="always" class="left-table-card">
        <EditorDialogue :graphData="graphData" :dialogFormVisible.sync="dialogFormVisible"></EditorDialogue>
        <el-table :data="tableData.filter(
            (data) =>
                !search ||
                data.name.toLowerCase().includes(search.toLowerCase())
        )
            " style="height: 700px" max-height="650px">
            <el-table-column fixed label="课程" prop="name">
                <template slot-scope="scope">
                    <a @click="clickCourse(scope.row)" style="color: rgb(0, 166, 255); cursor: pointer">{{ scope.row.name
                    }}</a>
                </template>
            </el-table-column>
            <el-table-column label="专业" prop="major"> </el-table-column>
            <el-table-column label="学院" prop="college"> </el-table-column>
            <el-table-column align="right">
                <template slot="header" slot-scope="scope">
                    <el-input v-model="search" size="mini" placeholder="输入关键字搜索" />
                </template>
                <template slot-scope="scope">
                    <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button type="primary" @click="openDialog()" icon="el-icon-plus" style="width: 100%">添加课程</el-button>
        <hr />
        <el-button @click="showAll" class="showall-button" icon="el-icon-picture-outline-round" type="success"
            round>完整图谱</el-button>
    </el-card>
</template>

<script>
import EditorDialogue from './EditorDialogue.vue'
export default {
    name: 'CourseTable',
    components: {
        EditorDialogue,
    },
    data() {
        return {
            tableData: [],
            search: '',
            dialogFormVisible: false, //编辑对话框是否可见
            graphData: {},
            newNodeData: {
                name: '新课程结点',
                categorie: 0,
                cand_pre: [], //候选前驱
                cand_next: [],
                cand_rel: [],
                cand_major: [],
                cand_college: [],
                // knowledge: [], //知识点
                nodeType: 'course',
                label: 'addNode'
            }
        }
    },
    methods: {
        getAllCourses() {
            this.$axios.post('/api/getCourses').then((res) => {
                let courses = res.data['nodes']
                this.$set(this, 'tableData', courses)
                // this.tableData = courses
            })
        },
        handleDelete(index, row) {
            // console.log(index, row)
            let course_id = row.id
            let query = {
                id: course_id
            }
            this.$confirm('确认删除?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$axios.post('/api/delete', query).then((res) => {
                    // console.log(res)
                    if (res.data == 1) {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.$store.commit('changeIsNodeChange', true)
                    }
                    this.getAllCourses()
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        clickCourse(row) {
            // console.log(row)
            this.$store.commit('changeFrom', 'course')
            this.$store.commit('changeNodeType', 'knowledge')
            this.$store.commit('changeCourseId', row.id)
            let data = {}
            this.$axios.post('/api/getKnowledge', {
                id: row.id,
            }).then((res) => {
                // console.log(res.data)
                data = res.data
                data.categories.forEach((item) => {
                    //设置节点样式
                    if (item.name == '课程') {
                        //课程结点样式
                        item.symbol = 'circle'
                        item.symbolSize = 70
                    } else if (item.name == '知识点') {
                        //知识点结点样式
                        item.symbol = 'circle'
                        item.symbolSize = [70, 50]
                    }
                })
                data.links.forEach((item) => {
                    //设置边的样式
                    if (item.type === 'relevant') {
                        item.symbol = ['none', 'none']
                    } else {
                        item.symbol = ['none', 'arrow']
                    }
                })
                this.$store.commit('changeGraphRenderData', data)

            })
        },
        showAll() {
            this.$store.commit('changeFrom', 'all')
            let data = {}
            this.$axios.post('/api/api/getAll', {}).then((res) => {
                // console.log(res.data)
                data = res.data
                data.categories.forEach((item) => {
                    //设置节点样式
                    if (item.name == '课程') {
                        //课程结点样式
                        item.symbol = 'circle'
                        item.symbolSize = 70
                    } else if (item.name == '知识点') {
                        //知识点结点样式
                        item.symbol = 'circle'
                        item.symbolSize = [70, 50]
                    }
                })
                data.links.forEach((item) => {
                    //设置边的样式
                    if (item.type === 'relevant') {
                        item.symbol = ['none', 'none']
                    } else {
                        item.symbol = ['none', 'arrow']
                    }
                })
                this.$store.commit('changeGraphRenderData', data)
            })
        },
        openDialog() {
            this.addCourse()
            this.graphData = this.newNodeData
            this.dialogFormVisible = true
            this.$store.commit('changeNodeType', 'course')
        },
        addCourse() {
            // console.log(this.tableData)
            this.tableData.forEach((item) => {
                this.newNodeData.cand_pre.push({ 'value': item.id, 'label': item.name })
                this.newNodeData.cand_next.push({ 'value': item.id, 'label': item.name })
                this.newNodeData.cand_rel.push({ 'value': item.id, 'label': item.name })
                this.newNodeData.cand_major.push({ 'value': item.major, 'label': item.major })
                this.newNodeData.cand_college.push({ 'value': item.college, 'label': item.college })
            })
            this.newNodeData.cand_pre = this.uniqueByFilter(this.newNodeData.cand_pre, 'value')
            this.newNodeData.cand_next = this.uniqueByFilter(this.newNodeData.cand_next, 'value')
            this.newNodeData.cand_rel = this.uniqueByFilter(this.newNodeData.cand_rel, 'value')
            this.newNodeData.cand_major = this.uniqueByFilter(this.newNodeData.cand_major, 'value')
            this.newNodeData.cand_college = this.uniqueByFilter(this.newNodeData.cand_college, 'value')
            // console.log(this.newNodeData)
        },
        uniqueByFilter(arr, key) { // 去重函数
            let map = new Map() // 创建一个空的 Map 对象
            return arr.filter(item => { // 使用 filter 方法遍历对象数组
                if (map.has(item[key])) { // 判断对象的某个属性是否已经在 Map 中存在
                    return false // 如果已经存在，返回 false，表示删除该对象
                } else {
                    map.set(item[key], true) // 如果不存在，将该对象加入到 Map 中，并返回 true，表示保留该对象
                    return true
                }
            })
        }
    },
    mounted() {
        this.getAllCourses()
        this.showAll()
    },
    watch: {
        '$store.state.isNodeChange'(val) {
            if (val && this.$store.state.from == 'course') {
                this.clickCourse({ 'id': this.$store.state.courseId })
                this.$store.commit('changeIsNodeChange', false)
            }else if(val && (this.$store.state.from == 'all' || this.$store.state.from == 'search')){
                this.showAll()
                this.getAllCourses()
                this.$store.commit('changeIsNodeChange', false)
            }
        }
    }
}
</script>

<style scoped>
.left-table-card {
    height: 900px;
    width: 99%;
    /* padding-bottom: 5px; */
}

.showall-button {
    width: 50%;
    margin-top: 25px;
    height: 45px;
    margin-left: 25%;
}
</style>