import Cookies from 'js-cookie';

const TokenKey = 'Admin-Token';

/* 获取access token */
export function getToken () {
  return Cookies.get(TokenKey);
}

/** 存储 token */
export function setToken (token) {
  return Cookies.set(TokenKey, token);
}

/** 清除 token */
export function removeToken () {
  return Cookies.remove(TokenKey);
}

/** 处理http请求方法名 */
export function handleHttpMethod (type, self) {
  return self.apiOrigin === 'PHP' ? `_${type}`: `$${type}`;
}

