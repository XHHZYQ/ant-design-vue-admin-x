
export default {
  data () {
    return {
      fileData: '',
      upLoading: { loading: false }
    };
  },
  methods: {
    /* 上传前钩子 */
    beforeUpload (file, fileList, key) {
      this.fileData = file;

      let index = this.gainListIndex(this.formList, key);
      let upload = this.formList[index];
      upload && upload.beforeHandle && upload.beforeHandle(file, fileList);
      return true;
    },
    /* 自定义上传事件 */
    customRequest (e, name, url) {
      let formdata = new FormData();
      formdata.append('file', this.fileData);
      this.$post({
        url: url || this.$store.state.uploadUrl,
        params: formdata,
        btnLoading: this.upLoading,
        config: { timeout: 200000 }
      }).then(({data}) => {
        let file = e.file;
        // if (Array.isArray(data)) {
        //   data.file_id = data[0].file_id;
        // }
        let fileObj = { [name]: data };
        this.formList.forEach((el) => {
          if (el.inputType === 'upload' && el.name === name) {
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
