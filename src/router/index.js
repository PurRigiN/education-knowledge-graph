// 路由

import Vue from 'vue'

//引入VueRouter
import VueRouter from 'vue-router'

const includPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return includPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter);

//创建router实例对象，去管理一组一组的路由规则
const router = new VueRouter({
  routes: [
    {
      path: '',
      // component: Index
      // component: resolve => require(['@/pages/Dialogue'],resolve)
      component: resolve => require(['@/pages/JYKG'],resolve)
    },
  ]
})

//暴露router
export default router