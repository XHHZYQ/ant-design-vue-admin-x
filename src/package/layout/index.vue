<template>
  <a-config-provider :locale="locale">
    <div id="app" v-if="hasLayout">
      <div id="components-layout">
        <aside class="layout-aside" :style="{backgroundColor: platFormDiffer[platform].asideColor, ...siderWidth}">
          <div class="logo" :class="{center: isCollapse}">
            <img v-if="!isCollapse" :src="platFormDiffer[platform].menuLogo" alt="">
            <img v-else src="../images/logo.png" alt="">
          </div>
          <a-menu
            :theme="platFormDiffer[platform].menuTheme"
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
                  <span>{{userInfo.userName}}</span>
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
              <img v-if="visitedViews.length" class="logo" src="../images/icon_haomiao.png" alt="">
              <img v-else class="logo" src="../images/icon_haomiao1.png" alt="">
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

    <div :class="[{'data-visual': isDataVisual && isNewViews}, {'old-visual': isDataVisual && !isNewViews}]" v-else>
      <views-head v-if="isNewViews"></views-head>
      <router-view/>
    </div>
  </a-config-provider>
</template>

<script>
import zhCn from 'ant-design-vue/lib/locale-provider/zh_CN';
import { mapState, mapGetters } from 'vuex';
import tagViews from './tagViews';
import { updateTheme, colorList } from '../utils/settingDrawer/settingConfig';
import { setCacheData } from '@/utils/mixins';
import { PLAT_FORM } from '@/utils/platform';
import { communityLogo, propertyLogo, govLogo } from '../images';
import { handleHttpMethod } from '../utils/common'
import viewsHead from '@/components/dataviews/viewsHead';

export default {
  name: 'App',
  mixins: [setCacheData],
  components: { tagViews, ViewsHead: viewsHead },
  data () {
    return {
      apiOrigin: 'JAVA',
      platform: PLAT_FORM,
      visible: false,
      colorList,
      locale: zhCn,
      isNewViews: false,
      isDataVisual: false,
      userInfo: {},
      hasLayout: false,
      isCollapse: false,
      openKeys: [],
      rootSubmenuKeys: [],
      breadList: [],
      platFormDiffer: {
        community: {
          menuLogo: communityLogo,
          menuTheme: 'dark',
          asideColor: '#001529',
          backgroundLogo: undefined
        },
        property: {
          menuLogo: propertyLogo,
          menuTheme: 'light',
          asideColor: '#fff',
          backgroundLogo: undefined
        },
        government: {
          menuLogo: govLogo,
          menuTheme: 'dark',
          asideColor: '#001529',
          backgroundLogo: undefined
        },
      }
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

      let routeArr = ['login', 'forget'];
      let subPage = ['over', 'monitor', 'manage'];
      let viewPage = ['allVis', 'communityVis', ...subPage];
      [...routeArr, ...viewPage, subPage].some(ele => this.$route.name === ele) ? this.hasLayout = false : this.hasLayout = true;
      let body = document.getElementsByTagName('body')[0];
      if (this.hasLayout === false && viewPage.some(el => el === this.$route.name)) {
        this.isDataVisual = true;
        if (subPage.includes(this.$route.name)) {
          this.isNewViews = true;
          body.style.backgroundColor = '#060C30';
        } else {
          this.isNewViews = false;
          body.style.backgroundColor = '#F3F5F8';
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
          this[handleHttpMethod('delete', this)]({
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
      if (breadNumber > 0 && query.parentTitle) {
        this.breadList = [{ name: query.parentTitle, path: query.parentPath }, newBread];
      }
      localStorage.setItem('breadListStorage', JSON.stringify(this.breadList));
    }
  }
};
</script>

<style lang="scss">
@import "~/src/style/index"; // todo

.data-visual {
  width: 100vw;
  height: 100vh;
  background-image: url("../images/bg.png");
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

/*S- app 布局*/
#components-layout {
  display: flex;
  transition: all 0.2s;
  .layout-aside {
    overflow: auto;
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    height: 100vh;
    box-shadow: 2px 0 6px rgba(0,21,41,.35);
    transition: all .2s;
    .logo {
      padding: 16px 0 16px 15px;
      cursor: pointer;
    }
    .center {
      text-align: center;
      padding: 16px 0;
    }
    .ant-menu {
      padding: 16px 0;
      width: 100%;
    }
  }

  .layout-main {
    padding-left: 250px;
    width: 100vw;
    transition: all 0.2s;
    .layout-nav {
      position: fixed;
      z-index: 5;
      top: 0;
      left: 0;
      width: 100vw;
    }
    header {
      position: fixed;
      z-index: 5;
      top: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      height: 48px;
      background-color: #fff;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
      //background: linear-gradient(120deg, #00e4d0, #5983e8);
      .trigger {
        font-size: 20px;
        line-height: 48px;
        padding: 0 24px;
        cursor: pointer;
        transition: color .3s;
      }
      .trigger:hover {
        background-color: $black_4;
        color: #1890ff;
      }
      .rt {
        padding-right: 20px;
        display: flex;
        >span {
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 12px;
          cursor: pointer;
          transition: all .3s;
          .anticon {
            font-size: 16px;
          }
          .avatar {
            margin-right: 5px;
            width: 24px;
            height: 24px;
            border-radius: 24px;
            overflow: hidden;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
        >span:hover {
          background-color: $black_4;
        }
      }
    }
    .page-header {
      display: flex;
      padding: 16px 24px;
      background-color: #fff;
      transition: all 0.2s;
      .headering {
        margin-top: 12px;
        color: $black_2;
        font-weight: 700;
        font-size: 16px;
        line-height: 1.4;
      }
    }
    .layout-content {
      margin: 170px 18px 18px;
      padding: 16px;
      background-color: #fff;
      min-height: 280px;
      transition: all 0.2s;
    }
    .blank {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      .logo {
        width: 300px;
      }
      .txt {
        text-align: center;
        font-size: 13px;
        color: #9FADB8;
      }
    }
    .foot {
      height: auto;
      display: block;
      margin: 24px 0 66px;
      padding: 0 16px;
      text-align: center;
      .logo {
        margin-bottom: 10px;
        width: 90px;
      }
      .txt {
        font-size: 12px;
        color: $gray_3;
      }
    }
  }
}
.ant-layout {
  background-color: transparent;
}
/*E- app 布局*/
</style>
