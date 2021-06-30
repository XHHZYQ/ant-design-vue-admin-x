# ant-design-vue-admin-x
> 基于 ant-design-vue 封装的后台管理组件

1.基于 ant-design-vue 封装的后台管理组件，包括 table 和 form 两大组件；<br/>
2.无需写ui组件，简单配置参数即可快速实现后台管理中大部分页面的开发，可以大幅度减少代码量，易于维护，提升开发效率；<br/>
3.集成 axios 封装的 http 请求；<br/>
4.全局集成了v-hasPermi 指令可以对不同角色进行显隐的控制。<br/>

# install
该插件基于ant-design-vue，也需要同时安装

    npm i ant-design-vue --save
    npm i ant-design-vue-admin-x --save
# usage
    import Vue from 'vue';
    import App from './App';
    import Antd from 'ant-design-vue';
    import 'ant-design-vue/dist/antd.css';
    import antAdminX, { GET, POST, DELETE, PUT } from 'ant-design-vue-admin-x';

    Vue.use(Antd);
    Vue.use(antAdminX);

    Vue.prototype.$get = GET; // 将请求方法挂载值vue原型
    Vue.prototype.$post = POST;
    Vue.prototype.$delete = DELETE;
    Vue.prototype.$put = PUT;

    new Vue({
      el: '#app',
      components: { App },
      template: '<App/>',
    });`

详情使用方法可以查看项目中 demo 示例

# form表单组件

## options 属性

| 参数 | 说明 | 类型 | 默认值 |
| ------ | ------ | ------ | ----- |
| formType | 表单类型，modal为弹窗表单，unModal为普通表单 | String | unModal |
| formList | 自动生成表单的参数，为对象数组 | Array | [] |
| formKey | 整个表单每项绑定值的key字段，如： formKey: { title: undefined, imageId: undefined }  | Object |{}
|addParam |表单提交为 新增 数据的参数|Object| {}|
|editParam|表单提交为 编辑 数据的参数|Object|{}|
| detailParam|获取表单 详情 表单赋值的参数|Object|{}|
|itemLayout|表单标签 labelCol、输入控件布局样式 wrapperCol  的配置|Object|{ labelCol: { span: 8 }, wrapperCol: { span: 9 } }|
| reqLoading|提交按钮loading效果，一般在弹窗表单中使用,如：reqLoading: { loading: false }|Object|{}|
|initReqHandle|初始化页面，是否需要请求获取详情接口。一般在非弹窗表单，进入详情且不需要初始化获取详情时很有必要| Boolean|true|
|isSubmitBtn|表单是否需要提交按钮，一般在弹窗表单中使用|Boolean|true

## addParam、editParam、detailParam参数

| 参数 | 说明 | 类型 | 默认值 |
| ------ | ------ | ------ | ----- |
|url|表单新增、详情、编辑数据请求接口的url|String|undefined|
|reqHandle|表单新增、编辑接口提交前事件，函数的参数为表单数据 values。需要再请求前处理数据时使用。此参数只有addParam中有该属性，如果有如果有赋值表单编辑时，也会调用改事件|Function|undefined|
|resHandle|表单在新增、编辑、详情数据，接口提交成功后的回调|Function|undefined|

## formList参数

|参数| 说明| 必填| 类型| 默认值|
|-----|-----|-----|-----|-----|
|label| form-item label的名称| 否| String| undefined|
|inputType| form-item 输入框的的表单类型，如：input，select| 是| String| undefined|
|placeholder| form-item输入框的提示信息| 否| String |undefined|
|props| form-item 绑定的值和options为数组，如：[key, options]，[详细见官网](https://www.antdv.com/components/form-cn/#API)| 是| Array| undefined|
|options| 当表单该项为select、cascader之类的输入框时，选择项的参数，格式一般为： [{value: 1, label: '选择项'}]| 否| Array| undefined|
|isShow| form-item 初始化是是否显示，该属性控制的是form-item的v-if属性值| 否| Boolean| true|
|labelCol| 为form-item单独设置label标签的布局| 否| Object| undefined|
|wrapperCol| 为form-item单独设置输入框的布局| 否| Object| undefined|
|handle| 输入框 change 事件处理函数| 否| Function| undefined|
|blur |输入框 blur 事件处理函数 |否 |Function| undefined|
|click |输入框 click 事件处理函数 |否 |Function |undefined|
|mode| select 设置 Select 的模式为多选或标签，可选值为'default'、 'multiple'、 'tags'、 'combobox'| 否| Strign| undefined|
|extra| 额外的提示信息，和 help 类似，当需要错误信息和提示文案同时出现时，可以使用，[详情见官网](https://www.antdv.com/components/form-cn/#API)| 否 |String |undefined|
|disabled| 禁用该表单项| 否| Boolean| false|
|treeCheckable| 当inputType为 tree-select时，是否显示 checkbox| 否| Boolean |undefined|
|fieldNames| inputType为 cascader 自定义 options 中 label name children 的字段| 否| String |undefined|
|type| inputType为 input ,当type为textarea、number/、password分别展示为textarea输入框、number输入框、密码框| 否| String| input|
|titles| transfer 的标题集合，[详情见官网](https://www.antdv.com/components/transfer-cn/#API)| 否| String| undefined|
|changeOnSelect| inputType为 cascader 当此项为 true 时，点选每级菜单选项值都会发生变化| 否| Boolean| false|
|help| 提示信息，如不设置，则会根据校验规则自动生成| 否| String| undefined|
|isSearch| tree 组件 是否展示搜索框 |否| Boolean| undefined|
|slot|slot的name名,form-item需要自定义时使用|否|String||
|subList|同一个form-item内部嵌套多个输入框时使用,配置项和formList相同|否|Array|undefined|

## uploadParam 参数

|参数| 说明| 类型| 默认值|
|-----|-----|-----|-----|
|url| 提交接口的地址| String| /file/ht_upload|
|iconUrl| fileList每项url的参数， listType为picture ,表单赋值时 icon 的字段，一般表单详情时使用| String| undefined|
|iconName| fileList每项name的参数，没设置时会依次去获取iconUrl、prop字段| String| undefined|
|accept| upload选择文件的格式（只能过滤选择文件时格式，提交前并没有验证）| String| undefined|
|listType| upload展示的格式，有text、picture、picture-card三种| String| text|

## 能通过refs操作组件内部的方法、数据

|方法|说明|类型|
|---|---|---|
|handleSubmit|表单提交方法|Function|
|routeQuery|表单为弹窗时，查看表单详情该条数据的 id| String/Number|
|getDetail|调用获取表单详情的方法|Function|
|setFieldsValue|给表单赋值，ant form 方法|Function({ [fieldName]: value })|
|validateFields|验证表单，ant form 方法|Function|
|targetKeys|transfer选中的项赋值|Array|
|resetSubValue|清空联动表单, 第二级的值和下拉选项|Function([keys: string[]])|


# table 组件

## table options

|参数|说明|类型|默认值|
|---|---|---|---|
|searchList|搜索列表|Array|[]|
|searchParams|搜索参数，对应searchList每项的值|Object|{}|
|tableOptList|全局操作项|Array|[]|
|rowOptList|每一项的操作项|Array|[]|
|columns|表格列的配置数组|Array|[]|
|dataSource|表格默认数据|Array|[]|
|excludeResetKey|重置搜索忽略的字段|Array|[]|
|rowOptLen|每项操作项默认展示的个数|Number|3|
|rowSelection|table是否需要多选按钮 checkbox|Boolean|true|
|rowKey|单独删除或多选删除的 id，也用于table循环需要的key|String|undefined|

## listApi
 table 接口请求配置参数

|参数|说明|类型|默认|
|---|---|---|---|
|url|接口地址|String|undefined|
|resHandle|接口成功后的回调|Function|undefined|
|searchHandle|接口请求前事件|Function|undefined|

## addHandleParam
新增一条table数据配置参数

|参数|说明|类型|默认|
|---|---|---|---|
|route|跳转的路由|String|undefined|
|title|跳转至新页面面包屑名称|String|undefined|

## deleteParam
单独删除或批量参数配置参数

|参数|说明|类型|默认|
|---|---|---|---|
|url|接口地址|String|undefined|
|title|删除时弹窗内容的 类型名称，如：门禁设备|String|undefined|
|key|删除时弹窗内容的 提示内容的key, 如：deviceName|String|undefined|

## 通过refs操作组件内部方法或数据

|参数|说明|类型|
|---|---|---|
|getTableList|请求接口获取表格数据|Function|
|showDeleteConfirm|打开删除确定框，方法参数为单条数据或多条数据数组|showDeleteConfirm(rows)|
|toEdit|进入该条数据表单的详情，方法参数为该条数据|toEdit(row)|
|setFieldsValue|设置搜索框的值|setFieldsValue（{key:value}）|

# http 使用方法

          this.$get({ // 包含四个请求方式$get、$post、$put、$delete
            url: '/users',
            params: { id: this.id },
            btnLoading: this.loading
            config: { timeout: 20000 } // axios 配置参数会合并默认参数
          }).then(({ data }) => {
            // do something
          }).catch((err) => {
            // do error handle
          });

|参数|说明|类型|默认值|
|---|---|---|---|
|url|接口url,baseUrl已处理，通过process.env.VUE_APP_BASE_API获取|String|undefined|
|params|接口参数，get、post、put、delete都使用该字段|Object|{}|
|btnLoading|loading处理，格式为：{loading: false}|Object|undefined|
|config|自定义axios配置参数，会合并默认参数|Object|undefined|
|then|接口成功的方法，参数为完整的返回数据对象|Function|undefined|
|catch|接口失败的方法,参数为error|Function|undefined|

# v-hasPermi 指令

    v-hasPermi="[user:list:add]" // hasPermi指令的值为数组，角色值格式为：a:b:c


