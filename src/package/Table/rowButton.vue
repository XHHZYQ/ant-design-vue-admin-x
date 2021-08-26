<template>
  <span v-hasPermi="item.permi">
    <a-button
      @click="item.handle(row)"
      type="link"
      :disabled="item.rowOptDisHandle && item.rowOptDisHandle(row, item) || rowOptDisable(row, item)"
    >
      {{item.customRender ? (item.rowOptText ? item.rowOptText(row) : statusTxt(row)) : item.text}}
    </a-button>
    <a-divider v-if="index < (len - 1)" type="vertical"/>
  </span>
</template>

<script>
export default {
  name: 'rowButton',
  props: {
    index: {
      type: Number
    },
    len: {
      type: Number
    },
    item: {
      type: Object,
      default: () => ({})
    },
    row: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    /* 操作按钮禁用判断 */
    rowOptDisable (row, el) {
      let text = el.text;
      if (text === '删除' && (row.canDelete === 0 || row.isDelete === 0 || row.is_delete === 0)) {
        return true;
      } else if (text === '查看子类' && (row.canSeeChild === 0 || row.can_see_child === 0)) { // 处理分类
        return true;
      } else if (text === '添加子类' && (row.canAddChild === 0 || row.can_add_child === 0)) { // 处理分类
        return true;
      } else if (text === '审核' && row.status !== 0) {
        return true;
      }
    },
    /* 处理状态字符 */
    statusTxt (record) {
      let statusKey = ['verifyStatus', 'status', 'status_desc', 'status_str', 'home_show_desc'];// 顺序不能换

      let isStatus = ['advert', 'passport', 'members', 'account', 'cardRecord', 'communityApp', 'stewardApp',
        'editStewardFun', 'editCommunityFun', 'editProduct', 'govAccount', 'company'].
      some(el => el === this.$route.name);
      for (var i = 0; i < statusKey.length; i++) {
        var el = statusKey[i];
        if (record.hasOwnProperty(el)) {
         if (el === 'status' && isStatus) {
            return record[el] === 0 || record[el] === '0' ? '启用' : '禁用';
          } else {
            return record[el];
          }
        }
      }
    }
  }
};
</script>
