
<template>
  <!--用户管理-->
  <div class="account-wrap">
    <x-tabula
        ref="table"
        :apiOrigin="apiOrigin"
        :dataSource="dataSource"
        rowKey="userId"
        :searchList="searchList"
        :columns="columns"
        :tableOptList="tableOptList"
        :rowOptLen="3"
        :rowOptList="rowOptList"
        :searchParams.sync="searchParams"
        :deleteParam="deleteParam"
        :listApi="listApi"
      >
      <template slot="opt_t" slot-scope="{row}">
        <a-switch @change="onChange($event, row.userName,row.userId)" :checked="Number(row.status) ? true : false"/>
      </template>
    </x-tabula>

    <!--添加用户的弹窗-->
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
      :apiOrigin="apiOrigin"
      :formList="formList"
      :formKey="formKey"
      :addParam="addParam"
      :editParam="editParam"
      :detailParam="detailParam"
    >
    </x-addEdit>
    </a-modal>
  </div>
</template>

<script>
import { empty } from 'ant-design-vue-admin-x';
import { handleHttpMethod } from '../../utils/common';
import { searchMobileOrAccount } from '../../utils/mixins';
export default {
  name: 'account',
  mixins: [searchMobileOrAccount],
  props: {
    apiOrigin: { default: () => 'JAVA' },
    listsApi: { default: () => '/user/list' },
    deleteApi: { default: () => '/user/' },
    addApi: { default: () => '/user' },
    editApi: { default: () => '/user/' },
    detailApi: { default: () => '/user/' },
    roleSelectApi: { default: () => '/role/optionselect' },
    changeStatusApi: { default: () => '/user/changeStatus/' },
    resetPwdApi: { default: () => '/user/resetPassword' },
    getByPhoneApi: { default: () => '/user/getByPhone' },
    getByUserNameApi: { default: () => '/user/getByUserName' }
  },
  data () {
    return {
      modalTitle: '增加账号',
      roomDetail: '',
      communityId: '',
      selectedKeys: [],
      expandedKeys: ['all'], // 展开指定的节点
      autoExpandParent: true, // 是否自动展开父节点
      treeData: [],
      constantTreeList: [],
      communityList: [],
      visible: false,
      isSubmit: false,
      btnLoading: { loading: false },
      modalQuery: '',

      // 表单参数
      addParam: {
        url: this.addApi,
        reqHandle: '', // this.addReqHandle
        resHandle: this.addResHandle
      },
      editParam: {
        url: this.editApi,
        resHandle: this.editResHandle
      },
      detailParam: {
        url: this.detailApi,
        resHandle: this.detailResHandle
      },
      formKey: {
        trueName: undefined,
        mobile: undefined,
        email: undefined,
        userName: undefined,
        status: undefined,
        sex: undefined,
        remarks: undefined,
        roleIds: undefined
      },
      formList: [
        {
          label: '手机号码',
          inputType: 'input',
          options: [],
          placeholder: '请输入手机号码',
          blur: e => this.searchMobileOrAccount(e, 'mobile'),
          props: ['mobile', {
            rules: [
              { required: true, message: '请输入手机号码' },
              { pattern: this.REG.mobile, message: this.MESSAGE.mobile }
            ]
          }]
        },
        {
          label: '账号名',
          inputType: 'input',
          options: [],
          placeholder: '请输入账号名',
          blur: e => this.searchMobileOrAccount(e, 'userName'),
          props: ['userName', {
            rules: [
              { required: true, message: '请输入账号名' }
            ]
          }]
        },
        {
          label: '邮箱',
          inputType: 'input',
          options: [],
          placeholder: '请输入邮箱',
          props: ['email', {
            rules: [
              { required: true, message: '请输入邮箱' },
              { pattern: this.REG.email, message: this.MESSAGE.email }
            ]
          }]
        },
        {
          label: '真实姓名',
          inputType: 'input',
          options: [],
          placeholder: '请输入真实姓名',
          props: ['trueName', {
            rules: [
              { required: true, message: '请输入真实姓名' }
            ]
          }]
        },
        {
          label: '用户性别',
          inputType: 'select',
          options: this.$store.state.sexList,
          placeholder: '请输入',
          props: ['sex', {
            rules: [{ required: true, message: '请输入选择性别' }]
          }]
        },
        {
          label: '状态',
          inputType: 'radioGroup',
          options: [{label: '正常', value: 1}, {label: '停用', value: 0}],
          placeholder: '请输入',
          props: ['status', {
            rules: [
              { required: true, message: '请输入权限字符' }
            ],
            initialValue: 1
          }]
        },
        {
          label: '角色',
          inputType: 'select',
          options: [],
          placeholder: '请选择',
          mode: 'multiple',
          props: ['roleIds', {
            rules: [
              { required: true, message: '请选择角色' }
            ]
          }]
        },
        {
          label: '描述',
          inputType: 'textarea',
          options: [],
          placeholder: '请输入内容',
          props: ['remarks', {
            rules: []
          }]
        }
      ],

      // 列表参数
      searchList: [
        { props: ['userName'], placeholder: '账号名', options: [], inputType: 'input' },
        { props: ['mobile'], placeholder: '手机号码', options: [], inputType: 'input' },
        { props: ['status'], placeholder: '用户状态', options: [{label: '正常', value: 1}, {label: '停用', value: 0}], inputType: 'select' }
        // { props: ['create_date'], placeholder: ['创建时间', '创建时间'], inputType: 'datePick' },
      ],
      searchParams: {
        userName: undefined,
        mobile: undefined,
        status: undefined
      },
      tableOptList: [
        { text: '新增', icon: 'plus', handle: this.openModal, key: 'addbtn', permi: ['system:user:add', 'property:user:add'] },
        { text: '删除', icon: 'close', disabled: true, key: 'batchDel', permi: ['system:user:remove', 'property:user:delete'] }
      ],
      rowOptList: [
        // {text: '重置密码', handle: (row) => this.confirmReset(row), permi: ['system:user:resetPwd']},
        {text: '修改', handle: (row) => this.openModal(row), permi: ['system:user:edit', 'property:user:edit']},
        {text: '删除', handle: (row) => this.$refs.table.showDeleteConfirm(row), permi: ['system:user:remove', 'property:user:delete']}
      ],
      columns: [
        { title: '账号名', dataIndex: 'userName', align: 'left', width: '' },
        { title: '手机', dataIndex: 'mobile', align: 'left', width: '' },
        { title: '角色', dataIndex: 'roleName', align: 'left', width: '' },
        { title: '真实姓名', dataIndex: 'trueName', align: 'left', width: '' },
        { title: '创建人', dataIndex: 'createBy', align: 'left', width: '' },
        { title: '创建时间', dataIndex: 'createTime', align: 'left', width: '' },
        { title: '状态', dataIndex: 'statusDesc', align: 'left', width: '', scopedSlots: {customRender: 't'} },
        { title: '操作', dataIndex: 'action', align: 'left', width: '', scopedSlots: {customRender: 'action'} }
      ],
      dataSource: [],
      listApi: {
        url: this.listsApi,
        resHandle: '', // this.listResHandle
        searchHandle: '' // searchHandle
      },
      addHandleParam: {
        route: 'addRoom',
        title: '修改房间'
      },
      deleteParam: {
        url: this.deleteApi,
        param: {},
        title: '账号',
        key: 'userName',
        resHandle: this.deleteHandle
      }
    };
  },
  created () {
    if (this['PLAT_FORM'] === 'property') {
      this.rowOptList.push({
        text: '分管小区', handle: (row) => this.toAllocCommunity(row), permi: ['property:user:alloc']
      });
    } else {
      this.rowOptList.splice(2, 1);
    }
    this.getRoleList();
  },
  methods: {
    /** 获取角色下拉 */
    getRoleList () {
      this[handleHttpMethod('get', this)]({
        url: this.roleSelectApi
      }).then(res => {
        let arr = [];
        res.data.forEach(item => {
          let obj = {};
          obj.label = item.roleName;
          obj.value = item.roleId;
          arr.push(obj);
        });
        this.formList[6].options = arr;
      });
    },
    /** 进入分管小区 */
    toAllocCommunity (row) {
      this.$router.push({
        name: 'allocCommunity',
        query: { // todo
          id: row.id,
          true_name: row.true_name,
          role_name: row.role_name,
          mobile: row.mobile
        }
      });
    },
    confirmReset (row) {
      this.$confirm({
        title: '确定重置密码？',
        centered: true,
        onOk: (close) => {
          this.resetPwd(row);
          close();
        }
      });
    },
    /* 重置密码 */
    resetPwd (row) {
      this[handleHttpMethod('put', this)]({
        url: this.resetPwdApi,
        params: {
          userId: row.userId
        }
      }).then((res) => {
        this.$message.success('密码重置成功！');
      });
    },
    /* 切换状态 */
    onChange (checked, name, id) {
      let title = `确认要${checked ? '启用' : '停用'}"${name}"账号吗?`;
      this['$confirm']({
        title,
        okType: 'danger',
        cancelText: '取消',
        okText: '确定',
        centered: true,
        onOk: () => {
          this[handleHttpMethod('put', this)]({
            url: `${this.changeStatusApi}${id}`,
            params: {
              status: checked ? 1 : 0
            }
          }).then(res => {
            this.$message.success(res.msg);
            this.$refs.table.getTableList();
          });
        }
      });
    },
    /* 编辑角色 */
    editForm (id) {
      this.modalTitle = '修改角色';
      this.visible = true;
    },
    addReqHandle (res) {
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
    editResHandle (res) {
      this.visible = false;
      if (res.data.flag) {
        this['$info']({
          title: '权限已变更,将自动刷新页面！',
          okType: 'primary',
          okText: '确定',
          centered: true,
          onOk: () => {
            setTimeout(() => {
              location.reload();
            }, 1000);
          }
        });
      } else {
        this.$message.success(res.msg);
        this.$refs.table.getTableList();
      }
    },
    /** 处理删除当前登录账号 */
    deleteHandle ({ data }) {
      if (data.flag === true) {
        this['$confirm']({
          title: '当前账号已被删除,请联系管理员！',
          okType: 'danger',
          centered: true,
          onOk: () => {
            empty.$emit('setCacheData');
          }
        });
      }
    },
    /* 重置角色选择 */
    resetSearch () {
      this.communityId = '';
      this.selectedKeys = [];
      this.treeData = [];
    },
    SearchChange (e) {
      let value = e.target.value;
      let tempList = [];
      let treeList = JSON.parse(JSON.stringify(this.constantTreeList));

      // 遍历第二级对象添加到数组中
      treeList.forEach(item => {
        item.children.forEach(item1 => {
          tempList.push(item1);
        });
      });

      // 遍历第三级对象并判断其title是否包含value值 有则添加到新数组中
      tempList.forEach((item, index) => {
        let temp = [];
        item.children.forEach(item1 => {
          if (item1.title.indexOf(value) > -1) {
            temp.push(item1);
          }
        });
        tempList[index].children = temp;
        // 如果第三级对象title不包含value值并且第二级对象也不包含value值 则删除该第二级对象
        if (!tempList[index].children.length && tempList[index].title.indexOf(value) < 0) {
          tempList.splice(index, 1);
        }
      });

      this.treeData = tempList;
      this.treeData = [
        {
          key: 'all',
          title: '浩邈营销平台',
          scopedSlots: {
            title: 'title'
          },
          children: tempList
        }
      ];

      // 搜索时展开所有层级节点
      this.expandedKeys = ['all'];
      this.treeData.forEach(item => {
        item.children.forEach(item1 => {
          this.expandedKeys.push(item1.key);
        });
      });
      if (!e.target.value) {
        this.treeData = JSON.parse(JSON.stringify(this.constantTreeList));
        this.expandedKeys = ['all'];
      }
    },
    /* 新增或编辑用户 */
    openModal (row) {
      this.formList[0].extra = undefined;
      this.formList[1].extra = undefined;
      this.visible = true;
      if (row.userId) {
        this.editUser(row.userId);
      } else {
        this.addUser();
      }
    },
    /** 新增用户 */
    addUser () {
      this.modalTitle = '新增账号';
      this.formList.forEach(item => {
        if (item.props[0] === 'userName' || item.props[0] === 'mobile') {
          item.disabled = false;
        }
      });
      this.formList[4].isShow = true;
    },
    /** 编辑用户 */
    editUser (userId) {
      this.modalTitle = '修改账号';
      this.formList.forEach(item => {
        if (item.props[0] === 'userName' || item.props[0] === 'mobile') {
          item.disabled = true;
        }
      });
      this.$nextTick(() => {
        this.$refs.form.routeQuery = userId;
        this.$refs.form.getDetail();
      });
    },
    detailResHandle (res) {
      res.user.status = Number(res.user.status);
      res.user.sex = Number(res.user.sex);
      if (res.roleIds.length) {
        res.roleIds.forEach(item => {
          item = Number(item);
        });
      }
      res.user.roleIds = res.roleIds;
      return res.user;
    },
    listResHandle (res) {
      return res.rows;
    },
    searchHandle (selectData) {
      return selectData;
    },
    /**
     * 展开指定的树节点
     * @param expandedKeys 选择的节点，下一步展开
     */
    onExpand (expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false; // 关闭自动展开父节点
    }
  }
};
</script>
