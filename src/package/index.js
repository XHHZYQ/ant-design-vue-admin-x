
import search from './Table/search';
import table from './Table/table';
import addEdit from './Form/addEdit';
import { hasPermi } from './utils/hasPermi';

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

export { empty } from './utils/empty';
export { addEdit, upload, inputSearch } from './utils/mixins/index';
export { GET, POST, DELETE, PUT } from './utils/http';
export default install;

