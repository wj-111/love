<template>
	<view class="note-content">
		<view class="class-container">
			<view class="class-items">
				<view v-for="(item, index) in classList" @click="updateSelectedClass(item)" class="class-item"
					:class="selectedClass === item ? 'highlighted-class-item' : ''">
					{{item}}
				</view>
			</view>
			<view class="class-add-button">
				<uni-icons type="folder-add" size="28" color="#efcf63"></uni-icons>
			</view>
		</view>
		
<!-- 		<view class="table-container">
			<view v-for="(item, index) in classList" @click="updateSelectedClass(item)" class="class-item"
				:class="selectedClass === item ? 'highlighted-class-item' : ''">
				{{item}}
			</view>
		</view> -->
		
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'

	const selectedClass = ref('全部')
	const classList = ref(['全部', '测试1', '测试2', '测试3', '测试4', '测试5'])

	function updateSelectedClass(nextSelectedClass) {
		selectedClass.value = nextSelectedClass
	}
</script>

<style lang="scss">
	.class-container {
		display: flex;
		margin-top: 30rpx;
		position: relative;
	}

	.class-items {
		overflow: auto;
		white-space: nowrap;
		border-radius: 20rpx;
		// 滚动条可以尝试去掉
	}

	.class-item {
		display: inline-block;
		background-color: #fff;
		padding: 10rpx 20rpx;
		margin-right: 20rpx;
		color: #676767;
		border-radius: 20rpx;
		font-size: 34rpx;
	}

	.class-add-button {
		border-radius: 20rpx;
		background-color: #fff;
		padding: 0 20rpx;
		margin-left: 20rpx;
		// padding: 3rpx 20rpx;
		// position: absolute;
		// right: 0;
		// top: 0;
	}

	.highlighted-class-item {
		color: #0b0b0b;
		background-color: #efefef;
	}
</style>