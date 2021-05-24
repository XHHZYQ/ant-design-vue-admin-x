import empty from '../empty';

export default {
  data () {
    return {
      cascadeParam: {},
      popupPageNum: 1,
      popupPageSize: 10
    };
  },
  methods: {
    /* 获取省市区 */
    regionSelect (index, scope = 'searchList', type = '1,2,3') {
      this.$get({
        url: 'hm/regions/treeselect',
        params: { type: type }
      }).then(({data}) => {
        let argument = arguments[0];
        if (argument && typeof argument === 'function') {
          argument(data);
        } else {
          this[scope][index].options = data;
        }
      });
    },
    /* 获取物业下拉 */
    propertySelect (index, scope = 'searchList') {
      this.$get({
        url: 'community/property/treeselect',
        params: {}
      }).then(({data}) => {
        this[scope][index].options = data;
      });
    },
    /* 获取小区下拉 */
    communitySelect (index, scope = 'searchList', isPosition) {
      this.$get({
        url: 'community/info/treeselect',
        params: {
          search: '',
          isShowPosition: isPosition || 0
        }
      }).then(({data}) => {
        let argument = arguments[0];
        if (argument && typeof argument === 'function') {
          argument(data);
        } else {
          this[scope][index].options = data;
        }
      });
    },
    /* 获取楼栋下拉 */
    buildSelect (index, cascadeParam = {}, scope = 'searchList') {
      this.$get({
        url: 'community/building/treeselect',
        params: {
          communityId: cascadeParam.communityId,
          search: ''
        }
      }).then(({data}) => {
        this[scope][index].options = data;
      });
    },
    /* 获取单元下拉 */
    unitSelect (index, cascadeParam = {}, scope = 'searchList') {
      this.$get({
        url: 'community/units/treeselect',
        params: {
          communityId: cascadeParam.communityId,
          buildingId: cascadeParam.buildingId,
          search: ''
        }
      }).then(({data}) => {
        this[scope][index].options = data;
      });
    },
    /* 获取房间下拉 */
    roomSelect (index, cascadeParam = {}, scope = 'searchList') {
      this.$get({
        url: 'community/room/treeselect',
        params: {
          communityId: cascadeParam.communityId,
          buildingId: cascadeParam.buildingId,
          unitsId: cascadeParam.unitId
        }
      }).then(({data}) => {
        this[scope][index].options = data;
      });
    },

    /* 获取位置下拉 */
    positionSelect (index, cascadeParam = {}, scope = 'searchList') {
      this.$get({
        url: 'community/position/treeselect',
        params: {
          communityId: cascadeParam.communityId,
          search: ''
        }
      }).then(({data}) => {
        this[scope][index].options = data;
      });
    },
    /* 获取设备下拉 */
    deviceSelect (index, cascadeParam = {}, scope = 'searchList') {
      console.log('cascadeParam', cascadeParam);
      this.$get({
        url: 'hm/device/treeselect',
        params: {
          positionId: cascadeParam.positionId,
          search: ''
        }
      }).then(({data}) => {
        this[scope][index].options = data;
      });
    },
    /* 获取产品分类 */
    categorySelect (index = 0, scope = 'searchList', level = 4) {
      this.$get({
        url: '/category/product/get_category_list',
        params: { level: level }
      }).then(({data}) => {
        this[scope][index].options = data;
      });
    },
    /* 小区change,联动位置列表 */
    communityChange_getPosi (index, val, scope) {
      this.cascadeParam.communityId = val;
      this.positionSelect(index, this.cascadeParam, scope);
    },
    /* 小区change,联动位置列表 */
    positionChange (index, val, scope) {
      this.cascadeParam.positionId = val;
      this.deviceSelect(index, this.cascadeParam, scope);
    },

    /* 小区change,联动楼栋列表 */
    communityChange (index, val, scope) {
      let resetKey = ['building_id', 'unit_id', 'room_id'];
      this.resetSub(resetKey);
      this.cascadeParam.communityId = val;
      this.buildSelect(index, this.cascadeParam, scope);
    },
    /* 楼栋change，联动单元列表 */
    buildingChange (index, val, scope) {
      let resetKey = ['unit_id', 'room_id'];
      this.resetSub(resetKey);
      this.cascadeParam.buildingId = val;
      this.unitSelect(index, this.cascadeParam, scope);
    },
    /* 单元change，联动房间列表 */
    unitChange (index, val, scope) {
      let resetKey = ['room_id'];
      this.resetSub(resetKey);
      this.cascadeParam.unitId = val;
      this.roomSelect(index, this.cascadeParam, scope);
    },
    /** 清除所有的子集 */
    resetSub (resetKey) {
      if (this.$refs.addEdit) { // 使用addEdit组件时，需声明ref addEdit变量
        this.$refs.addEdit.resetSubValue(resetKey);
      } else {
        empty.$emit('resetForm', resetKey);
      }
    },

    /* 会员管理下拉（会员管理模块） */
    memberManageSelect (paramArr) {
      this.$get({
        url: '/select_list/member_manage_list',
        params: {}
      }).then(({data}) => {
        paramArr.forEach((ele) => {
          this[ele.scope || 'searchList'][ele.index].options = data[ele.key];
        });
      });
    },
    /*  设备管理下拉（设备管理模块） */
    deviceManageSelect (paramArr, query) {
      this.$get({
        url: '/select_list/devices_manage_list',
        params: query
      }).then(({data}) => {
        paramArr.forEach((ele) => {
          this[ele.scope || 'searchList'][ele.index].options = data[ele.key];
        });
      });
    },
    // 根据类型获取字典下拉
    dictionarySelect (paramArr) {
      paramArr.forEach(item => {
        console.log('query', item.query);
        this.$get({
          url: `community/dict/data/dictType/${item.query}`
        }).then(({data}) => {
          // if (item.handle && typeof item.handle === 'function') {
          //   item.handle(data);
          // }
          // paramArr.forEach((ele) => {
          //   this[item.scope || 'searchList'][item.index].options = data;
          // });
          if (item.handle && typeof item.handle === 'function') {
            item.handle(data);
          } else {
            this[item.scope || 'searchList'][item.index].options = data;
          }
        });
      });
    },
    /*  物业管理下拉（物业管理模块） */
    propertyManageSelect (paramArr) {
      this.$get({
        url: '/select_list/property_manage_list',
        params: {}
      }).then(({data}) => {
        paramArr.forEach((ele) => {
          this[ele.scope || 'searchList'][ele.index].options = data[ele.key];
        });
      });
    },
    /*  运营管理下拉（运营管理模块） */
    marketingManageSelect (param) {
      this.$get({
        url: '/select_list/operate_manage_list',
        params: {}
      }).then(({data}) => {
        if (param && typeof param === 'function') {
          param(data);
        } else {
          param.forEach((ele) => {
            this[ele.scope || 'searchList'][ele.index].options = data[ele.key];
          });
        }
      });
    },
    /* 获取通用类别（晓纹接口） */
    typeSelect (params) {
      this.$get({
        url: '/get_typedesc',
        params: { type: params.query, format: params.format }
      }).then(({data}) => {
        if (params.handle && typeof params.handle === 'function') {
          params.handle(data);
        } else {
          this[params.scope || 'formList'][params.index].options = data;
        }
      });
    },
    /* 获取角色列表 */
    roleSelect (handle) {
      this.$get({
        url: '/get_roles_tree',
        params: {}
      }).then(({data}) => {
        if (typeof handle === 'function') {
          handle(data);
        }
      });
    }
  }
};
