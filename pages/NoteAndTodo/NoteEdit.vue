<template>
	<view class="container">
		<input v-model="title" class="title-input" type="text" placeholder="标题">
		<view class="time-and-count">
			<text>
				{{dateObj.text}}
			</text>
			<!-- 字数统计暂时感觉没有必要 -->
			<!--
				<text class="text-divider">
					|
				</text>
				<text>
					{{textCount}}字
				</text> 
			-->
		</view>
		<editor @input="$debounce(handleEditorChange, 1000)" @focus="changeButtonShow(true)"
			@blur="changeButtonShow(false)" id="editor" class="ql-container" placeholder="开始输入..."
			@ready="onEditorReady"></editor>
		<button class="add-img-button" @tap="addImg">插入图片</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				noteId: '-1',
				dateObj: {
					time: 1695177923583,
					text: '9月20日 上午10:31'
				},
				textCount: 0,
				isAddImgButtonShow: true,
				editorCtx: undefined,
				title: '',
				onlineImgObj: {}, // 注意初始化回填数据的时候，左右都是网络图片
			}
		},
		mounted() {
			// 处理是新笔记还是修改的情况


			this.calculateTime()
		},
		methods: {
			// 保存内容时，遍历整个富文本区域，有未上传的图片资源的时候，上传并记录（图片资源单独维护为一个列表）
			uploadImg(delta) {
				const that = this
				// 先拉出图片元素
				const imgDelta = delta.filter(item => item.insert?.image)

				const uploadPromises = imgDelta.map(item => {
					return new Promise((resolve, reject) => {
						const filePath = item.insert.image
						// 如果富文本区域图片已经是网络图片了， 直接返回
						if (filePath?.indexOf('blob') === -1) {
							resolve({
								[filePath]: filePath
							})
						}
						// 如果已经有网络链接了，返回网络链接
						if (that.onlineImgObj[filePath]) {
							resolve({
								[filePath]: that.onlineImgObj[filePath]
							})
						}

						// this.onlineImgObj[item.insert?.image]



						uniCloud.uploadFile({
							filePath,
							// 同一秒两个人上传怎么办
							cloudPath: `${new Date().getTime()}_100.jpg`,
							success(res) {
								const {
									fileID
								} = res
								resolve({
									[filePath]: fileID
								})
							},
							fail(res) {
								console.error('上传错误', res)
								// 错误图片
								resolve({
									[filePath]: 'https://mp-76f6500b-d2d6-4ca0-8bb1-f5fadc40d4ba.cdn.bspapp.com/public/upload_2822d3f4c4b4453397fa4e6c94617863.png'
								})
							},
						});
					});
				})
				console.log('uploadPromises', uploadPromises)
				if (uploadPromises.length === 0) {
					return []
				}

				return Promise.all(uploadPromises)
			},
			// 当标题和编辑器内容都为空时，直接删除；重新有内容了再创新的
			deleteNote() {
				console.log('删除本条内容')
			},
			// TODO: 很多错误处理都还没有
			handleEditorChange() {
				const that = this
				this.editorCtx.getContents({
					success: async (detail) => {
						console.log(detail)
						const {
							delta
						} = detail
						// TODO: title作为最后变化的输入框也需要判断
						if (delta.ops.length === 1 && delta.ops[0].insert === '\n' && that.title === '') {
							that.deleteNote()
							return
						}
						const nextImgList = await that.uploadImg(delta)
						let nextOnlineImgObj = {}
						nextImgList.forEach(item => {
							nextOnlineImgObj = {
								...item
							}
						})
						// 这里有点乱了，直接赋值是不是也行
						that.onlineImgObj = {
							nextOnlineImgObj
						}

						const db = uniCloud.database();

						const nextContent = delta.map(item => {
							if (item.insert.image) {
								return {
									...item,
									insert: {
										image: nextOnlineImgObj[item.insert
											.image] || item.insert.image
									}
								}
							}
							return item
						})

						console.log(that.noteId)
						if (that.noteId === '-1') {
							db.collection('note').add({
								title: that.title,
								content: nextContent
							}).then(res => {
								console.log(res)
								const {
									errCode,
									id
								} = res.result || {}
								console.log('res', res)
								if (errCode === 0) {
									console.log('id', id)
									that.noteId = id
								}
							})
						} else {
							db.collection('note').doc(that.noteId).update({
								title: that.title,
								content: nextContent
							}).then(res => {
								console.log(res)
							})
						}
					}
				})
			},
			changeButtonShow(nextShow) {
				this.isAddImgButtonShow = nextShow
			},
			calculateTime() {
				const nowDate = new Date()
				const time = nowDate.getTime()
				const month = nowDate.getMonth() + 1
				const date = nowDate.getDate()
				const hours = nowDate.getHours()
				const minutes = nowDate.getMinutes()
				const amOrPm = hours >= 12 ? '下午' : '上午'
				this.dateObj = {
					time,
					text: `${month}年${date}日 ${amOrPm}${hours}:${minutes}`
				}
			},
			async onEditorReady() {
				uni.createSelectorQuery().select('#editor').context((res) => {
					this.editorCtx = res.context
					console.log()
				}).exec()
			},
			addImg() {
				const that = this
				uni.chooseImage({
					count: 1,
					success: (res) => {
						if (res.tempFilePaths.length > 0) {
							const filePath = res.tempFilePaths[0]
							console.log(filePath);
							// TODO: 迅速上传两张图片会怎样
							that.editorCtx.insertImage({
								src: filePath,
								alt: '用户上传的图片',
								extClass: 'rich-text-img',
							})
						}
					}
				})
			},
			undo() {
				this.editorCtx.undo()
			}
		}
	}
</script>

<style>
	.container {
		/* padding: 10px; */
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.title-input {
		padding: 20rpx 30rpx;
		font-size: 42rpx;
		margin-top: 20rpx;
	}

	#editor {
		width: 100%;
		height: 100%;
		padding: 30rpx;
		/* background-color: #CCCCCC; */
	}

	.text-divider {
		color: #b6b6b6;
		font-size: 22rpx;
		margin: 0 20rpx;
	}

	.time-and-count {
		padding: 0 30rpx;
		font-size: 26rpx;
		color: #757575;
	}

	.ql-container {}

	.add-img-button {
		width: 100%;
	}
</style>