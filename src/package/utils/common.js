
/** 处理http请求方法名 */
export function handleHttpMethod (type, self) {
  return self.apiOrigin === 'PHP' ? `_${type}`: `$${type}`;
}

