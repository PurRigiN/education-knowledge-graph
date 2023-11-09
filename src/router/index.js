// 路由
import Vue from 'vue'
//引入VueRouter
import VueRouter from 'vue-router'

import Layout from '@/components/Layout.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'

const includPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return includPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter);

//创建router实例对象，去管理一组一组的路由规则
const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/layout',
      name: 'Layout',
      component: Layout
    }
  ]
})

//暴露router
export default router