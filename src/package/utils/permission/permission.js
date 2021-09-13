import router from '@/router';
import store from '@/store';
import Common from '@/utils/common';

const whiteList = ['/login', '/test', '/forget'];

router.beforeEach((to, from, next) => {
  if (Common.getToken()) {
    if (to.path === '/login') {
      next();
    } else {
      store.commit('setFromRoute', from);
      let hasView = store.state.visitedViews.some(item => item.name === from.name);
      let noCache = store.state.cachedViews.every(item => item !== from.name);
      hasView && noCache && store.commit('ADD_CACHED_VIEW', { view: from });

      if (store.getters.roles.length === 0) { // 判断当前用户是否获取完user_info信息
        store.dispatch('GetInfo').then(res => { // 拉取user_info
          store.dispatch('GenerateRoutes', {}).then(accessRoutes => {
            router.addRoutes(accessRoutes); // 动态添加可访问路由表
            if (Common.hasRoute(to.path, accessRoutes)) {
              next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
            } else {
              next({ path: accessRoutes[0].path});
            }
          });
        }).catch(() => {
          store.dispatch('FedLogOut').then(() => {
            next({ path: '/login' });
          });
        });
      } else {
        next();
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next();
    } else {
      let redirect = to.fullPath;
      let path = redirect ? `/login?redirect=${redirect}` : '/login';
      next(path); // 否则全部重定向到登录页
    }
  }
});
