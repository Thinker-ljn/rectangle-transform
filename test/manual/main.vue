
<template>
  <div class="manual-test-container">
    <div class="header">
      <span>RECTANGLE-TRANSLATE</span>
    </div>
    <div class="body">
      <div class="sider"></div>
      <div class="main">
        <test></test>
      </div>
    </div>
  </div>
</template>

<script>
import Test from './main-test/main.vue'
export default {
  components: {
    Test,
  },
}
</script>

<style scoped>
.header {
  height: 28px;
  line-height: 28px;
  padding: 0 16px;
  background-color: #333;
  color: #fff;
}
.body {
  border-top: 1px solid #eee;
  height: calc(100vh - 29px);
  background-color: #eee;
}
.sider {
  height: 100%;
  width: 200px;
  background-color: #444;
  float: left;
}
.main {
  height: 100%;
  margin-left: 200px;
}
</style>

<style>
* {
  box-sizing: content-box;
}
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}
</style>
