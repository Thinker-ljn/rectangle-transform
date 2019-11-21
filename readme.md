# RECTANGLE-Transform 矩形框的变换

## 项目背景

  方便用于对矩形框的拖拽，变形（包括强制比例，限制范围等）

## 安装

```
   npm i rectangle-transform
   or
   yarn add rectangle-transform
```

## 使用 

例子一，监听onmousedown，传入事件
```javascript
import RTListener from 'rectangle-transform'
function onmousedown (ev) {
  const onMoving = ({target, proportion}) => {
    // do something
    console.log(target, proportion)
  }
  const onFinished = ({target, proportion}) => {
    // do something
    console.log(target, proportion)
  }
  RTListener(
    ev,
    {
      'xy',
      step: 40,
      target: {left: 0, top: 0, width: 20, height: 10},
      maximum: {left: 0, top: 0, width: 100, height: 100},
    },
    onMoving,
    onFinished,
  )
}
```

例子二，直接传入位移
```javascript
import RTListener from 'rectangle-transform'
const movement = {x: 50, y: 50}
const {target: newTarget} = RTListener(
  movement,
  {
    'xy',
    target: {left: 0, top: 0, width: 20, height: 10},
    maximum: {left: 0, top: 0, width: 100, height: 100},
  },
)
console.log(newTarget)
```

## 参数类型说明

```typescript
interface RTRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface RTBbox extends RTRect {
  right: number;
  bottom: number;
}

// 方向控制：l t r b x y 分别是 左 上 右 下 水平 垂直
type RTCtrl = "lt" | "lb" | "rb" | "rt" | "xy" | "t" | "l" | "b" | "r" | "x" | "y"

// 回调函数的参数
interface RTUserDefinedHandlerParams {
  ev: MouseEvent; // 原生事件
  target: RTRect; // 新目标矩形，如果有定义步长，则等于stepTarget
  // 如果有定义步长，则有下面的参数：
  stepTarget?: RTRect; // 根据步长来生成新的矩形
  rawTarget?: RTRect; // 转化前的新目标矩形
  proportion?: RTRect; // 比例
}
// onmousemove, onmouseup 的回调函数
type RTUserDefinedHandler = (params: RTUserDefinedHandlerParams) => void | RTRect;

interface RTOptions {
    control: RTCtrl;
    target: RTRect; // 初始矩形
    maximum?: Partial<RTBbox>; // 最大的范围，可分别定义 左 上 右 下 宽 高
    minimum?: Partial<RTBbox>; // 最小的范围，可分别定义 左 上 右 下 宽 高
    step?: number | [number, number]; // 步长
    rate?: number; // 宽高比
}

interface RTResult {
    target: RTRect;
    proportion?: RTRect;
    stepTarget?: RTRect;
    rawTarget?: RTRect;
}

function RTListener(startEvent: MouseEvent | RTPointer, options: RTOptions, userMove?: RTUserDefinedHandler, userFinished?: RTUserDefinedHandler): RTResult;
```
