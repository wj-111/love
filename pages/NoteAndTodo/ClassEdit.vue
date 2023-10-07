<template>
	<view class="class-edit-content">
		<view class="class-item" v-for="(item, index) in classList">
			<view class="select-statu">
				<uni-icons v-show="item._id === selectedId" type="checkmarkempty" color="#f2be42" size="22" />
			</view>
			{{item.classTitle}} ({{item.count || 0}})
			<view v-if="index !== 0" class="class-tools">
				<uni-icons @click="editClass(item._id, item.classTitle)" type="compose" size="22"
					class="first-icon"></uni-icons>
				<uni-icons @click="deleteClass(item._id, item.count, item.classTitle)" type="trash"
					size="22"></uni-icons>
			</view>
		</view>
		<view @click="inputDialogToggle(true)" class="add-button">
			新建文件夹
			<text class="add-button-icon" @click="toEdit">
				<uni-icons type="plusempty" color="#fff" size="18"></uni-icons>
			</text>
		</view>
		<view>
			<!-- 输入框示例 -->
			<uni-popup ref="inputDialog" type="dialog">
				<uni-popup-dialog ref="inputClose" mode="input" title="新建文件夹" :value="nowChangeName" placeholder="请输入内容"
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
					classTitle: '全部',
					_id: '-1',
					count: 0,
				}],
				selectedId: '-1',
				nowChangeId: '-1',
				nowChangeName: '文件夹'
			};
		},
		mounted() {
			this.refreshList()
		},
		methods: {
			deleteClass(classId, classCount = 0, classTitle = '') {
				uni.showModal({
					title: `是否确认删除"${classTitle}"文件夹和内部的${classCount}条笔记`,
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
							// TODO: db是就定义一次比较好，还是随用随定义好
							const dbResult = await db.collection('note_class').doc(classId)
								.remove()
							// TODO: 把文件夹里的也删除
							setTimeout(() => {
								uni.hideLoading()
								this.refreshList()
							}, 500)
						}

					}
				})
			},
			editClass(classId, className) {
				this.nowChangeId = classId
				this.nowChangeName = className
				this.inputDialogToggle(false)
			},
			inputDialogToggle(isNew) {
				if (isNew) {
					this.nowChangeId = '-1'
					this.nowChangeName = '文件夹'
				}
				this.$refs.inputDialog.open()
			},
			async dialogInputConfirm(val) {
				const db = uniCloud.database();
				try {
					let res = {}
					if (this.nowChangeId === '-1') {
						res = await db.collection('note_class').add({
							classTitle: val,
						})
					} else {
						res = await db.collection('note_class').doc(this.nowChangeId).update({
							classTitle: val,
						})
					}

					const {
						errCode,
						id
					} = res.result || {}
					console.log('res', res)
					if (errCode === 0) {
						console.log('id', id)
						this.refreshList()
					}


				} catch (err) {
					console.log(err)
					let isConflict = false
					if (String(err).indexOf('冲突')) isConflict = true
					uni.showToast({
						icon: 'error',
						title: `操作失败${isConflict ? ',命名重复' : ''}`
					})
				}

			},
			async refreshList() {
				try {

					const db = uniCloud.databaseForJQL();
					const noteClassPromise = db.collection('note_class').get()
					// if (errCode === 0) {
					// 	this.classList = [{
					// 		classTitle: '全部',
					// 		_id: '-1',
					// 		count: 0,
					// 	}, ...data]
					// }

					// 中间步骤，筛选出有效的笔记
					const validNoteStep = db.collection('note')
						.where('article_status == 1')

					const groupCountPromise = validNoteStep.groupBy('category_id')
						.groupField('count(*) as count')
						.get()

					const totalCountPromise = validNoteStep.get({
						getCount: true
					})

					const noteClassRes = await noteClassPromise
					const groupCountRes = await groupCountPromise
					const totalCountRes = await totalCountPromise

					if (noteClassRes.errCode === 0 && groupCountRes.errCode === 0 && totalCountRes.errCode === 0) {
						// console.log(noteClassRes, groupCountRes, totalCountRes)
						this.classList = [{
							classTitle: '全部',
							_id: '-1',
							count: totalCountRes.count,
						}, ...noteClassRes.data.map(item => {
							return {
								...item,
								count: groupCountRes.data.find(hasCountItem => (hasCountItem.category_id === item._id))?.count || 0
							}
						}), {
							classTitle: '未分类',
							_id: null,
							count: groupCountRes.data.find(hasCountItem => (hasCountItem.category_id === null))?.count || 0
						}]
					}


				} catch (e) {
					console.error(e)
				}
			}
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