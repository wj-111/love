
// 防抖
let timer
function debounce(fn, wait) {
	let delay = wait || 500
	return function() {
		let args = arguments;
		if (timer) {
			clearTimeout(timer)
			// console.log('拦截')
		}
		timer = setTimeout(() => {
			// console.log('发送')
			fn.apply(this, args)
			timer = null
		}, delay)
	}() // 装好直接调用了
}

function test() {
	console.log('test')
}
//导出
export default {
	debounce,
	test
}