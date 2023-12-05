<template>
	<view class="note-content">
		<view class="class-container">
			<view class="class-items">
				<view v-for="(item, index) in classList" @click="updateSelectedClass(item._id)" class="class-item"
					:class="selectedClass === item._id ? 'highlighted-class-item' : ''">
					{{item.classTitle}}
				</view>
			</view>
			<view @click="toClassEdit" class="class-add-button">
				<uni-icons type="folder-add" size="28" color="#efcf63"></uni-icons>
			</view>
		</view>
		<view class="note-list-container">
			<view @click="toEdit(item._id)" class="note-item" v-for="item in noteList">
				<!-- 这里看下是否可以把三个函数抽成一个函数, 计算属性？ -->
				<view class="">
					<view class="note-title">
						{{item.title || '(无标题)'}}
					</view>
					<view class="note-content">
						{{renderContentText(item.content) || '(无文本内容)'}}
					</view>
					<view class="note-content note-date">
						{{renderTime(item.last_modify_date)}}
					</view>
				</view>
				<view class="img-box">
					<!-- 图片懒加载看怎么实现 -->
					<!-- 合并后这里也加个v-if -->
					<image class="img-item" :src="gainFirstImgSrc(item.content)" mode="aspectFill"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import dayjs from 'dayjs';

	export default {
		data() {
			return {
				selectedClass: '-1',
				classList: [{
					classTitle: '全部',
					_id: '-1',
				}],
				noteList: [],
			}
		},
		mounted() {
			// 初始化时候的数据获取
			this.getDataList()
		},
		created() {
			// 当页面onShow的时候数据获取
			uni.$on('update', () => {
				console.log('刷新')
				//重绘页面子组件methods中的函数调用
				this.getDataList()
			})
		},
		methods: {
			async getDataList() {
				uni.showLoading({
					title: '加载中',
					mask: true,
				})

				const db = uniCloud.databaseForJQL();

				// 获取分类
				const noteClassPromise = db.collection('note_class')
					.get()

				// 获取列表
				let tempWhere = this.selectedClass !== '-1' ? ` && category_id == '${this.selectedClass}'` : ''
				if (this.selectedClass === null) tempWhere = ` && category_id == ${this.selectedClass}`
				
				
				const notePromise = db.collection('note')
					.where('article_status == 1' + tempWhere)
					.orderBy('last_modify_date desc')
					.get()

				const noteClassRes = await noteClassPromise
				if (noteClassRes.errCode === 0) {
					this.classList = [{
						classTitle: '全部',
						_id: '-1',
					}, ...noteClassRes.data, {
						classTitle: '未分类',
						_id: null,
					}]
				}

				const noteRes = await notePromise
				if (noteRes.errCode === 0) {
					this.noteList = noteRes.data
				}
				uni.hideLoading()

			},
			toClassEdit() {
				uni.navigateTo({
					url: '/pages/NoteAndTodo/ClassEdit'
				});
			},
			toEdit(id) {
				uni.navigateTo({
					url: `/pages/NoteAndTodo/NoteEdit?id=${id}`
				});
			},
			gainFirstImgSrc(content) {
				const imgItemList = content.filter(item => item.insert.image)
				if (imgItemList.length) {
					return imgItemList[0].insert.image.slice(0, -1) || ''
				}
				return ''
			},
			renderContentText(content) {
				const textItemList = content.filter(item => !item.insert.image)
				let text = textItemList[0].insert
				if (text.length && text.length > 50) text = text.slice(0, 50) + '...'
				
				return textItemList[0].insert === '\n' ? '(无文本内容)' : text
			},
			renderTime(timestamp) {
				return dayjs(timestamp).format('MM月DD日 HH:mm')
			},
			updateSelectedClass(nextSelectedClass) {
				this.selectedClass = nextSelectedClass
				this.$emit('onClassChange', nextSelectedClass);
				this.getDataList()
			}
		}
	}
</script>

<style lang="scss">
	.note-content {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.note-list-container {
		// 配合才能自动撑满
		flex: auto;
		height: 0rpx;
		overflow: auto;
	}
	
	.note-item {
		padding: 20rpx;
		background-color: #fff;
		margin-bottom: 20rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;

	}
	
	.note-title {
		font-weight: bold;
	}
		
	.note-content {
		font-size: 28rpx;
		color: #676767;
		margin-top: 5rpx;
	}
		
	.note-date {
		margin-top: 10rpx;
	}
		
	.img-box {
		margin-left: auto;
		margin-right: 20rpx;
		
		.img-item {
			width: 20vw;
			height: 20vw;
			border-radius: 20rpx;
		}
	}

	.class-container {
		display: flex;
		margin: 30rpx 0;
		position: relative;
	}

	.class-items::-webkit-scrollbar {
		display: none;
		/* Chrome Safari */
	}

	.class-items {
		scrollbar-width: none;
		/* firefox */
		-ms-overflow-style: none;
		/* IE 10+ */

		margin-right: 20rpx;
		overflow: auto;
		white-space: nowrap;
		border-radius: 20rpx;
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
		// margin-left: 20rpx;
		margin-left: auto;


		display: flex;
		align-items: center;
		justify-content: center;
	}

	.highlighted-class-item {
		color: #0b0b0b;
		background-color: #efefef;
	}
</style>