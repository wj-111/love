// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
	_before: function() { // 通用预处理器

	},
	delete(photoItem) {
		try {
			console.log(photoItem.imgUrl)
			uniCloud
			  .deleteFile({
			    fileList: [`${photoItem.imgUrl}`],
				// fileList: ['https://mp-76f6500b-d2d6-4ca0-8bb1-f5fadc40d4ba.cdn.bspapp.com/cloudstorage/6a4baadc-cb16-48fb-9a5b-dbbee0d7793e.png'],
			  })
			  .then(res => {console.log(res)})
			  .catch(err => console.error(err))
			return {
				errCode: 0,
				errMsg: '删除成功'
			}

		} catch (e) {
			return {
				errCode: 500,
				errMsg: '删除失败'
			}
		}




	}
}