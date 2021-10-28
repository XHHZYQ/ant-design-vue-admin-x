<!-- 角色管理-->
<template>
  <div>
    <x-tabula
      ref="table"
      :apiOrigin="apiOrigin"
      :dataSource="dataSource"
      rowKey="roleId"
      :searchList="searchList"
      :columns="columns"
      :tableOptList="tableOptList"
      :rowOptLen="4"
      :rowOptList="rowOptList"
      :searchParams.sync="searchParams"
      :deleteParam="deleteParam"
      :listApi="listApi"
    >
      <template slot="opt_t" slot-scope="{row}">
        <a-switch @change="onChange($event, row.roleName,row.roleId)" :checked="Number(row.status) ? true : false"/>
      </template>
    </x-tabula>

    <!--添加角色的弹窗-->
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
      :defaultCheckedKeys="defaultCheckedKeys"
    >
    </x-addEdit>
    </a-modal>
  </div>
</template>

<script>
import { handleHttpMethod } from '../../utils/common';
export default {
  name: 'role',
  props: {
    apiOrigin: { default: () => 'JAVA' },
    listsApi: { default: () => '/role/list' },
    deleteApi: { default: () => '/role/'  },
    addApi: { default: () => '/role' },
    editApi: { default: () => '/role/'  },
    detailApi: { default: () => '/role/'  },
    changeStatusApi: { default: () => '/role/changeStatus/' },
    authMenuApi: { default: () => '/menu/treeselect' },
    authMenuByRoleApi: { default: () => '/menu/roleMenuTreeselect/' },
  },
  data () {
    return {
      modalTitle: '添加角色',
      visible: false,
      defaultCheckedKeys: [],
      btnLoading: { loading: false },
      // 表单参数
      addParam: {
        url: this.addApi,
        reqHandle: this.reqHandle,
        resHandle: this.addResHandle
      },
      editParam: {
        url: this.editApi,
        resHandle: this.addResHandle
      },
      detailParam: {
        url: undefined,
        resHandle: this.detailResHandle
      },
      formKey: {
        roleName: '',
        roleKey: '',
        roleSort: '',
        status: '',
        menuIds: '',
        remark: ''
      },
      formList: [
        {
          label: '角色名称',
          inputType: 'input',
          options: [],
          placeholder: '请输入角色名称',
          props: ['roleName', {
            rules: [
              { required: true, message: '请输入角色名称' }
            ]
          }]
        },
        {
          label: '权限字符',
          inputType: 'input',
          options: [],
          placeholder: '请输入权限字符',
          props: ['roleKey', {
            rules: [
              { required: true, message: '请输入权限字符' }
            ]
          }]
        },
        {
          label: '角色顺序',
          inputType: 'input',
          options: [],
          placeholder: '请输入角色顺序',
          props: ['roleSort', {
            rules: [
              { required: true, message: '请输入角色顺序' },
              { pattern: /^\d*$/, message: '请输入数字' },
              { min: 1, max: 4, message: '最多4位数' }
            ]
          }]
        },
        {
          label: '状态',
          inputType: 'radioGroup',
          options: [{label: '正常', value: 1}, {label: '停用', value: 0}],
          placeholder: '请输入权限字符',
          props: ['status', {
            rules: [
              { required: true, message: '请输入权限字符' }
            ],
            initialValue: 0
          }]
        },
        {
          disabled: false,
          label: '菜单权限',
          inputType: 'treeSearch',
          options: [],
          handle: '',
          isSearch: false,
          placeholder: '请选择',
          props: ['menuIds', {
            rules: [
              { required: true, message: '请设置菜单权限' }
            ]
          }]
        },
        {
          label: '备注',
          inputType: 'textarea',
          options: [],
          placeholder: '请输入备注',
          props: ['remark', {
            rules: []
          }]
        }
      ],
      searchList: [
        { props: ['roleName'], placeholder: '角色名称', options: [], inputType: 'input' }
      ],
      tableOptList: [
        { text: '新增', icon: 'plus', handle: this.openModal, permi: ['system:role:add', 'property:role:add', 'government:govRole:add'] },
        { text: '删除', icon: 'close', disabled: true, permi: ['system:role:remove', 'property:role:delete', 'government:govRole:delete'] }
      ],
      rowOptList: [
        { text: '修改', handle: (row) => this.openModal(row), permi: ['system:role:edit', 'property:role:edit', 'government:govRole:edit'] },
        { text: '删除', handle: (row) => this.$refs.table.showDeleteConfirm(row), permi: ['system:role:remove', 'property:role:delete', 'government:govRole:delete'] }
      ],
      columns: [
        { title: '角色名称', dataIndex: 'roleName', align: 'left', width: '' },
        { title: '权限字符', dataIndex: 'roleKey', align: 'left', width: '' },
        { title: '状态', dataIndex: 'statusDesc', align: 'left', width: '', scopedSlots: {customRender: 't'} },
        { title: '创建人', dataIndex: 'createBy', align: 'left', width: '' },
        { title: '创建时间', dataIndex: 'createTime', align: 'left', width: '' },
        { title: '操作', dataIndex: 'action', align: 'left', width: '', scopedSlots: {customRender: 'action'} }
      ],
      dataSource: [],
      searchParams: {
        roleName: undefined
      },
      listApi: {
        url: this.listsApi,
        resHandle: '', // this.resHandle
        searchHandle: '' // searchHandle
      },
      deleteParam: {
        url: this.deleteApi,
        param: {},
        title: '角色',
        key: 'roleName'
      }
    };
  },
  created () {
    this.getSelect();
  },
  methods: {
    getSelect () {
      this[handleHttpMethod('get', this)]({
        url: this.authMenuApi
      }).then(res => {
        this.recursionList(res.data);
        this.formList[4].options = res.data;
      });
    },
    recursionList (list) {
      list.forEach(item => {
        item.title = item.label;
        item.key = item.value;
        if (item.children && item.children.length) {
          this.recursionList(item.children);
        }
      });
    },
    /* 打开弹窗 */
    openModal (row) {
      this.visible = true;
      let title = '';
      if (row.roleId) {
        title = '修改角色';
        let url = `${this.detailApi}${row.roleId}`;
        this.$nextTick(() => {
          this.$refs.form.getDetail(url);
          this.$refs.form.routeQuery = row.roleId;

          this[handleHttpMethod('get', this)]({
            url: `${this.authMenuByRoleApi}${row.roleId}`
          }).then(res => {
            this.$refs.form.defaultTree = res.data.checkedKeys;
            this.$refs.form.treeCheck(res.data.checkedKeys, 'menuIds');
            if (row.roleId === '1') {
              this.formList[4].disabled = true;
            } else {
              this.formList[4].disabled = false;
            }
          });
        });
      } else {
        title = '新增角色';
      }
      this.modalTitle = title;
    },
    /** 切换状态 */
    onChange (checked, name, id) {
      let title = `确认要${checked ? '启用' : '停用'}"${name}"角色吗?`;
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
    // 弹窗表单返回结果
    addResHandle (res) {
      if (res.code !== 200) {
        this.$message.error(res.msg);
      } else {
        this.$message.success(res.msg);
        this.$refs.table.getTableList();
        this.visible = false;
      }
    },
    detailResHandle (res) {
      res.status = Number(res.status);
      return res;
    },
    // 添加角色
    reqHandle (res) {
      let choseList = res.menuIds;
      let arr = this.findFatherNode(choseList);
      res.menuIds = arr;
      return res;
    },
    /**
     * 获取check事件的节点的所有父级节点，提交给后台
     * 提交给后台的数据有包含父级节点
     * 详情返回的数据不包含父级节点
     **/
    findFatherNode (list) {
      let arr = [];
      this.formList[4].options.forEach(item1 => {
        if (list.includes(item1.value)) {
          arr.push(item1.value);
        }
        if (item1.children && item1.children.length) {
          item1.children.forEach(item2 => {
            if (list.includes(item2.value)) {
              arr.push(item2.value);
              arr.push(item1.value);
            }
            if (item2.children && item2.children.length) {
              item2.children.forEach(item3 => {
                if (list.includes(item3.value)) {
                  arr.push(item3.value);
                  arr.push(item2.value);
                  arr.push(item1.value);
                }
                if (item3.children && item3.children.length) {
                  item3.children.forEach(item4 => {
                    if (list.includes(item4.value)) {
                      arr.push(item4.value);
                      arr.push(item3.value);
                      arr.push(item2.value);
                      arr.push(item1.value);
                    }
                  });
                }
              });
            }
          });
        }
      });
      arr = [...new Set(arr)];
      return arr;
    },
    resHandle (res) {
      return res.rows;
    },
    searchHandle (selectData) {
      // return selectData;
    }
  }
};
</script>
