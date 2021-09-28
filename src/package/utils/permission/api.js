import { GET } from '../http';
import store from '@/store';
import Common from '@/utils/common';
import Layout from '../../layout/index';
import { PLAT_FORM } from '@/utils/platform';

let baseUrl;
if (PLAT_FORM === 'property' || PLAT_FORM === 'government') {
  baseUrl = process.env.VUE_APP_BASE_API_JAVA;
} else {
  baseUrl = process.env.VUE_APP_BASE_API;
}

// 获取用户信息
export function GetInfo () {
  return new Promise((resolve, reject) => {
    GET({
      url: baseUrl + '/user/getInfo'
    }).then(res => {
      const user = res.data.user;
      let userInfo = {
        avatar: user.avatar,
        user_name: user.userName,
        mobile: user.mobile,
        trueName: user.trueName,
        role_desc: user.roleName,
        sex: user.sex
      };
      Common.setLocal('userInfo', userInfo);
      if (res.data.roles && res.data.roles.length) {
        store.commit('SET_ROLES', res.data.roles);
        store.commit('SET_PERMISSIONS', res.data.permissions);
      } else { // 设置默认角色
        store.commit('SET_ROLES', ['ROLE_DEFAULT']);
      }
      localStorage.isManager = user.isManager;
      localStorage.userId = user.userId;
      resolve(res);
    }).catch(error => {
      reject(error);
    });
  });
}
// 生成路由
export function GenerateRoutes () {
  return new Promise((resolve, reject) => {
    GET({ // 向后端请求路由数据
      url: baseUrl + '/user/getRouters'
    }).then(({ data }) => {
      data.push({
        component: 'Layout',
        hidden: true,
        path: '/userInfo',
        children: [{
          component: 'login/userInfo',
          hidden: false,
          meta: { title: '账户信息' },
          path: '',
          name: 'userInfo'
        }]
      });
      let accessedRoutes = filterAsyncRouter(data);
      let router = [
        {
          path: '/redirect',
          component: Layout,
          hidden: true,
          children: [{
            path: '/redirect/:path(.*)',
            component: () => import('./views/redirect')
          }]
        },
        {
          path: '/empty',
          component: Layout,
          hidden: true,
          children: [{
            path: '',
            component: () => import('./views/emptyPage')
          }]
        }
      ];
      accessedRoutes = [...accessedRoutes, ...router, { path: '*', redirect: '/404', hidden: true }];
      store.commit('SET_ROUTES', accessedRoutes);
      resolve(accessedRoutes);
    }).catch(error => {
      reject(error);
    });
  });
}

// 遍历后台传来的路由字符串，转换为组件对象
export function filterAsyncRouter (asyncRouterMap) {
  return asyncRouterMap && asyncRouterMap.filter(route => {
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout;
      } else {
        route.component = loadView(route.component);
      }
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children);
    }
    return true;
  });
}

export const loadView = (view) => { // 路由懒加载
  return () => import(`@/views/${view}`);
};