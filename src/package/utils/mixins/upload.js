
export default {
  data () {
    return {
      fileData: '', // upload 提交的文件数据
      upLoading: { loading: false }
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
    }
  }
};
