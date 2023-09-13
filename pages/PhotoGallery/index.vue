<template>
	<view class="content">
		<view class="bg-img-botton"
			:style="{ 'background-image': `url(${info[bottomCurrent] ? info[bottomCurrent].imgUrl : ''})`}" />
		<view class="bg-img" :style="{ 'background-image': `url(${info[current].imgUrl})` }" />
		<swiper :current="current" class="swiper-box" @change="change" previous-margin="30px" next-margin="30px">
			<swiper-item v-for="(item ,index) in info" :key="index">
				<view class="swiper-item">
					<view :class="index === current ? 'white-box-selected' : 'white-box'">
						<image mode="aspectFill" :class="index === current ? 'item-img-selected' : 'item-img'"
							:src="item.imgUrl" alt="图片" />
						<view v-if="index === current" class="">
							<view class="description">
								{{item.description}}
							</view>
							<view v-if="index === current" class="other-infor">
								<view>
									<view>
										<uni-icons type="location" size="18" />&nbsp; {{item.position}}
									</view>
									<view>
										<uni-icons type="calendar" size="18" />&nbsp; {{item.setTime}}
									</view>
								</view>
								<view class="star-num">
									<view class="star-item" v-for="item in new Array(5)">
										<uni-icons color="#e85481" type="star-filled" size="24" />
									</view>
								</view>
							</view>
							<view class="divider" />
							<view class="tools">
								<uni-icons @click="deletePhoto(item)" class="first-icon" type="trash"
									size="30"></uni-icons>
								<uni-icons type="compose" size="30"></uni-icons>
								<uni-icons class="star-button" type="hand-up" size="36" color="#e85481"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>


<script>
	const photoObj = uniCloud.importObject('photo') //第一步导入云对象


	export default {
		data() {
			return {
				info: [{
					imgUrl: 'https://mp-76f6500b-d2d6-4ca0-8bb1-f5fadc40d4ba.cdn.bspapp.com/cloudstorage/0b20b8b0-96e0-489f-b228-d70a11458f87.jpg'
				}],
				current: 0,
				bottomCurrent: 0,
				_id: '-1'
			};
		},
		watch: {
			current(val, oldVal) {
				const that = this
				setTimeout(() => {
					that.bottomCurrent = val
				}, 500)
			},
		},
		mounted() {
			this.getListData()
		},
		methods: {
			getListData() {
				uni.showLoading({
					title: '加载中',
					mask: true,
				})

				const db = uniCloud.databaseForJQL();
				db.collection('photo_gallery').get().then(res => {
					console.log(res)
					const {
						data,
						errCode
					} = res || {}
					if (errCode === 0) {
						this.info = data
					}
					setTimeout(() => {
						uni.hideLoading()
					}, 200)
				})
			},
			change(e) {
				this.current = e.detail.current;
			},
			jumptoEdit() {
				uni.navigateTo({
					url: '/pages/PhotoGallery/edit'
				});
			},
			deletePhoto(photoItem) {
				try {
					uni.showModal({
						title: '是否确认删除',
						success: async (res) => {
							console.log(res)
							const {
								confirm,
								cancel
							} = res
							if (confirm) {
								uni.showLoading({
									title: '操作中',
									mask: true,
								})
								const db = uniCloud.database();
								const dbResult = await db.collection('photo_gallery').doc(photoItem._id)
									.remove()
								const storeResult = await photoObj.delete(photoItem)
								this.current = this.current - 1

								setTimeout(() => {
									uni.hideLoading()
									this.getListData()
								}, 500)
							}

						}
					})
				} catch (e) {
					// 符合uniCloud响应体规范 https://uniapp.dcloud.net.cn/uniCloud/cf-functions?id=resformat，自动抛出此错误 
					uni.showModal({
						title: '创建失败',
						content: e.errMsg,
						showCancel: false
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.content {
		width: 100vw;
		height: 100vh;
		box-sizing: border-box;
	}

	.bg-img-botton {
		z-index: -100;
		position: absolute;
		width: 100vw;
		height: 100vh;
		background-size: 100% 100%;
		filter: blur(5px) brightness(1) sepia(0.2);
		transition: all .2s ease;
	}

	.bg-img {
		position: absolute;
		width: 100vw;
		height: 100vh;
		background-size: 100% 100%;
		filter: blur(5px) brightness(1) sepia(0.2);
		transition: all .2s ease;
	}

	.swiper-box {
		height: 100%;

		.swiper-item {
			margin-top: 70%;
			text-align: center;

			.white-box-selected {
				background-color: #fff;
				border-radius: 20rpx;
				margin: 0 20rpx;
				box-shadow: 5px 10px 10px rgba(0, 0, 0, 0.2);
				padding: 0 20rpx;
			}

			.white-box {
				padding: 0 10rpx;
			}

			.item-img-selected {
				width: 95%;
				height: 50vh;
				border-radius: 20rpx;
				margin-top: -160rpx;

				transition: all .5s ease;
			}

			.item-img {
				width: 100%;
				height: 50vh;
				border-radius: 20rpx;
				margin-top: -100rpx;

				transition: all .5s ease;
			}

			.description {
				font-size: 36rpx;
				text-align: left;
			}

			.other-infor {
				text-align: left;
				display: flex;
				align-items: center;
				margin-top: 10rpx;
			}

			.star-num {
				color: #f1b;
				margin-left: auto;
			}

			.star-item {
				display: inline-block;
			}

			.divider {
				width: 100%;
				height: 1px;
				background-color: #dfe0e2;
				margin: 10rpx 0;
			}

			.tools {
				text-align: left;
				height: 80rpx;
			}

			.first-icon {
				margin-right: 20rpx;
			}

			.star-button {
				float: right;
				margin-right: 30rpx;
			}



		}
	}
</style>