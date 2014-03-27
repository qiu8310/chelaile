/* jshint -W099 */

(function (win) {
	'use strict';
	var rMatrix = /\s*([-\.\d]+),\s*([-\.\d]+)\)\s*$/; // 匹配 css transform 的属性 matrix
	function _ (selector, ctx) { return (ctx || document).querySelector(selector); }
	// function __(selector, ctx) { return [].slice.call((ctx || document).querySelectorAll(selector)); }


	touch.on('.wrap', 'swipeleft', function(ev){
		console.log('you have done', ev.type);
	});

	/**
	 *	设置或获取元素的 CSS 属性
	 */
	function css (elem, key, val) {
		var style,
			t;

		style = typeof val === 'undefined' ?
				win.getComputedStyle(elem, null) : elem.style;

		if (!(key in style)) {
			['Webkit', 'O', 'Moz', 'ms'].forEach(function (prefix) {
				t = prefix + key.charAt(0).toUpperCase() + key.substr(1);
				if (t in style) { key = t; }
			});
		}

		return typeof val === 'undefined' ?
					style[key] : (style[key] = val);
	}

	/**
	 *	移动 elem / 获取 elem 移动的 xy 值
	 */
	function translate (elem, distance, speed, func) {
		if (typeof distance !== 'undefined') {
			func = func || 'ease';
			css(elem, 'transitionTimingFunction', speed > 0 ? func : 'no');
			css(elem, 'transitionDuration', (speed || 0) + 'ms');
			css(elem, 'transform', 'matrix(1, 0, 0, 1, ' + distance.x + ', ' + distance.y + ')');
		} else {
			var match = css(elem, 'transform').match(rMatrix);
			return match ? {x: match[1] - 0, y: match[2] - 0} : {x: 0, y: 0};
		}
	}

	/**
	 *	空函数
	 */
	function noop () {}

	/**
	 * 在用户拖动时，通过 transformX/Y 去移动 elem
	 * opts:
	 *   duplex:     false		是否支持双向同时拖动，如果是 true，则horizontal和vertical会强制设为true
	 *   horizontal: true		是否支持水平方向拖动
	 *   vertical:   true		是否支持垂直方向手动
	 *   speed:      300 		动作变化需要的时间
	 *
	 *   onstart/onmove/onend: 	function
	 *
	 */
	var Touch = function (elem, opts) { return new Touch.fn.init(elem, opts); };
	Touch.fn = Touch.prototype = {
		init: function (elem, opts) {
			opts = opts || {};
			var self = this,
				start = {}, 	// 保存拖动的起点坐标和时间，{x, y, time}
				delta = {},  	// 保存拖动距离（相对于起点坐标）
				isScrolling, 	// 是否是垂直拖动
				startPosition, 	// 拖动之前的位置
				currentPosition,// 移动过程中的实时位置
				over, 			// 超过边界的距离（向下拉y为正，向上拉y为负；向右拉x为正，向左拉x为负）
				elemWidth, elemHeight,		// 当前元素宽高（支持动态变化）
				parentWidth, parentHeight,	// 当前元素父元素的宽高（支持动态变化）
				events;

			if (typeof elem === 'string') { elem = _(elem); }
			if (!elem || !elem.nodeType) { throw new Error('Elem empty'); }
			self.elem = elem;

			// 设置默认值
			['onstart', 'onend', 'onmove'].forEach(function (key) {
				self[key] = typeof opts[key] === 'function' ? opts[key] : noop;
			});
			['vertical', 'horizontal'].forEach(function (key) {
				self[key] = typeof opts[key] === 'undefined' ? true : !!opts[key];
			});
			self.speed = opts.speed > 0 ? opts.speed : 300;
			self.duplex = !!opts.duplex;
			if (self.duplex) {
				self.vertical = self.horizontal = true;
			}

			function getElemInfo () {
				return {
					isScrolling: 	isScrolling,
					elemWidth: 		elemWidth,
					elemHeight: 	elemHeight,
					parentWidth: 	parentWidth,
					parentHeight: 	parentHeight,
					startPosition: 	startPosition,
					currentPosition:currentPosition,
					start: 	start,
					delta: 	delta,
					over: 	over
				};
			}

			events = {
				handleEvent: function (e) {
					// console.log('%cevent type:' + e.type, 'color: green;', e);
					switch (e.type) {
						case 'touchstart':
							this.start(e);
							break;
						case 'touchmove':
							if (false === this.move(e)) {
								this.unstart(e);
							}
							break;
						case 'touchend':
							if (false === this.end(e)) {
								this.unstart(e);
							}
							break;
					}
				},
				start: function (e) {
					var touch = e.touches[0];
					start = {
						x: touch.pageX,
						y: touch.pageY,
						time: +new Date()
					};
					isScrolling = undefined;
					delta = {x:0, y:0};
					over = {x:0, y:0};
					currentPosition = startPosition = translate(elem);

					// 回调用户设置的 onstart 函数
					self.onstart(e, getElemInfo());

					document.addEventListener('touchmove', this, false);
					document.addEventListener('touchend', this, false);
				},
				unstart: function () {
					document.removeEventListener('touchmove', this, false);
					document.removeEventListener('touchend', this, false);
				},
				move: function (e) {
					// 确保不是多个手指再操作
					if (e.touches.length > 1 || e.scale && e.scale !== 1) {
						return false;
					}
					var touch = e.touches[0];

					// 计算出手指移动的距离(从拖动开始计算起)
					delta = {
						x: touch.pageX - start.x,
						y: touch.pageY - start.y
					};

					// 判断是否是垂直方向拖动，只判断一次，根据第一次拖动的方向来判断
					if (typeof isScrolling === 'undefined') {
						isScrolling = Math.abs(delta.x) < Math.abs(delta.y);
					}


					// 某一个方向被禁用了
					if (!self.duplex) {
						if (self.vertical === false  || !isScrolling) {
							delta.y = 0;
						}
						if (self.horizontal === false || isScrolling) {
							delta.x = 0;
						}
					}

					// 忽略掉用户禁用的方向
					if (!self.duplex &&
							(self.vertical === false && isScrolling ||
							self.horizontal === false && !isScrolling )) {
						return false;
					}

					e.preventDefault();

					currentPosition = translate(elem);
					elemWidth = parseInt(css(elem, 'width'));
					elemHeight = parseInt(css(elem, 'height'));
					parentWidth = parseInt(css(elem.parentNode, 'width'));
					parentHeight = parseInt(css(elem.parentNode, 'height'));

					// 超过边界时
					if (delta.x > 0 && delta.x + startPosition.x > 0 ||
						delta.x < 0 && parentWidth - startPosition.x - delta.x > elemWidth) {

						// 计算超过边界的距离（向下拉结果为正，向上拉结果为负）
						over.x = delta.x > 0 ? delta.x + startPosition.x : elemWidth - parentWidth + startPosition.x + delta.x;
						// 添加阻力
						delta.x = delta.x / ( Math.abs(delta.x) / Math.min(elemWidth, parentWidth) + 1);
					}

					// 同理计算 y 方向上的
					if (delta.y > 0 && delta.y + startPosition.y > 0 ||
						delta.y < 0 && parentHeight - startPosition.y - delta.y > elemHeight ) {

						// 先计算 over.y，要不可能会因为 delta.y 的变化而造成 over.y 的反向
						over.y = delta.y > 0 ? delta.y + startPosition.y : elemHeight - parentHeight + startPosition.y + delta.y;
						delta.y = delta.y / ( Math.abs(delta.y) / Math.min(elemHeight, parentHeight) + 1);
					}

					if (false !== self.onmove(e, getElemInfo())) {
						translate(elem, {x: startPosition.x + delta.x, y: startPosition.y + delta.y});
					}
				},
				end: function (e) {
					var duration, isValidTouch, distance = {};

					duration = (+new Date()) - start.time;

					// 这些拖动是否有效
					isValidTouch =
						//Number(duration) < 500 &&	// 开始到结束拖动时间小于 500 ms
						Math.abs(delta.x) > Math.min(20, elemWidth/2, parentWidth/2) ||
						Math.abs(delta.y) > Math.min(20, elemHeight/2, parentHeight/2);

					// 计算出实际要移动到的距离
					distance.x = isValidTouch ?
									(over.x > 0 ? 0 : // 向右拉超过边界
										(over.x < 0 ? parentWidth - elemWidth : // 向左拉超过边界
											startPosition.x + delta.x)) 	// 未超过边界
									: startPosition.x;	// 无效的拖拉

					distance.y = isValidTouch ?
									(over.y > 0 ? 0 :
										(over.y < 0 ? parentHeight - elemHeight :
											startPosition.y + delta.y ))
									: startPosition.y;

					if (false !== self.onend(e, getElemInfo())) {
						translate(elem, distance, (!isValidTouch || over.x !== 0 || over.y !== 0) ? self.speed : 0 );
					}

					this.unstart(e);
				}
			};
			elem.addEventListener('touchstart', events, false);
			return this;
		},

		/**
		 *	移动到指定的位置上 x/y支持: left,top,right,bottom 关键字、数字
		 */
		moveTo: function (x, y, speed) {
			var elem = this.elem,
				currentPosition = translate(elem),			// 移动过程中的实时位置
				elemWidth = parseInt(css(elem, 'width')),	// 当前元素父元素的宽高（支持动态变化）
				elemHeight = parseInt(css(elem, 'height')),
				parentWidth = parseInt(css(elem.parentNode, 'width')),	// 当前元素父元素的宽高（支持动态变化）
				parentHeight = parseInt(css(elem.parentNode, 'height'));

			// 格式化参数
			x = (x + '').trim();
			y = (y + '').trim();

			// 计算 x/y 的绝对值
			x = x === 'left' ? 0 :
				(x === 'right' ? parentWidth - elemWidth :
					( parseInt(x, 10) || 0 ));
			y = y === 'top' ? 0 :
				(y === 'bottom' ? parentHeight - elemHeight :
					( parseInt(y, 10) || 0));

			// 位置没变化
			if (x === currentPosition.x && y === currentPosition.y) {
				return ;
			}

			// 是否支持在该方向上移动
			if (!this.vertical) {
				y = currentPosition.y;
			}
			if (!this.horizontal) {
				x = currentPosition.x;
			}

			x = x > 0 ? 0 : (x < parentWidth - elemWidth ? parentWidth - elemWidth : x);
			y = y > 0 ? 0 : (y < parentHeight - elemHeight ? parentHeight - elemHeight : y);

			translate(elem, {x:x,y:y}, speed);
		}
	};
	Touch.fn.init.prototype = Touch.fn;

	win.Touch = Touch;
})(window);
