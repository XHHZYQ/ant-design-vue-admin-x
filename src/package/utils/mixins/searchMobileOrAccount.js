import { handleHttpMethod } from '../common'

export default {
  methods: {
    /** 手机号码 change 事件 */
    searchMobileOrAccount (e, key) {
      let url = key === 'mobile' ? (this.getByPhoneApi || '/user/getByPhone') : (this.getByUserNameApi || '/user/getByUserName');
      this[handleHttpMethod('get', this)]({
        url: url,
        params: { [key]: e.target.value }
      }).then(({ data }) => {
        const prop = key === 'mobile' ? 'userName' : 'mobile';
        let index = this.formList.findIndex(item => item.props && item.props[0] === prop);

        let propValue = this.$refs.form.form.getFieldValue(prop); // 引用位置的 ref 名称须为 form
        if (data && data[prop]) {
          if (data[prop] !== propValue) {
            this.$refs.form.form.setFieldsValue({ [prop]: data[prop] });
            if (index > -1) {
              this.formList[index].disabled = true;
              this.formList[index].extra = prop === 'userName' ? '该手机已存在对应账户名' : '该账户已存在对应手机号';
            }
          }
        } else {
          if (this.formList[index].disabled) {
            this.$refs.form.form.setFieldsValue({ [prop]: undefined });
            index > -1 && (this.formList[index].disabled = false);
          }
          this.formList[index].extra = undefined;
        }
      });
    }
  }
}
