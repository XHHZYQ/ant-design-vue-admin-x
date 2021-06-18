import { empty } from '../empty';

export default {
  data () {
    return {
      fieldData: {}, // 整个form表单提交的 upload 文件数据
      textData: {},
      targetKeys: [],
      selectedKeys: []
    };
  },
  watch: {
    formData (val) {
      if (val) {
        this.$nextTick(() => {
          this.form.setFieldsValue(val);
        });
      }
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this);
  },
  created () {
    this.addFormEvent();
    this.handleListHidden();
  },
  methods: {
    /* 添加表单事件 */
    addFormEvent () {
      empty.$on('setForm', (formVal) => {
        this.$nextTick(() => {
          if (formVal) {
            this.form.setFieldsValue(formVal);
            this.textData = formVal;
          }
        });
      });
    },
    /** 处理默认列表显隐 */
    handleListHidden () {
      this.formList && this.formList.forEach((el) => {
        if (!el.hasOwnProperty('isShow')) {
          el.isShow = true;
        }
      });
      let keyArr = ['city_scope', 'community_scope', 'account_scope'];
      this.formList.forEach((el) => {
        let isSame = keyArr.some(item => item === (el.props && el.props[0]));
        isSame && (el.isShow = false);
      });
    },
    /* 处理动态表单项的显隐 */
    handleDynamicForm (e, typeObj) {
      let formKeyObj = typeObj[e];
      this.formList.forEach(el => {
        for (let item in formKeyObj) {
          if (el.key === item) {
            el.isShow = formKeyObj[item];
          }
        }
      });
    },
    /* 清除下级值 */
    resetSubValue (key, val) {
      this.form.resetFields(key);
      this.formList.forEach((el) => {
        Array.isArray(key) && key.forEach((item) => {
          let props = el.props;
          if (props && props[0] === item) {
            el.options = [];
          }
        });
      });
    },
    /**
     * 处理获取详情fileList
     * param data 详情返回的整个data
     * */
    handleFileList (data) {
      this.formList.forEach((el, index) => {
        if (el.inputType === 'upload') {
          let prop = el.props && el.props[0];
          let fileUrl = data[el.uploadParam.iconUrl] || data[prop]; // 返回的url
          if (fileUrl && typeof fileUrl === 'string' && (fileUrl.includes('http') || fileUrl.includes('https'))) {
            let fileName = data[el.uploadParam.iconName] || data[el.uploadParam.iconUrl] || data[prop]; // 返回的文件名
            el.fileList = [{uid: index, name: fileName, url: fileUrl}];
          }
        }
      });
    },
    /* 处理时间格式 */
    handleDate (data) {
      let pick = ['rangePick', 'rangeTimePick', 'datePick', 'dateTimePick'];
      let dateValue = {};
      this.formList.forEach((el) => {
        if (pick.some((part) => part === el.inputType)) {
          let prop = el.props && el.props[0];
          if (data[prop]) {
            dateValue = {...dateValue, [prop]: this.Moment(data[prop])};
          }
        }
      });
      return dateValue;
    },
    /* 处理弹窗 */
    handleConfirm (param) { // 单独处理编辑app应用
      let isDiff = false;
      for (let item in this.detailValues) {
        if (param.hasOwnProperty(item)) {
          if (item === 'scope') {
            let scope = param[item];
            if (Array.isArray(scope)) {
              param[item] = scope.join(',');
            }
          }
          if (this.detailValues[item] !== param[item]) {
            isDiff = true;
            this.$confirm({
              title: '修改“平台”、“应用范围”将同步到功能配置，确定要修改？',
              centered: true,
              onOk: (close) => {
                param.if_update = 1;
                this.editForm(param);
                close();
              }
            });
            break;
          }
        }
      }
      if (!isDiff) {
        this.editForm(param);
      }
    },
    /* 编辑表单 */
    editForm (values) { // 单独处理编辑app应用
      for (let item in values) {
        if (Array.isArray(values[item])) {
          values[item] = values[item].join(',');
        }
      }
      Object.keys(this.fieldData).length && (values = {...values, ...this.fieldData});
      this.$put({
        url: `${this.editParam.url}${this.routeQuery}`,
        params: values
      }).then((res) => {
        this.$store.commit('setOptData', true);
        this.handleThen('编辑');
      });
    },
    /**
     * 选择项发送变化
     * @param sourceSelectedKeys 源数据选中的key
     * @param targetSelectedKeys 目标数据选中的Key
     */
    transferSelectChange (sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys];
    },
    /**
     * 选项在两栏之间转移时的回调函数
     * @param nextTargetKeys 事件后目标数据中有的key
     * @param direction 左移或右移操作
     * @param moveKeys 要移动的key
     */
    transferChange (nextTargetKeys, direction, moveKeys) {
      this.targetKeys = nextTargetKeys;
    }
  }
};
