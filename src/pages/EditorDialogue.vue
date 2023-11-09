<template>
  <el-dialog :title="form.old_name" :before-close="cancelDialog" :visible.sync="dialogFormVisible" width="25%">
    <el-form :model="form">
      <el-form-item label="结点名称" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off" style="width: 90%;"></el-input>
      </el-form-item>
      <el-form-item label="前继结点" :label-width="formLabelWidth">
        <el-select v-model="valuePre" multiple placeholder="请选择">
          <el-option v-for="item in optionsPre" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="后续结点" :label-width="formLabelWidth">
        <el-select v-model="valueNext" multiple placeholder="请选择">
          <el-option v-for="item in optionsNext" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="相关结点" :label-width="formLabelWidth">
        <el-select v-model="valueRel" multiple placeholder="请选择">
          <el-option v-for="item in optionsRel" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="包含的知识点" :label-width="formLabelWidth" v-if="isShowCon">
        <el-select v-model="valueCon" multiple filterable allow-create default-first-option placeholder="请添加">
          <el-option v-for="item in optionsCon" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="所属专业" :label-width="formLabelWidth" v-if="isShowMajorAndCollege">
        <el-select v-model="valueMajor" placeholder="请选择">
          <el-option v-for="item in optionsMajor" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属学院" :label-width="formLabelWidth" v-if="isShowMajorAndCollege">
        <el-select v-model="valueCollege" placeholder="请选择">
          <el-option v-for="item in optionsCollege" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="结点描述" :label-width="formLabelWidth" v-if="!isShowMajorAndCollege">
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="请输入内容" v-model="text">
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-col :span="8">
        <el-button type="danger" class="delete" @click="handleDelete()" v-if="graphData.label != 'addNode'">删
          除</el-button>
      </el-col>
      <el-col :span="16">
        <el-button @click="cancelDialog()">取 消</el-button>
        <el-button type="primary" @click="confirmDialog()">确 定</el-button>
      </el-col>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios' //引入axios
export default {
  name: 'EditorDialogue',
  props: {
    graphData: {
      type: Object,
      default: () => { },
    },
    dialogFormVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: {
        id: '',
        course_id: '', //课程id（新增知识点时用）
        old_name: '', //当前结点的旧名称
        name: '', //当前结点的新名称
        pre: [],
        next: [],
        rel: [],
        college: "",
        major: "",
        text: "",
        // kenowlenges: [], //知识点
        // nodeType: '', //结点类型
      },
      formLabelWidth: '120px',

      //  相关结点多选框
      optionsRel: [],
      valueRel: [],

      //  前继结点多选框
      optionsPre: [],
      valuePre: [],

      //  后续结点多选框
      optionsNext: [],
      valueNext: [],

      //  课程所属专业单选
      optionsMajor: [],
      valueMajor: '',

      // 课程所属学院单选
      optionsCollege: [],
      valueCollege: '',

      text: '',
    }
  },
  methods: {
    cancelDialog() {
      this.$emit('update:dialogFormVisible', false)
      this.valuePre = []
      this.valueNext = []
      this.valueRel = []
      this.valueMajor = ''
      this.valueCollege = ''
    },
    confirmDialog() {
      this.$emit('update:dialogFormVisible', false)
      // debugger
      this.form.pre = this.valuePre ? this.valuePre.toString() : ''
      this.form.next = this.valueNext ? this.valueNext.toString() : ''
      this.form.rel = this.valueRel ? this.valueRel.toString() : ''
      this.form.major = this.valueMajor
      this.form.college = this.valueCollege

      this.form.text = this.text
      this.form.course_id = this.$store.state.courseId
      // console.log(this.form)
      if (this.graphData.label === 'addNode') {
        this.addNode()
      } else {
        this.updateNode()
      }
    },
    handleDelete() {
      let that = this
      let entity_id = this.graphData.id
      let query = {
        id: entity_id
      }
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post('http://172.20.106.58:3018/delete', query).then((res) => {
          // console.log(res)
          if (res.data == 1) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          }
          this.$store.commit('changeIsNodeChange', 'true')
          this.$emit('update:dialogFormVisible', false)
          let data = {}
          const BaseURL = 'http://172.20.106.58:3018/'
          if (that.$store.state.from === 'all') { // 删除结点后，重新渲染图
            axios.post(BaseURL + 'api/getAll', {}).then((res) => {
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
          } else if (that.$store.state.from === 'course') {
            axios.post(BaseURL + 'getKnowledge', {
              id: that.$store.state.courseId,
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
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    addNode() {
      const BaseURL = 'http://172.20.106.58:3018/'
      if (this.graphData.nodeType === 'course') {
        axios.post(BaseURL + 'addCourse', this.form).then((res) => {
          if (res.data == 1) {
            this.$message({
              type: 'success',
              message: '操作成功！'
            });
            this.$store.commit('changeIsNodeChange', 'true')
          }
        }).catch((err) => {
          console.log(err)
        })
      } else {
        // console.log(this.form)
        axios.post(BaseURL + 'addKnowledge', this.form).then((res) => {
          if (res.data == 1) {
            this.$message({
              type: 'success',
              message: '操作成功！'
            });
            this.$store.commit('changeIsNodeChange', 'true')
          }
        }
        ).catch((err) => {
          console.log(err)
        })
      }
    },
    updateNode() {
      const BaseURL = 'http://172.20.106.58:3018/'
      if (this.graphData.nodeType === 'course') {
        console.log(this.form)
        axios.post(BaseURL + 'updateCourse', this.form).then((res) => {
          if (res.data == 1) {
            this.$message({
              type: 'success',
              message: '操作成功！'
            });
            this.$store.commit('changeIsNodeChange', 'true')
          }
        }).catch((err) => {
          console.log(err)
        })
      } else {
        axios.post(BaseURL + 'updateKnowledge', this.form).then((res) => {
          if (res.data == 1) {
            this.$message({
              type: 'success',
              message: '操作成功！'
            });
            this.$store.commit('changeIsNodeChange', 'true')
          }
        }).catch((err) => {
          console.log(err)
        })
      }

    }
  },
  computed: {
    isShowMajorAndCollege() {
      return this.$store.state.nodeType === 'course'
    }
  },
  watch: {
    dialogFormVisible(val) {
      if (val) {
        this.form.old_name = this.graphData.name
        this.form.name = this.graphData.name
        this.form.id = this.graphData.id

        this.optionsRel = this.graphData.cand_rel
        this.optionsPre = this.graphData.cand_pre
        this.optionsNext = this.graphData.cand_next
        this.optionsMajor = this.graphData.cand_major
        this.optionsCollege = this.graphData.cand_college

        setTimeout(() => {
          if (this.graphData.nodeType === 'course') {
            this.valueRel = this.graphData.oldRelCourses
            this.valuePre = this.graphData.oldPreCourses
            this.valueNext = this.graphData.oldNextCourses
            this.valueMajor = this.graphData.oldMajor
            this.valueCollege = this.graphData.oldCollege
          } else if (this.graphData.nodeType === 'knowledge') {
            this.valueRel = this.graphData.oldRelKnowledges
            this.valuePre = this.graphData.oldPreKnowledges
            this.valueNext = this.graphData.oldNextKnowledges
            this.text = this.graphData.text
          }
        }, 100)

      } else {
        // console.log('对话框关闭')
      }
    },
  },
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
}

.delete {
  float: left;
}
</style>