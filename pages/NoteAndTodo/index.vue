<template>
	<view class="content">
		<!-- 左右切换动画可以后面再做 -->
		<text @click="updateIsNote(true)" class="top-type" :class="isNote ? 'highlighted-top-type' : ''">
			笔记
		</text>
		<text @click="updateIsNote(false)" class="top-type" :class="!isNote ? 'highlighted-top-type' : ''">
			待办
		</text>
		<button @click="toEdit">添加</button>
		<Note />
	</view>
</template>

<script setup>
	import Note from './components/Note/index.vue'
	import {
		ref
	} from 'vue'

	const isNote = ref(true)

	function updateIsNote(nextIsNote) {
		isNote.value = nextIsNote
	}

	function toEdit() {
		uni.navigateTo({
			url: '/pages/NoteAndTodo/NoteEdit'
		});
	}
</script>

<style lang="scss">
	.content {
		padding: 40rpx 20px 0 20px;
		width: 100vw;
		height: 100vh;
		box-sizing: border-box;
		background-color: #f7f7f7;
	}

	.top-type {
		font-size: 62rpx;
		color: #949494;
	}

	.highlighted-top-type {
		color: #010101;
	}
</style>