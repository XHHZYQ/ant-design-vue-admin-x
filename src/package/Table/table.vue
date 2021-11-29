
<template>
  <!--table组件-->
  <div>
    <x-search
      ref="search"
      @searchHandle="searchHandle"
      @resetHandle="resetHandle"
      @btnsHandler="btnsHandler"
      :tableOptList="tableOptList"
      :searchList="searchList"
    >
    </x-search>

    <slot></slot>
    <slot name="bread"></slot>
    <a-spin :spinning="spinObj.spinning" size="large" :delay="20">
      <template slot="indicator">
        <img src="./loading.gif" :style="{width: '60px', height: '60px'}" alt="">
      </template>
      <a-table
        v-if="columns.length"
        @change="tableChange"
        :rowKey="record => record[rowKey]"
        :columns="columns"
        :dataSource="tableData"
        :pagination="paginationParam"
        :rowSelection="rowSelection ?
         { selectedRowKeys: selectedRowKeys,
          onChange: rowSelectChange,
          getCheckboxProps: checkboxProps } : null"
        :locale="localeText"
      >
        <!--默认slot-->
        <slot></slot>
        <!--默认操作-->
        <template slot="action" slot-scope="text, record, index"> <!--生成复杂数据的渲染函数，参数分别为当前行的值，当前行数据，行索引-->
          <span v-for="(item, index) of rowOptList" :key="index">
            <template v-if="index < rowOptLen">  <!--默认3，列表默认展示3个-->
              <row-button :item="item" :row="record" :len="rowOptList.length" :index="index"></row-button>
            </template>

            <template v-if="index > rowOptLen-1">
              <a-dropdown>
                <a-button type="link">更多<a-icon type="down"/></a-button>
                <a-menu slot="overlay">
                  <a-menu-item v-for="(el, i) of item" :key="i">
                     <row-button :item="el" :row="record"></row-button>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </template>
          </span>
        </template>

        <!--其他操作-->
        <div v-for="(item, index) of slots" :key="index" :slot="item" slot-scope="text, record">
          <slot :name="`opt_${item}`" :row="record"></slot>
        </div>
      </a-table>
    </a-spin>
  </div>
</template>

<script>
import rowButton from './rowButton';
import { handleHttpMethod } from '../utils/common';
import { PLAT_FORM } from '@/utils/platform';

export default {
  mixins: [],
  name: 'tabula',
  props: {
    apiOrigin: {
      type: String,
      default: () => {
        if (PLAT_FORM === 'property' || PLAT_FORM === 'government') {
          return 'PHP';
        } else {
          return 'JAVA';
        }
      }
    },
    canDelKey: {
      type: Array,
      default: () => []
    },
    rowCheckboxAble: {
      type: Function,
      default: () => false
    },
    excludeResetKey: {
      type: Array,
      default: () => []
    },
    rowOptLen: {
      type: Number,
      default: () => 3
    },
    getList: {
      type: Object
    },
    rowSelection: {
      type: Boolean,
      default: true
    },
    searchList: {
      type: Array,
      default: () => []
    },
    tableOptList: {
      type: Array,
      default: () => []
    },
    rowOptList: {
      type: Array,
      default: () => []
    },
    rowKey: { // 删除单项或多项数据的 id，也用于table循环使用的key
      type: String
    },
    columns: {
      type: Array,
      default: () => []
    },
    dataSource: {
      type: Array,
      default: () => []
    },
    searchParams: {
      type: Object,
      default: () => ({})
    },
    listApi: {
      type: Object,
      default: () => ({})
    },
    addHandleParam: {
      type: Object,
      default: () => ({})
    },
    deleteParam: { // 删除单项或多项的参数
      type: Object,
      default: () => ({})
    }
  },
  components: {
    RowButton: rowButton
  },
  data () {
    return {
      slots: [],
      localeText: {
        emptyText: ''
      },
      spinObj: { spinning: false },
      // queryParam: { page: 1, pagesize: 20 },
      selectedRows: [],
      expandedRowKeys: [],
      selectedId: [],
      selectedRowKeys: [],
      paginationParam: {
        current: 1,
        pageSize: 10,
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30', '40'],
        showTotal: total => {
          return `共 ${total} 条`;
        }
      },
      tableData: []
    };
  },
  watch: {
    getList: {
      handler: function (val) {
        val.reqList === true && this.getTableList();
      },
      deep: true
    },
    dataSource (val) {
      this.tableData = val;
    }
  },
  activated () {
    if (this.$store.state.isOptData) {
      this.getTableList();
      this.$store.commit('setOptData', false);
    }
  },
  created () {
    this.handleRowOpt();
    this.tableOptStatus();
  },
  mounted () {
    if (this.dataSource.length) {
      this.tableData = this.dataSource;
    }
    this.listApi.url && this.getTableList();
  },
  methods: {
    /** row checkbox 禁用判断 */
    checkboxProps (record) {
      return {
        props: { disabled: this.rowCheckboxAble(record) } // true or false
      };
    },
    /** 处理自定义列 slot */
    handleRowOpt () {
      let slotArr = [];
      this.columns.forEach((el) => {
        let slot = el.scopedSlots;
        if (slot && slot.customRender && slot.customRender !== 'action') { // 默认操作项 customRender 写死为action
          slotArr.push(slot.customRender);
        }
      });
      this.slots = slotArr;
    },
    /* 获取列表 */
    getTableList (pagination = {}) {
      if (!this.listApi.url) {
        return;
      }
      this.resetSelected();
      this.searchParams[this.handlePageParam('pageNum')] = pagination.current || 1;
      this.searchParams[this.handlePageParam('pageSize')] = pagination.pageSize || 10;
      if (!Object.keys(pagination).length) {
        this.paginationParam.current = this.searchParams[this.handlePageParam('pageNum')];
        this.paginationParam.pageSize = this.searchParams[this.handlePageParam('pageSize')];
      }

      this[handleHttpMethod('get', this)]({
        url: this.listApi.url,
        params: this.searchParams,
        localeText: this.localeText,
        spinObj: this.spinObj,
        config: this.listApi.timeout ? { timeout: this.listApi.timeout } : {}
      }).then(({data}) => {
        (data.list || data.data || (Array.isArray(data) && data) || data.rows || []).forEach((ele, index) => {
          ele.key = `${ele[this.rowKey]}`;
        });
        if (this.listApi.resHandle) {
          this.tableData = this.listApi.resHandle(data.list || data.rows || data);
        } else {
          this.tableData = data.list || data.rows || data.data || data;
        }
        if (data.hasOwnProperty('total')) {
          this.paginationParam.total = data.total;
        }
        if (this.getList) {
          this.getList.reqList = false;
        }
      }).catch(() => {
        this.tableData = [];
      });
    },
    /** 处理分页参数 */
    handlePageParam (param) {
      let pageType = {
        JAVA: { pageSize: 'pageSize', pageNum: 'pageNum' },
        PHP: { pageSize: 'pagesize', pageNum: 'page' }
      };
      return pageType[this.apiOrigin][param];
    },
    /* 搜索查询 */
    searchHandle (val) {
      for (let item in val) {
        if (this.searchParams.hasOwnProperty(item)) {
          this.searchParams[item] = val[item];
        }
      }

      if (this.listApi.searchHandle) {
        let resParam = this.listApi.searchHandle(val);
        Object.assign(this.searchParams, resParam || {});
      }

      for (let item in this.searchParams) {
        if (item.includes(`${this.$route.name}/`)) {
          let key = item.split('/')[1];
          key && (this.searchParams[key] = this.searchParams[item]);
        }
      }

      this.getTableList();
    },
    /* 清空查询 */
    resetHandle () {
      this.$emit('resetSearch'); // 单独处理分类面包屑 清空搜索条件
      this.resetData(this.searchParams, this.excludeResetKey);
      Object.assign(this.paginationParam, { current: 1, pageSize: 10 });
      this.getTableList();
    },
    /**
     * 分页、筛选、排序变化时触发搜索
     * @pagination 分页修改后参数
     * @filters  筛选参数
     * @sorter 排序参数
     * */
    tableChange (pagination, filters, sorter) {
      let current = pagination.current;
      let pageSize = pagination.pageSize;
      this.paginationParam.current = current;
      this.paginationParam.pageSize = pageSize;

      // this.searchParams.page = current;
      // this.searchParams.pagesize = pageSize;
      this.getTableList(pagination);
    },
    /* 翻页后重置 */
    resetSelected () {
      this.selectedRowKeys = [];
      this.selectedId = [];
      this.selectedRows = [];

      this.tableOptStatus();
    },
    /** 多选行
     * @param selectedRowKeys 选中的key
     * @param selectedRows 选中的整行
     * */
    rowSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectedId = selectedRowKeys;
      this.selectedRows = selectedRows;

      this.tableOptStatus();
      this.$emit('handleSelectChange', selectedRows);
    },
    /** 判断 tableOpt 按钮状态 */
    tableOptStatus () {
      this.tableOptList.forEach((item) => {
        if (item.hasOwnProperty('disabled')) { // 判断 删除 按钮禁用状态
          this.selectedRows.length ? item.disabled = false : item.disabled = true;
        }
      })
    },
    /* 按钮组 */
    btnsHandler (item) {
      if (item.handle) {
        item.handle(this.selectedId, this.selectedRows);
      } else if (item.text === '新增') {
        let route = this.getRoute();
        this.$router.push({
          name: route,
          query: {
            title: this.addHandleParam.addTitle ? this.addHandleParam.addTitle : undefined,
            ...this.breadParam(this)
          }
        });
      } else if (item.text.includes('删除') || item.key === 'delete') {
        this.showDeleteConfirm(this.selectedRows, 'isBatch');
      }
    },
    getRoute () {
      if (this.addHandleParam.route && typeof this.addHandleParam.route === 'function') {
        return this.addHandleParam.route();
      } else {
        return this.addHandleParam.route;
      }
    },
    /**
     *  验证单选或多选是否能删除
     *  */
    showDeleteConfirm (row, isBatch, verify) {
      let deleteParam = this.deleteParam;
      let id = this.rowKey;
      let isDelete; // 是否可以删除
      let selectedId = []; // 提交删除的id数组
      if (isBatch) {
        row.forEach((el) => {
          let delKey = ['canDelete' , 'can_delete', 'isDelete', 'is_delete'];
          if (this.canDelKey && this.canDelKey.length) {
            delKey = [...delKey, ...this.canDelKey];
          }
          // 1.没删除字段：可以；2.有删除字段，为0：不可以；3.有删除字段，为1：可以
          const canDel = delKey.every(item => !el.hasOwnProperty(item)) ||
            (delKey.some(item => el.hasOwnProperty(item)) && delKey.some(item => el[item] === 1));
          if (canDel) { // isDelete 为接口字段判断能否删除
            selectedId.push(el[id]);
          }
        });

        selectedId.length ? isDelete = true : isDelete = false;
      } else { // 点击 row 按钮 已在按钮状态上判断
        isDelete = true;
        selectedId = [row[id]];
        var name = row[deleteParam.key];
      }

      let msg;
      if (isDelete) {
        if (isBatch) { // 点击批量删除
          if (selectedId.length === row.length) {
            msg = `确定要删除 ${selectedId.length}条 ${deleteParam.title}数据？`;
          } else {
            msg = `确定要删除 ${selectedId.length}条 ${deleteParam.title}数据？其中 ${row.length - selectedId.length}条 不可删除`;
          }
        } else { // 点击单条删除
          msg = `确定要删除${deleteParam.title}：${name}？`;
        }
      } else {
        msg = `没有可删除的数据？`;
      }

      this.deleteConfirm(isDelete, selectedId, msg);
    },
    /* 打开删除对话框 */
    deleteConfirm (canDelete, deleteIds, deleteMsg) {
      this[canDelete ? '$confirm' : '$error']({
        title: deleteMsg,
        okType: 'danger',
        centered: true,
        width: 440,
        onOk: () => {
          canDelete && this.deleteSelected(deleteIds);
        }
      });
    },
    /* 删除所有选中 */
    deleteSelected (selectedId) {
      if (Array.isArray(selectedId)) {
        selectedId = selectedId.join(',');
      }
      let paramObj;
      if (this.apiOrigin === 'JAVA') {
        paramObj = { url: this.deleteParam.url + selectedId, params: {} };
      } else {
        this.deleteParam.param.pk_val = selectedId;
        this.deleteParam.param.tag_val = selectedId;
        paramObj = { url: this.deleteParam.url, params: this.deleteParam.param };
      }

      this[handleHttpMethod('delete', this)](paramObj).then((res) => {
        this.$message.success(`删除成功！`);
        this.getTableList();
        this.tableOptList.forEach((ele) => {
          if (ele.hasOwnProperty('disabled')) {
            ele.disabled = true;
          }
        });
        this.deleteParam.resHandle && this.deleteParam.resHandle(res); // 删除完成回调
      });
    },
    /* 进入修改页面 */
    toEdit (row, keyArr) {
      let paramObj = {};
      keyArr && keyArr.forEach((el) => {
        if (typeof row[el] === 'number') {
          paramObj[el] = `${row[el]}`;
        } else {
          paramObj[el] = row[el];
        }
      });
      let route = this.getRoute();
      this.$router.push({
        name: route,
        query: {
         id: row[this.rowKey],
         title: this.addHandleParam.editTitle ? this.addHandleParam.editTitle : undefined,
          ...paramObj,
          ...this.breadParam(this)
        }
      });
    }
  }
};
</script>

<style lang="scss">
/*S- 表格*/
.ant-table {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 16px 10px;
  }
  .anticon {
    margin-right: 5px;
  }
  .ant-table-row {
    .ant-btn-link {
      padding: 0;
      height: 19px;
    }
  }
}
/*E- 表格*/
</style>
