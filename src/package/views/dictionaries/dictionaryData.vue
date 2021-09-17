<!-- 字典数据-->
<template>
  <div>
    <x-tabula
      ref="table"
      :dataSource="dataSource"
      rowKey="dictCode"
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
    <template slot="bread">
      <a-breadcrumb style="margin-bottom: 20px;">
        当前位置:
        <a-breadcrumb-item>首页</a-breadcrumb-item>
        <a-breadcrumb-item v-for="(item, index) in breadList" :key="index">
          <a href="javascript:;" @click="handleBread(index)">{{item}}</a>
        </a-breadcrumb-item>
      </a-breadcrumb>
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
  name: 'dictionaryData',
  data () {
    return {
      modalTitle: '新增字典数据',
      visible: false,
      btnLoading: { loading: false },
      breadList: ['字典管理', '字典数据'],
      formKey: {
        dictType: '',
        dictLabel: '',
        dictValue: '',
        dictSort: '',
        status: '',
        remark: ''
      },
      formList: [
        {
          disabled: true,
          label: '字典类型',
          inputType: 'select',
          options: [],
          placeholder: '请选择字典类型',
          props: ['dictType', {
            rules: [
              { required: true, message: '请选择字典类型' }
            ]
          }]
        },
        {
          label: '数据标签',
          inputType: 'input',
          options: [],
          placeholder: '请输入数据标签',
          props: ['dictLabel', {
            rules: [
              { required: true, message: '请输入数据标签' }
            ]
          }]
        },
        {
          label: '数据键值',
          inputType: 'input',
          options: [],
          placeholder: '请输入数据键值',
          props: ['dictValue', {
            rules: [
              { required: true, message: '请输入数据键值' }
            ]
          }]
        },
        {
          label: '显示排序',
          inputType: 'input',
          options: [],
          placeholder: '请输入排序',
          props: ['dictSort', {
            rules: [
              { required: true, message: '请输入排序' }
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
        { props: ['dictType'], placeholder: '字典类型', options: [], defaultValue: '', inputType: 'select' },
        { props: ['dictLabel'], placeholder: '字典标签', options: [], inputType: 'input' },
        { props: ['status'], placeholder: '状态', options: [], inputType: 'select' }
      ],
      tableOptList: [
        { text: '新增', icon: 'plus', handle: this.openModal, permi: ['system:dict:add'] }
      ],
      rowOptList: [
        { text: '修改', handle: (row) => this.openModal(row), permi: ['system:dict:edit'] },
        { text: '删除', handle: (row) => this.$refs.table.showDeleteConfirm(row), key: 'delete', permi: ['system:dict:remove'] }
      ],
      columns: [
        { title: '字典编码', dataIndex: 'dictCode', align: 'left', width: '' },
        { title: '字典标签', dataIndex: 'dictLabel', align: 'left', width: '' },
        { title: '字典键值', dataIndex: 'dictValue', align: 'left', width: '' },
        { title: '状态', dataIndex: 'statusDesc', align: 'left', width: '' },
        { title: '备注', dataIndex: 'remark', align: 'left', width: '' },
        { title: '创建时间', dataIndex: 'createTime', align: 'left', width: '' },
        { title: '操作', dataIndex: 'action', align: 'left', width: '', scopedSlots: {customRender: 'action'} }
      ],
      dataSource: [],
      searchParams: {
        dictType: undefined,
        dictLabel: undefined,
        status: undefined,
        createDate: undefined
      },
      listApi: {
        url: '/dict/data/list',
        resHandle: '', // this.resHandle
        searchHandle: '' // searchHandle
      },
      // 表单参数
      addParam: {
        url: '/dict/data',
        reqHandle: '',
        resHandle: this.addResHandle
      },
      editParam: {
        url: '/dict/data/',
        resHandle: this.addResHandle
      },
      deleteParam: {
        url: '/dict/data/',
        param: {},
        title: '字典标签',
        key: 'dictLabel'
      }
    };
  },
  beforeCreate () {
    this.form = this.$form.createForm(this);
  },
  created () {
    this.getSelect();
  },
  methods: {
    getSelect () {
      this.$get({
        url: '/dict/type/treeselect'
      }).then(res => {
        this.searchList[0].options = res.data;
        this.searchList[0].defaultValue = this.$route.query.type;
        this.$refs.table.$children[0].form.setFieldsValue({
          dictType: this.$route.query.type
        });
        this.$refs.table.searchHandle({ dictType: this.$route.query.type });
        this.searchList[2].options = [{label: '正常', value: 1}, {label: '禁用', value: 0}];
      });
    },
    /* 打开弹窗 */
    openModal (row) {
      this.visible = true;
      let title = '';
      if (row.dictCode) {
        title = '修改字典数据';
        let url = `/dict/data/${row.dictCode}`;
        this.$nextTick(() => {
          this.$refs.form.getDetail(url);
          this.$refs.form.routeQuery = row.dictCode;
        });
      } else {
        this.$nextTick(() => {
          this.$refs.form.form.setFieldsValue({
            dictType: this.$route.query.type
          });
        });
        title = '新增字典数据';
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
    handleBread (index) {
      if (index === 0) {
        this.$router.push({path: '/dictionaries'});
      }
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
