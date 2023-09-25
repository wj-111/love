<template>
	<view class="content">
		<!-- 左右切换动画可以后面再做 -->
		<view class="">
			<text @click="updateIsNote(true)" class="top-type" :class="isNote ? 'highlighted-top-type' : ''">
				笔记
			</text>
			<text @click="updateIsNote(false)" class="top-type" :class="!isNote ? 'highlighted-top-type' : ''">
				待办
			</text>
		</view>
		<view class="add-button" @click="toEdit">
			<uni-icons type="plusempty" color="#fff" size="30"></uni-icons>
		</view>
		<view class="note-container">
			<Note />
		</view>
	</view>
</template>

<script>
	import Note from './components/Note/index.vue'

	export default {
		components: {
			Note
		},
		data() {
			return {
				isNote: true
			}
		},
		onShow() {
			console.log('展示')
			uni.$emit('update')
		},
		methods: {
			updateIsNote(nextIsNote) {
				this.isNote = nextIsNote
			},
			toEdit() {
				uni.navigateTo({
					url: '/pages/NoteAndTodo/NoteEdit'
				});
			}
		}
	}
</script>

<style lang="scss">
	.add-button {
		position: absolute;
		right: 80rpx;
		bottom: 100rpx;
		background-color: #f5bc41;
		padding: 25rpx;
		border-radius: 50%;
		z-index: 1;
	}

	.content {
		padding: 40rpx 20px 0 20px;
		width: 100vw;
		height: 100%;
		box-sizing: border-box;
		background-color: #f7f7f7;
		
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.top-type {
		font-size: 62rpx;
		color: #949494;
	}

	.highlighted-top-type {
		color: #010101;
	}
	
	.note-container {
		flex-grow: 1;
	}
</style>