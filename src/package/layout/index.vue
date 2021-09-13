<template>
  <a-config-provider :locale="locale">
    <div id="app" v-if="hasLayout">
      <div id="components-layout">
        <aside class="layout-sider" :style="siderWidth">
          <div class="logo" :class="{center: isCollapse}">
            <img v-if="!isCollapse" src="../assets/images/btn_logo.png" alt="">
            <img v-else src="../assets/images/logo.png" alt="">
          </div>
          <a-menu
            theme="dark"
            mode="inline"
            @click="({ item, key, keyPath }) => handleClick(key)"
            @openChange="onOpenChange"
            :selectedKeys="activeMenu"
            :openKeys="openKeys"
            :inlineCollapsed="isCollapse">
            <template v-for="item of permission_routes">
              <a-sub-menu :key="item.path" v-if="item.meta && !item.hidden">
                <span slot="title">
                  <a-icon :type="item.meta.icon"/>
                  <span>{{ item.meta.title }}</span>
                </span>

                <template v-for="el of item.children">
                  <a-menu-item :key="el.path" v-if="!el.hidden">
                    <a-icon :type="el.meta.icon"/>
                    <span>{{ el.meta.title }}</span>
                  </a-menu-item>
                </template>

              </a-sub-menu>
            </template>
          </a-menu>
        </aside>

        <main class="layout-main" :style="mainLeft">
          <div class="layout-nav" :style="mainLeft">
          <header :style="headLeft">
            <a-icon class="trigger" :type="isCollapse ? 'menu-unfold' : 'menu-fold'"
                    @click="triggerMenu"/>
            <div class="rt">
              <a-tooltip title="用户信息">
                <span @click="handleClick('/userInfo')">
                  <span class="avatar">
                  <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="">
                  </span>
                  <span>{{userInfo.user_name}}</span>
                </span>
              </a-tooltip>
              <a-tooltip title="修改密码">
                <span @click="handleClick('/userInfo', {param: 'changePwd'})"><a-icon type="lock"/></span>
              </a-tooltip>

              <a-tooltip title="设置主题">
                <span @click="visible = true" ><a-icon type="bg-colors" /></span>
              </a-tooltip>

              <a-tooltip title="退出登录">
                <span @click="logOut"><a-icon type="logout"/></span>
              </a-tooltip>
            </div>
          </header>

          <tag-views v-show="visitedViews.length"></tag-views>

            <div v-if="visitedViews.length" class="page-header">
              当前位置：
              <a-breadcrumb :routes="breadList">
                <template slot="itemRender" slot-scope="{route}">
                  <span v-if="breadList.indexOf(route) === breadList.length - 1">{{route.name}}</span>
                  <router-link v-else :to="route.path">{{route.name}}</router-link>
                </template>
              </a-breadcrumb>
<!--              <p class="headering">{{breadList[breadList.length - 1].name}}</p>-->
            </div>
          </div>

            <section v-if="visitedViews.length" class="layout-content" :style="layoutContent">
              <transition name="fade-transform" mode="out-in">
                <keep-alive :include="cachedViews">
                  <router-view/>
                </keep-alive>
              </transition>
            </section>

          <footer :class="!visitedViews.length ? 'blank' : 'foot'">
            <div>
              <img v-if="visitedViews.length" class="logo" src="../assets/images/icon_haomiao.png" alt="">
              <img v-else class="logo" src="../assets/images/icon_haomiao1.png" alt="">
              <p class="txt">Copyright © 厦门浩邈科技有限公司</p>
            </div>
          </footer>
        </main>
      </div>

      <a-modal
        title="设置主题"
        :visible="visible"
        @cancel="visible=false"
        v-bind="$store.state.modalConfig"
        :footer="null"
        :maskClosable="true"
        width="450px"
      >
        <div style="display: flex;">
        <a-tooltip v-for="(item, index) in colorList" :key="index">
          <template slot="title">{{ item.key }}</template>
          <a-tag style="width: 28px; height: 22px" :color="item.color" @click="changeColor(item.color)">
            <a-icon type="check" v-if="item.color === themeColor"></a-icon>
          </a-tag>
        </a-tooltip>
        </div>
      </a-modal>
    </div>

    <div :class="{'data-visual': isDataVisual}" v-else>
      <router-view/>
    </div>
  </a-config-provider>
</template>

<script>
import zhCn from 'ant-design-vue/lib/locale-provider/zh_CN';
import { mapState, mapGetters } from 'vuex';
import tagViews from './tagViews';
import { updateTheme, colorList } from '@/utils/settingDrawer/settingConfig';
import { setCacheData } from '@/utils/mixins';

export default {
  name: 'App',
  mixins: [setCacheData],
  components: { tagViews },
  data () {
    return {
      visible: false,
      colorList,
      locale: zhCn,
      isNewViews: '',
      isDataVisual: false,
      menuList: [],
      userInfo: {},
      loginInfo: {},
      hasLayout: false,
      isCollapse: false,
      openKeys: [],
      rootSubmenuKeys: [],
      breadList: []
    };
  },
  watch: {
    $route (to, from) {
      this.init();
      this.getBreadcrumb();

      if (['userInfo', 'login'].some(el => el === from.name)) {
        this.setUserData();
      }
    },
    activeMenu: {
      immediate: true,
      handler (val) {
        let parentPath;
        this.permission_routes.forEach((el) => { // todo 需优化
          if (el.children && el.children.length) {
            el.children.forEach((item) => {
              if (item.path === val[0]) {
                parentPath = el.path;
              }
            });
          }
        });
        parentPath && (this.openKeys = [parentPath]);
      }
    }
  },
  computed: {
    ...mapState(['routes', 'cachedViews', 'visitedViews', 'themeColor']),
    ...mapGetters(['permission_routes']),
    activeMenu: {
      get () {
        return [this.$route.path];
      },
      set (val) {}
    },
    headLeft () {
      if (this.isCollapse === true) {
        return { width: 'calc(100% - 80px)' };
      } else {
        return { width: 'calc(100% - 250px)' };
      }
    },
    mainLeft () {
      if (this.isCollapse === true) {
        return { paddingLeft: '80px' };
      } else {
        return { paddingLeft: '250px' };
      }
    },
    siderWidth () {
      if (this.isCollapse === true) {
        return {
          flex: '0 0 80px',
          maxWidth: '80px',
          minWidth: '80px',
          width: '80px'
        };
      } else {
        return {
          flex: '0 0 250px',
          maxWidth: '250px',
          minWidth: '250px',
          width: '250px'
        };
      }
    },
    layoutContent () {
      let routeArr = [
        'advancedForm',
        'smartDoor',
        // 'keyApply',
        // 'keyList',
        // 'cardRecord',
        // 'openLog',
        'householdAuthRecordDetail',
        'smartDoorDetail',
        'keyApplyDetail',
        'importRoom',
        'userInfo',
        'memberDetail',
        'pushDetail',
        'allocCommunity',
        // 'room',
        // 'stewardKey',
        'householdKey',
        'noAuth',
        'noPage'
      ];
      const isRoute = routeArr.some(el => this.$route.name === el);
      if (isRoute) {
        return { padding: '0px', backgroundColor: 'transparent' };
      } else {
        return {};
      }
    }
  },
  created () {
    this.getBreadcrumb();
    this.init();
    this.setUserData();
  },
  methods: {
    init () {
      this.rootSubmenuKeys = this.permission_routes.map(el => el.path); // 一级菜单的 Key

      let routeArr = ['login', 'forget', 'allVis', 'communityVis', 'over', 'monitor', 'manage'];
      routeArr.some(ele => this.$route.name === ele) ? (this.hasLayout = false) : (this.hasLayout = true);
      let body = document.getElementsByTagName('body')[0];
      if (this.hasLayout === true && ['allVis', 'communityVis', 'over', 'monitor', 'manage'].some(el => el === this.$route.name)) {
        this.isDataVisual = true;
        if (['over', 'monitor', 'manage'].includes(this.$route.name)) {
          this.isNewViews = true;
          body.style.backgroundColor = '#F3F5F8';
        } else {
          this.isNewViews = false;
          body.style.backgroundColor = '#060C30';
        }
      } else {
        body.style.backgroundColor = '#F3F5F8';
        this.isDataVisual = false;
      }
    },
    /** 改变主题 */
    changeColor (color) {
      const sessionTheme = sessionStorage.getItem('sessionTheme');
      if (color && color !== sessionTheme) {
        this.$store.commit('TOGGLE_COLOR', color);
        updateTheme(color);
      }
      this.visible = false;
    },
    /* 设置用户信息 */
    setUserData () {
      if (localStorage.userInfo) {
        this.userInfo = JSON.parse(localStorage.userInfo);
      }
    },
    /** SubMenu 展开/关闭 */
    onOpenChange (openKeys) {
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys;
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    },
    /* 点击修改密码 */
    changePwd () {
      this.$router.push({
        name: 'userInfo',
        query: {param: 'changePwd'}
      });
    },
    /* 退出登录 */
    logOut () {
      this.$confirm({
        title: '提示',
        content: '确定注销并退出系统吗？',
        centered: true,
        cancelText: '取消',
        okText: '确定',
        onOk: () => {
          this.$delete({
            url: '/userLogin/logout',
            params: {}
          }).then((res) => {
            this.$message.success('退出成功！');
            this.clearData();
          });
        }
      });
    },

    /* 切换菜单折叠 */
    triggerMenu () {
      this.isCollapse = !this.isCollapse;
      this.openKeys = [];
    },
    /** 点击导航菜单 */
    handleClick (key, query) {
      if (key === '/userInfo') { // 点击用户信息或修改密码
        if (key === this.$route.path) {
          this.$router.push({ path: '/redirect' + key, query });
        } else {
          this.$router.push({ path: key, query });
        }
      } else {
        if (key === this.$route.path) { return false; }
        this.$router.push(key);
      }
    },
    /* 点击菜单项 */
    menuClick (item, index, key) {
      if (item.name === 'allVis') { // 此代码还有用
        window.open(`${location.protocol}//${location.host}/#/${item.name}`);
      } else {
        this.$router.push({
          name: item.name
        });
      }
    },
    // 创建面包屑
    getBreadcrumb () {
      const breadNumber = typeof this.$route.meta.breadNumber !== 'undefined' ? this.$route.meta.breadNumber : 0;
      let query = this.$route.query;
      let newBread;
      if (Object.keys(query).length && query.title) {
        newBread = { name: query.title, path: this.$route.fullPath };
      } else {
        newBread = { name: this.$route.meta.title, path: this.$route.fullPath };
      }
      this.breadList = JSON.parse(localStorage.getItem('breadListStorage')) || [];
      this.breadList.splice(breadNumber, this.breadList.length - breadNumber, newBread);
      localStorage.setItem('breadListStorage', JSON.stringify(this.breadList));
    }
  }
};
</script>

<style lang="scss">
@import "../style/index";

.data-visual {
  width: 100vw;
  height: 100vh;
  //background-image: url("~/static/dataVisual/images/bg.jpg");
  background-image: url("/static/dataVisual/images/bg.jpg");
  background-repeat: no-repeat;
}

.old-visual {
  width: 100vw;
  height: 100vh;
  background-repeat: no-repeat;
}

/* fade-transform */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all .25s;
}
.fade-transform-enter {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
