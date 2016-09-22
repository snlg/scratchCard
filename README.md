刮刮卡
======

刮刮卡是一个既简单又好用的抽奖互动应用，在手淘各大活动中复用率非常高。

## 使用示例

```
var card = new ix.ScratchCard('#mycard', {
    coverColor: '#ccc',
    coverTitle: {
        font: '40px 微软雅黑',
        color: '#666',
        text: '刮开此涂层'
    },

    content: '<div>￥100元优惠券</div>',
    result: '<div>恭喜中奖！</div>',

    onReady: function(){
        console.log('scratchcard is ready');
    },
    onFinish: function(){
        console.log('scratchcard is finished');
    }
});
```

## Demo

* [demo](demo/index.html)

## Docs

* [API文档](API.md)