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
		<button class="add-img-button" @tap="addImg">
			插入图片
			<!-- <uni-icons type="image" size="24" /> -->
		</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				noteId: '-1',
				classId: '-1',
				dateObj: {
					time: 1695177923583,
					text: '未设置'
				},
				// textCount: 0,
				isAddImgButtonShow: true,
				editorCtx: undefined,
				title: '',
				isInit: false,
				initDelta: [],
				onlineImgObj: {}, // 注意初始化回填数据的时候，左右都是网络图片
			}
		},
		onLoad(option) {
			const {
				id,
				classId,
			} = option
			console.log(classId)
			if (classId) this.classId = classId
			if (id) {
				this.noteId = id
				uni.showLoading({
					title: '加载中',
					mask: true,
				})
				const db = uniCloud.databaseForJQL();
				db.collection('note')
					.where(`_id == "${id}"`)
					.get()
					.then((res) => {
						const {
							errCode,
							data
						} = res || {}
						console.log(res)
						if (errCode === 0) {
							if (data.length) {
								const {
									title,
									content,
									last_modify_date
								} = data[0]
								this.title = title
								// TODO: 会不会有富文本编辑器还没准备好的情况
								console.log('content', content)
								if (this.editorCtx) {
									this.editorCtx.setContents({
										delta: content
									})
									uni.hideLoading()
								} else {
									this.initDelta = content
								}
								this.calculateTime(last_modify_date)
							}
						}
					}).catch((err) => {
						// err.message 错误信息
						// err.code 错误码
					})
			}
		},
		watch: {
			title(newVal, oldVal) {
				// 如果初始化过，则要加上防抖
				if (this.isInit) {
					this.$debounce(this.handleEditorChange, 1000)
				} else {
					this.handleEditorChange()
				}
			}
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
						uniCloud.uploadFile({
							filePath,
							// 同一秒两个人上传怎么办
							cloudPath: `${new Date().getTime()}_100.jpg`,
							success(res) {
								const {
									fileID
								} = res
								resolve({
									[filePath]: `${fileID}?x-oss-process=image/quality,Q_50`
								})
							},
							fail(res) {
								console.error('上传错误', res)
								// 错误图片
								resolve({
									[filePath]: 'https://mp-76f6500b-d2d6-4ca0-8bb1-f5fadc40d4ba.cdn.bspapp.com/public/upload_2822d3f4c4b4453397fa4e6c94617863.png?x-oss-process=image/quality,Q_5'
								})
							},
						});
					});
				})
				if (uploadPromises.length === 0) {
					return []
				}

				return Promise.all(uploadPromises)
			},
			// 当标题和编辑器内容都为空时，直接删除；重新有内容了再创新的
			async deleteNote() {
				// TODO: 删除要改，只标记不彻底删除
				// 如果还没有id，则直接返回
				if (this.noteId === '-1') return
				console.log('删除本条内容')
				const db = uniCloud.database();
				const dbResult = await db.collection('note').doc(this.noteId).update({
					article_status: 0,
				})
				// 错误处理
				if (dbResult.errCode === 0) {
					console.log('删除成功')
					this.noteId === '-1'
				}
			},
			// TODO: 很多错误处理都还没有
			handleEditorChange() {
				// 初始化里面有标题的时候，一进来浏览就会触发一次更新，并改变最新更新时间，这里就是处理这个问题，分辨的不是很好
				// console.log(this.isInit)
				if (!this.isInit && this.title) {
					console.log('标题初始化，不用更新内容')
					this.isInit = true
					return
				}

				// 最后更新一下时间
				console.log('会走一遍这里？')
				this.calculateTime(new Date().getTime())

				const that = this
				this.editorCtx.getContents({
					success: async (detail) => {
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
								content: nextContent,
								article_status: 1,
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
							// 任何改动也会强制令该条记录重新变成激活状态
							db.collection('note').doc(that.noteId).update({
								title: that.title,
								content: nextContent,
								article_status: 1,
								...(that.classId !== '-1' ? {category_id: that.classId}  : {}),
								last_modify_date: new Date().getTime()
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
			calculateTime(timestamp) {

				const nowDate = new Date(timestamp)
				const time = nowDate.getTime()
				const month = nowDate.getMonth() + 1
				const date = nowDate.getDate()
				const hours = nowDate.getHours()
				let minutes = nowDate.getMinutes()
				minutes = minutes > 9 ? minutes : `0${minutes}`
				const amOrPm = hours >= 12 ? '下午' : '上午'
				this.dateObj = {
					time,
					text: `${month}月${date}日 ${amOrPm}${hours}:${minutes}`
				}
			},
			async onEditorReady() {
				uni.createSelectorQuery().select('#editor').context((res) => {
					this.editorCtx = res.context
					// 存在编辑器未初始化时，已经获取到了数据，在这里回填 TODO: 编辑器可能加载很慢
					if (this.initDelta.length) {
						this.editorCtx.setContents({
							delta: this.initDelta
						})
						uni.hideLoading()
					}
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