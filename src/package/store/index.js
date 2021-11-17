import Cookies from 'js-cookie';
import { authRoute } from '@/router'; // authRoute 命名在每个端要一致
import Common from '@/utils/common';

export const state = {
  isOptData: false,
  redirect: '',
  visitedViews: [], // 展示使用的
  cachedViews: [], // keep-alive 使用
  fromRoute: '',
  roles: [],
  addRoutes: [],
  routes: [],
  permissions: [],
  existView: undefined,
  tagSpin: false,
  noCacheWhiteList: [] // 不用keep-alive 的白名单
};

export const actions = {
  // 前端 登出
  FedLogOut ({ commit }) {
    return new Promise(resolve => {
      Common.removeToken();
      resolve();
    });
  },
  /** 删除上个页面或指定页面的缓存 */
  delCachedRoute ({ commit, state }, view) {
    view && (view = { name: view });
    let fromRoute = view || state.fromRoute;
    let preRouteCached = state.cachedViews.some(item => item === fromRoute.name);
    preRouteCached && commit('DEL_CACHED_VIEW', fromRoute);
  },
  addView ({ dispatch }, params) {
    dispatch('addVisitedView', params.view);
    dispatch('addCachedView', params);
  },
  addVisitedView ({ commit }, view) {
    commit('ADD_VISITED_VIEW', view);
  },
  addCachedView ({ commit }, view) {
    commit('ADD_CACHED_VIEW', view);
  },
  delView ({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delVisitedView', view);
      dispatch('delCachedView', view);
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      });
    });
  },
  delVisitedView ({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_VISITED_VIEW', view);
      resolve([...state.visitedViews]);
    });
  },
  delCachedView ({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_CACHED_VIEW', view);
      resolve([...state.cachedViews]);
    });
  },
  delOthersViews ({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delOthersVisitedViews', view);
      dispatch('delOthersCachedViews', view);
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      });
    });
  },
  delOthersVisitedViews ({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_VISITED_VIEWS', view);
      resolve([...state.visitedViews]);
    });
  },
  delOthersCachedViews ({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_CACHED_VIEWS', view);
      resolve([...state.cachedViews]);
    });
  },
  delAllViews ({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delAllVisitedViews', view);
      dispatch('delAllCachedViews', view);
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      });
    });
  },
  delAllVisitedViews ({ commit, state }) {
    return new Promise(resolve => {
      commit('DEL_ALL_VISITED_VIEWS');
      resolve([...state.visitedViews]);
    });
  },
  delAllCachedViews ({ commit, state }) {
    return new Promise(resolve => {
      commit('DEL_ALL_CACHED_VIEWS');
      resolve([...state.cachedViews]);
    });
  }
}

export const mutations = {
  /* 编辑或新增了数据（操作了数据） */
  setOptData (state, param) {
    state.isOptData = param;
  },
  SET_REDIRECT: (state, val) => {
    state.redirect = val
  },
  TOGGLE_COLOR: (state, color) => {
    Cookies.set('themeColor', color);
    sessionStorage.setItem('sessionTheme', color);
    state.themeColor = color;
  },
  setFromRoute (state, param) {
    state.fromRoute = param;
  },

  /** 添加访问的 view
   * view 当前页面的 $route
   * */
  ADD_VISITED_VIEW: (state, view) => {
    let fullPath;
    let exist = state.visitedViews.some((item) => {
      if (item.path === view.path) {
        fullPath = item.fullPath;
        if (view.query) { // 保存为当前访问页面的query
          Object.assign(item, view, { title: view.query.title || view.meta.title });
        }
      }
      return item.path === view.path;
    });
    if (exist) {
      state.existView = fullPath;
    } else {
      state.existView = undefined;
      state.visitedViews.push(
        Object.assign({}, view, { title: view.query.title || view.meta.title })
      );
    }
  },
  /**
   * 添加访问页面的缓存
   * params 对象包含 view、to。view：当前访问的页面，to：将要跳转的页面
   *  */
  ADD_CACHED_VIEW: (state, params) => {
    if (state.existView && params.to && state.existView !== params.to.fullPath) {
      let index = state.cachedViews.findIndex(item => item === params.to.name);
      state.cachedViews.splice(index, 1);
    } else {
      if (state.cachedViews.includes(params.view.name)) { return; } // cachedViews 存储的是路由 name
      // if (!view.meta.noCache) {} // 通过 meta 中noCache字段判断
      let unable = state.noCacheWhiteList.some(item => item === params.view.name);
      if (!unable) {
        state.cachedViews.push(params.view.name);
      }
    }
  },
  DEL_VISITED_VIEW: (state, view) => {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.path === view.path) {
        state.visitedViews.splice(i, 1);
        break;
      }
    }
  },
  DEL_CACHED_VIEW: (state, view) => {
    const index = state.cachedViews.indexOf(view.name);
    index > -1 && state.cachedViews.splice(index, 1);
  },
  DEL_OTHERS_VISITED_VIEWS: (state, view) => {
    state.visitedViews = state.visitedViews.filter(v => {
      return v.meta.affix || v.path === view.path;
    });
  },
  DEL_OTHERS_CACHED_VIEWS: (state, view) => {
    if (view.name) {
      state.cachedViews = state.cachedViews.filter(item => item === view.name);
    }
  },
  DEL_ALL_VISITED_VIEWS: (state) => {
    state.visitedViews = [];
  },
  DEL_ALL_CACHED_VIEWS: (state) => {
    state.cachedViews = [];
  },
  setTagSpin (state, spin) {
    state.tagSpin = spin;
  },

  SET_ROLES: (state, roles) => {
    state.roles = roles;
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions;
  },
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes;
    state.routes = authRoute.concat(routes);
  }
};

export const getters = {
  roles: (state) => state.roles,
  permissions: state => state.permissions,
  permission_routes: state => state.routes
};
