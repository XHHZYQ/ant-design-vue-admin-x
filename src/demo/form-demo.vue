
<template>
  <!--位置管理-->
  <div>
    <x-tabula
      ref="table"
      :dataSource="dataSource"
      rowKey="positionId"
      :searchList="searchList"
      :columns="columns"
      :tableOptList="tableOptList"
      :rowOptList="rowOptList"
      :searchParams.sync="searchParams"
      :listApi="listApi"
      :rowSelection="true"
      :addHandleParam="addHandleParam"
      :deleteParam="deleteParam"
    >
      <template slot="opt_o" slot-scope="{row}">
        <a-tooltip placement="topLeft" :title="row.categoryFullName">
          <span :style="{cursor: 'pointer'}">{{row.categoryName}}</span>
        </a-tooltip>
      </template>
    </x-tabula>
  </div>
</template>

<script>
import { fetchSelect } from '@/utils/mixins';
export default {
  mixins: [fetchSelect],
  name: 'location',
  data () {
    return {
      cascadeParam: {},
      searchList: [
        { props: ['communityId'], placeholder: '小区', options: [], inputType: 'select', handle: ($event) => this.communityChange(7, $event) },
        { props: ['keywords'], placeholder: '名称', options: [], inputType: 'input' },
        { props: ['positionType'], placeholder: '分类', options: [], inputType: 'cascader' },
        { props: ['isStrictly'], placeholder: '是否受限', options: [], inputType: 'select' },
        { props: ['createDate'], placeholder: ['创建时间', '创建时间'], options: [], inputType: 'datePick' },
        { props: ['areas'], placeholder: '省市', options: [], inputType: 'cascader', changeOnSelect: true },
        { props: ['propertyId'], placeholder: '物业公司', options: [], inputType: 'select' },
        { props: ['buildingId'], placeholder: '楼栋', options: [], inputType: 'select', handle: ($event) => this.buildingChange(8, $event) },
        { props: ['unitId'], placeholder: '单元', options: [], inputType: 'select' }
      ],
      searchParams: {
        communityId: '',
        keywords: '',
        positionType: '',
        isStrictly: '',
        createDate: '',
        areas: '',
        propertyId: '',
        buildingId: '',
        unitId: ''
      },
      tableOptList: [
        { text: '新增', icon: 'plus', permi: ['community:position:add'] },
        { text: '删除', icon: 'close', disabled: true, permi: ['community:position:remove'] }
      ],
      rowOptList: [
        { text: '修改', handle: (row) => this.$refs.table.toEdit(row, ['can_delete']), permi: ['community:position:edit'] },
        { text: '删除', handle: (row) => this.$refs.table.showDeleteConfirm(row), permi: ['community:position:remove'] }
      ],
      columns: [
        { title: 'ID', dataIndex: 'positionId', align: 'left', width: '' },
        { title: '所在城市', dataIndex: 'area', align: 'left', width: '' },
        { title: '位置', dataIndex: 'address', align: 'left', width: '' },
        { title: '名称', dataIndex: 'positionName', align: 'left', width: '' },
        { title: '所属分类', dataIndex: 'categoryName', align: 'left', width: '', scopedSlots: {customRender: 'o'} },
        { title: '是否受限', dataIndex: 'statusDesc', align: 'left', width: '' },
        { title: '创建时间', dataIndex: 'createTime', align: 'left', width: '' },
        { title: '操作', dataIndex: 'action', align: 'left', width: '', scopedSlots: {customRender: 'action'} }
      ],
      dataSource: [],
      listApi: {
        url: 'community/position/list',
        resHandle: '',
        searchHandle: '' // searchHandle
      },
      addHandleParam: {
        route: 'addLocation',
        title: '修改位置'
      },
      deleteParam: {
        url: 'community/position/',
        // param: { pk_key: 'position_id', pk_val: '' },
        title: '位置',
        key: 'address'
      }
    };
  },
  mounted () {
    this.getSelect();
  },
  methods: {
    /* 获取下拉 */
    getSelect () {
      this.communitySelect(0, 'searchList', 1);
      this.regionSelect(5);
      this.propertySelect(6);
      this.dictionarySelect([{index: 2, scope: 'searchList', query: 'comu_position_type'}]);
    },
    resHandle (res) {
      return res;
    },
    searchHandle (selectData) {
      console.log('处理搜索数据: ', selectData);
      return selectData;
    }
  }
};
</script>

