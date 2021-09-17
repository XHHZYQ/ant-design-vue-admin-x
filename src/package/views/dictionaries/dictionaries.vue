<!-- 字典管理-->
<template>
  <div>
    <x-tabula
      ref="table"
      :dataSource="dataSource"
      rowKey="dictId"
      :searchList="searchList"
      :columns="columns"
      :tableOptList="tableOptList"
      :rowOptLen="4"
      :rowOptList="rowOptList"
      :searchParams.sync="searchParams"
      :deleteParam="deleteParam"
      :listApi="listApi"
      :rowSelection="false"
    >
      <template slot="opt_t" slot-scope="{row}">
        <span style="color: #1890ff;cursor: pointer;" @click="goToDictData(row.dictType)">{{row.dictType}}</span>
      </template>
    </x-tabula>

    <!--添加字典的弹窗-->
    <a-modal
      width="700px"
      :title="modalTitle"
      :visible="visible"
      :footer="null"
      @ok="isSubmit = true"
      @cancel="visible=false"
      :confirmLoading="btnLoading.loading"
      v-bind="this.$store.state.modalConfig"
    >
    <x-addEdit
      ref="form"
      :formList="formList"
      :formKey="formKey"
      :addParam="addParam"
      :editParam="editParam"
    >
    </x-addEdit>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'dictionaries',
  data () {
    return {
      modalTitle: '新增字典类型',
      visible: false,
      btnLoading: { loading: false },
      formKey: {
        dictName: '',
        dictType: '',
        status: '',
        remark: ''
      },
      formList: [
        {
          label: '字典名称',
          inputType: 'input',
          options: [],
          placeholder: '请输入字典名称',
          props: ['dictName', {
            rules: [
              { required: true, message: '请输入字典名称' }
            ]
          }]
        },
        {
          label: '字典类型',
          inputType: 'input',
          options: [],
          placeholder: '请输入字典类型',
          props: ['dictType', {
            rules: [
              { required: true, message: '请输入字典类型' }
            ]
          }]
        },
        {
          label: '状态',
          inputType: 'radioGroup',
          options: [{label: '正常', value: 1}, {label: '禁用', value: 0}],
          placeholder: '请输入权限字符',
          props: ['status', {
            rules: [
              { required: true, message: '请输入权限字符' }
            ],
            initialValue: 0
          }]
        },
        {
          label: '备注',
          inputType: 'textarea',
          options: [],
          placeholder: '请输入备注',
          props: ['remark', {
            rules: [
              { required: true, message: '请输入备注内容' }
            ]
          }]
        }
      ],
      searchList: [
        { props: ['dictName'], placeholder: '字典名称', options: [], inputType: 'input' },
        { props: ['dictType'], placeholder: '字典类型', options: [], inputType: 'input' },
        { props: ['status'], placeholder: '状态', options: [], inputType: 'select' },
        { props: ['createDate'], placeholder: ['开始日期', '结束日期'], inputType: 'datePick' }
      ],
      tableOptList: [
        { text: '新增', icon: 'plus', handle: this.openModal, permi: ['system:dict:add'] }
      ],
      rowOptList: [
        { text: '修改', handle: (row) => this.openModal(row), permi: ['system:dict:edit'] },
        { text: '删除', handle: (row) => this.$refs.table.showDeleteConfirm(row), key: 'delete', permi: ['system:dict:remove'] }
      ],
      columns: [
        { title: '字典名称', dataIndex: 'dictName', align: 'left', width: '' },
        { title: '字典类型', dataIndex: 'dictType', align: 'left', width: '', scopedSlots: {customRender: 't'} },
        { title: '状态', dataIndex: 'statusDesc', align: 'left', width: '' },
        { title: '备注', dataIndex: 'remark', align: 'left', width: '' },
        { title: '创建时间', dataIndex: 'createTime', align: 'left', width: '' },
        { title: '操作', dataIndex: 'action', align: 'left', width: '', scopedSlots: {customRender: 'action'} }
      ],
      dataSource: [],
      searchParams: {
        dictName: undefined,
        dictType: undefined,
        status: undefined,
        createDate: undefined
      },
      listApi: {
        url: '/dict/type/list',
        resHandle: '', // this.resHandle
        searchHandle: '' // searchHandle
      },
      // 表单参数
      addParam: {
        url: '/dict/type',
        reqHandle: '',
        resHandle: this.addResHandle
      },
      editParam: {
        url: '/dict/type/',
        resHandle: this.addResHandle
      },
      deleteParam: {
        url: '/dict/type/',
        param: {},
        title: '字典名称',
        key: 'dictName'
      }
    };
  },
  mounted () {
    // this.getSelect();
    this.searchList[2].options = [{label: '正常', value: 1}, {label: '禁用', value: 0}];
  },
  methods: {
    getSelect () {
      this.$get({
        url: 'market/msgTemplete/temp/list'
      }).then(res => {
        this.searchList[1].options = res.data;
      });
    },
    /* 打开弹窗 */
    openModal (row) {
      this.visible = true;
      let title = '';
      if (row.dictId) {
        title = '修改字典类型';
        let url = `/dict/type/${row.dictId}`;
        this.$nextTick(() => {
          this.$refs.form.getDetail(url);
          this.$refs.form.routeQuery = row.dictId;
        });
      } else {
        title = '新增字典类型';
      }
      this.modalTitle = title;
    },
    addResHandle (res) {
      if (res.code !== 200) {
        this.$message.error(res.msg);
      } else {
        this.$message.success(res.msg);
        this.$refs.table.getTableList();
        this.visible = false;
      }
    },
    goToDictData (type) {
      this.$router.push({path: '/dictionaryData', query: { type }});
    },
    resHandle (res) {
      return res.records;
    },
    searchHandle (selectData) {
      // return selectData;
    }
  }
};
</script>
