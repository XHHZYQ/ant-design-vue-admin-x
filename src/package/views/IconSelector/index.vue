<template>
  <div :class="prefixCls">
    <a-tabs v-model="currentTab" @change="handleTabChange">
      <template v-for="v in icons">
      <a-tab-pane v-if="v.key !== 'iconfont'" :tab="v.title" :key="v.key">
        <ul>
          <li v-for="(icon, key) in v.icons" :key="`${v.key}-${key}`" :class="{ 'active': selectedIcon===icon }" @click="handleSelectedIcon(icon)" >
            <a-icon :type="icon" :style="{ fontSize: '36px' }" />
          </li>
        </ul>
      </a-tab-pane>

        <a-tab-pane v-else :tab="v.title" :key="v.key">
          <ul>
            <li v-for="(icon, key) in v.icons" :key="`${v.key}-${key}`" :class="{ 'active': selectedIcon===icon }" @click="handleSelectedIcon(icon)" >
              <icon-font :type="icon" :style="{ fontSize: '36px' }" />
            </li>
          </ul>
        </a-tab-pane>
      </template>
    </a-tabs>
  </div>
</template>

<script>
import icons from './icons';
import { IconFont } from '@/utils/icon';

export default {
  name: 'IconSelect',
  components: { IconFont },
  props: {
    prefixCls: {
      type: String,
      default: 'ant-pro-icon-selector'
    },
    // eslint-disable-next-line
    value: {
      type: String
    }
  },
  data () {
    return {
      selectedIcon: this.value || '',
      currentTab: 'directional',
      icons
    };
  },
  watch: {
    value (val) {
      this.selectedIcon = val;
      this.autoSwitchTab();
    }
  },
  created () {
    if (this.value) {
      this.autoSwitchTab();
    }
  },
  methods: {
    handleSelectedIcon (icon) {
      this.selectedIcon = icon;
      this.$emit('change', icon);
    },
    handleTabChange (activeKey) {
      this.currentTab = activeKey;
    },
    autoSwitchTab () {
      icons.some(item => item.icons.some(icon => icon === this.value) && (this.currentTab = item.key));
    }
  }
};
</script>

<style lang="less" scoped>
@import "~ant-design-vue/lib/style/index";

// The prefix to use on all css classes from ant-pro.
@ant-pro-prefix             : ant-pro;
@ant-global-sider-zindex    : 106;
@ant-global-header-zindex   : 105;

ul{
    list-style: none;
    padding: 0;
    overflow-y: scroll;
    height: 250px;

    li{
      display: inline-block;
      padding: @padding-sm;
      margin: 3px 0;
      border-radius: @border-radius-base;

      &:hover, &.active{
        // box-shadow: 0px 0px 5px 2px @primary-color;
        cursor: pointer;
        color: @white;
        background-color: @primary-color;
      }
    }
  }
</style>
