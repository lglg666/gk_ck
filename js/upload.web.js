/*
 * 作用：文件上传：图片、音频、视频
 * 创建于 2015-7-18 9：36
 * 更新于 2018-02-04
 */

! function(window) {
	var up = {
		defaultFiles: [],
		/*需要上传的文件数组*/
		uploadFiles: [
			/* {
				id: '',
				file: '',
			},
			 */
		],
		qiNiuToken: '',//上传前需要获取七牛上传token
		isUpload: false, //是否正在上传
		fileIndex: 0,
		callbackEvent: 'uploadSuccess', //所有文件上传完成后的触发事件
		values: {}, //异步参数
		xmlAjax: function (args) {
			var xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", function (evt) {
				console.log(evt)
				if (typeof args.progress === 'function') {
					args.progress(evt);
				}
			}, false)
			xhr.onreadystatechange = function () {
				// console.log(xhr)
				if (typeof args.success === 'function') {
					args.success(xhr);
				}
				// if (xhr.readyState == 4 && xhr.state == 200 && xhr.responseText != "") {
				// 	var blkRet = JSON.parse(xhr.responseText);
				// 	console && console.log(blkRet);
				// }
			}

			var formData = new FormData();
			formData.append('token', args.data.token);
			formData.append('file', args.data.file);

			xhr.open('POST', args.url, true);
			xhr.send( formData );
		},
		init: function(args) {
			this.callbackEvent = args.callbackEvent || self.callbackEvent;
			this.values = args.values || self.values;

			// if(args.files && args.files.length != 0) {
			// 	for(var i=0;i<args.files.length,g=args.files[i];i++) {
			// 		this.defaultFiles.push(g);
			// 	}
			// }
			this.uploadFiles = args.files || self.uploadFiles;

			/*执行文件上传*/
			this.run();
		},
		run: function() {
			var self = this;

			var fileIndex = 0;
			//设置正在上传
			self.isUpload = true;

			/*开始上传第一个文件*/
			getQiNiuToken(this.uploadFiles[fileIndex]);

			/*闭包-获取上传token*/
		 	function getQiNiuToken(args){
				ajax.get({
					ctrl: 'Qiniu',
					fn: 'getToken',
					data: {
						values: {}
					},
					hideLoading: true,
					showError: true,
					success: function(ct){
						self.qiNiuToken = ct.upToken;
						single(args);
					}
				});
			}

			/*begin 闭包-单文件上传*/
			function single(args) {
				self.xmlAjax({
					url: CONFIG.QI_NIU.UPLOAD_URL,
					// url: 'http://up-z2.qiniup.com',
					method: 'post',
					data: {
						file: args.file,
						token: self.qiNiuToken,
					},
					progress: function (ret) {
						self.uploading({
							args: args,
							ret: ret,
						});
					},
          success: function(ret, err) {
            console.log(ret);
						
						if (ret.readyState == 4 && ret.status == 200 && ret.responseText != "") {
							var body = JSON.parse(ret.responseText);
							if(body.key) {
								/*成功上传文件，后续逻辑处理*/
									self.done({
										ret: body,
										args: args,
									});

								fileIndex += 1;

								if(fileIndex < self.uploadFiles.length) {
									self.isUpload = true;
									/*继续上传下一个文件*/
									getQiNiuToken(self.uploadFiles[fileIndex]);
								} else {
									if(self.callbackEvent) {
										//上传完成
										try {
											api.sendEvent({
												name: self.callbackEvent,
												extra: args,
											});
										} catch (error) {
										}
									}

									/*多文件上传完毕,重置索引, 文件数组, uploadType*/
									fileIndex = 0;
									self.uploadFiles = [];
									self.isUpload = false;
								}
							}else {
								try {
									api.hideProgress();
									if('wifi' != api.connectionType){
										api.toast({
											msg: '当前网络环境不太稳定，建议在wifi下上传',
											duration: 2000,
											location: 'bottom'
										});
									}
								} catch (error) {
								}
							}
						} else if (ret.readyState == 2) {
							self.error({
								args: args,
							});
				
							fileIndex += 1;
							if(fileIndex < self.uploadFiles.length) {
								self.isUpload = true;
								/*继续上传下一个文件*/
								getQiNiuToken(self.uploadFiles[fileIndex]);
							} else {
								/*多文件上传完毕,重置索引*/
								fileIndex = 0;
				
								self.isUpload = false;
							}
						}
					},
				});
			}
		},
		uploading: function(data) {
			var ret = data.ret; //异步返回的数据
			var args = data.args;
			var id = args.id;

			if(!ret) ret = {};

			var pDom = this.getDomId(id);
			if(!pDom) return;

			//获取需要操作的元素
			var delBtnDom = this.findChildDom(id, '.del-btn');
			var readyDom = this.findChildDom(id, '.ready');
			var uploadDom = this.findChildDom(id, '.upload');
			var percentDom = this.findChildDom(id, '.percent');
			var errorDom = this.findChildDom(id, '.error');
			var successDom = this.findChildDom(id, '.success');

			//设置status为success
			this.setDomAttr(id, 'data-status', 'upload');

			var loaded = ret.loaded;
			var total = ret.total;
			var progress = (ret.loaded ? parseFloat(parseFloat(ret.loaded) / parseFloat(ret.total) * 100).toFixed(0) : 0) + '%';
			Debug.log("上传进度" + progress);
			$api.html(percentDom, progress);
		},
		done: function(data) {
			var ret = data.ret; //异步返回的数据
			var args = data.args;
			var id = args.id;

			var pDom = this.getDomId(id);
			if(!pDom) return;

			//获取需要操作的元素
			var delBtnDom = this.findChildDom(id, '.del-btn');
			var readyDom = this.findChildDom(id, '.ready');
			var uploadDom = this.findChildDom(id, '.upload');
			var percentDom = this.findChildDom(id, '.percent');
			var errorDom = this.findChildDom(id, '.error');
			var successDom = this.findChildDom(id, '.success');

			//设置status为success
			this.setDomAttr(id, 'data-status', 'success');
			//设置上传成功返回的标识
			Debug.log("设置上传成功返回的标识" + ret.key);
			this.setDomKeyAttr(id, ret.key);
		},
		error: function(data) {
			try {
				api.hideProgress();
			} catch (error) {
			}

			var args = data.args;
			var id = args.id;

			var pDom = this.getDomId(id);
			if(!pDom) return;

			//获取需要操作的元素
			var delBtnDom = this.findChildDom(id, '.del-btn');
			var readyDom = this.findChildDom(id, '.ready');
			var uploadDom = this.findChildDom(id, '.upload');
			var percentDom = this.findChildDom(id, '.percent');
			var errorDom = this.findChildDom(id, '.error');
			var successDom = this.findChildDom(id, '.success');

			//设置status为success
			this.setDomAttr(id, 'data-status', 'error');
		},

		getDomAttr: function(id, name) {
			/*获取自定义dom属性
			 * id 元素id
			 */
			return $api.attr(this.getDomId(id), name || 'data-status');
		},
		setDomAttr: function(id, name, status) {
			/*设置自定义dom属性
			 * id 元素id
			 * status 元素属性值
			 */
			$api.attr(this.getDomId(id), name || 'data-status', status);
		},
		setDomKeyAttr: function(id, key) {
			/*设置自定义dom  key属性
			 * id 元素id
			 * key 元素属性值
			 */
			$api.attr(this.getDomId(id), 'data-key', key);
		},
		getDomId: function(id) {
			/*获取dom
			 */
			return $api.dom('[data-file-id="' + id + '"]');
		},
		findChildDom: function(id, name) {
			/*获取子dom属性
			 */
			if(!name) return;
			return $api.dom(this.getDomId(id), name);
		},
		findParentDom: function(id, name) {
			/*获取父dom属性
			 */
			if(!name) return;
			return $api.closest(this.getDomId(id), name);
		},

		addApi: function(files, args) {
			var self = this;
			var newFiles = [];

			if(files && files instanceof Array && files.length != 0) {
				for(var i=0;i<files.length;i++) {
					var id = new Date().getTime() + Math.random();
					var obj = {
						file: files[i].file,
						id: id,
						status: 'ready',
					}

					self.defaultFiles.push(obj);

					//是否正在上传
					if(self.isUpload) {
						self.uploadFiles.push(obj);
					}else {
						newFiles.push(obj);
						if(parseInt(i + 1) == files.length) {
							Upload.init(Tool.assign({
								files: newFiles,
							}, args ? args : {}));
						}
					}
					if($api.dom('.add-img-btn')) {
						T.before('.add-img-btn', 'img', {
							img: files[i].file,
							file: files[i].file,
							id: id,
						});
					}
				}
				if(args && typeof args.success == 'function') {
					args.success();
				}
			}
		},

		add: function(args) {
			var self = this;

			//模拟点击上传文件
			var inp = $('input[name=upload-file]')[0];

			if(!inp) return;

			$api.val(inp, '');
			inp.click();

			inp.onchange = function() {
				var newFiles = [];
				var filesArr = this.files;
        for (var i = 0; i < this.files.length; i++) {
          if (i < args.max) {
            console.log('i::', i)
            var file = this.files[i];
            console.log(file);
  
            (function(i){
              var fr = new FileReader();
              fr.readAsDataURL(file);
							fr.onload = function () {
                var id = new Date().getTime() + Math.random();
                var obj = {
                  file: file,
                  // file: this.result,
                  id: id,
                  status: 'ready',
								}
								
                //是否正在上传
                if(self.isUpload) {
                  self.uploadFiles.push(obj);
                }else {
									newFiles.push(obj);
                  if(parseInt(i + 1) == filesArr.length) {
                    Upload.init(Tool.assign((args ? args : {}), {
                      files: newFiles,
                    }));
                  }
                }
                if($api.dom( (args.dom ? args.dom : '') + ' .add-img-btn')) {
                  T.before( (args.dom ? args.dom : '') + ' .add-img-btn', 'img', {
                    img: this.result,
                    file: file,
                    id: id,
                  });
                }
                if(args && typeof args.success == 'function') {
                  args.success();
                }
              }
            })(i);
          }
        }
			}
		},
		del: function(_this, e, id) {
			/*移除图片
			 */

			var self = this;

			e.stopPropagation();
			var pDom = this.getDomId(id);
			if(!pDom) return;

			var status = this.getDomAttr(id);
			if(status == 'upload') {
				Tool.toast('该文件上传中，请稍后删除');
				return;
			}

			var uploadFilesArr = self.uploadFiles;
			if(uploadFilesArr && uploadFilesArr instanceof Array && uploadFilesArr.length != 0) {
				for(var i = 0; i < uploadFilesArr.length; i++) {
					if(uploadFilesArr[i].id == id) {
						uploadFilesArr.splice(i, 1);
						break;
					}
				}
			}
			var ndefaultFiles = self.defaultFiles;
			if(ndefaultFiles && ndefaultFiles instanceof Array && ndefaultFiles.length != 0) {
				for(var i = 0; i < ndefaultFiles.length; i++) {
					if(ndefaultFiles[i].id == id) {
						ndefaultFiles.splice(i, 1);
						break;
					}
				}
			}
			//重置上传图片数组
			self.defaultFiles = ndefaultFiles;
			self.uploadFiles = uploadFilesArr;

			$api.remove(pDom);
		},
		previewApi: function(_this, e, id) {
			var self = this;

			e.stopPropagation();
			var pDom = this.getDomId(id);
			if(!pDom) return;

			//判断图片上传状态，错误状态点击重新上传
			var status = this.getDomAttr( id, 'data-status' );

			if(status == 'error') {
				//执行重新上传事件
				var rs = '';
				for(var i=0; i<self.defaultFiles.length,g=self.defaultFiles[i]; i++) {
					if(g.id == id) {
						rs = g;
						self.defaultFiles.splice(i, 1);
						break;
					}
				}
				if(rs) {
					this.setDomAttr(id, 'data-status', 'upload');
					var uploadDom = this.findChildDom(id, '.upload');
					var percentDom = this.findChildDom(id, '.percent');
					$api.html(percentDom, '0%');

					self.defaultFiles.push(rs);
					//是否正在上传
					if(self.isUpload) {
						self.uploadFiles.push(rs);
					}else {
						Upload.init({
							files: [rs],
						});
					}
				}
				return;
			}

			var arr = this.defaultFiles;
			var newArr = [];
			var index = 0;

			if(arr.length == 0) return;
			for(var i=0;i<arr.length,g=arr[i];i++) {
				newArr.push(g.file);
				if(id == arr[i].id) {
					index = i;
				}
			}
			Tool.openPhotoBrowser({
				images: newArr,
				activeIndex: index,
				click: function(photoBrowser) {
					photoBrowser.close();
				},
			});
		},

		preview: function(_this, e, id) {
			/*预览图片
			 */

			var self = this;

			e.stopPropagation();
			var pDom = this.getDomId(id);
			if(!pDom) return;
			console.log(id)

			//判断图片上传状态，错误状态点击重新上传
			var status = this.getDomAttr( id, 'data-status' );
			if(status == 'error') {
				//执行重新上传事件
				var rs = '';
				for(var i=0; i<self.uploadFiles.length,g=self.uploadFiles[i]; i++) {
					if(g.id == id) {
						rs = g;
					}
				}
				if(rs) {
					//是否正在上传
					if(self.isUpload) {
						self.uploadFiles.push(rs);
					}else {
						Upload.init({
							files: [rs],
						});
					}
				}
				return;
			}
			

			var img = this.getDomAttr(id, 'data-img');
			//重置预览框
			this.hidePreview();

			var _html = '<div class="img-preview flex-box flex-center-center " ' +
				'onclick="Upload.hidePreview()" ' +
				'style="position: fixed;left: 0;right: 0;top: 0;bottom: 0;background-color: rgba(0,0,0,0.7);z-index: 1050;" ' +
				'>' +
				'<img src="' + img + '" alt="" />' +
				'</div>';

			//T方法需要兼容
			T.prepend('body', '', _html);
		},
		hidePreview: function() {
			/*关闭预览
			 */
			var imgPreviewDom = $api.dom('.img-preview');
			if(imgPreviewDom) {
				$api.remove(imgPreviewDom);
			}
		},
	};

	window.Upload = up;
}(window);
