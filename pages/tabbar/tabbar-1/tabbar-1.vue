<template>
	<view class="content">
		<view class="menu-container">
			<view @click="jumpPage(item.linkUrl)" v-for="(item, index) in menuList" :class="[item.className, 'menu-item']">
				{{item.title}}
			</view>
			<view class="center-heart">
				123
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				menuList: [
					{
						title: '照片长廊',
						className: 'left-top',
						linkUrl: '/pages/PhotoGallery/index'
					},
					{
						title: '笔记',
						className: 'right-top',
						linkUrl: '/pages/NoteAndTodo/index'
					},
					{
						title: '书',
						className: 'left-botton'
					},
					{
						title: '暂无',
						className: 'right-botton'
					},
				]
			}
		},
		onLoad() {

		},
		methods: {
			jumpPage(url) {
				console.log(url)
				uni.navigateTo({
					url
				});
			}
		}
	}
</script>

<style lang="scss">
	.content {
		width: 100vw;
		height: 100vh;
		text-align: center;
	}
	
	.menu-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		width: 80vw;
		height: 400rpx;
	}
	
	.left-top {
		position: absolute;
		top: 0px;
		left: 0px;	
	}
	
	.right-top {
		position: absolute;
		top: 0px;
		right: 0px;
	}
	
	.left-botton {
		position: absolute;
		bottom: 0px;
		left: 0px;
	}
	
	.right-botton {
		position: absolute;
		bottom: 0px;
		right: 0px;
	}
	
	.menu-item {
		background-color: #d2d2d2;
		width: 30vw;
		height: 150rpx;
		text-align: center;
		line-height: 150rpx;
		border-radius: 10rpx;
	}
	
	.center-heart {
		background-color: #e9e9e9;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 38vw;
		height: 190rpx;
		border-radius: 10rpx;
		line-height: 190rpx;
	}
</style>
