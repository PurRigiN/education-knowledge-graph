<template>
  <div id="app">
    <Layout />
  </div>
</template>

<script>
  import Layout from './components/Layout.vue'

  import moment from 'moment'
  import 'moment/locale/zh-cn'

  moment.locale('zh-cn')
  export default {
    name: 'App',
    components: {
      Layout,
    },
    data() {
      return {
      }
    },
    mounted() {
    },
    methods: {
    },
  }
</script>

<style>
  body,
  ul,
  ol,
  li,
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  form,
  fieldset,
  table,
  td,
  img,
  div {
    margin: 0;
    padding: 0;
    border: 0;
  }
  body {
    min-width: 1300px;
  }
</style>
