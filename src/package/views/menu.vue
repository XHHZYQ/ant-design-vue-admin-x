<!-- 菜单管理-->
<template>
  <div>
    <x-tabula
      ref="table"
      :dataSource="dataSource"
      rowKey="menuId"
      :searchList="searchList"
      :columns="columns"
      :tableOptList="tableOptList"
      :rowOptLen="4"
      :rowOptList="rowOptList"
      :searchParams.sync="searchParams"
      :listApi="listApi"
      :deleteParam="deleteParam"
      :rowSelection="false"
    >
      <template slot="opt_t" slot-scope="{row}">
        <a-icon :type="row.icon" />
      </template>
    </x-tabula>

    <!--添加菜单弹窗-->
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
        :detailParam="detailParam"
        :defaultCheckedKeys="defaultCheckedKeys"
        @radioChange="handleClickMenuType"
      >
      </x-addEdit>
    </a-modal>

    <!-- 选择图标弹窗 -->
    <a-modal
      title="操作"
      style="top: 20px;"
      :width="800"
      :footer="null"
      @cancel="cancel"
      :visible="visibleIcon"
    >
      <icon-selector @change="handleIconChange"/>
    </a-modal>
  </div>
</template>

<script>
import IconSelector from '@/components/package/IconSelector';

export default {
  name: 'manageMenu',
  components: {
    IconSelector
  },
  data () {
    return {
      visibleIcon: false,
      visible: false,
      modalTitle: '新增菜单',
      formKey: {
        parentId: '',
        menuType: '',
        icon: '',
        menuName: '',
        menuSort: '',
        path: '',
        perms: '',
        btnType: '',
        component: '',
        routeName: '',
        visible: '',
        status: ''
      },
      formList: [
        {
          label: '上级菜单',
          inputType: 'treeSelect',
          options: [],
          placeholder: '请输入角色名称',
          props: ['parentId', {
            rules: [
              { required: true, message: '请选择上级菜单' }
            ]
          }]
        },
        {
          label: '菜单类型',
          inputType: 'radioGroup',
          handle: this.handleClickMenuType,
          options: [
            { label: '目录', value: 'M' },
            { label: '菜单', value: 'C' },
            { label: '按钮', value: 'F' }
          ],
          placeholder: '请选择菜单类型',
          props: ['menuType', {
            rules: [
              { required: true, message: '请选择菜单类型' }
            ],
            initialValue: 'M'
          }]
        },
        {
          isShow: true,
          label: '菜单图标',
          inputType: 'input',
          options: [],
          prefix: 'user',
          click: this.handleClick,
          placeholder: '请选择菜单图标',
          props: ['icon', {
            rules: [
              { required: true, message: '请选择菜单图标' }
            ]
          }]
        },
        {
          label: '菜单名称',
          inputType: 'input',
          options: [],
          placeholder: '请输入菜单名称',
          props: ['menuName', {
            rules: [
              { required: true, message: '请输入菜单名称' }
            ]
          }]
        },
        {
          label: '显示排序',
          inputType: 'input',
          options: [],
          placeholder: '请输入排序',
          props: ['menuSort', {
            rules: [
              { required: true, message: '请输入排序' }
            ]
          }]
        },
        {
          isShow: true,
          label: '路由地址',
          inputType: 'input',
          options: [],
          placeholder: '请输入路由地址',
          props: ['path', {
            rules: [
              { required: true, message: '请输入路由地址' }
            ]
          }]
        },
        {
          isShow: true,
          label: '路由名称',
          inputType: 'input',
          options: [],
          placeholder: '请输入路由名称',
          props: ['routeName', {
            rules: [
              { required: true, message: '请输入路由名称' }
            ]
          }]
        },
        {
          isShow: true,
          label: '组件路径',
          inputType: 'input',
          options: [],
          placeholder: '请输入组件路径',
          props: ['component', {
            rules: [
              { required: true, message: '请输入组件路径' }
            ]
          }]
        },
        {
          isShow: true,
          label: '权限标识',
          inputType: 'input',
          options: [],
          placeholder: '请输入权限标识',
          props: ['perms', {
            rules: [
              { required: true, message: '请输入权限标识' }
            ]
          }]
        },
        {
          isShow: false,
          label: '按钮类型',
          inputType: 'select',
          handle: this.handleSelectBtnType,
          options: [
            { label: '路由按钮', value: 1 },
            { label: '非路由按钮', value: 0 }
          ],
          placeholder: '选择按钮类型',
          props: ['btnType', {
            rules: [
              { required: true, message: '请选择按钮类型' }
            ]
          }]
        },
        {
          isShow: true,
          label: '显示状态',
          inputType: 'radioGroup',
          options: [{ label: '显示', value: 1 }, { label: '隐藏', value: 0 }],
          placeholder: '',
          props: ['visible', {
            rules: [
              { required: true, message: '请输入权限字符' }
            ],
            initialValue: 1
          }]
        }
      ],
      defaultCheckedKeys: [],
      btnLoading: { loading: false },
      // 表单参数
      addParam: {
        url: 'menu',
        reqHandle: '', // this.reqHandle
        resHandle: this.addResHandle
      },
      editParam: {
        url: 'menu/',
        resHandle: this.addResHandle
      },
      detailParam: {
        url: '', // /room/
        resHandle: this.detailResHandle
      },
      searchList: [
        { props: ['menuName'], placeholder: '菜单名称', options: [], inputType: 'input' }
      ],
      tableOptList: [
        { text: '新增', handle: this.openModal, icon: 'plus', permi: ['system:menu:add'] }
      ],
      rowOptList: [
        { text: '新增', handle: (row) => this.openModal(row.menuId), permi: ['system:menu:add'] },
        { text: '修改', handle: (row) => this.openModal(row), permi: ['system:menu:edit'] },
        { text: '删除', handle: (row) => this.$refs.table.showDeleteConfirm(row), permi: ['system:menu:remove'] }
      ],
      columns: [
        { title: '菜单名称', dataIndex: 'menuName', align: 'left', width: '' },
        { title: '图标', dataIndex: 'icon', align: 'left', width: '', scopedSlots: {customRender: 't'} },
        { title: '权限标识', dataIndex: 'perms', align: 'left', width: '' },
        { title: '创建时间', dataIndex: 'createTime', align: 'left', width: '' },
        { title: '操作', dataIndex: 'action', align: 'left', width: '', scopedSlots: { customRender: 'action' } }
      ],
      dataSource: [],
      searchParams: {
        menuName: undefined
      },
      listApi: {
        url: 'menu/list',
        resHandle: this.listResHandle, // this.resHandle
        searchHandle: '' // searchHandle
      },
      deleteParam: {
        url: 'menu/',
        param: {},
        title: '菜单',
        key: 'menuName'
      }
    };
  },
  beforeCreate () {
    this.form = this.$form.createForm(this);
  },
  mounted () {
    this.getSelect();
  },
  methods: {
    getSelect () {
      this.$get({
        url: 'menu/treeselect'
      }).then(res => {
        this.recursionList(res.data);
        let arr = [{ key: '0', value: '0', id: '0', label: '主类目', children: res.data }];
        this.formList[0].options = arr;
      });
    },
    openModal (row) {
      this.visible = true;
      let title = '';
      if (row.menuId) {
        title = '修改菜单';
        let url = `menu/${row.menuId}`;
        this.$nextTick(() => {
          this.$refs.form.routeQuery = row.menuId;
          this.handleClickMenuType(row.menuType, row.btnType);
          this.$refs.form.getDetail(url);
        });
      } else {
        if (row.length) {
          this.$nextTick(() => {
            this.$refs.form.form.setFieldsValue({ parentId: row });
          });
        }
        title = '新增菜单';
        this.formList[2].prefix = 'user';
        this.handleClickMenuType('M');
      }
      this.modalTitle = title;
    },
    handleClick () {
      this.visibleIcon = true;
    },
    handleClickMenuType (e, btnType) {
      e = e instanceof Object ? e.target.value : e;
      this.formList.forEach((item, index) => {
        if (index === 2 || index === 5 || index === 6 || index === 7 || index === 8) {
          item.isShow = true;
        }
      });
      if (e === 'C') {
        this.formList[10].isShow = true;
        this.formList[9].isShow = false;
      } else if (e === 'F') {
        this.formList[2].isShow = false;
        this.formList[5].isShow = false;
        this.formList[6].isShow = false;
        this.formList[7].isShow = false;
        this.formList[9].isShow = true;
        this.formList[10].isShow = false;
        if (btnType !== undefined && btnType === 1) {
          this.formList[5].isShow = true;
          this.formList[6].isShow = true;
          this.formList[7].isShow = true;
        }
      } else if (e === 'M') {
        this.formList[6].isShow = false;
        this.formList[7].isShow = false;
        this.formList[8].isShow = false;
        this.formList[9].isShow = false;
        this.formList[10].isShow = true;
      }
    },
    handleIconChange (icon) {
      this.formList[2].prefix = icon;
      this.$refs.form.form.setFieldsValue({ icon });
      this.visibleIcon = false;
    },
    cancel () {
      this.visibleIcon = false;
    },
    recursionList (list) {
      list.forEach(item => {
        item.title = item.label;
        if (item.children && item.children.length) {
          this.recursionList(item.children);
        }
      });
    },
    listResHandle (res) {
      this.deleteChildren(res);
      return res;
    },
    deleteChildren (list) {
      list.forEach(item => {
        if (item.children.length) {
          this.deleteChildren(item.children);
        } else {
          delete item.children;
        }
      });
    },
    // 弹窗表单返回结果
    addResHandle (res) {
      if (res.code !== 200) {
        this.$message.error(res.msg);
      } else {
        this.$message.success(res.msg);
      }
      this.$refs.table.getTableList();
      this.visible = false;
    },
    detailResHandle (res) {
      this.formList[2].prefix = res.icon;
      for (let key in res) {
        if (key === 'status' || key === 'isFrame' || key === 'visible') {
          res[key] = Number(res[key]);
        }
      }
      return res;
    },
    searchHandle (selectData) {
      console.log('处理搜索数据: ', selectData);
      // return selectData;
    },
    handleSelectBtnType (e) {
      if (e) {
        this.formList[5].isShow = true;
        this.formList[6].isShow = true;
        this.formList[7].isShow = true;
      } else {
        this.formList[5].isShow = false;
        this.formList[6].isShow = false;
        this.formList[7].isShow = false;
      }
    }
  }
};
</script>
