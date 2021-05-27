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
      if (text === '删除' && row.isDelete === 0) {
        return true;
      } else if (text === '升级' && row.isUpgrade === 0) {
        return true;
      } else if (text === '修改' && row.verify_status === 2) { // 单独处理：物业公司修改按钮
        return true;
      } else if (text === '回复' && row.status_str === '已回复') { // 单独处理：反馈回复按钮
        return true;
      } else if (text === '撤回' && row.status !== 0) { // 单独处理：推送撤回按钮
        return true;
      } if (text === '查看子类' && row.can_see_child === 0) { // 处理分类
        return true;
      } else if (text === '添加子类' && row.can_add_child === 0) { // 处理分类
        return true;
      }
    },
    /* 处理状态字符 */
    statusTxt (record) {
      let statusKey = ['verifyStatus', 'status', 'status_desc', 'status_str', 'home_show_desc'];// 顺序不能换

      let isStatus = ['advert', 'passport', 'members', 'account', 'accountV', 'cardRecord', 'communityApp',
        'stewardApp', 'editStewardFun', 'editCommunityFun', 'editProduct', 'govAccount', 'company'].some(el => el === this.$route.name);
      for (var i = 0; i < statusKey.length; i++) {
        var el = statusKey[i];
        if (record.hasOwnProperty(el)) {
          if (el === 'verifyStatus') { // 单独处理：物业公司状态
            return record[el] !== 0 ? '查看' : '审核';
          } else if (el === 'status' && isStatus) {
            return record[el] === 0 ? '启用' : '禁用';
          } else {
            return record[el];
          }
        }
      }
    }
  }
};
</script>
