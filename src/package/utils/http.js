/* axios config配置 */
import axios from 'axios';
import Qs from 'qs';
import CryptoJS from 'crypto-js';
import { message } from 'ant-design-vue';
import { empty } from './empty';
import Common from '@/utils/common';
import { PLAT_FORM } from '@/utils/platform';

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
    return status === 200 || status === 401; // 状态码为200时，为成功，否则失败
  }
});

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

  let usertoken;
  if (Common.getToken()) {
    usertoken = Common.getToken();
  }
  let aesStr = getAesString(
    `${keySecret.app_key}:${usertoken || ''}:''`,
    'hm2KzN8k32UyVAEm', // 加密key
    '9aec6fb8db98e4b4' // 偏移量
  );

  const appType = {
    community: 'admin',
    property: 'property',
    government: 'government',
  };
  aesStr = `${appType[PLAT_FORM]} ${aesStr}`;
  let head = {
    'timestamp': time,
    'signature': md5Param,
    'app-type': 'web',
    authentication: aesStr,
    Authorization: `Bearer ${Common.getToken()}`
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

function refreshToken (config) {
  let baseUrl;
  if (PLAT_FORM === 'property' || PLAT_FORM === 'government') {
    baseUrl = process.env.VUE_APP_BASE_API_JAVA;
  } else {
    baseUrl = process.env.VUE_APP_BASE_API;
  }

  return POST({
    url: baseUrl + '/userLogin/refresh',
    params: {
      refreshToken: config.params.refreshToken,
      userId: config.params.userId,
      grantType: 'refresh_token'
    }
  })
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
let isRefreshing = false
let requestList = []
instance.interceptors.response.use((res) => {
  let resData = res.data;
  if (typeof resData === 'string') {
    resData = JSON.parse(resData);
  }
  if (resData.code === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      return refreshToken({
        params: {
          refreshToken: localStorage.refresh_token,
          userId: localStorage.userId
        }
      }).then(newRes => {
        let data = newRes.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        const newToken = data.access_token
        Common.setToken(newToken);
        localStorage.refresh_token = data.refresh_token;
        res.config.headers.Authorization = 'Bearer ' + newToken;
        requestList.forEach(callback => callback(newToken))
        requestList = []
        return instance(res.config)
      }).catch(err => {
        message.error('登录已失效', 1).then((res) => {
          empty.$emit('setCacheData');
        });
      }).finally(() => {
        isRefreshing = false
      })
    } else {
      return new Promise(resolve => {
        requestList.push(newToken => {
          res.config.headers.Authorization = 'Bearer ' + newToken;
          resolve(instance(res.config))
        })
      })
    }
  } else {
    return res;
  }
}, (error) => {
  return Promise.reject(error);
});

/**
 * 封装请求方法
 * @param options, 配置参数
 * @param obj, 其他参数
 * @returns {Promise<any>}
 */
let isShowMsg = false;
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
      let resData = res.data;
      if (typeof resData === 'string') {
        resData = JSON.parse(resData);
      }
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
      } else if (resData.code === 9004) { // 登录的账号被删除（包括其他电脑）后强退
        message.error('当前登录账号已被删除', 1).then((res) => {
          empty.$emit('setCacheData');
        });
      } else if (resData.code === 401) { // 令牌失效
        message.error('登录已失效', 1).then((res) => {
          empty.$emit('setCacheData');
        });
      } else if (resData.code === 403) { // 无权限
        resData.msg && message.error(resData.msg, 5);
      } else if (resData.code === 9003 || resData.code === 40000) {
        message.error(resData.msg, 1).then((res) => {
          empty.$emit('setCacheData');
        })
      } else {
        resData.msg && message.error(resData.msg, 5); // 错误提示信息
        reject(res);
      }
    }).catch((err) => {
      spinObj && setTimeout(() => { spinObj.spinning = false; }, 300); // 关闭loading
      btnLoading && setTimeout(() => { btnLoading.loading = false; }, 300);
      if (localeText) {
        localeText.emptyText = '暂无数据';
      }
      let errData = (err.response || {}).data;
      console.log('err errData: ', errData);
      if (typeof errData === 'string') {
        errData = JSON.parse(errData);
      }
      reject(errData);

      if (isShowMsg) { return; }
      isShowMsg = true;

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
      setTimeout(() => { // 防止错误信息频繁弹窗
        isShowMsg = false;
      }, 1000 * 5);
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
