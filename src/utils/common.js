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

/**
 *  数据保存到localStorage
 * @param key
 * @param value
 */
export function setLocal (key, value) {
  if (value === undefined || key === undefined) {
    return;
  }
  if (typeof value === 'number' || typeof value === 'string') {
    localStorage[key] = value;
  } else if (typeof value === 'object' && value !== null) {
    localStorage[key] = JSON.stringify(value);
  }
}

/**
 * 获取localStorage数据
 * @param key
 * @returns {any}
 */
export function getLocal (key) {
  if (!localStorage[key]) {
    return;
  }
  let value = localStorage[key];
  let index1 = value.indexOf('[');
  let index2 = value.indexOf('{');
  if (index1 >= 0 || index2 >= 0) {
    value = JSON.parse(localStorage[key]);
  }
  return value;
}

let funArr = ['setLocal', 'getLocal'];

