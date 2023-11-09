<template>
  <el-card shadow="always" style="width: 99%; height: 99%">
    <EditorDialogue :graphData="graphData" :dialogFormVisible.sync="dialogFormVisible"></EditorDialogue>
    <el-row v-if="$store.state.from === 'all' || this.$store.state.from === 'search'" :gutter="20">
      <el-col :span="3"><el-button type="primary">查询条件<i class="el-icon-caret-right"></i></el-button></el-col>
      <el-col :span="6">
        <el-input placeholder="请输入查询条件" v-model="input">
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>
      </el-col>
      <el-col :span="3"><el-button type="primary">查询深度<i class="el-icon-caret-right"></i></el-button></el-col>
      <el-col :span="6">
        <el-select v-model="value" style="width: 250px" placeholder="请选择">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option> </el-select></el-col>
      <el-col :span="6"><el-button type="primary" icon="el-icon-search" @click="search()">确认查询</el-button></el-col>
    </el-row>
    <el-row v-if="isShowAdd">
      <el-col :span="22">
        <el-button type="warning">知识点编辑<i class="el-icon-caret-right"></i></el-button>
      </el-col>
      <el-col :span="2">
        <el-button plain type="success" icon="el-icon-plus" @click="addKnowledge()">新增知识</el-button>
      </el-col>
    </el-row>
    <br />
    <div id="main" style="width: 100%; height: 800px"></div>
  </el-card>
</template>

<script>
import axios from 'axios' //引入axios
import * as echarts from 'echarts' //引入echarts 5.4.2版本
import EditorDialogue from './EditorDialogue.vue'
export default {
  components: {
    EditorDialogue,
  },
  name: 'JYKG',
  data() {
    return {
      input: '', //查询条件文本
      options: [
        //查询深度选项
        {
          value: '1',
          label: '1',
        },
        {
          value: '2',
          label: '2',
        },
        {
          value: '3',
          label: '3',
        },
        {
          value: '4',
          label: '4',
        },
        {
          value: '5',
          label: '5',
        },
      ],
      value: '', //查询深度
      dialogFormVisible: false, //编辑对话框是否可见
      graphData: {},
      isGraphShow: false,
      newNodeData: {
        name: '新知识点结点',
        text: '',
        cand_pre: [], //候选前驱
        cand_next: [],
        cand_rel: [],
        course_id: '',
        nodeType: 'knowledge',
        label: 'addNode'// 用于区分是新增结点还是编辑结点
      },
      myChart: null,
      click_set: new Set()
    }
  },
  methods: {
    get_search_res() {
      //查询按钮点击事件(获取查询结果)
      let that = this
      let query_data = {
        //查询请求数据
        query: this.input,
        depth: +this.value,
      }
      //获取echarts实例
      let myChart = echarts.getInstanceByDom(document.getElementById('main'))
      if (myChart == null) {
        // 如果没有实例化则实例化
        myChart = echarts.init(document.getElementById('main'))
      }
      let data = {} //查询结果数据
      myChart.showLoading()
      // 根据查询条件和查询深度发送查询请求
      axios.post('http://172.20.106.58:3017/query', query_data).then(
        (res) => {
          // console.log(res.data)
          data = res.data
          if (data.error_code) {
            //如果查询出错
            alert(data.msg) //弹出错误信息
            return
          }
          data.categories.forEach((item) => {
            //设置节点样式
            if (item.name == '个人' || item.name == '机构') {
              //个人和机构节点样式
              item.symbol = 'rect'
              item.symbolSize = [60, 50]
            } else if (/.*案件$/.test(item.name)) {
              //案件节点样式
              item.symbol = 'circle'
              item.symbolSize = 70
            }
          })
          let option = {
            //设置echarts配置
            title: {
              text: '知识图谱',
              top: 'bottom',
              left: 'right',
            },
            legend: [
              {
                data: data.categories.map(function (a) {
                  //设置图例
                  return a.name
                }),
              },
            ],
            animationDurationUpdate: 2000,
            animationEasingUpdate: 'quinticInOut',
            series: [
              {
                // name: '知识图谱',
                type: 'graph',
                layout: 'force', //布局
                data: data.nodes, //节点数据
                links: data.links, //边数据
                categories: data.categories, //节点类别
                force: {
                  // fixed: true,
                  initLayout: 'circular',
                  repulsion: 2000,
                  gravity: 0.1,
                  // layoutAnimation: false,
                  draggable: true,
                  friction: 0.1,
                },
                roam: true,
                label: {
                  show: true,
                  // position: 'right',
                  fontSize: 15,
                  fontWeight: 'bold',
                  formatter: '{b}',
                },
                lineStyle: {
                  color: 'source',
                  curveness: 0,
                  opacity: 0.9,
                  width: 2,
                },
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: [10, 10],
                edgeLabel: {
                  show: true,
                  fontSize: 12,
                  formatter: (params) => {
                    //设置边标签
                    // console.log(params)
                    let regex = /^case/
                    // console.log(params)
                    if (regex.test(params.data.source)) {
                      //如果边的起点是案件节点
                      return '被申请'
                    } else {
                      return '申请'
                    }
                  },
                },
                autoCurveness: true,
                emphasis: {
                  focus: 'adjacency',
                  label: {
                    fontSize: 20,
                  },
                  lineStyle: {
                    width: 5,
                  },
                },
              },
            ],
            tooltip: {
              trigger: 'item',
              enterable: true,
              formatter: function (params) {
                //设置提示框
                let category_dic = {
                  //节点类别字典
                  0: '个人',
                  1: '机构',
                  2: '借贷案件',
                  3: '工伤案件',
                  4: '刑事案件',
                }
                let state_dic = {
                  //案件状态字典
                  0: '执行中',
                  1: '已结案',
                }
                let sub_obj_dic = {
                  //申请人/被申请人字典
                  0: '申请人',
                  1: '被申请人',
                  2: '申请人/被申请人',
                }
                // console.log(params)
                if (params.dataType == 'node') {
                  //如果是节点
                  if (params.data.category == 0 || params.data.category == 1) {
                    //如果是个人或机构节点
                    let content =
                      //设置提示框内容
                      `
                                姓名：${params.data.name}
                                <br/>
                                类型：${category_dic[params.data.category] +
                      '（' +
                      sub_obj_dic[params.data.sub_obj] +
                      '）'
                      }
                                <br/>
                                身份证号：${params.data.id_card}
                                <br/>
                                单位名称：${params.data.company}
                                <br/>
                                社会信用代码：${params.data.social_credit_code}
                                <br/>`
                    return content
                  } else {
                    //如果是案件节点
                    let abstract = params.data.abstract
                    if (abstract.length > 20) {
                      abstract = abstract.slice(0, 20) + '...'
                    }
                    let content =
                      //设置提示框内容
                      `
                                案件名称：${params.data.name}
                                <br/>
                                类型：${category_dic[params.data.category]}
                                <br/>
                                简介：${abstract}
                                <br/>
                                时间：${params.data.time}
                                <br/>
                                状态：${state_dic[params.data.state]}
                                <br/>`
                    return content
                  }
                } else {
                  //如果是边
                  return
                }
              },
            },
          }
          myChart.hideLoading()
          myChart.setOption(option)
          that.isGraphShow = true
        },
        (err) => {
          console.log(err)
        }
      )
      // 监听点击事件
      let click_set = new Set() // 用于记录点击过的结点
      myChart.off('click') //取消之前的监听事件
      myChart.on('click', function (params) {
        if (params.dataType == 'edge') {
          //如果点击的是边 则不做任何操作
          return
        }
        let query_data = {
          //设置查询参数
          id: params.data.id,
        }
        // 根据点击的结点id查询与之相关的结点和边
        axios.post('http://172.20.106.58:3017/id', query_data).then(
          (res) => {
            if (click_set.has(params.data.id)) {
              //如果点击过该结点 则删除与该结点相关并且与其他结点无关的边和结点
              res.data.nodes.forEach((node) => {
                //删除与该结点相关的边
                for (let link of data.links) {
                  if (
                    (link.source == node.id && link.target == params.data.id) ||
                    (link.target == node.id && link.source == params.data.id)
                  ) {
                    let index = data.links.indexOf(link)
                    if (index > -1) {
                      data.links.splice(index, 1)
                    }
                  }
                }
              })
              res.data.nodes.forEach((node) => {
                //删除与该结点相关的结点 且不与其他结点相关的结点
                let delete_flag = true //用于判断是否删除该结点
                data.links.forEach((link) => {
                  //遍历所有边
                  if (link.source == node.id || link.target == node.id) {
                    //如果该结点与其他结点有关联 则不删除
                    delete_flag = false
                  }
                })
                if (delete_flag && node.id != params.data.id) {
                  //如果该结点与其他结点无关联且不是点击的结点 则删除
                  data.nodes = data.nodes.filter((obj) => obj.id !== node.id)
                }
              })
              myChart.setOption({
                series: [
                  {
                    data: data.nodes,
                    links: data.links,
                  },
                ],
              })
              // 完成删除后，将该结点从click_set中删除
              click_set.delete(params.data.id)
              return
            }
            // 如果没有点击过该结点 则将与该结点相关的结点和边添加到data中
            res.data.nodes.forEach((node) => {
              //添加结点
              if (data.nodes.findIndex((item) => item.id == node.id) == -1) {
                data.nodes.push(node)
              }
            })

            if (!data.hasOwnProperty('links')) {
              data.links = []
            }

            res.data.links.forEach((link) => {
              //添加边
              if (
                JSON.stringify(data.links).indexOf(JSON.stringify(link)) == -1
              ) {
                data.links.push(link)
              }
            })
            // 将该结点添加到click_set中
            click_set.add(params.data.id)
            myChart.setOption({
              series: [
                {
                  data: data.nodes,
                  links: data.links,
                },
              ],
            })
          },
          (err) => {
            console.log(err)
          }
        )
      })
      myChart.on('contextmenu', function (params) {
        params.event.event.preventDefault() // 阻止默认的右键菜单
        if (params.dataType == 'edge') {
          //如果点击的是边 则不做任何操作
          return
        }
        that.openDialog(params)
      })
    },
    openDialog(params) { // 右键监听事件
      this.graphData = params.data
      let nodeTypeMap = {
        0: 'course',
        1: 'knowledge'
      }
      let nodeType = nodeTypeMap[params.data.category]
      // console.log(params.data)
      if (nodeType === 'course') {
        this.$store.commit('changeNodeType', 'course')
        this.dialogFormVisible = true
        // console.log(this.$store.state.graphRenderData)
        let otherAllCourses = this.$store.state.graphRenderData.nodes.filter(node => node.category === 0 && node.id !== params.data.id)
        let candCourses = otherAllCourses.map(course => {
          return {
            value: course.id,
            label: course.name
          }
        })
        this.graphData.cand_pre = candCourses
        this.graphData.cand_next = candCourses
        this.graphData.cand_rel = candCourses
        this.graphData.cand_major = this.$store.state.graphRenderData.majors.map(major => {
          return {
            value: major,
            label: major
          }
        })
        this.graphData.cand_college = this.$store.state.graphRenderData.colleges.map(college => {
          return {
            value: college,
            label: college
          }
        })
        // console.log(candMajor)

        // console.log(this.graphData)
        // console.log(otherAllCourses)
        let oldMajor = params.data.major
        let oldCollege = params.data.college

        let query_data = {
          //设置查询参数
          id: params.data.id,
        }
        axios.post('http://172.20.106.58:3018/getNeighbour', query_data).then(
          (res) => {
            // console.log(res.data)
            let oldPreCoursesId = res.data.links.filter(link => link.source === params.data.id && link.type === 'precede').map(link => link.target)
            let oldNextCoursesId = res.data.links.filter(link => link.target === params.data.id && link.type === 'precede').map(link => link.source)
            let oldRelCoursesId1 = res.data.links.filter(link => link.source === params.data.id && link.type === 'relevant').map(link => link.target)
            let oldRelCoursesId2 = res.data.links.filter(link => link.target === params.data.id && link.type === 'relevant').map(link => link.source)
            let oldRelCoursesId = [...oldRelCoursesId1, ...oldRelCoursesId2]

            // console.log(oldPreCoursesId)
            // console.log(oldNextCoursesId)
            // console.log(oldRelCoursesId)

            let oldPreCourses = res.data.nodes.filter(node => oldPreCoursesId.includes(node.id)).map(node =>
              node.id)
            // console.log(oldPreCourses)
            let oldNextCourses = res.data.nodes.filter(node => oldNextCoursesId.includes(node.id)).map(node =>
              node.id,
            )
            let oldRelCourses = res.data.nodes.filter(node => oldRelCoursesId.includes(node.id)).map(node => node.id,
            )

            this.graphData.oldPreCourses = oldPreCourses
            this.graphData.oldNextCourses = oldNextCourses
            this.graphData.oldRelCourses = oldRelCourses

            this.graphData.label = 'editNode'
            this.graphData.nodeType = 'course'
          },
          (err) => {
            console.log(err)
          }
        )


        this.graphData.oldMajor = oldMajor
        this.graphData.oldCollege = oldCollege
        // this.graphData.oldPreCourses = oldPreCourses
        // this.graphData.oldNextCourses = oldNextCourses
        // // console.log(oldNextCourses)
        // this.graphData.oldRelCourses = oldRelCourses

      } else if (nodeType === 'knowledge') {
        this.$store.commit('changeNodeType', 'knowledge')
        if (this.$store.state.from === 'course') {
          this.dialogFormVisible = true
          let otherAllKnowledge = this.$store.state.graphRenderData.nodes.filter(node => node.category === 1 && node.id !== params.data.id)
          let candKnowledge = otherAllKnowledge.map(knowledge => {
            return {
              value: knowledge.id,
              label: knowledge.name
            }
          })
          this.graphData.cand_pre = candKnowledge
          this.graphData.cand_next = candKnowledge
          this.graphData.cand_rel = candKnowledge

          this.graphData.text = params.data.text
          let query_data = {
            //设置查询参数
            id: params.data.id,
          }
          axios.post('http://172.20.106.58:3018/getNeighbour', query_data).then(
            (res) => {
              // console.log(res.data)
              let oldPreKnowledgeId = res.data.links.filter(link => link.source === params.data.id && link.type === 'precede').map(link => link.target)
              let oldNextKnowledgeId = res.data.links.filter(link => link.target === params.data.id && link.type === 'precede').map(link => link.source)
              let oldRelKnowledgeId1 = res.data.links.filter(link => link.source === params.data.id && link.type === 'relevant').map(link => link.target)
              let oldRelKnowledgeId2 = res.data.links.filter(link => link.target === params.data.id && link.type === 'relevant').map(link => link.source)
              let oldRelKnowledgeId = [...oldRelKnowledgeId1, ...oldRelKnowledgeId2]

              // console.log(oldPreKnowledgeId)
              // console.log(oldNextKnowledgeId)
              // console.log(oldRelKnowledgeId)

              let oldPreKnowledges = res.data.nodes.filter(node => oldPreKnowledgeId.includes(node.id)).map(node =>
                node.id)
              // console.log(oldPreKnowledge)
              let oldNextKnowledges = res.data.nodes.filter(node => oldNextKnowledgeId.includes(node.id)).map(node =>
                node.id,
              )
              let oldRelKnowledges = res.data.nodes.filter(node => oldRelKnowledgeId.includes(node.id)).map(node => node.id,
              )

              this.graphData.oldPreKnowledges = oldPreKnowledges
              this.graphData.oldNextKnowledges = oldNextKnowledges
              this.graphData.oldRelKnowledges = oldRelKnowledges

              this.graphData.label = 'editNode'
              this.graphData.nodeType = 'knowledge'
            },
            (err) => {
              console.log(err)
            }
          )
        }
      } else {
        this.$store.commit('changeNodeType', 'unknown')
      }
      // console.log(params.data)
    },
    addKnowledge() {
      // 新增知识点
      let knowledgeData = this.$store.state.graphRenderData
      // console.log(knowledgeData)
      knowledgeData.nodes.forEach((item) => {
        this.newNodeData.cand_pre.push({ 'value': item.id, 'label': item.name })
        this.newNodeData.cand_next.push({ 'value': item.id, 'label': item.name })
        this.newNodeData.cand_rel.push({ 'value': item.id, 'label': item.name })
      })
      this.newNodeData.course_id = this.$store.state.courseId
      this.graphData = this.newNodeData
      this.dialogFormVisible = true
      this.newNodeData = {
        name: '新知识点结点',
        text: '',
        cand_pre: [], //候选前驱
        cand_next: [],
        cand_rel: [],
        course_id: '',
        nodeType: 'knowledge',
        label: 'addNode'// 用于区分是新增结点还是编辑结点
      }
    },
    renderGraph() {
      let that = this
      this.myChart = echarts.getInstanceByDom(document.getElementById('main'))
      if (this.myChart == null) {
        // 如果没有实例化则实例化
        this.myChart = echarts.init(document.getElementById('main'))
      }
      this.myChart.showLoading()
      let data = this.$store.state.graphRenderData
      // console.log(data)
      let option = {
        //设置echarts配置
        title: {
          text: '知识图谱',
          top: 'bottom',
          left: 'right',
        },
        legend: [
          {
            data: data.categories.map(function (a) {
              //设置图例
              return a.name
            }),
          },
        ],
        animationDurationUpdate: 2000,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            // name: '知识图谱',
            type: 'graph',
            layout: 'force', //布局
            data: data.nodes, //节点数据
            links: data.links, //边数据
            categories: data.categories, //节点类别
            force: {
              // fixed: true,
              initLayout: 'circular',
              repulsion: 2000,
              gravity: 0.1,
              // layoutAnimation: false,
              draggable: true,
              friction: 0.1,
            },
            roam: true,
            label: {
              show: true,
              // position: 'right',
              fontSize: 15,
              fontWeight: 'bold',
              formatter: (params) => {
                // console.log(params.data)
                let node = params.data
                if (node.name.length > 3) {
                  return node.name.slice(0, 3) + '...'
                } else {
                  return node.name
                }
              },
            },
            lineStyle: {
              color: 'source',
              curveness: 0,
              opacity: 0.9,
              width: 2,
            },
            edgeSymbol: ['none', 'none'],
            edgeSymbolSize: [10, 10],
            edgeLabel: {
              show: true,
              fontSize: 12,
              formatter: (params) => {
                //设置边标签
                // console.log(params)
                if (params.data.type === 'precede') {
                  return '前继'
                } else if (params.data.type === 'relevant') {
                  return '相关'
                }
                else if (params.data.type === 'include') {
                  return '包含'
                }
              },
            },
            autoCurveness: true,
            emphasis: {
              focus: 'adjacency',
              label: {
                fontSize: 20,
              },
              lineStyle: {
                width: 5,
              },
            },
          },
        ],
        tooltip: {
          trigger: 'item',
          enterable: true,
          formatter: function (params) {
            // console.log(params.data)
            // //设置提示框
            let category_dict = {
              //节点类别字典
              0: '课程',
              1: '知识点',
            }
            if (params.dataType === 'node') {
              if (category_dict[params.data.category] === '课程') {
                let content =
                  //设置提示框内容
                  `
                                课程名称：${params.data.name}
                                <br/>
                                课程学院：${params.data.college}
                                <br/>
                                课程专业：${params.data.major}
                                `
                return content
              } else if (category_dict[params.data.category] === '知识点') {
                let content =
                  //设置提示框内容
                  `
                                知识点名称：${params.data.name}
                                <br/>
                                知识点描述：${params.data.text}
                                `
                return content
              }
            } else {
              //如果是边
              return
            }
          },
        },
      }
      setTimeout(() => {
        // setOption前隐藏loading事件 
        this.myChart.hideLoading()
        this.myChart.setOption(option)
      }, 500);
      // this.myChart.hideLoading()
      // this.myChart.setOption(option)
      that.isGraphShow = true
      // 监听点击事件
      this.myChart.off('click') //取消之前的监听事件
      this.myChart.on('click', (params) => {
        this.graphClick(params, data)
      })
      this.myChart.on('contextmenu', (params) => {
        params.event.event.preventDefault() // 阻止默认的右键菜单
        // console.log(params)
        if (params.dataType === 'edge') {
          //如果点击的是边 则不做任何操作
          return
        }
        that.openDialog(params)
      })
    },
    graphClick(params, data) {
      // console.log(data)
      // let click_set = new Set() // 用于记录点击过的结点
      // console.log(params)
      if (params.dataType == 'edge' || this.$store.state.from === 'course') {
        //如果点击的是边 或 从课程跳转过来(只有知识点) 则不做任何操作
        return
      }
      let query_data = {
        //设置查询参数
        id: params.data.id,
      }
      // console.log(query_data)
      // 根据点击的结点id查询与之相关的结点和边
      axios.post('http://172.20.106.58:3018/getNeighbour', query_data).then(
        (res) => {
          // console.log(res.data)
          if (this.click_set.has(params.data.id)) {
            //如果点击过该结点 则删除与该结点相关并且与其他结点无关的边和结点
            res.data.nodes.forEach((node) => {
              //删除与该结点相关的边
              for (let link of data.links) {
                if (
                  (link.source == node.id && link.target == params.data.id) ||
                  (link.target == node.id && link.source == params.data.id)
                ) {
                  let index = data.links.indexOf(link)
                  if (index > -1) {
                    data.links.splice(index, 1)
                  }
                }
              }
            })
            res.data.nodes.forEach((node) => {
              //删除与该结点相关的结点 且不与其他结点相关的结点
              let delete_flag = true //用于判断是否删除该结点
              data.links.forEach((link) => {
                //遍历所有边
                if (link.source == node.id || link.target == node.id) {
                  //如果该结点与其他结点有关联 则不删除
                  delete_flag = false
                }
              })
              if (delete_flag && node.id != params.data.id) {
                //如果该结点与其他结点无关联且不是点击的结点 则删除
                data.nodes = data.nodes.filter((obj) => obj.id !== node.id)
              }
            })
            this.myChart.setOption({
              series: [
                {
                  data: data.nodes,
                  links: data.links,
                },
              ],
            })
            // 完成删除后，将该结点从click_set中删除
            this.click_set.delete(params.data.id)
            return
          } else {
            // 如果没有点击过该结点 则将与该结点相关的结点和边添加到data中
            res.data.nodes.forEach((node) => {
              //添加结点
              if (data.nodes.findIndex((item) => item.id == node.id) == -1) {
                data.nodes.push(node)
              }
            })

            if (!data.hasOwnProperty('links')) {
              data.links = []
            }

            res.data.links.forEach((link) => {
              //添加边
              if (
                JSON.stringify(data.links).indexOf(JSON.stringify(link)) == -1
              ) {
                if (link.type === 'relevant') {
                  link.symbol = ['none', 'none']
                } else {
                  link.symbol = ['none', 'arrow']
                }
                data.links.push(link)
              }
            })
            // 将该结点添加到click_set中
            this.click_set.add(params.data.id)
            // console.log(data)
            this.myChart.setOption({
              series: [
                {
                  data: data.nodes,
                  links: data.links,
                },
              ],
            })
          }
        },
        (err) => {
          console.log(err)
        }
      )
    },
    search() {
      let query_data = {
        //查询请求数据
        name: this.input,
        depth: +this.value,
      }
      // console.log(query_data)
      let data = {}
      // 根据查询条件和查询深度发送查询请求
      axios.post('http://172.20.106.58:3018/search', query_data).then((res) => {
        this.$store.commit('changeFrom', 'search')
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
  },
  computed: {
    isShowAdd() {
      // 是否显示新增按钮 仅在从 课程 跳转到知识图谱时显示
      return this.$store.state.from === 'course' && this.isGraphShow && this.$store.state.nodeType === 'knowledge'
    },
    // graphRenderData() {
    //   return this.$store.state.graphRenderData
    // }
  },
  watch: {
    '$store.state.graphRenderData'() { // 监听Vuex知识图谱数据的变化
      this.renderGraph()
    },
  }
}
</script>

<style></style>