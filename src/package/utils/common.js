import platform from '@/utils/platform';

/** 处理http请求方法名 */
export function handleHttpMethod (type, self) {
  console.log('platform apiOrigin: ', platform, self.apiOrigin);
  if (platform === 'property' || platform === 'government') { // 物业、政务
    return self.apiOrigin === 'JAVA' ? `_${type}`: `$${type}`;
  } else { // 社区
    return self.apiOrigin === 'PHP' ? `_${type}`: `$${type}`;
  }
}

