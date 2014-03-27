/* jshint newcap:false */
/* global Hammer: true */

'use strict';
var rMatrix = /\s*([-\.\d]+),\s*([-\.\d]+)\)\s*$/; // 匹配 css transform 的属性 matrix
var util = {
	// 设置/获取 元素的 CSS 属性
	css: function(elem, key, val) {
		var style,
			t;

		style = typeof val === 'undefined' ?
				window.getComputedStyle(elem, null) : elem.style;

		if (!(key in style)) {
			['Webkit', 'O', 'Moz', 'ms'].forEach(function (prefix) {
				t = prefix + key.charAt(0).toUpperCase() + key.substr(1);
				if (t in style) {
					key = t;
				}
			});
		}

		return typeof val === 'undefined' ? style[key] : (style[key] = val);
	},

	// 移动 elem / 获取 elem 移动的位移
	translate: function(elem, distance, speed, func) {
		if (typeof distance !== 'undefined') {
			distance.x = distance.x || 0;
			distance.y = distance.y || 0;
			func = func || 'ease';
			this.css(elem, 'transitionTimingFunction', speed > 0 ? func : 'no');
			this.css(elem, 'transitionDuration', (speed || 0) + 'ms');
			this.css(elem, 'transform', 'matrix(1, 0, 0, 1, ' + distance.x + ', ' + distance.y + ')');
		} else {
			var match = this.css(elem, 'transform').match(rMatrix);
			return match ? {x: match[1] - 0, y: match[2] - 0} : {x: 0, y: 0};
		}
	}
};


$(function() {
	var MAX_WIDTH = 70,
		ele = document.querySelector('.list-home');

	function dragHandler(e) {

		e.gesture.preventDefault();
		e.gesture.stopPropagation();

		e.preventDefault();
		e.stopPropagation();

		// 获取真正的 target
		var target = e.target, lastTarget;
		while (target && !target.classList.contains('wrap')) {
			target = target.parentNode;
		}

		lastTarget = document.querySelector('.deleteOn');
		if (lastTarget && lastTarget !== target) {
			lastTarget.classList.remove('deleteOn');
			util.translate(lastTarget, {x: 0}, 200);
		}


		// 移动 target
		if (target) {
			var abs,
				distance = e.gesture.distance,
				translate = util.translate(target);

			switch(e.type) {
				case 'dragleft':
					distance = translate.x - distance;
					break;
				case 'dragright':
					distance = distance + translate.x;
					break;
				case 'dragend':
					distance = translate.x;
					abs = Math.abs(distance);
					if (distance < 0 && abs > 0.5 * MAX_WIDTH) {
						target.classList.add('deleteOn');
						util.translate(target, {x: - MAX_WIDTH}, 200);
					} else if (distance >= 0 && abs < 0.5 * MAX_WIDTH) {
						target.classList.remove('deleteOn');
						util.translate(target, {x: 0}, 200);
					}
					return ;
			}

			if (distance > 0) {
				distance = 0;
			} else if (MAX_WIDTH + distance < 0) {
				distance = - MAX_WIDTH - (distance + MAX_WIDTH) * MAX_WIDTH / distance;
			}

			util.translate(target, {x: distance});
		}
	}


	Hammer(ele).on('dragleft dragright dragend', dragHandler);
});
