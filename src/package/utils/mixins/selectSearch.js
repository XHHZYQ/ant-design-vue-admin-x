
export default {
  methods: {
    /* select搜索下拉项 */
    filterOption (input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) > -1;
    },
    /* 级联搜索下拉项 */
    filter (inputValue, path) {
      return (path.some(option => (option.label || option.title).toLowerCase().indexOf(inputValue.toLowerCase()) > -1));
    },
    /* 穿梭框搜索 */
    transferFilter (inputValue, option) {
      return option.title.toLowerCase().indexOf(inputValue) > -1;
    },
    /**
     * 选项在两栏之间转移时的回调函数
     * @param nextTargetKeys 事件后目标数据中有的key
     * @param direction 左移或右移操作
     * @param moveKeys 要移动的key
     */
    handleChange (nextTargetKeys, direction, moveKeys) {
      this.targetKeys = nextTargetKeys;
    }
  }
};
