<template>
	<view class="content">
<!-- 		<view class="bg-img-botton"
			:style="{ 'background-image': `url(${info[bottomCurrent] ? info[bottomCurrent].imgUrl : ''})`}" /> -->
		<view class="bg-img" :style="{ 'background-image': `url(${info[current].imgUrl}?x-oss-process=image/quality,Q_50)` }" />

		<view class="header">
			<view class="tools">
				<view class="select-sort">
					<uni-data-select v-model="nowSortType" :localdata="sortTypeList" :clear="false"></uni-data-select>
				</view>

				<uni-icons @click="jumptoEdit(-1)" class="add-button" color="#424242" type="plusempty" size="24" />
			</view>
		</view>

		<swiper :current="current" class="swiper-box" @change="change" previous-margin="30px" next-margin="30px">
			<swiper-item v-for="(item ,index) in info" :key="index">
				<view class="swiper-item">
					<view :class="index === current ? 'white-box-selected' : 'white-box'">
						<image mode="aspectFill" :class="index === current ? 'item-img-selected' : 'item-img'"
							:src="`${item.imgUrl}?x-oss-process=image/quality,Q_50` " alt="图片" />
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
										<uni-icons type="calendar" size="18" />&nbsp; {{item.userSetTime}}
									</view>
								</view>
								<view class="star-num">
									<view class="star-item" v-for="item in 5">
										<uni-icons color="#e85481" type="star-filled" size="24" />
									</view>
								</view>
							</view>
							<view class="divider" />
							<view class="tools">
								<uni-icons @click="deletePhoto(item)" class="first-icon" type="trash"
									size="30"></uni-icons>
								<uni-icons @click="jumptoEdit(item._id)"  type="compose" size="30"></uni-icons>
								<uni-icons class="star-button" type="hand-up" size="36" color="#e85481"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>


		<view class="footer">
			<text class="currentIndex">{{current + 1}}</text> / {{info.length}}
		</view>

	</view>
</template>


<script>
	import {
		SortTypeEnum
	} from './constants.ts'

	const photoObj = uniCloud.importObject('photo') //第一步导入云对象


	export default {
		data() {
			return {
				info: [{
					imgUrl: 'https://mp-76f6500b-d2d6-4ca0-8bb1-f5fadc40d4ba.cdn.bspapp.com/cloudstorage/394c70e4-c193-4cd7-bbda-ff2128df4dbe.jpg?x-oss-process=image/quality,Q_50'
				}],
				current: 0,
				// bottomCurrent: 0,
				_id: '-1',
				nowSortType: SortTypeEnum.IMGTIMEDESC,
				sortTypeList: [{
						value: SortTypeEnum.BUILDDESC,
						text: "最新创建"
					},
					{
						value: SortTypeEnum.BUILD,
						text: "创建倒叙"
					},
					{
						value: SortTypeEnum.IMGTIMEDESC,
						text: "最新照片日期"
					},
					{
						value: SortTypeEnum.IMGTIME,
						text: "照片日期倒序"
					},
					{
						value: SortTypeEnum.STAR,
						text: "点赞数最多"
					},
					{
						value: SortTypeEnum.STARDESC,
						text: "点赞数最少"
					},
				],
			};
		},
		watch: {
			// current(val, oldVal) {
			// 	const that = this
			// 	setTimeout(() => {
			// 		that.bottomCurrent = val
			// 	}, 500)
			// },
			nowSortType(val, oldVal) {
				this.getListData()
			},
		},
		mounted() {
			this.getListData()
		},
		onShow() {
			this.getListData()
		},
		methods: {
			getListData() {
				uni.showLoading({
					title: '加载中',
					mask: true,
				})
				
				console.log(this.nowSortType)

				const db = uniCloud.databaseForJQL();
				db.collection('photo_gallery').orderBy(this.nowSortType).get().then(
					res => {
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
			jumptoEdit(id) {
				uni.navigateTo({
					url: '/pages/PhotoGallery/edit?id=' + id 
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
								if (this.current !== 0) {
									this.current = this.current - 1
								}
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

	// .bg-img-botton {
	// 	z-index: -10;
	// 	position: absolute;
	// 	width: 100vw;
	// 	height: 100vh;
	// 	background-size: 100% 100%;
	// 	filter: blur(5px) brightness(1) sepia(0.2);
	// 	transition: all .2s ease;
	// }

	.bg-img {
		z-index: -5;
		position: absolute;
		width: 100vw;
		height: 100vh;
		background-size: 100% 100%;
		filter: blur(5px) brightness(1) sepia(0.2);
		transition: all .2s ease;
	}

	.header {
		height: 10%;

		.tools {
			color: #424242;
			display: flex;
			align-items: center;
			padding: 20rpx 0;
			background-color: rgba(255, 255, 255, 0.8);

			.select-sort {
				width: 300rpx;
				margin-left: 20rpx;
			}

			.add-button {
				margin-left: auto;
				margin-right: 30rpx;
			}
		}
	}

	.footer {
		height: 10%;
		text-align: center;
		font-weight: bold;
		font-size: 42rpx;
		color: #e0e0e0;

		.currentIndex {
			color: #d74f7a;
		}
	}

	.swiper-box {
		height: 80%;

		.swiper-item {
			text-align: center;
			margin-top: 260rpx;

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