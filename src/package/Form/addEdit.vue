
<template>
  <!--新增编辑组件-->
  <div>
    <slot></slot>
    <!--<a-form :form="form" @submit.prevent="handleSubmit">-->
    <a-form :form="form" v-bind="itemLayout || $store.state.base_itemLayout">
      <template v-for="(item, index) of formList">
        <!--纯文本-->
        <template v-if="item.inputType==='text'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <span class="ant-form-text">{{ textData[item.props[0]] }}</span>
          </a-form-item>
        </template>

        <template v-if="item.inputType==='input'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :extra="item.extra"
            :help="item.help"
            has-feedback
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-input @blur="(e) => {item.blur && item.blur(e)}" @click="(e) => item.click && item.click(e)"
                     @change="(e) => {item.handle && item.handle(e)}" v-decorator="item.props" :type="item.type"
                     :disabled="item.disabled" :placeholder="item.placeholder"/>
          </a-form-item>
        </template>

        <div v-if="item.inputType==='textarea'" :key="index">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            class="textarea-icon"
            :label="item.label"
            has-feedback
            :extra="item.extra"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
          >
            <a-textarea v-decorator="item.props" :rows="4" :placeholder="item.placeholder" :disabled="item.disabled"/>
          </a-form-item>
        </div>

        <div v-if="item.inputType=== 'select'" :key="index">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            has-feedback
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
          >
            <a-select
              @change="(e, option) => {item.handle && item.handle(e, option)}"
              @search="selectSearch(item, $event)"
              @popupScroll="selectScroll(item, $event)"
              v-decorator="item.props"
              :mode="item.mode || 'default'"
              allowClear
              showSearch
              :labelInValue="item.labelInValue"
              :disabled="item.disabled"
              :filterOption="typeof item.fetchOptions === 'function' ? () => true : filterOption"
              :placeholder="item.placeholder">

<!--                <template slot="dropdownRender" slot-scope="menu">-->
<!--                  <v-nodes :vnodes="menu" />-->
<!--                  <div style="padding: 6px 12px 0">-->
<!--                     <a-spin v-if="isFetched"/>-->
<!--                  </div>-->
<!--                  <div v-if="typeof item.fetchOptions === 'function'" style="padding: 4px 8px;" @mousedown="e => e.preventDefault()">-->
<!--                      <a-pagination-->
<!--                       v-model="selectCurrentPage"-->
<!--                       @change="selectPageChange(item, $event)"-->
<!--                       :total="item.paginationTotal"-->
<!--                       :showTotal="total => total + ' items'"-->
<!--                       size="small"-->
<!--                       />-->
<!--                  </div>-->
<!--                </template>-->

              <a-select-option
                v-for="(el, order) of item.options"
                :key="order"
                :value="el.value">
                {{ el.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <div v-if="item.inputType=== 'treeSelect'" :key="index">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            has-feedback
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
          >
            <a-tree-select
              @change="(e) => {item.handle && item.handle(e)}"
              style="width: 100%"
              showSearch
              allowClear
              :treeCheckable="item.treeCheckable"
              :tree-data="item.options"
              treeNodeFilterProp="title"
              v-decorator="item.props"
              :placeholder='item.placeholder'
              :disabled="item.disabled"
              :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
            >
              <!-- <a-tree-select-node v-for="eve of item.options" :title='eve.label' :value='`${eve.value}`' :key='eve.value'>
                <a-tree-select-node v-if="eve.children.length" v-for="el of eve.children" :title='el.label' :value='`${el.value}`' :key='el.value'>
                  <a-tree-select-node v-if="el.children.length" v-for="part of el.children" :title='part.label' :value='`${part.value}`' :key='part.value'>
                    <a-tree-select-node v-if="part.children.length" v-for="ele of part.children" :title='ele.label' :value='`${ele.value}`' :key='ele.value'>
                      <a-tree-select-node v-if="ele.children.length" v-for="cnode of ele.children" :title='cnode.label' :value='`${cnode.value}`' :key='cnode.value'>
                      </a-tree-select-node>
                    </a-tree-select-node>
                  </a-tree-select-node>
                </a-tree-select-node>
              </a-tree-select-node> -->
            </a-tree-select>
          </a-form-item>
        </div>

        <template v-if="item.inputType=== 'cascader'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            has-feedback
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-cascader
              @change="(e, v) => {item.handle && item.handle(e, v)}"
              @click="(e, v) => {item.click && item.click(e, v)}"
              :displayRender="({ labels, selectedOptions }) => {
                item.displayRender && item.displayRender(labels, selectedOptions);
                return labels.join(' / ');
              }"
              :loadData="item.loadData"
              v-decorator="item.props"
              :options="item.options"
              :expandTrigger="item.expandTrigger || 'hover'"
              :placeholder="item.placeholder"
              :showSearch="{filter}"
              :disabled="item.disabled"
              :fieldNames="item.fieldNames || {label: 'label', value: 'value', children: 'children'}"
              :changeOnSelect="item.changeOnSelect"
              notFoundContent="无匹配结果"/>
          </a-form-item>
        </template>

        <template v-if="item.inputType==='inputNumber'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-input-number v-decorator="item.props" :min="item.min" :max="item.max"/>
            <span v-if="item.unit" class="ant-form-text">{{ item.unit }}</span>
          </a-form-item>
        </template>

        <template v-if="item.inputType==='switch'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-switch
              v-decorator="item.props"
              :checkedChildren="item.checkedChildren || '开'"
              :unCheckedChildren="item.unCheckedChildren || '关'"
              :checked="isChecked"
              @change="switchClick($event, item.handle)"
            />
          </a-form-item>
        </template>

        <template v-if="item.inputType==='checkboxGroup'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            class="checkbox-group"
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-checkbox-group
              @change="e => {item.handle && item.handle(e)}"
              v-decorator="item.props"
              :disabled="item.disabled"
              :style="{width: '100%'}"
            >
              <a-row>
                <a-col v-for="(el, order) of item.options" :key="order" :span="8">
                  <a-checkbox :value="el.value" :disabled="el.disabled">{{ el.label }}</a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-form-item>
        </template>

        <template v-if="item.inputType==='checkbox'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-checkbox v-decorator="item.props">{{ item.checkboxLabel }}</a-checkbox>
          </a-form-item>
        </template>

        <template v-if="item.inputType==='upload'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :extra="item.extra"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-upload
              @change="uploadChange"
              :beforeUpload="(file, fileList) => beforeUpload(file, fileList, item)"
              :customRequest="e => customRequest(e, item)"
              v-decorator="[item.props[0], Object.assign(item.props[1], uploadGetValue)]"
              :fileList="item.fileList"
              :remove="(e) => removeFile(item, e)"
              v-bind="item.uploadParam"
            > <!--text 、picture、picture-card-->
              <a-button icon="upload" :loading="upLoading.loading">{{ item.btnTxt || '点击上传' }}</a-button>
            </a-upload>
          </a-form-item>
        </template>

        <template v-if="item.inputType==='rangePick'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-range-picker
              v-decorator="item.props"
              format="YYYY-MM-DD"
              :disabledDate="date => item.disabledDate ? item.disabledDate(date) : false"
              :disabled="item.disabled"
            />
          </a-form-item>
        </template>

        <template v-if="item.inputType==='rangeTimePick'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-range-picker
              v-decorator="item.props"
              showTime format="YYYY-MM-DD HH:mm:ss"
              :disabledDate="date => item.disabledDate ? item.disabledDate(date) : false"
              :disabled="item.disabled"
            />
          </a-form-item>
        </template>

        <template v-if="item.inputType==='datePick'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-date-picker
              v-decorator="item.props"
              format="YYYY-MM-DD"
              :disabledDate="date => item.disabledDate ? item.disabledDate(date) : false"
              :disabled="item.disabled"
            />
          </a-form-item>
        </template>

        <template v-if="item.inputType==='dateTimePick'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-date-picker
              v-decorator="item.props"
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              :disabledDate="date => item.disabledDate ? item.disabledDate(date) : false"
              :disabled="item.disabled"
            />
          </a-form-item>
        </template>

        <div v-if="item.inputType==='transfer'" :key="index">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
          >
            <a-transfer
              :listStyle="{ width: '43%', height: '250px' }"
              v-decorator="item.props"
              :dataSource="item.options"
              :targetKeys="targetKeys"
              :selectedKeys="selectedKeys"
              :disabled="item.disabled"
              :filterOption="transferFilter"
              @change="e => {
                transferChange(e);
                item.change && item.change(e);
              }"
              @selectChange="(sourceKeys, targetKeys) => {
                transferSelectChange(sourceKeys, targetKeys);
                item.selectChange && item.selectChange(sourceKeys, targetKeys);
              }"
              :titles="item.titles || ['Source', 'Target']"
              :render="item => item.title"
              :showSelectAll="item.hasOwnProperty('showSelectAll') ? item.showSelectAll : true"
              showSearch
            />
          </a-form-item>
        </div>

        <!--tree 搜索组件-->
        <template v-if="item.inputType=== 'treeSearch'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-else
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-input @change="(e) => treeSearchChange(e.target.value, item.options)" placeholder="搜索" allowClear
                     v-model="treeSearchContent" v-if="item.isSearch"/>
            <!--:checkedKeys="treeChecked"-->
            <a-tree
              :disabled="item.disabled"
              @check="(e) => treeCheck(e, item.props[0])"
              @expand="treeExpand"
              v-decorator="item.props"
              :expanded-keys="expandedKeys"
              :auto-expand-parent="autoExpandParent"
              :tree-data="item.options"
              v-model="defaultTree"
              checkable
            >
<!--              <template slot="title" slot-scope="{ title }">-->
<!--                <span v-if="title.indexOf(searchValue) > -1">-->
<!--                  {{ title.substr(0, title.indexOf(searchValue)) }}-->
<!--                  <span style="color: #f50">{{ searchValue }}</span>-->
<!--                  {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}-->
<!--                </span>-->
<!--                <span v-else>{{ title }}</span>-->
<!--              </template>-->
            </a-tree>
          </a-form-item>
        </template>

        <template v-if="item.inputType==='radioGroup'">
          <cardHead v-if="item.cardHead" :formItem="item" :formIndex="index"/>
          <slot v-if="item.slot && item.isShow" :name="item.slot" :formItem="item"></slot>
          <a-form-item
            v-if="!item.slot && item.isShow"
            :label="item.label"
            :labelCol="item.labelCol"
            :wrapperCol="item.wrapperCol"
            :key="index">
            <a-radio-group
              @change="e => {item.handle && item.handle(e)}"
              v-decorator="item.props"
              :disabled="item.disabled"
            >
              <a-radio v-for="(el, i) of item.options" :key="i" :value="el.value">{{ el.label }}</a-radio>
            </a-radio-group>
          </a-form-item>
        </template>
      </template>

      <div v-if="isSubmitBtn && formList.length" style="padding-bottom: 2px">
      <slot name="submitBtn">
      <a-form-item :wrapper-col="{ span: 8, offset: offset}">
        <a-button type="primary" @click="handleSubmit" size="large" :disabled="upLoading.loading" :loading="submitLoading.loading">确定</a-button>
      </a-form-item>
      </slot>
      </div>
    </a-form>
  </div>
</template>

<script>
import { addEdit, inputSearch, upload } from '../utils/mixins';
import { handleHttpMethod } from '../utils/common';
import { PLAT_FORM } from '@/utils/platform';
import store from '@/store';
import cardHead from './cardHead';

export default {
  mixins: [ addEdit, inputSearch, upload ],
  name: 'addEdit',
  components: {
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
    cardHead
  },
  props: {
    apiOrigin: {
      type: String,
      default: () => {
        if (PLAT_FORM === 'property' || PLAT_FORM === 'government') {
          return 'PHP';
        } else {
          return 'JAVA';
        }
      }
    },
    transferVal: '',
    formType: {
        type: String,
        default: () => 'unModal'
    },
    isSubmitBtn: {
      type: Boolean,
      default: () => true
    },
    initReqHandle: {
      type: Boolean,
      default: () => true
    },
    reqLoading: {
      type: Object,
      default: () => ({})
    },
    reqData: '', // 只有编辑app菜单使用到
    formData: '',
    itemLayout: {
      type: Object
    },
    formList: {
      type: Array,
      default: () => []
    },
    formKey: {
      type: Object,
      default: () => { return {}; }
    },
    addParam: {
      type: Object,
      default: () => { return {}; }
    },
    editParam: {
      type: Object,
      default: () => { return {}; }
    },
    detailParam: {
      type: Object,
      default: () => { return {}; }
    }
  },
  data () {
    return {
      flattenData: [],
      selectCurrentPage: 1,
      isFetched: false,
      treeSearchContent: '',
      expandedKeys: [],
      defaultTree: [],
      autoExpandParent: true,
      isChecked: false,
      routeArr: ['addCommunityApp', 'addStewardApp'],
      detailValues: {},
      routeQuery: '',
      btnLoading: { loading: false }
    };
  },
  computed: {
    submitLoading () {
      return (Object.keys(this.reqLoading).length && this.reqLoading) || this.btnLoading;
    },
    offset () {
      if (this.itemLayout) {
        return this.itemLayout.labelCol.span;
      }
      return this.$store.state.base_itemLayout.labelCol.span;
    }
  },
  created () {
    if (this.$route) { // 兼容没配置路由
      if (this.formType === 'unModal') { // 为新开页
        this.routeQuery = this.$route.query.id;
        this.routeQuery && this.initReqHandle && this.getDetail();
      }
    }
  },
  mounted () {
    if (this.formType !== 'unModal') { // 为弹窗
      this.routeQuery && this.initReqHandle && this.getDetail();
    }
  },
  watch: {
    transferVal (val) {
      this.targetKeys = val;
    },
    // routeQuery (newValue, oldValue) {
    //   this.routeQuery = newValue;
    //   this.getDetail();
    // }
  },
  methods: {
    /** 处理 a-select 滚动加载下一页 */
    selectScroll (item, e) {
      if (!item.fetchOptions) { return; }
      let scrollHeight = e.target.scrollHeight;
      let dropdown = document.getElementsByClassName('ant-select-dropdown-menu')[0];
      let dropdownHeight = dropdown.getBoundingClientRect().height;
      let canScrollHeight = scrollHeight - dropdownHeight;
      if (canScrollHeight - e.target.scrollTop <= 40) {
        if (this.isFetched) { return; }
        this.isFetched = true;
        if (this.selectCurrentPage < item.totalPage) {
          this.selectCurrentPage += 1;
          item.fetchOptions(this.selectCurrentPage, item.searchValue, item, true).then((data) => { // 第四个参数判断是否为滚动
            item.paginationTotal = data.total;
            item.totalPage = data.totalPage;
            setTimeout(() => {
              this.isFetched = false;
            }, 150);
          });
        }
      }
    },
    /** 下拉框 search 事件 */
    selectSearch (item, e) {
      item.searchValue = e; // 搜索值
      if (this.isFetched) { return; }
      this.isFetched = true;

      typeof item.fetchOptions === 'function' && item.fetchOptions(undefined, e, item).then((data) => {
        item.paginationTotal = data.total;
        item.totalPage = data.totalPage;

        setTimeout(() => {
           this.isFetched = false;
        }, 100);
      });
    },
    /** 下拉框分页 change 事件 */
    selectPageChange (item, pageNum) {
      item.fetchOptions(pageNum, item.searchValue, item).then((data) => {
        item.paginationTotal = data.total;
        item.totalPage = data.totalPage;
      });
    },
    handleChange (info) {
      if (info.file.status === 'done') {
        this.$message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`);
      }
    },
    /** tree check 事件 */
    treeCheck (keys, props) {
      this.form.setFieldsValue({[props]: keys});
      // let values = this.form.getFieldsValue();
    },
    /** tree expand 事件 */
    treeExpand (expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    /** tree change */
    treeSearchChange (value, options) {
      const expandedKeys = this.flattenData.map(item => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.title, options);
        }
        return null;
      }).filter((item, i, self) => item && self.indexOf(item) === i);

      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true
      });
      if (!value) {
        this.expandedKeys = ['all'];
      }
    },
    getParentKey (title, tree) {
      let parentKey;
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
          if (node.children.some(item => item.title === title)) {
            parentKey = node.key;
          } else if (this.getParentKey(title, node.children)) {
            parentKey = this.getParentKey(title, node.children);
          }
        }
      }
      return parentKey;
    },
    /** 用以展平 treeSearch 列表数据 */
    treeflattenData (data) {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        this.flattenData.push({ key: node.key, title: node.title });
        if (node.children) {
          this.treeflattenData(node.children);
        }
      }
    },
    /* 获取详情 */
    getDetail (url) {
      if (!this.detailParam.url && !url) { return; }
      this[handleHttpMethod('get', this)]({
        url: url || `${this.detailParam.url}${this.routeQuery}`,
        params: {}
      }).then(({data}) => {
        let formValues = {};
        for (let item in data) {
          if (this.formKey.hasOwnProperty(item)) {
            formValues[item] = data[item];
          }
        }
        this.handleApp(formValues); // 平台才有

        if (this.detailParam.resHandle) { // 父组件有处理数据
          let resHandleVal = this.detailParam.resHandle(data, this); // esHandle中的this可能需去掉
          if (resHandleVal) {
            formValues = {...formValues, ...resHandleVal};
          } else {
            return;
          }
        }
        this.handleFileList(formValues);
        this.textData = formValues = {...formValues, ...this.handleDate(formValues)};
        formValues = this.filterParam(formValues);
        this.$nextTick(() => {
          this.form.setFieldsValue(formValues);
        });
      });
    },
    /* 表单提交 */
    handleSubmit  () {
      this.form.validateFields((err, values) => {
        if (err) { return; }
        values = {...values};

        this.formList.forEach(item => {// 处理 upload 数据
          if (item.inputType === 'upload' && item.fileList && item.fileList.length) {
            let fileId = item.fileList.map(item => item.uid);
            const limit = (item.uploadParam || {}).limit || 1;
            fileId = limit > 1 ? fileId : fileId[0]; // 处理单张或多张
            values[item.props[0]] = fileId;
          }
        })

        if (this.apiOrigin === 'PHP') {
          for (let item in values) {
            if (Array.isArray(values[item])) {
              values[item] = values[item].join(',');
            }
          }
        }

        if (this.addParam.reqHandle) {
          let resVals = this.addParam.reqHandle(values);
          if (!resVals) {
            return;
          } else {
            values = resVals;
          }
        }
        if (this.routeArr.some(el => el === this.$route.name) && this.$route.query.id) { // 单独处理编辑app应用
          this.handleConfirm(values);
          return;
        }

        if (this.routeQuery) { // 编辑
          this[handleHttpMethod('put', this)]({
            url: `${this.editParam.url}${this.routeQuery}`,
            params: values,
            btnLoading: this.submitLoading
          }).then((res) => {
            this.$store.commit('setOptData', true);
            if (this.editParam.resHandle) {
              this.editParam.resHandle(res);
            } else {
              this.handleThen('编辑');
            }
          });
        } else { // 新增
          this[handleHttpMethod('post', this)]({
            url: this.addParam.url,
            params: values,
            btnLoading: this.submitLoading
          }).then((res) => {
            store.dispatch('delCachedRoute');

            if (this.addParam.resHandle) {
              this.addParam.resHandle(res);
            } else {
              this.handleThen('新增');
            }
          });
        }
      });
    },
    handleThen (msg) {
      this.$message.success(`${msg}成功！`);
      this.$router.go(-1);
    },
    /* 单独处理编辑app应用 */
    handleApp (formValues) {
      if (this.routeArr.some(el => el === this.$route.name)) {
        this.detailValues = {
          android: formValues.android,
          ios: formValues.ios,
          scope_type: formValues.scope_type,
          scope: formValues.scope
        };
      }
    },
    switchClick (e, handle) {
      this.isChecked = e;
      handle && handle(e);
    }
  }
};
</script>
