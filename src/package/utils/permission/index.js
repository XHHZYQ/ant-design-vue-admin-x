import router from '@/router';
import store from '@/store';
import Common from '@/utils/common';
import { hasRoute } from '../common';
import { GetInfo, GenerateRoutes } from './api';

const whiteList = ['/login', '/test', '/forget'];

export function routerBeforeEach (to, from, next) {
  console.log('before: ', to.path);
  if (Common.getToken()) {
    store.commit('setFromRoute', from);
    let hasView = store.state.visitedViews.some(item => item.name === from.name);
    let noCache = store.state.cachedViews.every(item => item !== from.name);
    hasView && noCache && store.commit('ADD_CACHED_VIEW', { view: from });

    console.log('roles.length: ', store.getters.roles.length);
    if (store.getters.roles.length === 0) { // 判断当前用户是否获取完user_info信息
      GetInfo().then(user => { // 拉取user_info
        GenerateRoutes().then(accessRoutes => {
          router.addRoutes(accessRoutes); // 动态添加可访问路由表

          let full = store.state.redirect;
          let path;
          full && full.includes('?') ? path = full.split('?')[0] : path = full;
          if (from.path === '/login' && path && hasRoute(path, accessRoutes)) { // 上页面为登录页，角色中包含要跳转的变量 redirect，跳转redirect
            console.log('跳转redirect', full);
            next({ path: full, replace: true });
          } else if (hasRoute(to.path, accessRoutes)) {// 角色中包含要跳转的路由,跳转 to
            console.log('跳转 to', to.fullPath);
            next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
          } else {// 跳转角色中第一个
            let flatRoutes = flatRoute(store.state.accessRoute);
            let others = flatRoutes.filter(item => !store.state.dataViewRoutes.includes(item.path));
            console.log('跳转角色第一个 path: ', others[0].path);
            next({ path: others[0].path});
          }

          sessionStorage.userData = JSON.stringify({ userName: user.userName, mobile: user.mobile });
        });
      }).catch(() => {
        store.dispatch('FedLogOut').then(() => { // todo 该代码执行不到
          next({ path: '/login' });
        });
      });
    } else {
      console.log('有角色: ', to.path);
      if (to.path === '/login') {
        let flatRoutes = flatRoute(store.state.accessRoute);
        let others = flatRoutes.filter(item => !store.state.dataViewRoutes.includes(item.path));
        console.log('others 22: ', others[0].path);
        others && others.length && next({ path: others[0].path });
      } else {
        next();
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next();
    } else {
      let redirect;
      if (from.path !== '/login') {
        redirect = to.fullPath;
      }
      redirect && (sessionStorage.redirect = redirect);
      let path = redirect ? `/login?redirect=${redirect}` : '/login';
      next(path); // 否则全部重定向到登录页
    }
  }
}

/** 展平嵌套的路由 */
let flatRoutes = [];
function flatRoute (list) {
  list.forEach((item) => {
    if (item.component === 'Layout') {
      flatRoute(item.children);
    } else {
      flatRoutes.push(item);
    }
  });
  return flatRoutes;
}

