
<template>
  <!--位置管理-->
  <div class="table-demo">
    <x-tabula
      ref="table"
      :dataSource="dataSource"
      rowKey="position_id"
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
import { fetchSelect } from '../utils/mixins';
let isStrictlySelect = [
  { value: '是', label: 1 },
  { value: '否', label: 0 }
];

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
        { props: ['isStrictly'], placeholder: '是否受限', options: isStrictlySelect, inputType: 'select' },
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
        { text: '删除', handle: (row) => this.$refs.table.showDeleteConfirm(row), permi: ['community:position:remove'] },
        { text: '详情', handle: (row) => {}, permi: ['community:position:detail'] }
      ],
      columns: [
        { title: 'ID', dataIndex: 'position_id', align: 'left', width: '' },
        { title: '所在城市', dataIndex: 'area', align: 'left', width: '' },
        { title: '位置', dataIndex: 'address', align: 'left', width: '' },
        { title: '名称', dataIndex: 'position_name', align: 'left', width: '' },
        { title: '所属分类', dataIndex: 'category_name', align: 'left', width: '', scopedSlots: {customRender: 'o'} },
        { title: '是否受限', dataIndex: 'status_desc', align: 'left', width: '' },
        { title: '创建时间', dataIndex: 'create_time', align: 'left', width: '' },
        { title: '操作', dataIndex: 'action', align: 'left', width: '', scopedSlots: {customRender: 'action'} }
      ],
      dataSource: [
        {
          position_id: 56,
          area: '福建省 厦门市',
          address: '测试一期小区1号楼2单元',
          position_name: '测试2层',
          category_name: '单元门',
          create_time: '2021-03-19 09:15:46',
          status_desc: '正常',
          can_delete: 0
        },
        {
          position_id: 1,
          area: '福建省 厦门市',
          address: '测试一期小区1号楼2单元',
          position_name: '测试2层',
          category_name: '单元门',
          create_time: '2021-03-19 09:15:46',
          status_desc: '正常',
          can_delete: 0
        }
      ],
      listApi: {
        url: '',
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
  created () {
    this.setPpermiList();
  },
  mounted () {
    // this.getSelect();
  },
  methods: {
    setPpermiList () {
      let arr = [
        'community:position:add',
        'community:position:remove',
        'community:position:edit',
        // 'community:position:detail'
      ];
      sessionStorage.setItem('permiList', JSON.stringify(arr))
    },
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
      return selectData;
    }
  }
};
</script>

<style lang="scss">
.table-demo {
  margin: 24px;
  padding: 24px;
  background-color: #fff;
  min-height: 280px;
  transition: all .2s;
}
</style>
