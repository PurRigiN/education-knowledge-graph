import Vue from 'vue'
import App from './App.vue'

// import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/antd.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
//引入store
import store from './store'

// 引入路由
import router from './router';

Vue.config.productionTip = false

Vue.use(ElementUI);

new Vue({
  render: h => h(App),
  store,
  router: router
}).$mount('#app')
