<template>
  <div class="manual-test">
    <div class="maximum-border" :style="maxPos">
    </div>
    <div class="minimum-border" :style="minPos">
    </div>
    <div class="target" :style="tarPos"></div>
    <div class="drag-region" :style="tarPos" @mousedown.stop="startControl($event, 'xy')">
      <div :class="c" v-for="c in ctrls" @mousedown.stop="startControl($event, c)"></div>
    </div>
    <div class="maximum-rect"></div>
    <div class="minimum-rect"></div>
    <div class="border" v-for="border in borders" :style="border"></div>
    <div class="rect" v-for="rect in rects" :style="rect"></div>
  </div>
</template>

<script>
const fullW = window.innerWidth
const w = fullW - 20
const w2 = w / 2
const w3 = w / 3
const w5 = w / 25
const fullH = window.innerHeight
const h = fullH - 20
const h2 = h / 2
const h3 = h / 3
const h5 = h / 25
import x from '@/index.ts'
import c from '@/gen-scope.ts'
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
      borders: [],
      rects: [],
      ctrls: ['l', 'lt', 't', 'rt', 'r', 'rb', 'b', 'lb']
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
    }
  },
  mounted () {
    this.genScope()
    this.genRect()
  },
  methods: {
    genPos (target) {
      const {left, top, right, bottom, width, height} = target
      const {fullW2, fullH2} = this
      return {
        left: left + fullW2,
        top: top + fullH2,
        width: (right ? right - left : width),
        height: (bottom ? bottom - top : height),
      }
    },
    genPosPx (target) {
      const pos = this.genPos(target)
      const {left, top, right, bottom, width, height} = target
      const {fullW2, fullH2} = this
      return {
        left: pos.left + 'px',
        top: pos.top + 'px',
        width: pos.width + 'px',
        height: pos.height + 'px',
      }
    },
    genRect () {
      const {min, max, tar} = this
      const {left: l, top: t, width: w, height: h} = this.genPos(tar)
      const tl = l + 'px'
      const tt = t + 'px'
      const tr = fullW - l - w + 'px'
      const tb = fullH - t - h + 'px'
      const iw = min.width + 'px'
      const ih = min.height + 'px'
      const aw = max.width + 'px'
      const ah = max.height + 'px'
      const cx1 = l + w / 2 - 4 + 'px'
      const cx2 = l + w / 2 + 4 + 'px'
      const cy1 = t + h / 2 - 4 + 'px'
      const cy2 = t + h / 2 + 4 + 'px'
      const len = '4px'
      this.rects = [
        {width: iw, height: len, right: tr, top: cy1},
        {width: aw, height: len, right: tr, top: cy1},
        {width: len, height: ih, bottom: tb, left: cx1},
        {width: len, height: ah, bottom: tb, left: cx1},
        {width: iw, height: len, left: tl, top: cy2},
        {width: aw, height: len, left: tl, top: cy2},
        {width: len, height: ih, top: tt, left: cx2},
        {width: len, height: ah, top: tt, left: cx2},
      ]
    },
    genBorder (border, isH) {
      if (isH) {
        return {
          width: '1px',
          height: this.tarPos.height,
          top: this.tarPos.top,
          left: border + this.fullW2 + 'px'
        }
      } else {
        return {
          height: '1px',
          width: this.tarPos.width,
          left: this.tarPos.left,
          top: border + this.fullH2 + 'px',
        }
      }
    },
    startControl (ev, control) {
      x(
        ev,
        {
          control,
          target: this.tar,
          maximum: this.max,
          minimum: this.min,
          rate: 2,
        },
        (rect) => {
          this.tar = rect.target
        },
        (rect) => {
          this.tar = rect.target
          this.genRect()
          this.genScope()
        },
      )
    },
    genScope () {
      this.borders = []
      for (const ctrl of ['l', 't', 'r', 'b']) {
        const [h, v] = c(
          ctrl,
          this.tar,
          this.max,
          this.min,
        )
        if (h) {
          this.borders.push(this.genBorder(h[0], true))
          this.borders.push(this.genBorder(h[1], true))
        } else {
          this.borders.push(this.genBorder(v[0], false))
          this.borders.push(this.genBorder(v[1], false))
        }
      }
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
  white-space: nowrap;
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
.border {
  position: absolute;
  background-color: rgb(50, 204, 50);
}
.rect {
  position: absolute;
  background-color: rgba(204, 50, 158, 0.4);
}
</style>