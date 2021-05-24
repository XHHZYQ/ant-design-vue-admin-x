import { GET } from '@/utils/http';
import Cookies from 'js-cookie';

const TokenKey = 'Admin-Token';

/* 获取access token */
export function getToken () {
  GET({
    url: '/access_token',
    params: { grant_type: 'client_credential' }
  }).then(({data}) => {
    let docToken = document.cookie.split('=')[1];
    if (!docToken) {
      document.cookie = `accessToken=${data.access_token};max-age=1800`;
    }
  });
}

/** 存储 token */
export function setToken (token) {
  return Cookies.set(TokenKey, token);
}

/** 清除 token */
export function removeToken () {
  return Cookies.remove(TokenKey);
}
