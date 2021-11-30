import { handleHttpMethod } from '../common';
import store from '@/store';

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
     * @param item upload当前配置项
     * @returns {boolean}
     */
    beforeUpload (file, fileList, item) {
      this.fileData = file;
      if (item && item.beforeHandle) {
        if (!item.beforeHandle(file, fileList)) { return false; }
      }

      const limit = item.uploadParam.limit || 1; // limit 限制最多上传个数
      if (item.fileList.length < limit) {
        return true;
      } else {
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
      const name = item.props && item.props[0];
      let formdata = new FormData();
      formdata.append('file', this.fileData); // 默认提交字段为file
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
        const fileId = data.file_id || data.fileId;
        item.fileList.push({
          uid: fileId,
          name: file.name,
          url: data.file_url || data.fileUrl // 3.0返回的是 data.file_url，4.0是 data
        });

        let fileObj = { [name]: fileId }; // 3.0表单提交的是file_id，4.0是 url 地址
        const limit = item.uploadParam.limit || 1;
        if (limit > 1) {
          this.fieldData.push(fileObj);
        } else {
          this.fieldData = {...this.fieldData, ...fileObj};
        }
      }).catch(() => { // 上传失败清除文件
        this.form.resetFields([name]); // 未处理多文件情况
      });
    },
    /* upload 删除文件列表 */
    removeFile (item, e) {
      let uidIndex = item.fileList.findIndex(item => item.uid === e.uid);
      item.fileList.splice(uidIndex, 1);

      let prop = item.props;
      const name = prop && prop[0];
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
      if (requireIndex >= 0 && prop[1].rules[requireIndex].required === true) { // 未处理多文件情况。如果为必填，则清空值。用户端要有完整的rules数据结构
        this.form.resetFields([name]);
      } else { // 如果为非必填，直接赋值为0
        this.fieldData[name] = '';
      }

      return true;
    },
    uploadChange (e) {}
  }
};
