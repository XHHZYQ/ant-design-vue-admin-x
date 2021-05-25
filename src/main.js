import Vue from 'vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

// import xhhPkg, { GET, POST, DELETE, PUT } from '../dist'; // 打包结果引入 dist
import xhhPkg, { GET, POST, DELETE, PUT }  from '@/package'; // 直接引入

// import App from './demo/form-demo.vue';
import App from '@/demo/table-demo.vue';

Vue.use(Antd);
Vue.use(xhhPkg);

let config = { baseURL: 'http://192.168.1.225:8000/community/' };
let $get = GET.bind(config);
let $post = POST.bind(config);
let $delete = DELETE.bind(config);
let $put = PUT.bind(config);

Vue.prototype.$get = $get;
Vue.prototype.$post = $post;
Vue.prototype.$delete = $delete;
Vue.prototype.$put = $put;

new Vue({
  el: '#app',
  render: h => h(App)
})
