import { PLAT_FORM } from '@/utils/platform';

/** 处理http请求方法名 */
export function handleHttpMethod (type = 'get', self = { apiOrigin: 'JAVA' }) {
  console.log('PLAT_FORM apiOrigin: ', PLAT_FORM, self.apiOrigin);
  if (PLAT_FORM === 'property' || PLAT_FORM === 'government') { // 物业、政务
    return self.apiOrigin === 'JAVA' ? `_${type}`: `$${type}`;
  } else { // 社区
    return self.apiOrigin === 'PHP' ? `_${type}`: `$${type}`;
  }
}

