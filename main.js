import App from './App.vue'
//配置公共方法
import common from './common/common.js'


// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
common.test()
Vue.prototype.$debounce = common.debounce;
Vue.prototype.$test = common.test;
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	app.config.globalProperties.$debounce = common.debounce;
	app.config.globalProperties.$test = common.test;
	return {
		app
	}
}
// #endif


