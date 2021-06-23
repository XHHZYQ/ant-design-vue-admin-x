/* axios config配置 */
import axios from 'axios';
// import router from '../router';
import Qs from 'qs';
import CryptoJS from 'crypto-js';
import { message } from 'ant-design-vue';
import { empty } from './empty';
import { getToken, setToken, removeToken } from './common';

const newAxios = axios.create({ timeout: 1000 * 30, baseURL: process.env.VUE_APP_BASE_API });

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  params: {},
  timeout: 1000 * 30,
  headers: {
    'Content-Type': 'application/json'
  },
  transformResponse: [function (data) {
    return data;
  }],
  paramsSerializer: function (params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'});
  },
  withCredentials: false,
  responseType: 'json',
  maxContentLength: 2000,
  maxRedirects: 5,
  validateStatus: function (status) {
    return status === 200; // 状态码为200时，为成功，否则失败
  }
});

let getTokenCount = 0;
function createHeader (config) {
  let time = parseInt(new Date().getTime() / 1000);
  let keySecret = {
    'app_key': 'hmkA6En4U93pfhvJjiBj', // 写死
    'app_secret': '7da99be28f035c05d912ab07a224d71f' // 写死
  };
  let paramArr = [];
  if (config.params && Object.keys(config.params).length) {
    joinParam(config.params, paramArr);
  }
  if (config.data && Object.keys(config.data).length) {
    joinParam(config.data, paramArr);
  }
  let sortRes = sortObjArr(paramArr);
  for (let item in keySecret) {
    sortRes.push({[item]: keySecret[item]});
  }
  let urlEncoded = stringifyArr(sortRes);
  let md5Param = CryptoJS.MD5(urlEncoded).toString().toLowerCase();

  let accesstoken;
  if (config.url !== '/access_token') {
    let token = document.cookie.split('=')[1];

    if (token) {
      accesstoken = token;
    } else {
      if (getTokenCount < 4) { // todo
        getToken();
        getTokenCount++;
      }
    }
  }

  if (localStorage.userToken) {
    var usertoken = localStorage.userToken;
  }
  let aesStr = getAesString(
    `${keySecret.app_key}:${usertoken || ''}:${accesstoken || ''}`,
    'hm2KzN8k32UyVAEm', // 加密key
    '9aec6fb8db98e4b4' // 偏移量
  );
  aesStr = `admin ${aesStr}`;
  let head = {
    'timestamp': time,
    'signature': md5Param,
    'app-type': 'web',
    authentication: aesStr,
    Authorization: `Bearer ${getToken()}`
  };
  config.headers = {...config.headers, ...head};
  return config;
}

function stringifyArr (sortRes) {
  let paramStr = [];
  sortRes.forEach((ele) => {
    let str;
    for (let item in ele) {
      str = `${item}=${ele[item]}`;
    }
    paramStr.push(str);
  });
  paramStr = paramStr.join('&');
  return paramStr;
}

/**
 * AES 加密
 * @param data 需加密的字符
 * @param key 加密key
 * @param iv 偏移量
 * @returns {string}
 */
function getAesString (data, key, iv) {
  key = CryptoJS.enc.Utf8.parse(key);
  iv = CryptoJS.enc.Utf8.parse(iv);
  var encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
  return encrypted;
}

/**
 *  把post或get参数合并成一个数组
 * @param param
 * @param paramArr
 */
function joinParam (param, paramArr) {
  if (param && Object.keys(param).length) {
    for (let item in param) {
      let obj = {};
      obj[item] = param[item];
      paramArr.push(obj);
    }
  }
}

/**
 * 参数排序
 * @param arr
 * @returns {Array}
 */
function sortObjArr (arr) {
  let keyArr = [];
  arr.forEach((ele) => {
    keyArr = [...keyArr, ...Object.keys(ele)];
  });
  keyArr.sort();
  let result = [];
  arr.forEach((ele) => {
    for (let item in ele) {
      keyArr.forEach((part, index) => {
        if (item === part) {
          let obj = {};
          obj[item] = ele[item];
          result[index] = obj;
        }
      });
    }
  });
  return result;
}

// 请求拦截器
instance.interceptors.request.use(config => {
    config = createHeader(config);
    return config;
  }, error => {
    return Promise.reject(error);
  }
);

// 响应拦截器  用于token失效时刷新
instance.interceptors.response.use((res) => {
  getTokenCount = 0;
  if (res.data.code === 401) {
    return newAxios({
      method: 'post',
      url: 'community/userLogin/refresh',
      data: {
        refreshToekn: localStorage.refresh_token,
        userId: localStorage.userId,
        grantType: 'refresh_token'
      }
    }).then(res1 => {
      if (res1.data.code === 200) {
        setToken(res1.data.data.access_token);
        localStorage.refresh_token = res1.data.data.refresh_token;
        let {params, url, method} = res.config;
        res.config.headers.Authorization = 'Bearer ' + res1.data.data.access_token;
        return newAxios(res.config);
      } else {
        removeToken();
        localStorage.clear();
        sessionStorage.clear();

        let path = location && location.hash.split('#')[1];
        console.log('http 401 path: ', path);
        window.location.href = `${location.origin}${location.pathname}${location.hash}?redirect=${path}`;
      }
    });
  } else {
    return res;
  }
}, (error) => {
  getTokenCount = 0;
  // console.log('tokenCunt err: ', getTokenCount);
  return Promise.reject(error);
});

/**
 * 封装请求方法
 * @param options, 配置参数
 * @param obj, 其他参数
 * @returns {Promise<any>}
 */
const fetch = (options, obj) => {
  let { spinObj } = obj;
  let { btnLoading } = obj;
  let { localeText } = obj;
  if (localeText) {
    localeText.emptyText = '加载中...';
  }
  spinObj && (spinObj.spinning = true); // 打开loading
  btnLoading && (btnLoading.loading = true);

  return new Promise((resolve, reject) => {
    instance(options).then((res) => {
      // console.log('http options: ', options.url, options);
      let resData = res.data;
      spinObj && setTimeout(() => { spinObj.spinning = false; }, 300); // 关闭loading
      btnLoading && setTimeout(() => { btnLoading.loading = false; }, 300);
      if (localeText && resData.data) {
        let list = resData.data.list;
        if (!list || !list.length) {
          localeText.emptyText = '暂无数据';
        }
      }
      if (resData.code === 1 || resData.code === 2 || resData.code === 200) { // 1：成功，2：单独处理导入房间部分成功
        resolve(resData); // 注意：resolve只接收一个参数
      } else if (resData.code === 9002) { // accessToken失效
        document.cookie = `accessToken=`;
      } else if (resData.code === 9003) { // 重定向至登录页
        location.href = `http://${location.host}/#/login`;
      } else if (resData.code === 9004) { // 登录的账号被删除（包括其他电脑）后强退
        message.error('当前登录账号已被删除', 5).then((res) => {
          empty.$emit('setCacheData');
        });
      } else if (resData.code === 401) { // 令牌失效
      } else if (resData.code === 403) { // 无权限
        resData.msg && message.error(resData.msg, 5);
      } else {
        resData.msg && message.error(resData.msg, 5); // 错误提示信息
        reject(res);
      }
    }).catch((err) => {
      // console.log('http error options : ', options.url, options);
      spinObj && setTimeout(() => { spinObj.spinning = false; }, 300); // 关闭loading
      btnLoading && setTimeout(() => { btnLoading.loading = false; }, 300);
      if (localeText) {
        localeText.emptyText = '暂无数据';
      }
      let errData = (err.response || {}).data;
      reject(errData);
      if (err.response) {
        /* 错误提示信息 */
        if (errData && errData.msg) {
          message.error(errData.msg, 5);
        } else {
          message.error('网络不给力，请刷新重试');
        }
      } else {
        message.error('网络不给力，请刷新重试');
      }
    });
  });
};


export function GET (obj) {
  let { url, params, config } = obj;
  config = config || {};
  config = {...config, ...this};

  return fetch({
    method: 'get',
    url,
    params,
    ...config
  }, obj);
}

export function POST (obj) {
  let { url, params, config, query } = obj;
  config = config || {};
  config = {...config, ...this};

  return fetch({
    method: 'post',
    url,
    params: query, // 单独处理文件上传
    data: params, // data 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
    ...config
  }, obj);
}

export function DELETE (obj) {
  let { url, params, config } = obj;
  config = config || {};
  config = {...config, ...this};

  return fetch({
    method: 'delete',
    url,
    params, // DELTE 参数放在路由 query
    ...config
  }, obj);
}

export function PUT (obj) {
  let { url, params, config } = obj;
  config = config || {};
  config = {...config, ...this};

  return fetch({
    method: 'put',
    url,
    data: params, // data 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
    ...config
  }, obj);
}