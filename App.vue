<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
		}
	};
</script>

<style>
	/*每个页面公共css */
	.rich-text-img {
		border-radius: 25rpx;
	}

	/* 特别注意微信没有html,body元素,只有page,所以写这种全局的时候一定要注意一下兼容 */
	uni-page-body,
	page,
	html,
	body {
		height: 100%;
	}
</style>