//引入Vue核心库
import Vue from 'vue'
//引入Vuex
import Vuex from 'vuex'
//应用Vuex插件
Vue.use(Vuex)


//准备actions对象——响应组件中用户的动作
const actions = {
}
//准备mutations对象——修改state中的数据
const mutations = {
  changeFrom(state, from) {
    state.from = from
  },
  changeNodeType(state, nodeType) {
    state.nodeType = nodeType
  },
  changeGraphRenderData(state, graphRenderData) {
    state.graphRenderData = graphRenderData
  },
  changeCourseId(state, courseId) {
    state.courseId = courseId
  },
  changeIsNodeChange(state, isNodeChange) {
    state.isNodeChange = isNodeChange
  }
}
//准备state对象——保存具体的数据
const state = {
  from: 'all',
  nodeType: 'course',
  graphRenderData: {
    nodes: [],
    links: [],
    categories: []
  },
  courseId: '',
  isNodeChange: false
}
//创建并暴露store
export default new Vuex.Store({
  actions,
  mutations,
  state
})