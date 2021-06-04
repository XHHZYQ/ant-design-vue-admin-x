import { getLocal, setLocal } from '../common';

export default {
  appAuth: {
    watch: {
      $route (to, from) {
        if (from.name === 'login') {
          if (getLocal('adminStatus') === '1') {
            this.menuList = this.$store.state.menuList;
          } else {
            localStorage.menuList && (this.menuList = getLocal('menuList'));
          }
        }
      }
    },
    created () {
      this.initMenuRoute();
    },
    methods: {
      initMenuRoute () {
        if (getLocal('adminStatus') === '1') {
          let state = this.$store.state;
          this.menuList = state.menuList;
          this.$router.addRoutes(state.routes);
        } else {
          this.setMenuRoute();
        }
      },
      setMenuRoute (menuList, routeList) {
        let state = this.$store.state;
        let noPage = {
          path: '*',
          redirect: '/noPage'
        };
        if (menuList && routeList) {
          routeList.push(noPage);
          this.$router.addRoutes(routeList);
        } else {
          localStorage.menuList && (this.menuList = getLocal('menuList'));
          let routes = getLocal('routeList');
          if (routes) {
            routes.forEach((el) => {
              state.routes.forEach((item) => {
                if (item.name === el.name) {
                  el.component = item.component;
                }
              });
            });
            routes.push(noPage);
            this.$router.addRoutes(routes);
          }
        }
      }
    }
  },

  tableAuth: {
    created () {
      this.disableAllBtn();
      if (getLocal('adminStatus') === '1') {
        this.openBtnAuth();
      } else {
        this.setBtnAuth();
      }
    },
    methods: {
      /* 禁用全部权限按钮 */
      disableAllBtn () {
        this.tableOptList.forEach((item) => {
          item.authDisabled = true;
        });

        this.rowOptList.forEach((part) => {
          if (Array.isArray(part)) {
            part.forEach((el) => {
              el.authDisabled = true;
            });
          } else {
            part.authDisabled = true;
          }
        });
      },
      /* 放开按钮权限 */
      openBtnAuth () {
        this.tableOptList.forEach((item) => {
          item.authDisabled = false;
        });
        this.rowOptList.forEach((part) => {
          if (Array.isArray(part)) {
            part.forEach((el) => {
              el.authDisabled = false;
            });
          } else {
            part.authDisabled = false;
          }
        });
      },
      /* 设置按钮权限 */
      setBtnAuth () {
        let btnList = getLocal('btnList');
        btnList && btnList.forEach((el) => {
          if (this.$route.name === el.componentName) {
            this.tableOptList.forEach((item) => {
              if (item.key === el.key) {
                item.authDisabled = false;
              }
            });

            this.rowOptList.forEach((part) => {
              if (Array.isArray(part)) {
                part.forEach((eve) => {
                  if (eve.key === el.key) {
                    eve.authDisabled = false;
                  }
                });
              } else {
                if (part.key === el.key) {
                  part.authDisabled = false;
                }
              }
            });
          }
        });
      }
    }
  },
  addEditAuth: {
    data () {
      return { submitDisabled: true };
    },
    created () {
      this.$route && this.$route.name === 'userInfo' && (this.submitDisabled = false);

      if (getLocal('adminStatus') === '1') {
        this.submitDisabled = false;
      } else {
        this.pageBtnAuth();
      }
    },
    methods: {
      /* 设置按钮权限 */
      pageBtnAuth () {
        let btnList = getLocal('btnList');
        btnList && btnList.forEach((el) => {
          if (this.$route.name === el.componentName) {
            el.key === 'submit' && (this.submitDisabled = false);
          }
        });
      }
    }
  },
  securityAuth: {
    data () {
      return {
        singleSelect: true,
        singleNormal: true,
        singleBlock: true,
        detail: true,
        batchSelect: true,
        batchNormal: true,
        batchBlock: true,
        keyArr: ['singleSelect', 'singleNormal', 'singleBlock', 'detail', 'batchSelect', 'batchNormal', 'batchBlock']
      };
    },
    created () {
      this.disableAllBtn();
      if (getLocal('adminStatus') === '1') {
        this.openBtnAuth();
      } else {
        this.setBtnAuth();
      }
    },
    methods: {
      /* 禁用所有的按钮 */
      disableAllBtn () {
        this.keyArr.forEach((item) => {
          this[item] = true;
        });
      },
      /* 放开按钮权限 */
      openBtnAuth () {
        this.keyArr.forEach((item) => {
          this[item] = false;
        });
      },
      /* 设置按钮权限 */
      setBtnAuth () {
        let btnList = getLocal('btnList');
        btnList && btnList.forEach((el) => {
          if (this.$route.name === el.componentName) {
            this.keyArr.forEach((item) => {
              if (item === el.key) {
                this[item] = false;
              }
            });
          }
        });
      }
    }
  }
};
