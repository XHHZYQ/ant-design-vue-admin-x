
import { state, actions, mutations, getters } from './store';
import search from './Table/search';
import table from './Table/table';
import addEdit from './Form/addEdit';
import { hasPermi } from './utils/hasPermi';
import Layout from './layout';
import { account, role, menu, IconSelector, dictionaries, dictionaryData, loginLog, operLog, userInfo, forgetPwd  } from './views';
import cardHead from './Form/cardHead';
import { routerBeforeEach } from './utils/permission';

let component = {
  search,
  tabula: table,
  addEdit
};

const install = (Vue) => {
  Object.keys(component).forEach((key) => {
    Vue.component(`x-${key}`, component[key]);
  });
  Vue.directive('hasPermi', hasPermi);
};

export { state, actions, mutations, getters };
export { empty } from './utils/empty';
export { handleHttpMethod, breadParam } from './utils/common';
export { addEdit, upload, inputSearch, searchMobileOrAccount, clearCacheData } from './utils/mixins/index';
export { GET, POST, DELETE, PUT } from './utils/http';
export { routerBeforeEach };
export { Layout };
export { account, role, menu, IconSelector, dictionaries, dictionaryData, loginLog, operLog, userInfo, forgetPwd, cardHead };
export { MenuIconFont } from './views/IconSelector/icons';
export { updateTheme } from  './utils/settingDrawer/settingConfig';
export default install;

