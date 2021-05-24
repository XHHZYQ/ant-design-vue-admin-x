
/**
 * 操作权限处理
 */
export const hasPermi = {
  inserted (el, binding, vnode) {
    const { value } = binding;
    const all_permission = '*:*:*'; // admin 权限

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value;
      const permissions = JSON.parse(sessionStorage.getItem('permiList')) || []; // 角色权限列表存储在 sessionStorage 中
      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permissionFlag.includes(permission);
      });

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      console.log(`请设置操作权限标签值`);
    }
  }
};
