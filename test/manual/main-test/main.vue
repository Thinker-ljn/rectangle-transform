<template>
  <div class="basic-test">
    <div class="test-area" ref="test">
      <div class="step-grid" :style="stepStyle" v-show="effects.step"></div>
      <div class="maximum-border" :style="maxPos" v-show="effects.max"> </div>
      <div class="minimum-border" :style="minPos" v-show="effects.min"> </div>
      <div class="target" :style="tarPos"> </div>
      <div class="drag-region" :style="tarPos" @mousedown.stop="startControl($event, 'xy')" @mousewheel="mousewheel">
        <div :class="c" v-for="c in ctrls" @mousedown.stop="startControl($event, c)"></div>
      </div>
    </div>
    <div class="function-area">
      <div class="max">
        <h4>最大范围 <input type="checkbox" v-model="effects.max"></h4>
        <r-input :label="key" :key="key" v-model="max[key]" v-for="(value, key) in max"></r-input>
      </div>
      <div class="min">
        <h4>最小范围 <input type="checkbox" v-model="effects.min"></h4>
        <r-input :label="key" :key="key" v-model="min[key]" v-for="(value, key) in min"></r-input>
      </div>
      <div class="rate">
        <h4>固定比例 <input type="checkbox" v-model="effects.rate"></h4>
        <r-input label="长" v-model="rate.w"></r-input>
        <r-input label="宽" v-model="rate.h"></r-input>
      </div>
      <div class="step">
        <h4>步长 <input type="checkbox" v-model="effects.step"></h4>
        <r-input label="水平" v-model="step.h"></r-input>
        <r-input label="垂直" v-model="step.v"></r-input>
      </div>
      <div class="step">
        <h4>缩放 <input type="checkbox" v-model="effects.scale"></h4>
        <r-input label="scale" v-model="scale.value"></r-input>
      </div>
      <div class="frame">
        <h4>帧刷新 <input type="checkbox" v-model="effects.frame"></h4>
      </div>
    </div>
  </div>
</template>

<script>
import x, {scale} from '@/index.ts'
import c from '@/gen-scope.ts'
import RInput from './reactive-input.vue'
export default {
  components: {
    RInput
  },
  data () {
    return {
      size: { w: 0, h: 0, w2: 0, h2: 0, rect: null},
      max: { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, },
      min: { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, },
      tar: { left: 0, right: 0, width: 0, height: 0, },
      ctrls: ['l', 'lt', 't', 'rt', 'r', 'rb', 'b', 'lb'],
      effects: { max: true, min: true, step: false, rate: false, scale: true, frame: false },
      step: { h: 50, v: 50, },
      rate: { w: 1, h: 1, },
      scale: {
        value: 1,
        init: null
      }
    }
  },
  computed: {
    maxPos () {
      return this.genPosPx(this.max)
    },
    minPos () {
      return this.genPosPx(this.min)
    },
    tarPos () {
      return this.genPosPx(this.tar)
    },
    stepStyle () {
      const {h, v} = this.step
      const halfW = this.size.w2
      const halfH = this.size.h2
      const color1 = '#aaaaaa88'
      const color2 = '#cccccc88'
      const sw = Math.round(this.size.w / h) * h
      const sh = Math.round(this.size.h / v) * v
      return {
        backgroundImage: `
          repeating-linear-gradient(to right, transparent 0, transparent ${h}px, ${color1} ${h}px, ${color1} ${h * 2}px), 
          repeating-linear-gradient(to bottom, transparent 0, transparent ${v}px, ${color2} ${v}px, ${color2} ${v * 2}px)
        `,
        backgroundSize: `${sw}px ${sh}px`,
        backgroundPosition: `${sw + halfW}px ${h + halfH}px`,
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    init () {
      const {clientWidth: w, clientHeight: h} = this.$refs.test
      const rect = this.$refs.test.getBoundingClientRect()
      const w2 = w / 2
      const h2 = h / 2      
      const w10 = w / 5
      const h10 = h / 5
      this.size = {w, h, w2, h2, rect}
      this.max = { left: -w2, right: w2, top: -h2, bottom: h2, width: w, height: h2 }
      this.min = { left: -w10, right: w10, top: -h10, bottom: h10, width: w10, height: h10 }
      this.tar = { left: -w10, top: -h10, width: w2, height: h2 }
    },
    toNumber (target) {
      return Object.keys(target).reduce((result, key) => {
        result[key] = Number(target[key])
        return result
      }, {})
    },
    genPos (target) {
      const {left, top, right, bottom, width, height} = this.toNumber(target)
      const {w2, h2} = this.size
      return {
        left: left + w2,
        top: top + h2,
        width: (right ? right - left : width),
        height: (bottom ? bottom - top : height),
      }
    },
    genPosPx (target) {
      const pos = this.genPos(target)
      const {left, top, right, bottom, width, height} = target
      return {
        left: pos.left + 'px',
        top: pos.top + 'px',
        width: pos.width + 'px',
        height: pos.height + 'px',
      }
    },

    getOptions () {
      const options = {}
      const {max, min, rate, step, frame} = this.effects
      if (max) {
        options.maximum = this.max
      }
      if (min) {
        options.minimum = this.min
      }
      if (rate) {
        options.rate = this.rate.w / this.rate.h
      }
      if (step) {
        options.step = [this.step.h, this.step.v]
      }
      if (frame) {
        options.animationFrameUpdate = true
      }
      return options
    },
    
    startControl (ev, control) {
      const before = document.body.style.cursor
      const cursor = getComputedStyle(ev.target).cursor
      document.body.style.cursor = cursor
      x(
        ev,
        {
          control,
          target: this.tar,
          ...this.getOptions()
        },
        (rect) => {
          this.tar = rect.target
        },
        (rect) => {
          this.tar = rect.target
          document.body.style.cursor = before
        },
      )
    },

    getPointer (ev) {
      const {x, y} = this.size.rect
      const {w2, h2} = this.size
      const {clientX, clientY} = ev
      return {
        x: clientX - x - w2,
        y: clientY - y - h2,
      }
    },

    mousewheel (ev) {
      const delta = ev.wheelDelta / 1200
      const curr = this.scale.value + delta
      const factor = curr / this.scale.value
      this.scale.value = curr
      if (this.scale.init === null) {
        this.scale.init = this.tar
      }
      const pointer = this.getPointer(ev)
      this.tar = scale(this.tar, factor, pointer)
    }
  }
}
</script>

<style scoped>
.basic-test {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #eee;
  overflow: hidden;
}
.test-area {
  margin: 10px;
  width: calc(100% - 220px);
  height: calc(100% - 20px);
  float: left;
  position: relative;
}
.test-area::before {
  content: '';
  width: 100%;
  height: 0;
  border-top: 1px dashed #555;
  position: absolute;
  left: 0;
  top: calc(50% - 1px);
}
.test-area::after {
  content: '';
  height: 100%;
  width: 0;
  border-left: 1px dashed #555;
  position: absolute;
  top: 0;
  left: calc(50% - 1px);
}
.function-area {
  width: 200px;
  height: 100%;
  float: right;
  background-color: #ccc;
  overflow: auto;
}
.maximum-border {
  position: absolute;
  border: 1px dashed rgb(102, 51, 153);
}
.minimum-border {
  position: absolute;
  border: 1px dashed rgb(2, 179, 179);
}
.step-grid {
  position: absolute;
  width: 100%;
  height: 100%;
}
.target {
  position: absolute;
  border: 1px solid rgb(218, 134, 66);
  z-index: 10;
}
.drag-region {
  position: absolute;
  z-index: 11;
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
.l, .r {
  cursor: e-resize;
}
.t, .b {
  cursor: n-resize;
}
.l {
  border-left-width: 2px;
  left: -5px;
  top: calc(50% - 6px);
}
.r {
  border-right-width: 2px;
  right: -5px;
  top: calc(50% - 6px);
}
.t {
  border-top-width: 2px;
  top: -5px;
  left: calc(50% - 6px);
}
.b {
  border-bottom-width: 2px;
  bottom: -5px;
  left: calc(50% - 6px);
}
</style>