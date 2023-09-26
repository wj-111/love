<template>
	<view class="class-edit-content">
		<view class="class-item" v-for="item in classList">
			<view class="select-statu">
				<uni-icons v-show="item._id === selectedId" type="checkmarkempty" color="#f2be42" size="22" />
			</view>
			{{item.title}} ({{item.count}})
			<view class="class-tools">
				<uni-icons @click="jumptoEdit(item._id)" type="compose" size="22" class="first-icon"></uni-icons>
				<uni-icons @click="deletePhoto(item)" type="trash" size="22"></uni-icons>
			</view>
		</view>
		<view @click="inputDialogToggle" class="add-button">
			新建文件夹
			<text class="add-button-icon" @click="toEdit">
				<uni-icons type="plusempty" color="#fff" size="18"></uni-icons>
			</text>
		</view>
		<view>
			<!-- 输入框示例 -->
			<uni-popup ref="inputDialog" type="dialog">
				<uni-popup-dialog ref="inputClose" mode="input" title="新建文件夹" value="文件夹" placeholder="请输入内容"
					@confirm="dialogInputConfirm"></uni-popup-dialog>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				classList: [{
					title: '全部',
					_id: '-1',
					count: 0,
				}, {
					title: '假数据1',
					_id: '1',
					count: 0,
				}],
				selectedId: '-1',
			};
		},
		methods: {
			inputDialogToggle() {
				this.$refs.inputDialog.open()
			},
			dialogInputConfirm(val) {
				console.log(val)
			},
		}
	}
</script>

<style lang="scss">
	.class-edit-content {
		background-color: #f7f7f7;
		height: 100%;
		padding-top: 40rpx;
	}

	.class-item {
		background-color: #fff;
		padding: 40rpx 50rpx;
		margin: 0 40rpx 30rpx 40rpx;
		border-radius: 20rpx;

		display: flex;
		align-items: center;

		.select-statu {
			width: 40rpx;
			height: 40rpx;
			margin-right: 20rpx;
		}

		.class-tools {
			margin-left: auto;
			.first-icon {
				margin-right: 20rpx;
			}
		}
	}

	.add-button {
		background-color: #fff;
		padding: 35rpx 50rpx;
		margin: 0 40rpx 30rpx 40rpx;
		border-radius: 20rpx;

		text-align: center;

		.add-button-icon {
			display: inline-block;
			border-radius: 50%;
			width: 50rpx;
			height: 50rpx;
			text-align: center;
			line-height: 50rpx;
			background-color: #f5bc41;
		}
	}
</style>