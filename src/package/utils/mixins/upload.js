
export default {
  data () {
    return {
      fileData: '', // upload 提交的文件数据
      upLoading: { loading: false },
      uploadGetValue: {
        getValueFromEvent (e) {
          if (Array.isArray(e)) { return e; }
          return e && e.fileList;
        }
      }
    };
  },
  methods: {
    /**
     * 上传前钩子
     * @param file
     * @param fileList
     * @param key props字段
     * @returns {boolean}
     */
    beforeUpload (file, fileList, key) {
      this.fileData = file;

      let index = this.gainListIndex(this.formList, key);
      let upload = this.formList[index];
      if (upload && upload.beforeHandle) {
        if (!upload.beforeHandle(file, fileList)) { return false; }
      }

      return true;
    },
    /**
     * 自定义上传事件
     * @param e 文件数据
     * @param name 字段名
     * @param url 上传的url
     */
    customRequest (e, name, url) {
      let formdata = new FormData();
      formdata.append('file', this.fileData); // 默认提交字段为file
      this.$post({
        url: url || this.$store.state.uploadUrl,
        params: formdata,
        btnLoading: this.upLoading,
        config: { timeout: 200000 }
      }).then(({data}) => {
        let file = e.file;

        let fileObj = { [name]: data };
        this.formList.forEach((el) => {
          if (el.inputType === 'upload' && (el.props && el.props[0] === name)) {
            el.fileList = [{
              uid: file.uid,
              name: file.name,
              url: data
            }];
          }
        });
        this.fieldData = {...this.fieldData, ...fileObj};
      }).catch(() => { // 上传失败清除文件
        this.form.resetFields([name]);
      });
    },
    /* upload 删除文件列表 */
    removeFile (name, e) {
      this.formList.forEach((el, index) => {
        let field = el.props && el.props[0];
        if (el.inputType === 'upload' && field === name) {
          let prop = el.props;
          let requireIndex = -1;
          prop &&
          prop[1] &&
          prop[1].hasOwnProperty('rules') &&
          prop[1].rules.length &&
          prop[1].rules.forEach((item, index) => {
            if (item.hasOwnProperty('required')) {
              requireIndex = index;
            }
          });
          if (requireIndex >= 0 && prop[1].rules[requireIndex].required === true) { // 如果为必填，则清空值。用户端要有完整的rules数据结构
            this.form.resetFields([name]);
          } else { // 如果为非必填，直接赋值为0
            this.fieldData[name] = '';
          }
          el.fileList = [];
        }
      });

      return true;
    }
  }
};
