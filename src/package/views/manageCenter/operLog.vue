
<template>
  <!--操作日志-->
  <div>
    <x-tabula
      ref="table"
      :apiOrigin="apiOrigin"
      :dataSource="dataSource"
      rowKey="operId"
      :searchList="searchList"
      :columns="columns"
      :tableOptList="tableOptList"
      :searchParams.sync="searchParams"
      :rowOptList="rowOptList"
      :listApi="listApi"
      :rowSelection="false"
    >
    </x-tabula>

    <!--账号详情的弹窗-->
    <a-modal
      title="管理员信息"
      :visible="visible"
      @cancel="visible=false"
      :width="900"
      v-bind="$store.state.modalDetailConfig"
    >
      <a-form>
        <template v-for="(item, index) of accountInfo">
          <a-form-item
            v-if="item.key !== 'errorMsg'"
            :key="index"
            :label="item.label"
            v-bind="itemLayout"
          >
            <span class="ant-form-text">{{item.value}}</span>
          </a-form-item>

          <a-form-item
            v-if="item.key === 'errorMsg' && item.visible"
            :key="index"
            :label="item.label"
            v-bind="itemLayout"
          >
            <span class="ant-form-text">{{item.value}}</span>
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { fetchSelect } from '@/utils/mixins';
import { handleHttpMethod } from '../../utils/common';
import { PLAT_FORM } from '@/utils/platform';

const sysOperType = [
  { 'label': '新增', 'value': '1' },
  { 'label': '修改', 'value': '2' },
  { 'label': '删除', 'value': '3' },
  { 'label': '授权', 'value': '4' },
  { 'label': '导出', 'value': '5' },
  { 'label': '导入', 'value': '6' },
  { 'label': '强退', 'value': '7' },
  { 'label': '生成代码', 'value': '8' },
  { 'label': '清空数据', 'value': '9' }
];
export default {
  mixins: [fetchSelect],
  name: 'operLog',
  data () {
    return {
      apiOrigin: 'JAVA',
      visible: false,
      itemLayout: {labelCol: { span: 4 }, wrapperCol: { span: 19 }},
      searchList: [
        { props: ['title'], placeholder: '系统模块', options: [], inputType: 'input' },
        { props: ['operName'], placeholder: '操作人员', options: [], inputType: 'input' },
        { props: ['businessType'], placeholder: '操作类型', options: [], inputType: 'select' },
        { props: ['status'], placeholder: '操作状态', options: [], inputType: 'select' },
        { props: ['createDate'], placeholder: ['操作时间', '操作时间'], options: [], inputType: 'datePick' }
      ],
      tableOptList: [],
      rowOptList: [
        { text: '详细', handle: (row) => this.showAccountInfo(row.operId), permi: ['system:operlog:detail', 'property:operlog:detail', 'government:operation:detail'] }
      ],
      columns: [
        { title: '系统模块', dataIndex: 'title', align: 'left', width: '' },
        { title: '操作类型', dataIndex: 'businessTypeDesc', align: 'left', width: '' },
        { title: '请求方式', dataIndex: 'requestMethod', align: 'left', width: '' },
        { title: '操作人员', dataIndex: 'operName', align: 'left', width: '' },
        { title: '主机', dataIndex: 'operIp', align: 'left', width: '' },
        { title: '操作地点', dataIndex: 'operLocation', align: 'left', width: '' },
        { title: '操作状态', dataIndex: 'statusDesc', align: 'left', width: '' },
        { title: '操作日期', dataIndex: 'operTime', align: 'left', width: '' },
        { title: '操作', dataIndex: 'action', align: 'left', width: '', scopedSlots: {customRender: 'action'} }
      ],
      dataSource: [],
      searchParams: {
        title: '',
        operName: '',
        businessType: '',
        status: '',
        createDate: ''
      },
      accountInfo: [
        { label: '操作模块', key: 'title', value: '' },
        { label: '登录信息', key: 'operId', value: '' },
        { label: '操作方法', key: 'method', value: '' },
        { label: '请求参数', key: 'operParam', value: '' },
        { label: '返回参数', key: 'jsonResult', value: '' },
        { label: '操作状态', key: 'status', value: '' },
        { label: '失败原因', key: 'errorMsg', value: '' },
        { label: '请求地址', key: 'operUrl', value: '' },
        { label: '请求方式', key: 'requestMethod', value: '' },
        { label: '操作时间', key: 'operTime', value: '' }
      ],
      listApi: {
        url: '/operlog/list',
        resHandle: '', // this.resHandle
        searchHandle: '' // searchHandle
      }
    };
  },
  created () {
    this.getSelect();
  },
  methods: {
    getSelect () {
      if (PLAT_FORM === 'community') { // 社区4.*才有有字典表，物业没有
        this.dictionarySelect([{index: 2, scope: 'searchList', query: 'sys_oper_type'}]);
      } else {
        this.searchList[2].options = sysOperType;
      }
      this.searchList[3].options = [{label: '成功', value: 1}, {label: '失败', value: 0}];
    },
    /* 查看账号详情 */
    showAccountInfo (id) {
      this[handleHttpMethod('get', this)]({
        url: `/operlog/${id}`
      }).then(({data}) => {
        this.accountInfo.forEach((el) => {
          for (let item in data) {
            if (item === el.key) {
              el.value = data[item];
              if (el.key === 'status') {
                el.value = data[item] ? '成功' : '失败';
              }
              if (el.key === 'errorMsg') {
                data.status === 0 ? el.visible = true : el.visible = false;
              }

              if (el.key === 'operParam' && data[item]) {
                let value = '';
                try {
                  let parseRes = JSON.parse(data[item]);
                  parseRes && (value = parseRes);
                } catch (error) {
                  console.log('解析报错了', error);
                  value = data[item].split(',');
                }
                console.log('value: ', value);
                el.value = value;
              }
            }
          }
        });
      });
      this.visible = true;
    },
    resHandle (res) {
      console.log('处理list返回数据: ');
      return res;
    },
    searchHandle (selectData) {
      console.log('处理搜索数据: ', selectData);
      // return selectData;
    }
  }
};
</script>

