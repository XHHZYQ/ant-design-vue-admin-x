<template>
  <div class="tab-views">
    <a-dropdown :visible="visible" :trigger="['contextmenu']">
      <a-tabs
        class="tags-box"
        :activeKey="activeKey"
        @change="tabsChange"
        @contextmenu.prevent="contextMenu"
        type="card"
      >
        <a-tab-pane ref="tag" v-for="pane in visitedViews" :key="pane.path">
          <template slot="tab">
            <span style="margin-right: 8px">{{ pane.title }}</span>
            <a-icon
              style="margin-right: 8px"
              v-if="activeKey === pane.path"
              @click="refreshSelectedTag(pane)"
              class="reload"
              type="reload"
              :spin="tagSpin"
            />
            <a-icon
              @click="closeSelectedTag(pane)"
              class="reload"
              type="close"
            />
          </template>
        </a-tab-pane>
      </a-tabs>

      <a-menu slot="overlay">
        <a-menu-item @click="refreshSelectedTag()" key="1">刷新当前页</a-menu-item>
        <a-menu-item @click="closeSelectedTag()" key="2">关闭当前页</a-menu-item>
        <a-menu-item @click="closeOthersTags()" key="3">关闭其他页</a-menu-item>
        <a-menu-item @click="closeAllTags()" key="4">关闭所有页</a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'tagViews',
  data () {
    return {
      visible: false,
      selectedTag: {},
      activeKey: ''
    };
  },
  computed: {
    ...mapState(['tagSpin', 'cachedViews']),
    visitedViews () {
      return this.$store.state.visitedViews;
    }
  },
  watch: {
    cachedViews (val) {
    },
    $route (to) {
      this.activeKey = this.$route.path;
      this.addTags(to);
    },
    visible (value) {
      if (value === true) {
        document.body.addEventListener('click', this.closeMenu);
      } else {
        document.body.removeEventListener('click', this.closeMenu);
      }
    }
  },
  created () {
    this.addTags();
  },
  methods: {
    contextMenu (e) {
      let target = this.visitedViews.filter(item => item.title === e.target.innerText);
      if (target && target.length) {
        this.selectedTag = target[0];
        this.visible = true;
      }
    },
    closeMenu () {
      this.visible = false;
    },
    /** 刷新页面 */
    refreshSelectedTag (pane) {
      this.visible = false;
      if (pane) {
        this.selectedTag = pane;
      }

      this.$store.commit('setTagSpin', true);
      this.$store.dispatch('delCachedView', this.selectedTag).then(() => {
        const { fullPath } = this.selectedTag;
        this.$nextTick(() => {
          this.$router.replace({ path: '/redirect' + fullPath });
        });

        setTimeout(() => {
          this.tagSpin && this.$store.commit('setTagSpin', false);
        }, 1000);
      });
    },
    /** 切换面板的回调 */
    tabsChange (key) {
      this.visitedViews.forEach((el) => {
        if (el.path === key) {
          this.$router.push({ path: el.path, query: el.query });
        }
      });
    },
    /** 添加标签 */
    addTags (to) {
      const { name } = this.$route;
      if (name) {
        let view = this.$route;
        this.$store.dispatch('addView', { view, to: to });

        this.activeKey = this.$route.path;
      }
    },
    /** 关闭选择的标签 */
    closeSelectedTag (key) {
      if (key) {
        this.selectedTag = key;
      } else {
        this.visible = false;
      }
      this.$store.dispatch('delView', this.selectedTag).then(({visitedViews}) => {
        if (!visitedViews.length) { // 关闭了所有页签
          this.$router.push('/empty');
        } else if (this.isActive(this.selectedTag)) {
          this.toLastView(visitedViews, this.selectedTag);
        }
      });
    },
    /** 跳转至倒数第一个标签页 */
    toLastView (visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0];
      if (latestView) {
        this.$router.push(latestView.fullPath);
      }
    },
    /** 关闭其他 */
    closeOthersTags () {
      this.visible = false;
      this.$store.dispatch('delOthersViews', this.selectedTag).then(() => {
        this.$router.push(this.selectedTag);
      });
    },
    /** 关闭所有标签页 */
    closeAllTags () {
      this.$store.dispatch('delAllViews').then(() => {
        this.$router.push('/empty');
      });
    },
    isActive (route) {
      return route.path === this.$route.path;
    }
  }
};
</script>

<style lang="scss">
.tab-views {
  margin-top:48px;
  background-color: #fff;
  padding: 8px 8px 0;
  .ant-tabs {
    color: rgba(0, 0, 0, 0.85);
  }
  .tags-box {
    .ant-tabs-bar {
      padding-left: 10px;
      margin-bottom: 0;
    }
  }
}
.ant-tabs-nav .ant-tabs-tab .reload {
  color: rgb(85, 85, 85);
  font-size: 12px;
  &:hover {
    color: #1890ff;
  }
}
.tags-box .ant-tabs-nav .ant-tabs-tab .anticon {
  margin-right: 0;
}
</style>
