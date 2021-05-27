import empty from '../empty';

export default {
  data () {
    return {
      fieldData: {},
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
    this.initEvent && this.initEvent(); // 父组件初始化事件
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
    /* 处理获取详情fileList */
    handleFileList (data) {
      this.formList.forEach((el, index) => {
        if (el.inputType === 'upload') {
          let fileUrl = data[el.resUrl] || data[el.name]; // 返回的url
          if (fileUrl && typeof fileUrl === 'string' && (fileUrl.includes('http') || fileUrl.includes('https'))) {
            let fileName = data[el.resName] || data[el.resUrl] || data[el.name]; // 返回的文件名
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
    /* upload 删除文件列表 */
    removeFile (name, e) {
      this.formList.forEach((el, index) => {
        if (el.inputType === 'upload' && el.name === name) {
          let prop = el.props;
          let requireIndex = -1;
          prop &&
          prop[1] &&
          prop[1].hasOwnProperty('rules') &&
          prop[1].rules.length &&
          prop[1].rules.forEach((el, index) => {
            if (el.hasOwnProperty('required')) {
              requireIndex = index;
            }
          });
          if (requireIndex >= 0 && prop[1].rules[requireIndex].required === true) { // 如果为必填，则清空值
            this.form.resetFields([name]);
          } else { // 如果为非必填，直接赋值为0
            this.fieldData[name] = 0;
          }

          el.fileList = [];
        }
      });
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
    },

    /* 获取用户范围下拉列表 */
    userRangeList (regionIndex, communityIndex, fn1, fn2) {
      this.regionSelect((data) => {
        this.formList[regionIndex].options = data;
        fn1 && fn1(data); // 需要时可以添加回调
      }, null, '1,2');

      this.communitySelect((data) => {
        let arr = [];
        data.forEach((el) => {
          arr.push({key: `${el.value}`, title: el.label});
        });
        this.formList[communityIndex].options = arr;
        fn2 && fn2(arr); // 需要时可以添加回调
      });
    },
    /* 处理用户范围提交值 */
    rangeReqVal (param) {
      let scopeArr = ['cityScope', 'communityScope', 'accountScope'];
      scopeArr.forEach((el) => {
        for (let item in param) {
          if (el === item) {
            param.scope = param[item];
          }
        }
      });
      typeof param.scope === 'undefined' && (param.scope = '0');
      return param;
    },
    /* 处理用户范围返回值 */
    rangeResVal (values, res) {
      let scopeType = {
        1: 'cityScope',
        2: 'communityScope',
        3: 'accountScope'
      };
      let type = [1, 2].some(el => el === res.scopeType);
      values[scopeType[res.scopeType]] = type ? formatScope() : res.scope;
      function formatScope () {
        let arr = res.scope && res.scope.split(',');
        if (res.scopeType === 1) {
          let cityArr = [];
          arr.forEach((el) => {
            cityArr.push((el));
          });
          return cityArr;
        }
        return arr; // formatScope返回
      }
      return values; // 整个函数返回
    },
    /* 处理定时发送单选框 */
    handleDealyTime (value) {
      let index;
      this.formList.forEach((el, i) => {
        let props = el.props;
        if (props && props[0] === 'isDelay') {
          index = i;
        }
      });
      let delayTime = this.formList[index].dateProps[1].rules[0];
      let list = this.formList[index];
      value === 1 ? delayTime.required = true : delayTime.required = false;
      value === 1 ? list.pickerDisabled = false : list.pickerDisabled = true;
      this.$children[0].form.resetFields(['delayTime']);
    },

    /* 定位成功 */
    locaSuccess (val) {
      let obj = {
        'map_lng': val.lng,
        'map_lat': val.lat,
        'address': val.address
      };
      this.$children[0].form.setFieldsValue(obj);
    },
    /* 限制修改上级 */
    limitEdit (res, keyArr) {
      res.can_delete === 0 && this.formList.forEach((el) => {
        keyArr.forEach((item) => {
          if (el.props && el.props[0] === item) {
            el.disabled = true;
          }
        });
      });
    }
  }
};
