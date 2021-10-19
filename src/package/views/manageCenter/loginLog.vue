
<template>
  <!--登陆日志-->
  <div>
    <x-tabula
      ref="table"
      :apiOrigin="apiOrigin"
      :dataSource="dataSource"
      rowKey="loginLogId"
      :searchList="searchList"
      :columns="columns"
      :tableOptList="tableOptList"
      :searchParams.sync="searchParams"
      :listApi="listApi"
      :rowSelection="false"
    >
      <template slot="opt_o" slot-scope="{row}">
        <a-button type="link" @click="showAccountInfo(row)">{{row.user_name}}</a-button>
      </template>
    </x-tabula>

    <!--账号详情的弹窗-->
    <a-modal
      title="管理员信息"
      :visible="visible"
      @cancel="visible=false"
      :width="700"
      v-bind="$store.state.modalDetailConfig"
    >
      <a-form>
        <a-form-item
          v-for="(item, index) of accountInfo"
          :key="index"
          :label="item.label"
          v-bind="{labelCol: { span: 4 }, wrapperCol: { span: 9 }}"
        >
          <span class="ant-form-text">{{item.value}}</span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { fetchSelect } from '@/utils/mixins';
import { handleHttpMethod } from '../../utils/common'
export default {
  mixins: [fetchSelect],
  name: 'loginLog',
  data () {
    return {
      apiOrigin: 'JAVA',
      visible: false,
      searchList: [
        { props: ['ipaddr'], placeholder: '登入地址', options: [], inputType: 'input' },
        { props: ['userName'], placeholder: '用户名称', options: [], inputType: 'input' },
        { props: ['status'], placeholder: '登陆状态', options: [], inputType: 'select' },
        { props: ['createDate'], placeholder: ['操作时间', '操作时间'], options: [], inputType: 'datePick' }
      ],
      tableOptList: [],
      columns: [
        { title: '账号名', dataIndex: 'userName', align: 'left', width: '' },
        { title: '地址', dataIndex: 'ipaddr', align: 'left', width: '' },
        { title: '状态', dataIndex: 'statusDesc', align: 'left', width: '' },
        { title: '描述', dataIndex: 'msg', align: 'left', width: '' },
        { title: '访问时间', dataIndex: 'loginTime', align: 'left', width: '' }
      ],
      dataSource: [],
      searchParams: {
        ipaddr: '',
        userName: '',
        status: '',
        createDate: ''
      },
      accountInfo: [
        { label: '账号', key: 'user_name', value: '' },
        { label: '角色', key: 'role_desc', value: '' },
        { label: '手机号', key: 'mobile', value: '' },
        { label: '真实姓名', key: 'true_name', value: '' }
      ],
      listApi: {
        url: '/loginlog/list',
        resHandle: '', // this.resHandle
        searchHandle: '' // searchHandle
      }
    };
  },
  mounted () {
    // this.getSelect();
    this.searchList[2].options = [{label: '成功', value: 1}, {label: '失败', value: 0}];
  },
  methods: {
    getSelect () {
      this[handleHttpMethod('get', this)]({
        url: '/select_list/admin_manage_list',
        params: {}
      }).then(({data}) => {
        this.searchList[1].options = data.roles_list;
        this.searchList[2].options = [{label: '成功', value: 1}, {label: '失败', value: 0}];
      });
    },
    /* 查看账号详情 */
    showAccountInfo (row) {
      this.accountInfo.forEach((el) => {
        for (let item in row) {
          if (item === el.key) {
            el.value = row[item];
          }
        }
      });
      this.visible = true;
    },
    resHandle (res) {
      return res;
    },
    searchHandle (selectData) {
      // return selectData;
    }
  }
};
</script>
