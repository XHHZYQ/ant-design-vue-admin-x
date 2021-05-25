
<template>
  <div class="form-demo">
    <x-addEdit
      ref="addEdit"
      :formList="formList"
      :formKey="formKey"
      :addParam="addParam"
      :editParam="editParam"
      :detailParam="detailParam"
      :itemLayout="{
      labelCol: {span: 5},
      wrapperCol: {span: 13}
    }"
    >
      <template slot="" slot-scope="{}">
      </template>
    </x-addEdit>
  </div>
</template>

<script>
export default {
  name: 'addSystemMsg',
  data () {
    return {
      formKey: {
        title: '',
        imageId: '',
        isDelay: '',
        sendTime: '',
        aims: '',
        scopeType: '',
        pushAims: '',
        pushContent: '',
        cityScope: '',
        communityScope: '',
        accountScope: ''
      },
      formList: [
        {
          label: '标题',
          inputType: 'input',
          options: [],
          placeholder: '请输入标题',
          labelCol: {span: 5},
          wrapperCol: {span: 6},
          props: ['title', {
            validateTrigger: ['change', 'blur'],
            rules: [
              { required: true, message: '请输入标题' },
              { min: 1, max: 50, message: '标题为1-50个字' }
            ]
          }]
        },
        {
          label: '封面图片',
          inputType: 'upload',
          options: [],
          placeholder: '',
          name: 'imageId',
          resUrl: 'image_url',
          resName: 'file_name',
          fileList: [],
          uploadParam: {
            action: '',
            headers: {},
            accept: '',
            listType: 'picture'
          },
          props: ['imageId', { rules: [] }]
        },
        {
          label: '目标应用',
          inputType: 'radioGroup',
          options: [
            { value: 2, label: '社区' },
            { value: 4, label: '管家' },
            { value: 8, label: '工程' }
          ],
          placeholder: '',
          props: ['aims', {
            rules: [{required: true, message: '请选择目标应用'}]
          }]
        },
        {
          label: '应用范围',
          inputType: 'select',
          options: [
            { value: 0, label: '全部用户' },
            { value: 1, label: '指定城市' },
            { value: 2, label: '指定小区' },
            { value: 3, label: '指定用户' }
          ],
          placeholder: '请选择应用范围',
          handle: () => {},
          props: ['scopeType', {
            rules: [{required: true, message: '请选择用户范围'}]
          }]
        },
        {
          isShow: false,
          label: '选择城市',
          inputType: 'treeSelect',
          options: [], // options的 value是字符
          placeholder: '请选择城市',
          treeCheckable: true,
          props: ['cityScope', {
            rules: [{required: true, message: '请选择城市'}]
          }]
        },
        {
          isShow: false,
          label: '选择小区',
          inputType: 'transfer',
          options: [],
          placeholder: '',
          props: ['communityScope', {
            rules: [{required: true, message: '请选择小区'}]
          }],
          titles: ['小区列表', '已选']
        },
        {
          label: '输入账号',
          inputType: 'textarea',
          extra: '多个账号以英文“,”逗号隔开',
          props: ['accountScope', {
            rules: [{required: true, message: '请输入账号'}]
          }]
        },
        {
          label: '同时推送',
          inputType: 'checkboxGroup',
          options: [
            { value: 1, label: 'ios' },
            { value: 2, label: 'android' }
          ],
          placeholder: '',
          handle: () => {},
          props: ['pushAims', { rules: [] }]
        },
        {
          label: '推送内容',
          inputType: 'textarea',
          options: [],
          placeholder: '请输入推送内容',
          props: ['pushContent', {
            validateTrigger: 'blur',
            rules: [
              { required: false, message: '请输入推送内容' },
              { min: 0, max: 100, message: '推送内容为0-100个字' }
            ]
          }]
        }
      ],
      addParam: {
        url: 'http://192.168.1.91:12181/community/systemMessage',
        reqHandle: this.reqHandle,
        resHandle: '' // this.addResHandle
      },
      editParam: {
        url: 'http://192.168.1.91:12181/community/systemMessage/',
        resHandle: '' // this.editResHandle
      },
      detailParam: {
        url: 'http://192.168.1.91:12181/community/systemMessage/',
        resHandle: undefined
      }
    };
  },
  mounted () {
  },
  methods: {
  }
};
</script>

<style lang="scss">
.form-demo {
  margin: 24px;
  padding: 24px;
  background-color: #fff;
}
</style>
