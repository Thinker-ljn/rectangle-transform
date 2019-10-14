<template>
  <div class="reactive-input">
    <span class="label">{{label || ''}}</span>
    <input type="text" :value="value" @input="$emit('input', $event.target.value)">
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    value: [String, Number]
  },
}
</script>

<style scoped>
.reactive-input {
  width: 100%;
}
.label {
  display: inline-block;
  text-align: right;
  width: 60px;
  margin-right: 10px;
}
input {
  width: calc(100% - 100px);
}
</style>
