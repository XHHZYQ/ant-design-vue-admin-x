
<template>
  <!--搜索组件-->
  <div id="search">
    <a-form class="search-form" :form="form" @submit="handleSearch">
      <a-row :gutter="24">
        <a-col
          v-for="(item, index) of searchList"
          :key="index"
          :md="colmd"
          :sm="colsm"
          :style="{ display: index < count ? 'block' : 'none' }"
        >
          <a-form-item
            v-if="item.inputType=== 'input'"
            :label="item.label"
            v-bind="item.itemLayout ? item.itemLayout : formItemLayout"
          >
            <a-input v-decorator="[...item.props, {
            rules: []
            }]" :placeholder="item.placeholder"/>
          </a-form-item>

          <a-form-item
            v-if="item.inputType=== 'select'"
            :label="item.label"
            v-bind="item.itemLayout ? item.itemLayout : formItemLayout"
          >
            <a-select  @change="(e) => {item.handle && item.handle(e)}"
              @popupScroll ="(e) => { item.placeholder === '小区名称' ? popupScroll(e) : ''}"
              :filterOption="filterOption" v-decorator="item.props" showSearch allowClear :placeholder="item.placeholder">
              <a-select-option v-for="(el, i) of item.options" :key="i" :value="el.value">{{el.label}}</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            v-if="item.inputType=== 'cascader'"
            :label="item.label"
            v-bind="item.itemLayout ? item.itemLayout : formItemLayout"
          >
            <a-cascader
              @change="e => {item.handle && item.handle(e);}"
              :showSearch="{filter}"
              :loadData="item.loadData"
              v-decorator="item.props"
              :options="item.options"
              :expandTrigger="item.expandTrigger || 'hover'"
              :placeholder="item.placeholder"
              :fieldNames="item.fieldNames || {label: 'label', value: 'value', children: 'children'}"
              :changeOnSelect="item.changeOnSelect"
              notFoundContent="无匹配结果"
            />
          </a-form-item>

          <a-form-item
            v-if="item.inputType=== 'datePick'"
            :label="item.label"
            v-bind="item.itemLayout ? item.itemLayout : formItemLayout"
          >
            <a-range-picker v-decorator="item.props" :placeholder="item.placeholder" format="YYYY-MM-DD"/></a-form-item>

          <a-form-item
            v-if="item.inputType=== 'dateTimePick'"
            :label="item.label"
            v-bind="item.itemLayout ? item.itemLayout : formItemLayout"
          >
            <a-range-picker v-decorator="item.props" :placeholder="item.placeholder" showTime format="YYYY-MM-DD HH:mm"/></a-form-item>
        </a-col>

        <a-col v-if="searchList.length" class="search-btns" :class="{'is-expand': expand}" :span="expand ? 24 : 8">
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button class="reset" @click="handleReset">重置</a-button>
          <a v-if="searchList.length > 2" @click="changeFold">
            {{expand ? '收起' : '展开'}}<a-icon :type="expand ? 'up' : 'down'"/>
          </a>
        </a-col>
      </a-row>
    </a-form>

    <div class="table-opt" v-if="tableOptList.length">
      <a-button
        v-for="(item, index) of tableOptList"
        :key="index"
        @click.native="dispatchBtns(item)"
        :loading="item.loading || false"
        type="primary"
        :icon="item.icon"
        :disabled="item.disabled"
        v-hasPermi="item.permi"
      >{{item.text}}
      </a-button>
    </div>
  </div>
</template>
<script>
import { inputSearch } from '../utils/mixins';
import { empty } from '../utils/empty';
export default {
  mixins: [inputSearch],
  name: 'search',
  props: {
    searchList: {
      type: Array,
      default: () => []
    },
    tableOptList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      colmd: 8,
      colsm: 24,
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 }
      },
      expand: false
    };
  },
  computed: {
    count () {
      return this.expand ? this.searchList.length : 2;
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this);
  },
  created () {
    this.assignSearchValue();
    empty.$on('resetForm', (key) => {
      if (key && Array.isArray(key) && key.length) {
        this.form.resetFields(key);

        this.searchList.forEach((el) => {
          key.forEach((item) => {
            let props = el.props;
            if (props && props[0] === item) {
              el.options = [];
            }
          });
        });
      } else {
        this.form.resetFields();
      }
    });
  },
  updated () {
    this.changePickerStyle();
  },
  mounted () {
    this.changePickerStyle();
  },
  methods: {
    // 当选择器为小区时 作分页展示
    popupScroll (e) {
      const { target } = e;
      if (Math.ceil(target.scrollTop + target.offsetHeight) >= target.scrollHeight) {
      }
    },
    assignSearchValue () {
      empty.$on('setSearchValue', (formVal) => {
        this.$nextTick(() => {
          if (formVal) {
            this.form.setFieldsValue(formVal);
          }
        });
      });
    },
    changeFold () {
      this.expand = !this.expand;
    },
    /** 修改日期选择默认样式 */
    changePickerStyle () {
      this.$nextTick(() => {
        let picker = document.getElementsByClassName('ant-calendar-picker');
        for (let i = 0; i < picker.length; i++) {
          picker[i].style && (picker[i].style.width = '100%');
        }
      });
    },
    /* 分发btn事件 */
    dispatchBtns (item) {
      this.$emit('btnsHandler', item);
    },
    /* 查询 */
    handleSearch  (e) {
      e.preventDefault();
      this.form.validateFields((error, values) => {
        if (error) { return; }
        let newValue = {...values};
        let dateProps = [];

        this.searchList.forEach((el) => {
          if (el.inputType === 'datePick' || el.inputType === 'dateTimePick') {
            dateProps.push({
              props: el.props[0],
              inputType: el.inputType
            });
          }
        });

        dateProps.forEach((ele) => {
          let date = newValue[ele.props];
          if (date && date.length) {
            let format = ele.inputType === 'datePick' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
            let startDate = date[0].format(format);
            let endDate = date[1].format(format);
            newValue[ele.props] = `${startDate},${endDate}`;
          }
        });

        for (let item in newValue) {
          if (Array.isArray(newValue[item])) {
            newValue[item] = newValue[item].join(',');
          }
        }
        this.$emit('searchHandle', newValue);
      });
    },
    /* 清空 */
    handleReset () {
      this.$emit('resetHandle');
      this.form.resetFields();
    }
  }
};
</script>

<style lang="scss">
/*S- 更多搜索*/
#search {
  margin-bottom: 16px;
  .search-form  {
    transition: all 0.2s;
    .ant-form-item {
      display: flex;
      .ant-form-item-control-wrapper {
        flex: 1;
      }
    }
    .ant-calendar-picker {
      width: 100%;
    }
    .search-btns {
      line-height: 40px;
      .reset {
        margin-left: 8px;
      }
      a {
        margin-left: 8px;
        font-size: 14px;
      }
    }
    .is-expand {
      text-align: right;
    }
  }
  .table-opt {
    .ant-btn-primary {
      margin-right: 8px;
      margin-top: 8px
    }
  }
}
/*E- 更多搜索*/
</style>
