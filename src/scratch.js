;(function(exports){

var win = window, doc = document;
var ua = navigator.userAgent;
var jsVendor = /webkit/i.test(ua) ? 'webkit' : 
               /firefox/i.test(ua) ? 'Moz' : 
               /msie/i.test(ua) ? 'ms' : '';

var imageCache = {};
var defaultConfig = {
    coverColor: '#fff',
    coverAlpha: 1,
    thresholdPercent: 0.7,
    continuousCheck: false,
    lineWidth: 30,
};

/**
 * @typedef {Object} ScratchCard~ScartchCardConfig
 * @property {String} [coverColor=#fff] 刮刮卡的封面颜色。
 * @property {Number} [coverAlpha=1] 刮刮卡的封面透明度。
 * @property {ScratchCard~CoverImage} [coverImage] 刮刮卡的封面图片。
 * @property {ScratchCard~CoverTitle} [coverTitle] 刮刮卡的封面标题。
 * @property {Number} [lineWidth=30] 刮刮卡的线条宽度。
 * @property {String|HTMLElement} content 刮刮卡的内容。可以是DOM元素或HTML字符串。
 * @property {String|HTMLElement} [result] 刮刮卡刮开之后的显示结果。可以是DOM元素或HTML字符串。
 * @property {Selector|HTMLElement} [checkElement] 刮刮卡的检测元素。若不设置，则默认为整个刮刮卡。在刮卡时会检测此元素区域被刮开的部分，当此元素被刮开的部分比例超过`thresholdPercent`值时，则刮刮卡会自动全部刮开。
 * @property {Number} [thresholdPercent=0.7] 刮开检测元素`checkElement`的临界百分比，超过此比例则自动全部刮开。
 * @property {Boolean} [continousCheck=false] 指定是否在刮卡的过程中不断检查是否刮开。若为false，则只在`touchend`事件后进行检测。
 * @property {Function} [onReady] 刮刮卡准备就绪的回调函数。
 * @property {Function} [onFinish] 刮刮卡完成的回调函数。
 */

/**
 * @typedef {Object|String|Image} ScratchCard~CoverImage
 * @desc CoverImage对象用来设置刮刮卡的封面图片。
 * 它一般为Object类型，包含如下属性。此外，如果类型为String，则即设置`src`属性。如果类型为Image，则设置`image`属性。
 * @property {String} [src] 图片来源地址。
 * @property {Image} [image] 图片对象。
 * @property {Number|String} [x=center] 图片在刮刮卡封面上的x轴坐标。若值为`center`，则水平居中。
 * @property {Number|String} [y=center] 图片在刮刮卡封面上的y轴坐标。若值为`center`，则垂直居中。
 */

/**
 * @typedef {Object} ScratchCard~CoverTitle
 * @desc CoverTitle对象用来设置刮刮卡的封面标题。它包含如下属性：
 * @property {String} text 标题文字。
 * @property {String} [color=#000] 标题颜色。
 * @property {String} [font=20px Arial] 标题文字字体样式。
 * @property {Number|String} [x=center] 标题的x轴坐标。若值为`center`，则水平居中。
 * @property {Number|String} [y=center] 标题的y轴坐标。若值为`center`，则垂直居中。
 */

/**
 * 刮刮卡类。使用此类创建一个刮刮卡应用。
 * @class ScratchCard
 * @param {HTMLElement|Selector} container 显示刮刮卡的容器元素。可以是DOM对象或CSS选择器。
 * @param {ScratchCard~ScartchCardConfig} config 刮刮卡配置。
 */
function ScratchCard(container, config){
    var self = this;

    for(var p in config) defaultConfig[p] = config[p];
    config = self.config = defaultConfig;

    //container
    if(typeof container === 'string') container = document.querySelector(container);
    container.style.cssText += 'relative';
    self.container = container;

    //content wrapper
    var wrapper = self.wrapper = doc.createElement('div');
    wrapper.style.cssText = 'width:100%;height:100%;position:absolute;left:0;top:0;';
    container.appendChild(wrapper);

    //init canvas
    var region = self.region = container.getBoundingClientRect();
    var canvas = self.canvas = document.createElement('canvas');
    canvas.width = region.width;
    canvas.height = region.height;
    canvas.style.cssText = 'width:' + canvas.width + 'px;height:' + canvas.height + ';position:absolute;top:0;left:0;';
    container.appendChild(canvas);
    var context = self.context = canvas.getContext('2d');

    doc.addEventListener('touchstart', onTouchStart, false);
    self.refresh();

    //event handlers
    var startTouches;
    function onTouchStart(e){
        if(!self.ready) return;

        doc.addEventListener('touchmove', onTouchMove, false);
        doc.addEventListener('touchend', onTouchEnd, false);
        
        startTouches = {};
        var changedTouches = e.changedTouches, i, touch, x, y;
        for(i = 0; i < changedTouches.length; i++){
            touch = changedTouches[i];
            if(checkPointInRegion(region, touch)){
                x = touch.clientX - region.left;
                y = touch.clientY - region.top;
            }
            startTouches[touch.identifier] = {touch:touch, startX:x, startY:y};
        }
    }

    function onTouchMove(e){
        var changedTouches = e.changedTouches, i, touch, obj;
        for(i = 0; i < changedTouches.length; i++){1
            touch = changedTouches[i];
            obj = startTouches[touch.identifier];

            if(obj && checkPointInRegion(region, touch)){
                var x = touch.clientX - region.left;
                var y = touch.clientY - region.top;

                if(!obj.started){
                    context.beginPath();
                    if(obj.startX && obj.startY){
                        context.moveTo(obj.startX, obj.startY);
                        context.lineTo(x, y);
                    }else{
                        context.moveTo(x, y);
                    }
                    obj.started = true;
                }else{
                    context.lineTo(x, y);
                }

                context.stroke();
            }
        }

        if(config.continuousCheck){
            checkScratchStatus();
        }
    }

    function onTouchEnd(e){
        checkScratchStatus();
        doc.removeEventListener('touchmove', onTouchMove, false);
        doc.removeEventListener('touchend', onTouchEnd, false);
    }

    function checkScratchStatus(){
        if(!self.completed && calcClearedPercent(context, region, self.checkArea) > config.thresholdPercent){
            self.ready = false;
            self.completed = true;
            canvas.addEventListener(jsVendor + 'TransitionEnd', function(e){
                canvas.removeEventListener(e.type, arguments.callee);
                canvas.style.webkitTransition = '';
                canvas.style.display = 'none';
                setElementContent(wrapper, config.result);
                config.onFinish && config.onFinish();
            });
            canvas.style.webkitTransition = 'opacity 0.6s ease';
            canvas.style.opacity = 0;
        }
    }
}

var proto = ScratchCard.prototype;

/**
 * 刷新刮刮卡。
 * @method refresh
 * @memberOf ScratchCard.prototype
 * @param {ScratchCard~ScartchCardConfig} config 刮刮卡配置。
 */
proto.refresh = function(config){
    var self = this;

    for(var p in config) self.config[p] = config[p];
    config = self.config;

    self.ready = false;
    self.completed = false;

    var content = config.content;
    if(content){
        setElementContent(self.wrapper, content);
        self._drawCover();
    }
};

/**
 * draw scratch card cover
 * @private
 */
proto._drawCover = function(){
    var self = this,
        config = self.config,
        container = self.container,
        canvas = self.canvas,
        context = self.context; 
    
    //draw background
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = config.coverAlpha;
    context.fillStyle = config.coverColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    //preprocess image
    var imageObj = config.coverImage || {};
    if(typeof imageObj === 'string'){
        imageObj = {src:imageObj};
    }else if(imageObj instanceof Image || image instanceof HTMLImageElement){
        imageObj = {src:imageObj.src, image:imageObj};
    }
    if(!imageObj.src && imageObj.image){
        imageObj.src = imageObj.image.src;
    }else if(imageObj.src && !imageObj.image){
        imageObj.image = imageCache[imageObj.src];
    }

    if(!imageObj.image && imageObj.src){
        var image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = function(){
            image.onload = null;
            imageObj.image = imageCache[imageObj.src] = image;
            doDrawCover();
        };
        image.src = imageObj.src;
    }else{
        imageCache[imageObj.src] = imageObj.image;
        doDrawCover();
    }

    function doDrawCover(){
        context.globalCompositeOperation = 'source-over';

        //draw image
        var image = imageObj.image;
        if(image){
            var w = image.width, h = image.height,
                x = imageObj.x, y = imageObj.y;
            if(x === undefined || x === 'center') x = canvas.width - w >> 1;
            if(y === undefined || y === 'center') y = canvas.height - h >> 1;
            context.drawImage(image, x, y, w, h);
        }

        //draw title
        var title = config.coverTitle;
        if(title){
            context.globalAlpha = 1;
            context.font = title.font || '20px Arial';
            context.fillStyle = title.color || '#000';
            context.textBaseline = 'middle';

            var x = title.x, y = title.y;
            if(x === undefined || x === 'center'){
                var width = context.measureText(title.text).width;
                x = canvas.width - width >> 1;
            }
            if(y === undefined || y === 'center'){
                // var height = measureFontHeight(context.font);
                y = canvas.height >> 1;
            }
            
            context.fillText(title.text, x, y);
            context.globalAlpha = config.coverAlpha;
        }

        //set scratch style
        setScratchStyle(context, config);
        //pre calculate check areas
        self.checkArea = calcCheckArea(canvas, self.region, config.checkElement);
        //ready to scracth, go!
        canvas.style.display = '';
        canvas.style.opacity = 1;
        self.ready = true;

        config.onReady && config.onReady();
    }
};

/**
 * set content to specific element
 * @private
 */
function setElementContent(elem, content){
    if(!elem || !content) return;

    if(typeof content === 'string'){
        elem.innerHTML = content;
    }else{
        elem.innerHTML = '';
        elem.appendChild(content);
    }
}

/**
 * set scratch stroke style
 * @private
 */
function setScratchStyle(context, config){
    context.globalCompositeOperation = 'destination-out';
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(0, 0, 0, 255)';
    context.lineWidth = config.lineWidth;
}

/**
 * calculate check area on scratch canvas
 * @private
 */
function calcCheckArea(canvas, region, checkElements){
    if(typeof checkElements === 'string') checkElements = doc.querySelectorAll(checkElements);
    else if(checkElements instanceof HTMLElement) checkElements = [checkElements];
    if(!checkElements || checkElements.length === 0) checkElements = [canvas];

    var rects = [], i, left, top, width, height;
    for(i = 0; i < checkElements.length; i++){
        rect = checkElements[i].getBoundingClientRect();
        if(rect && rect.width > 0 && rect.height > 0){
            left = Math.max(0, rect.left - region.left);
            top = Math.max(0, rect.top - region.top);
            width = region.width - left - Math.max(0, region.right - rect.right);
            height = region.height - top - Math.max(0, region.bottom - rect.bottom);
            rects.push([left, top, width, height]);
        }
    }

    return rects;
}

/**
 * check whether the touch point is in the scratch region
 * @private
 */
function checkPointInRegion(region, touch){
    return (touch.clientX > region.left && touch.clientX < region.right &&
            touch.clientY > region.top && touch.clientY < region.bottom);
}

/**
 * calculate the percentage of cleared pixels
 * @private 
 */
function calcClearedPercent(context, region, checkArea){
    var pixels = 0, clearedPixels = 0, i, rect, data;

    for(i = 0; i < checkArea.length; i++){
        rect = checkArea[i];
        data = context.getImageData(rect[0], rect[1], rect[2], rect[3]).data;

        for(var j = 0; j < data.length; j += 4){
            pixels++;
            if(data[j + 3] === 0) clearedPixels++;
        }
    }

    return clearedPixels / pixels;
}

// function measureFontHeight(font){
//     var elem = doc.createElement('div');
//     elem.style.cssText = 'position:absolute;font:' + font + ';';
//     elem.innerHTML = 'M';

//     var docElement = document.documentElement;
//     docElement.appendChild(elem);
//     var fontHeight = elem.offsetHeight;
//     docElement.removeChild(elem);
//     return fontHeight;
// }

exports.ScratchCard = ScratchCard;

})(window.ix || (window.ix = {}));