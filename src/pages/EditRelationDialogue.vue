<template>
  <el-dialog title="编辑关系" :before-close="cancelDialog" :visible.sync="editRelationFormVisible" width="25%">
    <el-form :model="form">
      <el-form-item label="头结点" :label-width="formLabelWidth">
        <el-input v-model="form.node1.name" autocomplete="off" style="width: 90%;" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="可选关系" :label-width="formLabelWidth">
        <template slot="label">
          <span>可选关系
            <el-tooltip class="item" effect="dark" content="留空表示设置为“无关系”" placement="left">
              <i class="el-icon-question" style="font-size: 16px; vertical-align: middle;"></i>
            </el-tooltip>
          </span>
        </template>
        <el-select v-model="selected_relation" clearable placeholder="请选择">
          <el-option v-for="item in acceptable_relation" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="尾结点" :label-width="formLabelWidth">
        <el-input v-model="form.node2.name" autocomplete="off" style="width: 90%;" :disabled="true"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-col :span="8">
        <el-button type="primary" class="switch-button" @click="handleSwitch()">交换节点</el-button>
      </el-col>
      <el-col :span="16">
        <el-button @click="cancelDialog()">取 消</el-button>
        <el-button type="success" @click="confirmDialog()">确 定</el-button>
      </el-col>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'EditRelationDialogue',
  props: {
    editRelationFormVisible: {
      type: Boolean,
      default: false,
    },
    in_node1: {
      type: Object,
      default: () => { }
    },
    in_node2: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      form: {
        node1: {
          category: 0,
          id: '',
          name: '',
          text: '',
        },
        node2: {
          category: 0,
          id: '',
          name: '',
          text: '',
        },
      },
      formLabelWidth: '120px',

      selected_relation: '', //选择的关系
    }
  },
  methods: {
    handleSwitch() {
      let temp = this.form.node1;
      this.form.node1 = this.form.node2;
      this.form.node2 = temp;
    },
    cancelDialog() {
      this.$emit('update:editRelationFormVisible', false);
    },
    confirmDialog() {
      let fromData = {
        "head_key": this.form.node1.id,
        "tail_key": this.form.node2.id,
        "edge_type": "",
      }
      let changeRelMessage = `确认将节点 \"${this.form.node1.name}\" 与\
        节点 \"${this.form.node2.name}\" 的关系设置为 \"${this.selected_relation ? this.selected_relation : "无关系"}\" ?`;
      this.$confirm(changeRelMessage, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let edge_type = "";
        console.log("selected_relation: ", this.selected_relation);
        if (this.selected_relation == "前继关系")
          edge_type = "precede";
        else if (this.selected_relation == "相关关系")
          edge_type = "relevant";
        else if (this.selected_relation == "包含关系")
          edge_type = "include";
        else if (this.selected_relation == '')
          edge_type = '';
        else  // 未选择关系
          edge_type = '';

        fromData.edge_type = edge_type;
        // post
        this.$axios.post("/api/modifyEdge", fromData).then((res) => {
          // Refresh the graph
          this.$store.commit('changeIsNodeChange', 'true')
        })
      }).catch((err) => {
        console.log(err)
      });
      this.$emit('update:editRelationFormVisible', false);
    },
  },
  computed: {
    acceptable_relation() {
      // 在node1 node2变化同时，返回不同的可选关系列表
      let relations = [];
      if (this.form.node1.id == '' || this.form.node2.id == '')
        return relations;
      if (this.form.node1.category == 0) {
        if (this.form.node2.category == 0) {
          relations = ["前继关系", "相关关系"]
        } else {
          relations = ["包含关系"]
        }
      } else {
        if (this.form.node2.category == 0) {
          relations = ["包含关系"]
        } else {
          relations = ["前继关系", "相关关系"]
        }
      }
      return relations;
    }
  },
  watch: {
    editRelationFormVisible(newVal, oldVal) {
      if (newVal === true) {
        // 在变为可视时
        // 将传入的节点信息赋值给子组件的node
        this.form.node1 = this.in_node1;
        this.form.node2 = this.in_node2;
      } else {
        this.form.node1 = {
          category: 0,
          id: '',
          name: '',
          text: '',
        };
        this.form.node2 = {
          category: 0,
          id: '',
          name: '',
          text: '',
        };
      }
    }
  }
}
</script>
  
<style scoped>
.dialog-footer {
  display: flex;
}

.switch-button {
  float: left;
}

.item {
  margin: 4px;
}
</style>