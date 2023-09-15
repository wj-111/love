<template>
	<view class="content">
		<view class="uni-textarea">
			<textarea v-model="description" placeholder="描述一下吧" />
		</view>
		<uni-file-picker class="img-picker" return-type="object" v-model="imageValue" fileMediatype="image" mode="grid"
			@select="select" @progress="progress" @success="success" @delete="deleteEvent" @fail="fail" ref="files"
			:auto-upload="false" limit="1" />

		地点：
		<input class="uni-input" v-model="position" placeholder="请输入地点" type="text">
		<!-- <input v-model="userSetTime" placeholder="时间" type="text"> -->

		<view class="uni-list">
			<view class="uni-list-cell">
				<view class="uni-list-cell-db">
					<picker mode="date" :value="userSetTime" @change="bindDateChange">
						时间：<view class="uni-input">{{userSetTime}}</view>
					</picker>
				</view>
			</view>
		</view>

		<button class="submit-button" @click="upload()">发表</button>
		<!-- <button @click="printInfor()">输出图片</button> -->
		<!-- <button @click="handleImg()">处理图片</button> -->
	</view>
</template>


<script>
	export default {
		data() {
			const currentDate = this.getDate({
				format: true
			})
			return {
				id: '-1',
				imageValue: {},
				description: '',
				position: '',
				userSetTime: currentDate,
			};
		},
		onLoad(option) {
			const {
				id
			} = option
			// 不为-1是修改
			if (id !== '-1') {
				this.id = id
				uni.showLoading({
					title: '加载中',
					mask: true,
				})
				const db = uniCloud.databaseForJQL();
				db.collection('photo_gallery')
					.where(`_id == "${id}"`)
					.get()
					.then((res) => {
						const {
							errCode,
							data
						} = res || {}
						console.log(res)
						if (errCode === 0) {
							const {
								imgUrl,
								description,
								position,
								userSetTime
							} = data[0]
							this.imageValue = {
								url: imgUrl
							}
							this.description = description
							this.position = position
							this.userSetTime = userSetTime
						}
						uni.hideLoading()
					}).catch((err) => {
						// err.message 错误信息
						// err.code 错误码
					})
			}
		},
		methods: {
			getDate(type) {
				const date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();

				if (type === 'start') {
					year = year - 60;
				} else if (type === 'end') {
					year = year + 2;
				}
				month = month > 9 ? month : '0' + month;
				day = day > 9 ? day : '0' + day;
				return `${year}-${month}-${day}`;
			},
			deleteEvent() {
				this.$refs.files.clearFiles()
			},
			bindDateChange: function(e) {
				this.userSetTime = e.detail.value
			},
			// 提交触发上传图片，图片上传成功回调里，把其他数据和图片路径一起保存
			upload() {
				console.log(this.imageValue)
				// 有概率新增也会出现有这个对象
				
				// 如果未修改图片或者新增图片，就直接调用上传其他信息
				if (this?.imageValue?.url) {
					this.success()
				} else {
					uni.showLoading({
						title: '上传中',
						mask: true,
					})
					this.$refs.files.upload()
				}

			},
			printInfor() {
				console.log(this.imageValue)
			},
			// 获取上传状态
			select(e) {
				console.log('选择文件：', e)
			},
			// 获取上传进度
			progress(e) {
				console.log('上传进度：', e)
			},

			// 
			success(e) {
				const db = uniCloud.database();
				if (this.id === '-1') {
					db.collection('photo_gallery').add({
						imgUrl: this.imageValue.url,
						description: this.description,
						position: this.position,
						userSetTime: this.userSetTime,
						buildTime: String(new Date().getTime()),
						lastUpdateTime: String(new Date().getTime()),
					}).then(() => {
						setTimeout(() => {
							uni.hideLoading()
							uni.showToast({
								icon: 'success',
								title: '上传成功'
							})
							setTimeout(() => {
								uni.navigateBack({})
							}, 1500)
						}, 200)
					}).catch((e) => {
						setTimeout(() => {
							uni.hideLoading()
							uni.showToast({
								icon: 'error',
								title: '上传失败'
							})
							console.log(e)
						}, 200)
					})
				} else {
					db.collection('photo_gallery').doc(this.id).update({
						imgUrl: this.imageValue.url,
						description: this.description,
						position: this.position,
						userSetTime: this.userSetTime,
						lastUpdateTime: String(new Date().getTime()),
					}).then(() => {
						setTimeout(() => {
							uni.hideLoading()
							uni.showToast({
								icon: 'success',
								title: '上传成功'
							})
							setTimeout(() => {
								uni.navigateBack({})
							}, 1500)
						}, 200)
					}).catch((e) => {
						setTimeout(() => {
							uni.hideLoading()
							uni.showToast({
								icon: 'error',
								title: '上传失败'
							})
							console.log(e)
						}, 200)
					})
				}






				// TODO: 失败的话要删除图片
			},

			// 上传失败
			fail(e) {
				console.log('上传失败：', e)
			}
		}
	}
</script>

<style lang="scss">
	.content {
		padding: 30rpx;
	}

	.uni-input {
		padding: 10rpx 0;
	}

	.img-picker {
		margin-bottom: 20rpx;
	}

	.submit-button {
		margin-top: 20rpx;
	}
</style>