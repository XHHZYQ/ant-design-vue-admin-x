import { PLAT_FORM } from '@/utils/platform';

/** 二级面包屑参数 */
export function breadParam (self) {
  return {
    parentTitle: self.$route.meta.title,
    parentPath: self.$route.fullPath
  };
}

/** 过滤账号是否有登陆时要跳转页面的路由 */
export function hasRoute (target, arr) {
  return arr.map(item => {
    return item.path === target ? target : ((item.children && item.children.length) ? hasRoute(target, item.children) : '');
  }).toString().split(',').filter(item => item === target)[0];
}

/** 处理http请求方法名 */
export function handleHttpMethod (type = 'get', self = { apiOrigin: 'JAVA' }) {
  console.log('PLAT_FORM apiOrigin: ', PLAT_FORM, self.apiOrigin);
  if (PLAT_FORM === 'property' || PLAT_FORM === 'government') { // 物业、政务
    return self.apiOrigin === 'JAVA' ? `_${type}`: `$${type}`;
  } else { // 社区
    return self.apiOrigin === 'PHP' ? `_${type}`: `$${type}`;
  }
}

