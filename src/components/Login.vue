<template>
  <el-container class="elui_container">
    <el-main class="elui_main">
      <div v-loading="loading" element-loading-text="登录中..." element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.6)" class="login-container">

        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
          label-position="left">
          <!-- 头像区域 -->
          <div v-if="TxStatus" class="avatar-box">
            <img src="@/assets/KGLogo.jpg" alt="">
          </div>

          <div class="title-container">
            <h3 class="title">教育知识图谱系统</h3>
          </div>

          <el-form-item prop="username">
            <span style="margin-left: 18px;">用户</span>
            <el-input ref="username" v-model="loginForm.username" placeholder="Username" name="username" type="text"
              tabindex="1" auto-complete="on" />
          </el-form-item>

          <el-form-item prop="password">
            <span style="margin-left: 18px;">密码</span>
            <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
              placeholder="Password" name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
            <span @click="showPwd">{{ passwordType === 'password' ? '显示' : '隐藏' }}</span>
          </el-form-item>
          <div>
            <el-button type="primary" style="width:100%;margin-bottom:20px;"
              @click.native.prevent="handleLogin">登录</el-button>
          </div>
          <div class="tips">
            <span style="margin-right:20px;">如果您还没有账号请先 <span style="color:#409EFF;cursor:pointer"
                @click="register">注册</span></span>
          </div>

        </el-form>
      </div>
    </el-main>
  </el-container>
</template>
   
<script>
import Vue from 'vue'
import {
  Button,
  Container,
  Header,
  Main,
  Footer,
  Form,
  FormItem,
  Input,
  Loading
} from 'element-ui'

Vue.use(Button);
Vue.use(Container);
Vue.use(Header);
Vue.use(Main);
Vue.use(Footer);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);

Vue.use(Loading.directive);
Vue.prototype.$loading = Loading.service;

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {

      let regexp = /^[a-zA-Z0-9_-]{6,16}$/;
      if (value === "") {
        callback(new Error('用户名不能为空'));
      } else if (value.length < 6) {
        callback(new Error('用户名最少为6位字符'));
      } else if (value.length > 16) {
        callback(new Error('用户名最多为16位字符'));
      } else if (regexp.test(value) == false) {
        callback(new Error('用户名不符合规范：只能包含英文字母、数字、下划线、短横线'));
      }
      else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      let regexp = /^[a-zA-Z0-9_-]{6,16}$/;
      if (value === "") {
        callback(new Error('密码不能为空'));
      } else if (value.length < 6) {
        callback(new Error('密码最少为6位字符'));
      } else if (value.length > 16) {
        callback(new Error('密码最多为16位字符'));
      } else if (regexp.test(value) == false) {
        callback(new Error('密码不符合规范：只能包含英文字母、数字、下划线、短横线'));
      }
      else {
        callback()
      }
    }
    return {
      // 头像状态
      TxStatus: true,
      loginForm: {
        username: '',
        password: ''
      },
      // 登录规则
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    // 登录业务
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        // 如果符合初步验证规则
        if (valid) {
          this.loading = true
          setTimeout(() => {
            console.log('waiting');
            // 登陆逻辑
            // 发送登陆请求
            let form_data = {
              user_name: this.loginForm.username,
              user_password: this.loginForm.password
            }
            this.$axios.post('/api/login/', form_data).then((res) => {
              console.log(res);
              let data = res.data;
              if (data.if_success == false) {
                // 如果验证失败
                alert("登陆失败： " + data.info);
              } else {
                // 如果验证成功
                this.$router.push({ name: 'Layout' })
              }
            }, (err) => {
              console.log(err);
            })
            this.loading = false;
          }, 1500)
        }
        //不符合初步验证规则
        else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 注册业务
    register() {
      this.$router.push({ name: 'Register' })
    }
  }
}
</script>
   
<style lang="scss">
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      // -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>
   
<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.elui_container {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
}

.elui_header {
  line-height: 1px;
}

.elui_main {
  line-height: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  margin: 0px;
}

.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #889aa4;
  background-size: 100% 100%;

  // 头像
  .avatar-box {
    margin: 0 auto;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 1px solid #409eff;
    box-shadow: 0 0 10px #409eff;
    position: relative;
    bottom: 20px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;

  }

  .tips {
    font-size: 18px;
    text-align: center;
    color: #000;
    margin-bottom: 10px;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 30px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: 500;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>