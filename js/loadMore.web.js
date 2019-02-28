/**
 * @author					xtg
 * @description			封装了页面滚动的底部时，加载更多信息函数(针对	Web	端)
 * @namespace				LoadMore
 * @version					1.0.0
 * @date            2018-03-02
 */
! function(window) {
	var c = {
		args: {}, //
		tap: function () {
			var self = this;
			self.loadFunc(self.args);
		},
		init: function(args) {
			/*
			 * 参数 json args
			 * 				string ctrl
			 * 				string fn
			 * 				scrollDomSelector: 选择器，被滚动监听的元素，默认为window
			 * 				json values //异步请求参数
			 * 				boolean showError
			 * 				boolean test
			 *				string template 渲染模板
			 *				string wrapper 渲染父节点, 模板的包裹层节点
			 *				number countType
			 * 					0 默认统计模式，page/pagesize并用;
			 * 					1 时间戳模式，以时间戳为标识获取更多数据;
			 *				function count 自定义判断加载条件是否符合，针对特殊场景，可为空
			 *					return t{
			 *						number status (0:马上终止执行下面的逻辑)
			 *						json values	异步请求所需的参数(status=1:返回values)
			 *					}
			 *				string field 异步返回的ct里，需要被遍历合成模板的字段，如：ct[field]
			 *				string countSelector 通过该css选择器获取当前节点数，判断是否符合加载下一个分页数据的条件
			 *				boolean scrollDomSelector 节点是否为iframe嵌套页面使用，必须传scrollDomSelector参数，节点滚动监听才生效
			 *				boolean justReturn 是否只获取到筛选后的数据 
			 *				boolean justReturnData 是否直接返回异步请求返回的数据，数据不处理
			 */
			
			var self = this;
			if (!args) args = {};
			if (!args.data) args.data = {};
			if (!args.data.values) args.data.values = {};

			this.args = args;
			
			$api.remove($api.dom('.load-more-start'));

			if (!$api.dom('.return-null')) {
				T.append(args.container || '#main', '', '<div class="load-more-start" onclick="LoadMore.tap()">加载更多</div>')
			}

			args.scrollDomSelector = '#main';
			$(args.scrollDomSelector || window).scroll(function () {
				var scrollTop = 0;　　
				var scrollHeight = 0;　　
				var windowHeight = 0;
				
				var headerHeight = $api.dom('#header') && $api.offset($api.dom('#header')).h || 0;
				
				scrollTop = args.scrollDomSelector ? $(this)[0].scrollTop : $(this).scrollTop();
				scrollHeight = args.scrollDomSelector ? $(this)[0].scrollHeight : $(document).height();
				windowHeight = args.scrollDomSelector ? $(document).height() : $(this).height();
				
				// console.log(scrollTop, windowHeight, scrollHeight, headerHeight)

				if (scrollTop + windowHeight == scrollHeight + headerHeight) {
					// Debug.toast('已经到底了')
					//触发加载更多
					self.loadFunc(args);
				}
			});

			
		},
		loadFunc: function (args) {
			/*判断是否加载中*/
			var loadMoreDom = $api.dom('.load-more');
			var loadMoreEndDom = $api.dom('.load-more-start.end');
			var loadingDom = $api.dom('.loading-null');
			if(loadMoreDom || loadingDom || loadMoreEndDom) {
				return;
			}

			if('function' === typeof args.count) {
				var t = args.count();
				if(t && t.status) {
					for(var key in t.values) {
						args.data.values[key] = t.values[key];
					}
					/*使用默认统计模式page/pagesize*/
					try{
						var listDoms = $api.domAll(args.countSelector || '#main > div:not(.load-more-start)');
						if(listDoms.length == 0 || listDoms.length%(args.pagesize || 10) != 0){
							$api.remove($api.dom('.load-more'));
							$api.remove($api.dom('.load-more-start'));
							T.append('#main', '', '<div class="load-more-start end">暂无更多内容</div>')
							return;
						}else{
							args.data.values.page = listDoms.length/(args.pagesize || 10)+1;
						}
					}catch(e){
						return;
					}
					
					if(t && t.isEnd) {
						//已经没有数据
						Tool.toast({
							msg: '暂无更多内容',
							location: 'bottom',
							duration: 2000
						});

						$api.remove($api.dom('.load-more'));
						$api.remove($api.dom('.load-more-start'));
						T.append('#main', '', '<div class="load-more-start end">暂无更多内容</div>')
						return;
					}
					
				} else {
					return;
				}
			} else {
				if(args.countType) {
					/*使用时间戳统计模式
						获取时间戳
					*/
					args.data.values.time = $api.attr($api.dom(args.countSelector || '#main > div:last-child'), 'timestamp');
				} else {
					/*使用默认统计模式page/pagesize*/
					try {
						var listDoms = $api.domAll(args.countSelector || '#main > div:not(.load-more-start)');
						if(listDoms.length == 0 || listDoms.length % (args.pagesize || 10) != 0) {
							$api.remove($api.dom('.load-more'));
							$api.remove($api.dom('.load-more-start'));
							T.append('#main', '', '<div class="load-more-start end">暂无更多内容</div>')
							return;
						} else {
							args.data.values.page = listDoms.length / (args.pagesize || 10) + 1;
						}
					} catch(e) {
						return;
					}
				}
			}

			/*渲染“加载更多”UI*/
			var loadMoreCode = '' +
				'<div class="load-more">' +
				'正在加载' +
				'</div>';
			$api.append($api.dom('#main'), loadMoreCode);
			$api.remove($api.dom('.load-more-start'));

			//发起异步请求
			ajax.get({
				type: args.type || 'POST',
				dataType: args.dataType || 'json',
				url: args.url,
				ctrl: args.ctrl,
				fn: args.fn,
				data: args.data || {},
				hideLoading: true,
				showError: args.showError,
				test: args.test,
				loadType: 2, //scrolltobottom类型
				success: function(ct) {
					var fieldData = '';
					if(args.field) {
						if(args.field2) {
							fieldData = ct[args.field][args.field2];
						} else {
							fieldData = ct[args.field];
						}
					} else {
						fieldData = ct;
					}
					
					//Tool.toast('当前请求页数:' + (args.data.values && args.data.values.page || 1) )
					
					ct.readsta = parseInt(ct.readsta);
					var isEnd = false;
					if (!ct || ct.readsta != 1) {
						isEnd = true;
					}

					//是否需要设置页数
					if(typeof args.setPage == 'function') {
						args.setPage( args.data.values.page, isEnd );
					}
					
					//是否直接返回数据
					if(args.justReturnData) {
						
						if(typeof args.success === 'function') {
							args.success(fieldData, args.data.values.page, isEnd);
						}

						if(ct.readsta == 0) {
							Tool.toast({
								msg: '暂无更多内容',
								location: 'bottom',
								duration: 2000
							});

							$api.remove($api.dom('.load-more'));
							T.append('#main', '', '<div class="load-more-start end">暂无更多内容</div>')
						} else {
							$api.remove($api.dom('.load-more-start'));
							T.append('#main', '', '<div class="load-more-start">加载更多</div>')
						}
						return;
					}

					if(fieldData instanceof Array && fieldData.length != 0) {
						if(!args.justReturn) {
							T.append(args.container || '#main', args.template || 'list', fieldData);
						}

						if(typeof args.success === 'function') {
							args.success(fieldData, args.data.values.page);
						}

						$api.remove($api.dom('.load-more-start'));
						T.append('#main', '', '<div class="load-more-start">加载更多</div>')
					} else {
						Tool.toast({
							msg: '暂无更多内容',
							location: 'bottom',
							duration: 2000
						});

						$api.remove($api.dom('.load-more'));
						T.append('#main', '', '<div class="load-more-start end">暂无更多内容</div>')
					}
				},
				complete: args.complete || null,
			});
		},
	};

	window.LoadMore = c;
}(window);




/**
 * @author					xtg
 * @description			监听页面滚动的底部事件
 * @namespace				ScrollBottom
 * @version					1.0.0
 * @date            2018-03-02
 */
! function(window) {
	var c = {
		init: function(args) {
			if (!args) args = {};
			args.scrollDomSelector = args.scrollDomSelector || '#main';
			$(args.scrollDomSelector).scroll(function() {
				var scrollTop = 0;　　
				var scrollHeight = 0;　　
				var windowHeight = 0;
				
				scrollTop = args.scrollDomSelector ? $(this)[0].scrollTop : $(this).scrollTop();
				scrollHeight = args.scrollDomSelector ? $(this)[0].scrollHeight : $(document).height();
				windowHeight = args.scrollDomSelector ? $(document).height() : $(this).height();
				
				//发送正在滚动页面回调
				if (typeof args.scroll === 'function') {
					args.scroll(scrollTop + windowHeight);
				}

				if (scrollTop + windowHeight == scrollHeight) {
					Debug.toast('已经到底了')
					
					//发送页面滚动到底部回调
					if (typeof args.success === 'function') {
						args.success(scrollHeight);
					}
				}
			});
		}
	};

	window.ScrollBottom = c;
}(window);