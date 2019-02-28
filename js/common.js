! function(window) {
	//项目名称，组成异步地址、分享地址的一部分
	window.PROJECT_NAME = 'kejikeji';
	//是否为正式(生产)环境
	window.IS_FORMAL_ENV = false;
	//是否在测试环境打开调试
	window.IS_DEBUG = true;
	//是否打开funDebug调试
	window.IS_FUN_DEBUG = true;

	//域名
	window.ZHIXIAO_PREFIX = IS_FORMAL_ENV ? 'http://kjxt.kejikeji.shop/#/auth' : 'http://kjxt.kejikeji.shop/#/auth';
	window.PREFIX = IS_FORMAL_ENV ? 'http://shopapi.kejikeji.shop' : 'http://shopapi.kejikeji.shop';
	window.DOMAIN = IS_FORMAL_ENV ? 'http://shopapi.kejikeji.shop/public/index.php' : 'http://192.168.5.70/index.php';

	window.AJAX = {
		BASE_URL: DOMAIN,
	}

	window.CONFIG = {
		VERSION: '1.0.0', //app上架版本号，是组成本地数据库文件的名称的一部分
		DEBUG: (IS_DEBUG ? true : false),
		SHARE_URL: DOMAIN + '/H5',
		CHINESE_NAME: '可机可机',
		/*异步请求配置，用于获取服务器端数据*/
		AJAX: AJAX,
		AJ_PUSH: IS_FORMAL_ENV ? false : true,
		//是否添加极光推送模块
		IS_AJ_PUSH: false,

		/**七牛配置
		 * 上传服务器域名 {
	 	 * 上传到华东一区的域名为 up.qiniu.com、up-z0.qiniu.com 和 upload.qiniu.com;
	   * 上传到华北一区的域名为 up-z1.qiniu.com 和 upload-z1.qiniu.com
	   * }
	   */
		QI_NIU: {
			DOMAIN: IS_FORMAL_ENV ? 'http://qiniu.kejikeji.shop' : 'http://qiniu.kejikeji.shop',
			PREFIX: IS_FORMAL_ENV ? 'http://qiniu.kejikeji.shop/' : 'http://qiniu.kejikeji.shop/',
			UPLOAD_URL: IS_FORMAL_ENV ? 'http://up-z0.qiniup.com' : 'http://up-z0.qiniup.com',
		},

		KEY: { //预设键名，用于数据缓存
			USER_NAME: 'username', //键名：用户名
			MEMBER_INFO: 'memberinfo', //键名：用户信息
			MEMBER_INFO_ZB: 'memberinfo-zb', //键名：用户信息

			MEMBER_ID: 'id', //键名：用户id
			TOKEN: 'token', //键名：用户token
			APP_VERSION: 'appVersion', //键名：app编译版本号
			FIRST_OPEN: 'firstOpen', //键名：是否第一次打开app
			LON: 'lon', //键名：用户定位-经度
			LAT: 'lat', //键名：用户定位-纬度
			RELOGIN_EVENT: 'relogin', //退出登录事件
			CONTACT_UNREAD_COUNT: 'contactUnreadCount', //键名：客服未读条数
			LOCAL_SHARE_LOGO: '', //本地分享图标ICON路径
			SHARE_LOGO: '', //线上分享图标ICON路径
			// SHARE_UEL: PREFIX + '/AppShare/index.html',
			SHARE_UEL: PREFIX,
			MEIQIA: {
				APPKEY: IS_FORMAL_ENV ? '' : '',
			},
			VERSION: 'version', //版本号
			ISTEACH: 'isteach', //是否老师
			AVATAR: 'avatar',
			GLOBAL_DATA: 'global_data', //全局信息

			SHOP_CART: 'shop-cart', //购物车缓存

			LANG: 'cn', //cn中文 en英文 zh-hk繁体
			SALT: 'salt', //盐值
			CITY_LIST: 'city_list', //地区
			ASSET: 'asset', //资产
		},

		THEME: {
			BG_COLOR: '#f9f9f9',
			INIT_TAB_FIX_NAME: 'publish',
		},

		EVENT: { //预设键名，用于监听事件
			LOGIN: 'login', //监听用户登录
			LOGOUT: 'logout', //监听用户退出登录
			CLOSE_WIN: 'close_win',
			CHANGE_INFO: 'change_info', //监听修改用户信息
			AVATAR_CLIP: 'avatar_clip', //监听安卓截取头像
			UPLOAD_AVATAR: 'upload_avatar', //监听上传头像
			CLIP_IMAGE: 'clip_image', //监听 截取图片
			CHANGE_DEAL_GROUP: 'change_deal_group', //监听切换交易frameGroup
			UPDATE_USER_INFO: 'update_user_info', //监听修改用户信息
			UPDATE_LOGIN_PASSWORD: 'update_login_password', //监听刷新登录密码
		},

		API: { //定义API
			MEMBER_INFO: { ctrl: 'User', fn: 'userMyInfo', },
			UPLOAD_TOKEN: { ctrl: 'Qiniu', fn: 'getToken', },
		},
	};
}(window);


! function(window) {
	var ajax = {
		method: 'post',
		timeout: 30,
		cache: true,
		report: true,
		dataType: 'json',
		showLoading: true,
		data: '',
		loadType: 1,
		get: function(args) {
			var self = this;
			if(!args) args = {};
			if(!args.data) args.data = {};

			if(!args.hideLoading) {
				var code = '' +
				'<div class="null loading-null flex-box">' +
				'<div class="null-box">' +
				'<div class="loading-arrow"></div>' +
				'<div class="wait">' +
				'加载中' +
				'</div>' +
				'</div>' +
				'</div>';
				try {
					if(!$api.dom('.loading-null')) {
						if(args.container) {
							Tool.append(args.container, '', code);
						} else {
							Tool.append('body', '', code);
						}
					}
				} catch(e) {}
				args.loadType = args.loadType || self.loadType;
			}

			if(args.url){
				_url = args.url;
			}else{
				var module = (args.module ? args.module : 'mobile') + '/';
				_url = CONFIG.AJAX.BASE_URL+ '/' + module +  args.ctrl + '/' + args.fn;
			}
			if(CONFIG.DEBUG){
				console.log(_url)
			}
			if(!args.data) args.data = {};
			if(!args.data.values) args.data.values = {};

			args.data.values = Tool.assign({
				user_id: $api.getStorage(CONFIG.KEY.MEMBER_ID),
				token: $api.getStorage(CONFIG.KEY.TOKEN),
			}, args.data.values);

			$.ajax({
				type: args.type || self.method,
				url: _url,
				data: (!!args.data.values ? args.data.values:''),
				dataType: args.dataType || self.dataType,
				timeout: 0,
				cache: args.cache || false,
				success: function(data, status, xhr) {
					// console.log('ajax-success:' + JSON.stringify(data, null, 2));
					// console.log('ajax-success:', data);

					switch(parseInt(data.status)) {
						case 200:
							/*成功*/
							if(typeof args.success === 'function') {
								args.success(data.content);
							}
							break;
						case 250: /*服务器拒绝访问*/
						case 404: /*服务器拒绝访问*/
							if(args.showError){
								Tool.toast({
									msg: data.msg || '404非法访问:(',
								});
							}
							if(typeof args._404 === 'function'){
								args._404(data.msg || '404非法访问:(');
							}
							break;
						case 401: /*服务器拒绝访问*/
							if(typeof args._401 === 'function'){
								args._401(data.content);
							}
							break;
						case 403: /*权限不足*/
							if(typeof args._403 === 'function'){
								args._403();
							}else {
								Tool.reloginBefore();
								Tool.toast({
									msg: '账号可能在其他地方登陆过或账号信息已过期，请重新登录',
									mask: true,
								});
							}
							break;
					}
					//移除加载样式
					self.setloadType(args);
				},
				error: function(xhr, errorType, error) {
					console.log(error)
					//移除加载样式
					self.setloadType(args);
					if('function' === typeof args.error) {
						args.error(error);
					} else {
						Tool.toast({
							msg: error,
						})
					}
				},
				complete: function() {
					if('function' === typeof args.complete) {
						args.complete(args);
					}
				},
			});
		},
		error: function(err) {
			Tool.toast({
				msg: err.msg || '404非法访问:(',
			});
		},
		setloadType: function(args) {
			if(args.loadType) {
				switch(args.loadType) {
					case 1:
						/*去除下拉刷新样式*/
						if($api.dom('.loading-null.null')) {
							$api.remove($api.dom('.loading-null.null'));
						}
						break;
					case 2:
						/*scrolltobottom事件, 去除“加载中...”UI*/
						setTimeout(function() {
							$api.remove($api.dom('.load-more'));
						}, 300)
						break;
				}
			}
		},
	};

	window.ajax = ajax;
}(window);

//Former
!function(window){
	var f = {
		isPhone: function(val){
			if(val && /^1[3,5,7,8]\d{9}$/.test(val)){
				return true;
			}else{
				return false;
			}
		},
		isEmail: function(val){
			var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
			if(val && reg.test(val)){
				return true;
			}else{
				return false;
			}
		},
		validateNickname: function (nickname){
			if (nickname) {
				if (!/^[\u4E00-\u9FA5A-Za-z0-9]+$/.test(nickname)) {
					Tool.toast('昵称不能含有特殊字符~');
					return false;
				}
			} else {
				Tool.toast('请填写您的昵称~');
				return false;
			}
			return true;
		},
		validateRealname: function (value){
			if (value) {
				if (!/^[\u4E00-\u9FA5A-Za-z]+$/.test(value)) {
					Tool.toast('真实姓名不能含有数字、特殊字符~');
					return false;
				}
			} else {
				Tool.toast('请填写您的真实姓名~');
				return false;
			}
			return true;
		},
		validatePhone: function(phone){
			//验证手机号码合法性
			if (phone) {
				if (!/^1[3,4,5,7,8]\d{9}$/.test(phone)) {
					Tool.toast('手机号码不正确~');
					return false;
				}
			} else {
				Tool.toast('请填写您的手机号码~');
				return false;
			}
			return true;
		},
		validateEmail: function(email){
			//验证邮箱合法性
			if (email) {
				if (!/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(email)) {
					Tool.toast('邮箱地址不正确~');
					return false;
				}
			} else {
				Tool.toast('请填写您的邮箱地址~');
				return false;
			}
			return true;
		},
		validatePassword: function(password, text){
			//验证密码合法性
			if (!password) {
				Tool.toast( (text ? text : '密码') + '不能为空~');
				return false;
			} else if (password.length < 6) {
				Tool.toast( (text ? text : '密码') + '长度必须大于6位');
				return false;
			} else if (password.indexOf(' ') > -1) {
				Tool.toast( (text ? text : '密码') + '不能含有空格');
				return false;
			}
			return true;
		},
		checkPassword: function(pwd) {
			//验证密码长度8-16位,需包含数字,字母,符号至少2种以上元素
			var regUpper = /[A-Z]/;
			var regLower = /[a-z]/;
			var regNum = /[0-9]/;
			var regTeShu = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？+-]");
			var complex = 0;
			if (regLower.test(pwd)) {
					++complex;
			}
			if (regUpper.test(pwd)) {
					++complex;
			}
			if (regNum.test(pwd)) {
					++complex;
			}
			if(regTeShu.test(pwd)){
					++complex;
			}
			if(complex < 2 || pwd.length < 8) {
					return false;
			}
			return true;
		},
		is_define: function (value, text) {
			if (value == null || value == "" || value == "undefined" || value == undefined || value == "null" || value == "(null)" || value == 'NULL' || typeof(value) == 'undefined') {
				if(text && Tool) {
					Tool.toast( text );
				}
				return false;
			} else {
				value = value + "";
				value = value.replace(/\s/g, "");
				if (value == "") {
					if(text && Tool) {
						Tool.toast( text );
					}
					return false;
				}
				return true;
			}
		},
		getValue: function(dom) {
			/*获取输入组建的值
			*/
			if(!dom) return '';

			var selector = typeof dom == 'object' ? dom : $api.dom(dom);
			if(!selector) return '';

			return $api.trimAll( $api.val( selector ) );
		},
		setValue: function(dom, value) {
			/*设置输入组建的值
			*/
			if(!dom) return;
			var selector = typeof dom == 'object' ? dom : $api.dom(dom);

			return $api.trimAll( $api.val( selector, value ) );
		},
	};

	window.Former = f;
}(window);


/*
 * Tool的网页版
 *
 * 创建于 2015-11-1
 */
!function(window){
	var t = {
		toast: function(args) {
			/**
			 * 弹出一个定时自动关闭的提示框
			 * args内部结构
			 * @param		{string}	msg		提示信息
			 * @param		{number}	duration		提示框显示时间
			 * @param		{boolean}mask		是否需要遮罩层 1需要0不需要 默认不需要
			 * @param		{string}location		遮罩层弹出位置 top, middle, bottom 默认top
			 * @param		{boolean}nohide		是否倒计时关闭弹出框
			 * @param		{function}success		回调
			 */
			if(typeof args != 'object' && JSON.stringify(args) != '{}') {
				var msgs = args;
				args = {};
				args.msg = msgs;
			}

			var msg = args.msg || '未知信息',
					duration = args.duration || 2000,
					mask = args.mask || false,
					nohide = args.nohide || false,
					location = args.location || 'top';

			var time = new Date().getTime() + Math.random();
			var toastDom = '';
			var _html = '';

			var pos = '';
			switch(location) {
				case 'top':
					pos = '20%';
					break;
				case 'middle':
					pos = '50%';
					break;
				case 'bottom':
					pos = '80%';
					break;
			}

			if(mask) {
				_html = '<div class="null">' +
					'<div class="toast-box toast" data-toast-time="'+ time +'" style="z-index: '+ time +';top: '+ pos +';">'+
						msg +
					'</div>' +
				'</div>';
			}else {
				_html = '<div class="toast-box toast" data-toast-time="'+ time +'" style="z-index: '+ time +';top: '+ pos +';">'+
						msg +
				'</div>';
			}
			Tool.append('body', '', _html)

			toastDom = $api.dom('[data-toast-time="'+ time +'"]');

			$api.addCls(toastDom, 'show');

			function hide() {
				setTimeout(function() {
					if(toastDom) {
						$api.addCls(toastDom, 'hide');
						setTimeout(function() {
							$api.remove( mask ? $api.closest(toastDom, '.null') : toastDom );
						}, 500)
					}
				}, duration ? duration : 2000)
			}
			if (!nohide) {
				hide();
			}
			if (typeof args.success == 'function') {
				args.success(toastDom);
			}
		},
		getUrlParam: function(name) {
			/*获取当前地址是否存在某个参数
			 */
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if(r != null) return unescape(r[2]);
			return null;
		},
		parseParam: function(param) {
			/*json 转url参数
			 */
			if(!param) return '';
			var paramStr = "";
			if(param instanceof Object) {
				for(var i in param) {
					paramStr += (paramStr ? "&" : '?') + i + '=' + param[i];
				}
			}
			return paramStr;
		},
		parseUrl: function(url) {
			/*url地址 转json
			 */
			if(!url) return '';
			var args = {}, //保存数据的对象
				items = url.split('?').length > 1 ? url.split('?')[1] : [], //取第一项
				items = url.split('?').length > 1 ? items.split('&') : [],
				item = null,
				name = null,
				value = null,
				i = 0,
				len = items.length;

			//逐个将每一项添加到args对象中
			for(i = 0; i < len; i++) {
				item = items[i].split('=');
				name = decodeURIComponent(item[0]);
				value = decodeURIComponent(item[1]);
				if(name.length) {
					args[name] = value;
				}
			}
			return args;
		},
		html: function(selector, template, data){
			$api.html(typeof selector == 'object' ? selector : $api.dom(selector), template ? doT.template($api.html($api.dom('[template="'+template+'"]')))(data||'') : (data || ''));
			try{
				api.parseTapmode();
			}catch(e){
			}
		},
		append: function(selector, template, data){
			$api.append(typeof selector == 'object' ? selector : $api.dom(selector), template ? doT.template($api.html($api.dom('[template="'+template+'"]')))(data||'') : (data || ''));
			try{
				api.parseTapmode();
			}catch(e){
			}
		},
		prepend: function(selector, template, data){
			$api.prepend(typeof selector == 'object' ? selector : $api.dom(selector), template ? doT.template($api.html($api.dom('[template="'+template+'"]')))(data||'') : (data || ''));
			try{
				api.parseTapmode();
			}catch(e){
			}
		},
		after: function(selector, template, data){
			$api.after(typeof selector == 'object' ? selector : $api.dom(selector), template ? doT.template($api.html($api.dom('[template="'+template+'"]')))(data||'') : (data || ''));
			try{
				api.parseTapmode();
			}catch(e){
			}
		},
		before: function(selector, template, data){
			$api.before(typeof selector == 'object' ? selector : $api.dom(selector), template ? doT.template($api.html($api.dom('[template="'+template+'"]')))(data||'') : (data || ''));
			try{
				api.parseTapmode();
			}catch(e){
			}
		},
		val: function (selector, template, data) {
			$api.val(typeof selector == 'object' ? selector : $api.dom(selector), data || '');
			try {
				api.parseTapmode();
			} catch(e) {

			}
		},
		getQueryStringArgs: function(){
				//取得查询字符串并去掉开头的问号
			var qs = (location.search.length > 0 ? location.search.substring(1) : ''),
				//保存数据的对象
					args = {},
				//取得每一项
					items = qs.length ? qs.split('&') : [],
					item = null,
					name = null,
					value = null,
					i = 0,
					len = items.length;
				//逐个将每一项添加到args对象中
				for(i = 0; i < len; i++){
					item = items[i].split('=');
					name = decodeURIComponent(item[0]);
					value = decodeURIComponent(item[1]);
					if(name.length){
						args[name] = value;
					}
				}
			return args;
		},
		hasProp: function(obj){
			/*判断object是否为空*/
			if(typeof obj === 'object' && !(obj instanceof Array)){
				var hasProp = false;
				for(var prop in obj){
					hasProp = true;
					break;
				}
			}
			return hasProp || false;
		},
		removeHTMLTag:function(str){
			//过滤html标签
			str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
			str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
			//str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
			str=str.replace(/&nbsp;/ig,'');//去掉&nbsp;
			return str;
		},
		toHTML: function(str){
			//实体转html
			if(str){
				var regx = /&[l,g]t;|&quot;|&nbsp;|&amp;#39;|&amp;/gm,
						_html = str.replace(regx, function(match){
							switch(match){
								case '&amp;#39;':
									return '\'';
								case '&lt;':
									return '<';
								case '&gt;':
									return '>';
								case '&quot;':
									return '"';
								case '&nbsp;':
									return '';
								case '&amp;':
									return '&';
							}
						});
				return _html;
			}else{
				return '';
			}
		},
		imageCompressByQiNiu: function(url, model, w, h){
			//七牛图片压缩
			return url + '?imageView2/' + model + '/w/' + w + '/h/' + h;
		},
		parseDate: function(timestamp){
			/*将时间戳转换为年、月、日、时、分、秒
			 */
			timestamp = timestamp.toString();
			if(timestamp.length == 10){
				/*PHP返回的时间戳长度为10，JS要求的长度必须13
				 * 若长度不足，则以0补充
				 */
				timestamp = parseInt(timestamp) * 1000;
			}
			var _d = new Date(timestamp);
			return {
				year: _d.getFullYear(),
				month: _d.getMonth() + 1,
				date: _d.getDate(),
				hour: _d.getHours(),
				minute: _d.getMinutes(),
				second: _d.getSeconds(),
			};
		},
		assign: function(object1,object2){
			/**
			 * @description 克隆对象并合并对象
			 * @param {Object} object1 要克隆的对象
			 * @param {Object} object2 要合并的对象
			 */
			var obj1 = JSON.parse(JSON.stringify(object1));
			if(typeof object2 == 'object'){
				for(var i in object2){
					obj1[i] = object2[i];
				}
			}
			return obj1;
		},
		setCNToUrl: function (name) {
			/**
			 * 在url上传递中文
			 */
			if (!name) return name;
			return encodeURI( encodeURI( name ) )
		},
		getCNToUrl: function (name) {
			/**
			 * 获取url上的中文
			 */
			if (!name) return name;
			return decodeURI( decodeURI( name ) )
		},
		returnNull: function(msg) {
			var msg = msg || '暂无相关数据';
			//暂无相关信息
			var _html = '<div class="" style="z-index: 1;padding-top: 10%;">' +
				'<div class="img-null"></div>' +
				'<div class="text-center font-null">' +
					 msg +
				'</div>' +
			'</div>';
			return _html;
		},
		reloginBefore: function(cb) {
			setTimeout(function (){
				window.location.href="../login/login.html";
			},2000)
			if(!cb) {
				//去除缓存
				$api.rmStorage(CONFIG.KEY.MEMBER_ID);
				$api.rmStorage(CONFIG.KEY.TOKEN);
				$api.rmStorage(CONFIG.KEY.MEMBER_INFO);
				$api.rmStorage(CONFIG.KEY.VERSION);
				return;
			}

			if(!CONFIG.IS_AJ_PUSH) {
				if(typeof cb === 'function') {
					cb();
				}
				return;
			}
			// Tool.closeAjpush(cb);
			
		},
		loginTip: function () {
			//当用户还未登录 提示要其登录
			Tool.toast({
        msg: '您还未登录,请先登录',
        type: 2,
			})
    },
		isLogin: function (args) {
			args = args ? args : {};
			//获取是否有 登录
			if ($api.getStorage(CONFIG.KEY.MEMBER_ID) && $api.getStorage(CONFIG.KEY.TOKEN)) {
				if (args && typeof args.success == 'function') {
					args.success();
				}
			} else {
				if (args && typeof args.error == 'function') {
					args.error();
				}else {
					Tool.loginTip();
					Tool.reloginBefore();
				}
				return false;
			}
		},
	};

	window.Tool = t;
}(window);

/**
 * @author					xtg
 * @description		封装了模板拼接函数，必须先导入doT.js
 * @namespace			T
 * @date           2018-03-02
 */
! function(window) {
	var t = {
		html: function (selector, template, data) {
			$api.html(typeof selector == 'object' ? selector : $api.dom(selector), template ? (doT.template($api.html($api.dom('[template="' + template + '"]')))(data || '')) : (data));
			try {
				api.parseTapmode();
			} catch(e) {

			}
		},
		append: function(selector, template, data) {
			$api.append(typeof selector == 'object' ? selector : $api.dom(selector), template ? (doT.template($api.html($api.dom('[template="' + template + '"]')))(data || '')) : (data));
			try {
				api.parseTapmode();
			} catch(e) {

			}
		},
		prepend: function(selector, template, data) {
			$api.prepend(typeof selector == 'object' ? selector : $api.dom(selector), template ? (doT.template($api.html($api.dom('[template="' + template + '"]')))(data || '')) : (data));
			try {
				api.parseTapmode();
			} catch(e) {

			}
		},
		before: function(selector, template, data) {
			$api.before(typeof selector == 'object' ? selector : $api.dom(selector), template ? (doT.template($api.html($api.dom('[template="' + template + '"]')))(data || '')) : (data));
			try {
				api.parseTapmode();
			} catch(e) {

			}
		},
		after: function(selector, template, data) {
			$api.after(typeof selector == 'object' ? selector : $api.dom(selector), template ? (doT.template($api.html($api.dom('[template="' + template + '"]')))(data || '')) : (data));
			try {
				api.parseTapmode();
			} catch(e) {

			}
		},

		val: function (selector, template, data) {
			$api.val(typeof selector == 'object' ? selector : $api.dom(selector), data || '');
			try {
				api.parseTapmode();
			} catch(e) {

			}
		},
	};
	window.T = t;
}(window);



/**
 * 基本方法
 */
!function(window) {
	var my = {
		getCode: function(type, cb) {
			var tel = '';
			if($api.dom('[name=tel]')) {
				tel = Former.getValue('[name=tel]');
			}else if($api.dom('.tel')) {
				tel = $api.html($api.dom('.tel'));
			}
			if(!Former.is_define(tel, '请输入手机号')) {
				return;
			}
			var values = {
				mobile: tel,
				type: type,
			}
			ajax.get({
				ctrl: 'Reg',
				fn: 'getSmsCode',
				data: {
					values: values,
				},
				showProgress: true,
				// hideLoading: false,
				showError: true,
				success: function(ct) {
					if(typeof cb === 'function') {
						cb(ct);
					}else {
						Tool.toast('发送验证码成功，请注意查收');
						MyApi.setTime();
					}
				},
			})
		},
		checkCode: function(args, cb) {
			if(!args) args = {};
			var values = {
				mobile: args.tel,
				code: args.code,
			}
			ajax.get({
				ctrl: 'Reg',
				fn: 'yanzhenCode',
				data: {
					values: values,
				},
				_404: function(msg) {
					if(typeof args._404 === 'function') {
						args._404(msg);
					}
				},
				showProgress: true,
				hideLoading: true,
				showError: true,
				success: function(ct) {
					if(typeof cb === 'function') {
						cb(ct);
					}
				},
			})
		},
		getMemberInfo: function(args) {
			if(!args) args = {};
			var id = $api.getStorage(CONFIG.KEY.MEMBER_ID);
			var token = $api.getStorage(CONFIG.KEY.TOKEN);
			if(id && token) {
				ajax.get({
					ctrl: 'User',
					fn: 'userMyInfo',
					data: {
						values: {},
					},
					showProgress: typeof args.showProgress == 'boolean' ? args.showProgress : true,
					hideLoading: typeof args.hideLoading == 'boolean' ? args.hideLoading : true,
					showError: typeof args.showError == 'boolean' ? args.showError : true,
					success: function(ct) {
						ct.id = ct.user_id;
						$api.setStorage(CONFIG.KEY.MEMBER_INFO, ct);
						if(typeof args.success === 'function') {
							args.success(ct);
						}
					},
				})
			}
		},
		setTime: function() {
			//倒计时
			var count = 60,
					code = $api.dom('.send-code-btn');
			code.disabled = true;
			var InterValObj = setInterval(function() {
				if(count > 0) {
					$api.text(code, '重新发送(' + (count--) + 's)');
				}else {
					clearInterval(InterValObj);
					code.disabled = false;
					$api.text(code,'获取验证码');
				}
			},1000);
		},
	};
	window.MyApi = my;
}(window);


/*
 * 支付键盘模块
 * 需要配合common.js使用
 * 创建时间：2018-01-31
 */
! function(window) {
	var pb = {
		loading: false,
		password: '',
		moduleName: 'setpay_keyboard',
		dom: '.keyboard.module',
		selector: '#wrap',
		inSelector: '.module-wrap',
		init: function(args) {
			var self = this;
			if(!args) args = {};
			this.args = args;
			this.moduleName = args.moduleName || this.moduleName;
			this.selector = args.selector || this.selector;
			this.inSelector = args.inSelector || this.inSelector;
			this.dom = args.dom || this.dom;
			this.password = '';
		},
		clearValue: function() {
			var self = this;
			/*清除输入的支付密码
			 */
			this.loading = false;
			this.password = '';
			var pDoms = $api.domAll('.password .point');
			for(var i = 0;i<pDoms.length;i++) {
				$api.addCls(pDoms[i], 'hidden');
			}
		},
		numKeyboardListener: function(e) {
			var self = this;
			var numDom = e.target,
					num = $api.attr(numDom, 'data-num'),
					passwordPointHiddenDom = $api.dom('.password .point.hidden'),
					allPasswordPointDoms = $api.domAll('.password .point'),
					allPasswordPointHiddenDoms = $api.domAll('.password .point.hidden');

			if(num){
				if(num != '-1'){
					if(passwordPointHiddenDom){
						//拼接密码
						this.password += num;
						//console.log(this.password)
						//显示密码点占位符
						$api.removeCls(passwordPointHiddenDom, 'hidden');
						//检查密码是否输入完毕
						if(allPasswordPointHiddenDoms.length == 1){
							//密码输入完毕，关闭键盘，调用相关接口验证支付密码
							console.log('验证支付密码：' + this.password);
							this.loading = true;
							// api.showProgress();
							//测试
							if(typeof self.args.success == 'function'){
								// api.hideProgress();
								self.loading = false;
								self.args.success(self.password);
							}
						}
					}
				}else{
					if(this.loading) return;
					//退格键
					if(6 - allPasswordPointHiddenDoms.length){
						//隐藏最后一位的密码点占位符
						$api.addCls(allPasswordPointDoms[5-allPasswordPointHiddenDoms.length], 'hidden');
						//重新处理密码字符串
						this.password = this.password.slice(0, -1);
						this.loading = false;

						//console.log(this.password)
					}
				}
			}
		},

		show: function(cb) {
			var self = this;
			/*显示弹出框
			 */
			if($api.dom(this.dom) && $api.closest($api.dom(this.dom), this.inSelector)) {
				$api.removeCls($api.closest($api.dom(this.dom), this.inSelector), 'hidden');
			}
			$api.addCls($api.dom(this.dom), 'show');
			$api.removeCls($api.dom(this.dom), 'hide');

			if(typeof cb == 'function') {
				setTimeout(function() {
					cb();
				}, 30)
			}
		},
		hide: function(cb, flag) {
			var self = this;
			/*隐藏/关闭弹出框
			 * flag 是否移除弹出框节点 1是0否
			 */
			self.clearValue();

			$api.addCls($api.dom(this.dom), 'hide');
			$api.removeCls($api.dom(this.dom), 'show');

			setTimeout(function() {
				if($api.dom(self.dom) && $api.closest($api.dom(self.dom), self.inSelector)) {
					console.log('test')
					$api.addCls($api.closest($api.dom(self.dom), self.inSelector), 'hidden');
				}
				if(flag) {
					self.removeDom();
				}
			}, 300)

			if(typeof cb == 'function') {
				cb();
			}
		},
		removeDom: function() {
			var self = this;
			/*移除弹出框节点
			 */
			$api.remove($api.closest($api.dom(this.dom), this.inSelector));
			if(typeof self.args.removeSuccess == 'function'){
				self.args.removeSuccess();
			}
		},
	};
	window.payBoard = pb;
}(window);



/**
 * @author					xtg
 * @description		封装了时间工具函数
 * @namespace			D
 * @date           2018-03-02
 */
! function(window) {
	var d = {
		t1: function(pts, flag) {
			/*
			 *参数
			 * string/number pts 过去的时间戳
			 * boolean flag: '我的消息'一周之外只显示：月/日
			 */
			pts = this.formatTS(pts);
			var now = new Date(),
				nts = now.getTime(),
				pass = new Date(pts);
			/*是否在三天内：今天、昨天、前天*/
			var isT = this.isT(pts, now);
			if(isT) {
				return isT;
			}
			/*是否在这一周内*/
			var isInWeek = this.isInWeek(pts, now);
			if(isInWeek) {
				return isInWeek;
			}
			/*超出一周范围*/
			var moment,
				hours = pass.getHours();
			if(hours >= 0 && hours < 6) {
				moment = '凌晨 ';
			} else if(hours >= 6 && hours < 12) {
				moment = '上午 ';
			} else if(hours == 12) {
				moment = '中午 ';
			} else if(hours > 12 && hours < 18) {
				moment = '下午 ';
			} else {
				moment = '晚上 ';
			}
			if(flag) {
				return(pass.getMonth() + 1) + '月' + pass.getDate() + '日';
			} else {
				return(pass.getMonth() + 1) + '月' + pass.getDate() + '日 ' + moment + (pass.getHours() > 9 ? pass.getHours() : '0' + pass.getHours()) + ':' + (pass.getMinutes() > 9 ? pass.getMinutes() : '0' + pass.getMinutes());
			}
		},
		t2: function(ts) {
			/*仿微信朋友圈列表发布时间
			 * ts 发布时间戳
			 */
			ts = this.formatTS(ts);
			var now = new Date(),
				nts = now.getTime(),
				pts = nts - ts; //时间差

			if(pts < 1000 * 60) {
				return '刚刚';
			} else if(pts < 1000 * 60 * 60) {
				return parseInt(pts / 1000 / 60) + '分钟前';
			} else if(pts < 1000 * 60 * 60 * 24) {
				return parseInt(pts / 1000 / 60 / 60) + '小时前';
			} else {
				return parseInt(pts / 1000 / 60 / 60 / 24) + '天前';
			}
		},
		t3: function(ts) {
			/*仿微信朋友圈-帖子详情内的发布时间
			 * ts 发布时间戳
			 */
			ts = this.formatTS(ts);
			var now = new Date(),
				nts = now.getTime(),
				pass = new Date(ts),
				pyear = pass.getFullYear(),
				phour = pass.getHours(),
				pminute = pass.getMinutes(),
				psecond = pass.getSeconds(),
				pts = nts - ts; //时间差
			pminute = pminute > 9 ? pminute : '0' + pminute;
			if(nts > pts && nts < pts + (24 - phour) * 60 * 60 * 1000 + (60 - pminute) * 60 * 1000 + (60 - psecond) * 1000) {
				//今天发布的
				return phour + ':' + pminute;
			} else if(now.getFullYear() == pyear) {
				//今年发布
				return(pass.getMonth() + 1) + '月' + pass.getDate() + '日  ' + phour + ':' + pminute;
			} else {
				//更久以前发布
				return pyear + '年' + (pass.getMonth() + 1) + '月' + pass.getDate() + '日  ' + phour + ':' + pminute;
			}
		},
		formatTS: function(ts) {
			/*若时间戳为字符串则转型*/
			if('string' === typeof st) {
				ts = parseInt(ts);
			}
			/*由于PHP返回的时间戳为10位，不足13位则补充*/
			if(ts.toString().length < 13) {
				ts *= 1000;
			}
			return ts;
		},
		/*时间格式化f系列方法*/
		f1: function(t, flag) {
			var t = new Date(parseInt(t) * 1000);
			return t.getFullYear() + flag + (t.getMonth() + 1) + flag + t.getDate();
		},
		isT: function(pts, now) {
			/*是否在三天内：今天、昨天、前天*/
			/*pts为过去时间戳，now为现在的日期对象*/
			pts = this.formatTS(pts);
			var nts = now.getTime(),
				pass = new Date(pts);
			if((nts - (now.getHours() + 24 * 2) * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000) <= pts) {
				var moment;
				/*三天内*/
				if(now.getDate() == pass.getDate()) {
					/*今天*/
					var hours = pass.getHours();
					if(hours >= 0 && hours < 6) {
						moment = '凌晨 ';
					} else if(hours >= 6 && hours < 12) {
						moment = '上午 ';
					} else if(hours == 12) {
						moment = '中午 ';
					} else if(hours > 12 && hours < 18) {
						moment = '下午 ';
					} else {
						moment = '晚上 ';
					}
				} else if((nts - (now.getHours() + 24) * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000) <= pts) {
					/*昨天*/
					moment = '昨天 ';
				} else if((nts - (now.getHours() + 24 * 2) * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000) <= pts) {
					/*前天*/
					moment = '前天 ';
				}
				return(moment || (pass.getMonth() + 1) + '月' + pass.getDate() + '日 ') + (pass.getHours() > 9 ? pass.getHours() : '0' + pass.getHours()) + ':' + (pass.getMinutes() > 9 ? pass.getMinutes() : '0' + pass.getMinutes());
			}
			return false;
		},
		isInWeek: function(pts, now) {
			/*是否在这一周内*/
			/*pts为过去时间戳，now为现在的日期对象*/
			var x = now.getDay(),
				/*今天星期几*/
				nts = now.getTime(),
				pass = new Date(pts);
			if(x > 3) {
				if(nts - (now.getHours() + 24 * (x == 0 ? 6 : x)) * 60 * 60 * 1000 - now.getMinutes() * 60 * 1000 - now.getSeconds() * 1000 <= pts) {
					var weekDay;
					switch(pass.getDay()) {
						case 0:
							weekDay = '周日';
							break;
						case 1:
							weekDay = '周一';
							break;
						case 2:
							weekDay = '周二';
							break;
						case 3:
							weekDay = '周三';
							break;
						case 4:
							weekDay = '周四';
							break;
						case 5:
							weekDay = '周五';
							break;
						case 6:
							weekDay = '周六';
							break;
					}
					return weekDay + ' ' + (pass.getHours() > 9 ? pass.getHours() : '0' + pass.getHours()) + ':' + (pass.getMinutes() > 9 ? pass.getMinutes() : '0' + pass.getMinutes());
				}
			}
			return false;
		},
	};
	window.D = d;
}(window);
