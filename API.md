<a name="ScratchCard"></a>
# class: ScratchCard
**Members**

* [class: ScratchCard](#ScratchCard)
  * [new ScratchCard(container, config)](#new_ScratchCard)
  * [scratchCard.refresh(config)](#ScratchCard#refresh)
  * [type: ScratchCard~ScartchCardConfig](#ScratchCard..ScartchCardConfig)
  * [type: ScratchCard~CoverImage](#ScratchCard..CoverImage)
  * [type: ScratchCard~CoverTitle](#ScratchCard..CoverTitle)

<a name="new_ScratchCard"></a>
## new ScratchCard(container, config)
刮刮卡类。使用此类创建一个刮刮卡应用。

**Params**

- container `HTMLElement` | `Selector` - 显示刮刮卡的容器元素。可以是DOM对象或CSS选择器。  
- config <code>[ScartchCardConfig](#ScratchCard..ScartchCardConfig)</code> - 刮刮卡配置。  

<a name="ScratchCard#refresh"></a>
## scratchCard.refresh(config)
刷新刮刮卡。

**Params**

- config <code>[ScartchCardConfig](#ScratchCard..ScartchCardConfig)</code> - 刮刮卡配置。  

<a name="ScratchCard..ScartchCardConfig"></a>
## type: ScratchCard~ScartchCardConfig
**Properties**

- coverColor `String` - 刮刮卡的封面颜色。  
- coverAlpha `Number` - 刮刮卡的封面透明度。  
- coverImage <code>[CoverImage](#ScratchCard..CoverImage)</code> - 刮刮卡的封面图片。  
- coverTitle <code>[CoverTitle](#ScratchCard..CoverTitle)</code> - 刮刮卡的封面标题。  
- lineWidth `Number` - 刮刮卡的线条宽度。  
- content `String` | `HTMLElement` - 刮刮卡的内容。可以是DOM元素或HTML字符串。  
- result `String` | `HTMLElement` - 刮刮卡刮开之后的显示结果。可以是DOM元素或HTML字符串。  
- checkElement `Selector` | `HTMLElement` - 刮刮卡的检测元素。若不设置，则默认为整个刮刮卡。在刮卡时会检测此元素区域被刮开的部分，当此元素被刮开的部分比例超过`thresholdPercent`值时，则刮刮卡会自动全部刮开。  
- thresholdPercent `Number` - 刮开检测元素`checkElement`的临界百分比，超过此比例则自动全部刮开。  
- continousCheck `Boolean` - 指定是否在刮卡的过程中不断检查是否刮开。若为false，则只在`touchend`事件后进行检测。  
- onReady `function` - 刮刮卡准备就绪的回调函数。  
- onFinish `function` - 刮刮卡完成的回调函数。  

**Scope**: inner typedef of [ScratchCard](#ScratchCard)  
**Type**: `Object`  
<a name="ScratchCard..CoverImage"></a>
## type: ScratchCard~CoverImage
CoverImage对象用来设置刮刮卡的封面图片。
它一般为Object类型，包含如下属性。此外，如果类型为String，则即设置`src`属性。如果类型为Image，则设置`image`属性。

**Properties**

- src `String` - 图片来源地址。  
- image `Image` - 图片对象。  
- x `Number` | `String` - 图片在刮刮卡封面上的x轴坐标。若值为`center`，则水平居中。  
- y `Number` | `String` - 图片在刮刮卡封面上的y轴坐标。若值为`center`，则垂直居中。  

**Scope**: inner typedef of [ScratchCard](#ScratchCard)  
**Type**: `Object` | `String` | `Image`  
<a name="ScratchCard..CoverTitle"></a>
## type: ScratchCard~CoverTitle
CoverTitle对象用来设置刮刮卡的封面标题。它包含如下属性：

**Properties**

- text `String` - 标题文字。  
- color `String` - 标题颜色。  
- font `String` - 标题文字字体样式。  
- x `Number` | `String` - 标题的x轴坐标。若值为`center`，则水平居中。  
- y `Number` | `String` - 标题的y轴坐标。若值为`center`，则垂直居中。  

**Scope**: inner typedef of [ScratchCard](#ScratchCard)  
**Type**: `Object`  
