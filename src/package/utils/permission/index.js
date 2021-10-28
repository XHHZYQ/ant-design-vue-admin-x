import router from '@/router';
import store from '@/store';
import Common from '@/utils/common';
import { hasRoute } from '../common';
import { GetInfo, GenerateRoutes } from './api';

const whiteList = ['/login', '/test', '/forget'];

export function routerBeforeEach (to, from, next) {
  if (Common.getToken()) {
    store.commit('setFromRoute', from);
    let hasView = store.state.visitedViews.some(item => item.name === from.name);
    let noCache = store.state.cachedViews.every(item => item !== from.name);
    hasView && noCache && store.commit('ADD_CACHED_VIEW', { view: from });

    if (store.getters.roles.length === 0) { // 判断当前用户是否获取完user_info信息
      GetInfo().then(user => { // 拉取user_info
        GenerateRoutes().then(accessRoutes => {
          router.addRoutes(accessRoutes); // 动态添加可访问路由表

          let full = store.state.redirect;
          console.log('有cookie to, from: ', to.path, from.path);
          let path;
          full && full.includes('?') ? path = full.split('?')[0] : path = full;
          console.log('path: ', path);
          console.log('full: ', full);
          if (from.path === '/login' && path && hasRoute(path, accessRoutes)) {
            next({ path: full, replace: true });
          } else if (hasRoute(to.path, accessRoutes)) {
            next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
          } else {
            next({ path: accessRoutes[0].path});
          }

          sessionStorage.userData = JSON.stringify({ userName: user.userName, mobile: user.mobile });
        });
      }).catch(() => {
        store.dispatch('FedLogOut').then(() => { // todo 该代码执行不到
          next({ path: '/login' });
        });
      });
    } else {
      if (to.path === '/login') {
        let children = store.state.addRoutes[0].children; // 除了几个特殊页面路由都有children
        children && children.length && next({ path: children[0].path });
      } else {
        next();
      }
    }
  } else {
    console.log('无cookie to, from: ', to.path, from.path);
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next();
    } else {
      let redirect;
      console.log('redirect-1: ', redirect);
      if (from.path !== '/login') {
        redirect = to.fullPath;
      }
      console.log('redirect-2: ', redirect);
      redirect && (sessionStorage.redirect = redirect);
      let path = redirect ? `/login?redirect=${redirect}` : '/login';
      next(path); // 否则全部重定向到登录页
    }
  }
}

