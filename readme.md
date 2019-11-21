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
