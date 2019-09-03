<template>
  <div class="manual-test">
    <div class="maximum-border" :style="maxPos"></div>
    <div class="minimum-border" :style="minPos"></div>
    <div class="target" :style="tarPos"></div>
    <div class="drag-region" :style="tarPos" @mousedown.stop="startControl($event, 'xy')">
      <div :class="c" v-for="c in ctrls" @mousedown.stop="startControl($event, c)"></div>
    </div>
    <div class="maximum-rect"></div>
    <div class="minimum-rect"></div>

  </div>
</template>

<script>
const fullW = window.innerWidth
const w = fullW - 20
const w2 = w / 2
const w3 = w / 3
const w5 = w / 20
const fullH = window.innerHeight
const h = fullH - 20
const h2 = h / 2
const h3 = h / 3
const h5 = h / 20
import x from '@/index.ts'
export default {
  data () {
    return {
      fullW,
      fullH,
      fullW2: fullW / 2,
      fullH2: fullH / 2,
      max: {
        left: -w2,
        right: w2,
        top: -h2,
        bottom: h2,
        width: w2,
        height: h2,
      },
      min: {
        left: -w5,
        right: w5,
        top: -h5,
        bottom: h5,
        width: w3,
        height: h3,
      },
      tar: {
        left: -w5,
        top: -h5,
        width: w3,
        height: h3
      },
      ctrls: ['l', 'lt', 't', 'rt', 'r', 'rb', 'b', 'lb']
    }
  },
  computed: {
    maxPos () {
      return this.genPos(this.max)
    },
    minPos () {
      return this.genPos(this.min)
    },
    tarPos () {
      return this.genPos(this.tar)
    }
  },
  methods: {
    genPos (target) {
      const {left, top, right, bottom, width, height} = target
      const {fullW2, fullH2} = this
      return {
        left: left + fullW2 + 'px',
        top: top + fullH2 + 'px',
        width: (right ? right - left : width) + 'px',
        height: (bottom ? bottom - top : height) + 'px',
      }
    },
    startControl (ev, control) {
      console.log(control)
      x(
      ev,
      {
        control,
        target: this.tar,
        maximum: this.max,
        minimum: this.min,
      },
      (rect) => {
        this.tar = rect.target
      },
      (rect) => {
        this.tar = rect.target
      },
    )
    }
  }
}
</script>

<style>
* {
  box-sizing: content-box;
}
body {
  margin: 0;
  width: 100vw;
  height: 100vh;
}
.manual-test {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #eee;
}
.maximum-border {
  position: absolute;
  border: 1px solid rgb(102, 51, 153);
}
.minimum-border {
  position: absolute;
  border: 1px solid rgb(2, 179, 179);
}
.maximum-rect {
  position: absolute;
  background-color: rgba(102, 51, 153, 0.705);
}
.minimum-rect {
  position: absolute;
  background-color: rgba(2, 179, 179, 0.705);
}
.target {
  position: absolute;
  border: 1px dashed rgb(218, 134, 66);
}
.drag-region {
  position: absolute;
  cursor: move;
}
.lt, .rt, .lb, .rb, .l, .r, .t, .b
{
  z-index: 1;
  position: absolute;
  width: 10px;
  height: 10px;
  border-style: solid;
  border-color: rgb(218, 134, 66);
  border-width: 0;
}
.lt
{
  cursor: nw-resize;
  top: -5px;
  left: -5px;
  border-top-width: 2px;
  border-left-width: 2px;
}
.rt
{
  cursor: sw-resize;
  top: -5px;
  right: -5px;
  border-top-width: 2px;
  border-right-width: 2px;
}
.lb
{
  cursor: sw-resize;
  bottom: -5px;
  left: -5px;
  border-bottom-width: 2px;
  border-left-width: 2px;
}
.rb
{
  cursor: nw-resize;
  bottom: -5px;
  right: -5px;
  border-bottom-width: 2px;
  border-right-width: 2px;
}

/* .l, .r, .t, .b
{
  z-index: 1;
  position: absolute;
  background-color: rgb(218, 134, 66);
  width: 10px;
  height: 10px;
} */
.l, .r {
  /* width: 2px; */
  cursor: e-resize;
}
.t, .b {
  /* height: 2px; */
  cursor: n-resize;
}
.l {
  border-left-width: 2px;
  left: -5px;
  top: 50%;
}
.r {
  border-right-width: 2px;
  right: -5px;
  top: 50%;
}
.t {
  border-top-width: 2px;
  top: -5px;
  left: 50%;
}
.b {
  border-bottom-width: 2px;
  bottom: -5px;
  left: 50%;
}
</style>