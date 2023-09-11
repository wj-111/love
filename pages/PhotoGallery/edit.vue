<template>
	<view>
		<view class="uni-textarea">
			<textarea v-model="description" placeholder="描述一下吧" />
		</view>
		<uni-file-picker v-model="imageValue" fileMediatype="image" mode="grid" @select="select" @progress="progress"
			@success="success" @delete="deleteEvent" @fail="fail" ref="files" :auto-upload="false" limit="1" />

		<input v-model="position" placeholder="地点" type="text">
		<!-- <input v-model="setTime" placeholder="时间" type="text"> -->

		<view class="uni-list">
			<view class="uni-list-cell">
				<view class="uni-list-cell-left">
					当前选择
				</view>
				<view class="uni-list-cell-db">
					<picker mode="date" :value="setTime" @change="bindDateChange">
						<view class="uni-input">{{setTime}}</view>
					</picker>
				</view>
			</view>
		</view>

		<button @click="upload()">发表</button>
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
				imageValue: [],
				description: '',
				position: '',
				setTime: currentDate,
				// setTime: '',
			};
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
				this.setTime = e.detail.value
			},
			// 提交触发上传图片，图片上传成功回调里，把其他数据和图片路径一起保存
			upload() {
				uni.showLoading({
					title: '上传中',
					mask: true,
				})
				this.$refs.files.upload()
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
				console.log({
					imgUrl: this.imageValue[0].url,
					description: this.description,
					position: this.position,
					setTime: this.setTime,
				})

				const db = uniCloud.database();
				db.collection('photo_gallery').add({
					imgUrl: this.imageValue[0].url,
					description: this.description,
					position: this.position,
					setTime: this.setTime,
				}).then(() => {
					setTimeout(() => {
						uni.hideLoading()
						uni.showToast({
							icon: 'success',
							title: '上传成功'
						})
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

</style>