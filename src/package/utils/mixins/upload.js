import { handleHttpMethod } from '../common';
import store from '@/store';

export default {
  data () {
    return {
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
     * @param item upload当前配置项
     * @returns {boolean}
     */
    beforeUpload (file, fileList, item) {
      if (item && item.beforeHandle) {
        if (!item.beforeHandle(file, fileList)) { return false; }
      }

      const limit = item.uploadParam.limit || 1; // limit 限制最多上传个数
      if (item.fileList.length < limit) {
        return true;
      } else {
        // const prop = item.props && item.props[0];
        // this.form.setFields({
        //   [prop]: { value: fileList.splice(fileList.length - 1, 1), errors: new Error(`最多上传 ${limit}个 文件`) }
        // });
        this.$message.error(`最多上传 ${limit}个 文件`);
        return false;
      }
    },
    /**
     * 自定义上传事件
     * @param e 文件数据
     * @param item upload当前配置项
     */
    customRequest (e, item) {
      let formdata = new FormData();
      formdata.append('file', e.file); // 默认提交字段为file
      formdata.append('type', item.uploadParam.uploadType || 4); // 上传的文件类型
      let reqUrl;
      if (this.apiOrigin === 'JAVA') {
        reqUrl = item.uploadParam.url || store.state.uploadUrlJava;
      } else {
        reqUrl = item.uploadParam.url || store.state.uploadUrl;
      }

      this[handleHttpMethod('post', this)]({
        url: reqUrl,
        params: formdata,
        btnLoading: this.upLoading,
        config: { timeout: 200000 }
      }).then(({data}) => {
        let file = e.file;
        const fileId = data.file_id || data.fileId || data.fileUrl; // 接口返回的文件 id
        item.fileList.push({
          uid: fileId,
          name: file.name,
          url: data.file_url || data.fileUrl // 3.0返回的是 data.file_url，4.0是 data
        });
      });
    },
    /* upload 删除文件列表 */
    removeFile (item, e) {
      let uidIndex = item.fileList.findIndex(el => el.uid === e.uid);
      item.fileList.splice(uidIndex, 1);
      const prop = item.props && item.props[0];
      const files = item.fileList.length ? item.fileList : '';
      this.form.setFieldsValue({ [prop]: files });

      return true;
    },
    uploadChange (e) {}
  }
};
