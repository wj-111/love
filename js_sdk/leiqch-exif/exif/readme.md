```
// uni-app中的用法：
	uni.chooseImage({
		sizeType: ['original'],
		sourceType: ['camera'],
		success: function (res) {
			console.log(JSON.stringify(res.tempFilePaths));
			var allFiles = res.tempFilePaths;
			var tmpimg = allFiles[0];
			console.log(tmpimg)
			//#ifdef APP-PLUS
			plus.io.resolveLocalFileSystemURL(tmpimg, function(entry){
				entry.file(function(file){  
					var reader = new plus.io.FileReader();  
					reader.onloadend = function (e) {
						var base64=e.target.result
						console.log(base64);
						var name=tmpimg.substring(tmpimg.lastIndexOf('/') + 1);
						var img={path:tmpimg,name:name,src:base64};
						var EXIF=require('@/common/js_sdk/exif/exif.js');
						EXIF.getData(img, function(){
							console.log(EXIF.pretty(this));
							console.log('AllTags:',EXIF.getAllTags(this)) // 此处打印的为选中图片的数据
							console.log(EXIF.getTag(this, 'Orientation'));
						  var tagj=EXIF.getTag(this,'GPSLongitude');
						  var tagw=EXIF.getTag(this,'GPSLatitude');
						  if(tagj&&tagw) {
							  var longitude=tagj[0]+tagj[1]/60+tagj[2]/60/60;
							  var latitude=tagw[0]+tagw[1]/60+tagw[2]/60/60;
							  var lalinfo=this.name+":"+longitude+":"+latitude+",";
							  console.log(lalinfo);
							  uni.openLocation({latitude:latitude,longitude:longitude});
						  }
						})
					};  
					reader.readAsDataURL(file);  
				},function(e){  
					console.log("读写出现异常: " + e.message );
					throw "Could not load image";
				})  
			}) 
			//#endif
		}
		
		//#ifdef H5
		<input type="file" accept="image/*" id="uploadImage" capture="camera" οnchange="selectFileImage(this);" />
		function selectFileImage(fileObj) {
		  var file = fileObj.files['0'];
		  //图片方向角 added by lzk
		  var Orientation = null;
		  if (file) {
		    console.log("正在上传,请稍后...");
		    var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式
		    if (!rFilter.test(file.type)) {
		      //showMyTips("请选择jpeg、png格式的图片", false);
		      return;
		    }
		    // var URL = URL || webkitURL;
		    //获取照片方向角属性，用户旋转控制
		    EXIF.getData(file, function() {
		      // alert(EXIF.pretty(this));
		      EXIF.getAllTags(this); 
		      //alert(EXIF.getTag(this, 'Orientation')); 
		      Orientation = EXIF.getTag(this, 'Orientation');
		      //return;
		    });
		  }
		  ...
		}
		//#endif
	});

```
