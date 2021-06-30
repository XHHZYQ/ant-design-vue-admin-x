# form 属性

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

# addParam、editParam、detailParam参数

| 参数 | 说明 | 类型 | 默认值 |
| ------ | ------ | ------ | ----- |
|url|表单新增、详情、编辑数据请求接口的url|String|undefined|
|reqHandle|表单新增、编辑接口提交前事件，函数的参数为表单数据 values。需要再请求前处理数据时使用。此参数只有addParam中有该属性，如果有如果有赋值表单编辑时，也会调用改事件|Function|undefined|
|resHandle|表单在新增、编辑、详情数据，接口提交成功后的回调|Function|undefined|

# formList参数

|参数| 说明| 是否必填| 类型| 默认值|
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
|fieldNames| inputType为 cascader 自定义 options 中 label name children 的字段 否| String |undefined|
|type| inputType为 input ,当type为textarea、number/、password分别展示为textarea输入框、number输入框、密码框| 否| String| input|
|titles| transfer 的标题集合，[详情见官网](https://www.antdv.com/components/transfer-cn/#API)| 否| String| undefined|
|changeOnSelect| inputType为 cascader 当此项为 true 时，点选每级菜单选项值都会发生变化| 否| Boolean| false|
|help| 提示信息，如不设置，则会根据校验规则自动生成| 否| String| undefined|
|isSearch| tree 组件 是否展示搜索框 否| Boolean| undefined|
|slot|
|subList|

# uploadParam 参数

|参数| 说明| 类型| 默认值|
|-----|-----|-----|-----|
|url| 提交接口的地址| String| /file/ht_upload|
|iconUrl| fileList每项url的参数， listType为picture ,表单赋值时 icon 的字段，一般表单详情时使用| String| undefined|
|iconName| fileList每项name的参数，没设置时会依次去获取iconUrl、prop字段| String| undefined|
|accept| upload选择文件的格式（只能过滤选择文件时格式，提交前并没有验证）| String| undefined|
|listType| upload展示的格式，有text、picture、picture-card三种| String| text|


能使用refs方法或参数

|方法|说明|类型|
|---|---|---|
|handleSubmit|||

