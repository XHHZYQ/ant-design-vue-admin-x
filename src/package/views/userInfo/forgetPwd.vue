
<template>
  <div class="step-form forget-pwd">
    <a-steps class="steps" :current="currentStep" :status="stepStatus">
      <a-step v-for="item in steps" :key="item.title" :title="item.title" />
    </a-steps>

    <a-form class="content" :form="form">
      <template v-if="currentStep===0">
        <a-form-item v-bind="$store.state.step_ItemLayout" label="手机号" has-feedback>
          <a-input v-decorator="['phone', decoratorOptions.phone]" placeholder="请输入手机号"/>
        </a-form-item>

        <a-form-item class="row-form-item" v-bind="$store.state.step_ItemLayout" label="验证码" required>
          <a-form-item has-feedback>
            <a-input v-decorator="['smscode', decoratorOptions.smscode]" placeholder="请输入验证码"/>
          </a-form-item>
          <a-form-item>
            <a-button @click="getCode">{{second && `${second}S`}} 获取验证码</a-button>
          </a-form-item>
        </a-form-item>
      </template>

      <template v-if="currentStep===1">
        <a-form-item v-bind="$store.state.step_ItemLayout" label="密码">
          <a-input-password v-decorator="['newPassword', decoratorOptions.newPassword]" placeholder="请输入密码"/>
        </a-form-item>

        <a-form-item v-bind="$store.state.step_ItemLayout" label="确认密码">
          <a-input-password v-decorator="['confirmPassword', decoratorOptions.confirmPassword]" placeholder="请输入确认密码"/>
        </a-form-item>
      </template>

      <a-form-item :wrapper-col="{ span: 19, offset: 5 }">
        <div class="steps-action">
          <a-button v-if="currentStep < steps.length - 2" type="primary" @click="next" size="large">下一步</a-button>
          <a-button v-if="currentStep === steps.length - 2" type="primary" @click="handleSubmit" size="large">确定</a-button>
          <a-button v-if="currentStep>0" :style="{marginLeft: '8px'}" @click="prev" size="large">上一步</a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import CryptoJS from 'crypto-js';
import { handleHttpMethod } from '../../utils/common'
export default {
  name: 'forgetPwd',
  data () {
    return {
      second: '',
      mobileVal: {},
      currentStep: 0,
      stepStatus: 'process',
      steps: [{ title: '验证身份' }, { title: '重置密码' }, { title: '完成' }],
      decoratorOptions: {
        phone: {
          rules: [
            { required: true, message: '请输入手机号' },
            { pattern: this.REG.mobile, message: this.MESSAGE.mobile }
          ]
        },
        smscode: {
          rules: [{ required: true, message: '请输入验证码' }]
        },
        newPassword: {
          rules: [
            { required: true, message: '请输入密码' },
            { pattern: this.REG.passWord, message: this.MESSAGE.passWord }
          ]
        },
        confirmPassword: {
          rules: [
            {required: true, message: '请输入确认密码'},
            {validator: this.samePassword}
          ]
        }
      }
    };
  },
  beforeCreate () {
    this.form = this.$form.createForm(this);
  },
  methods: {
    /* 获取验证码 */
    getCode () {
      this.form.validateFields(['phone'], (err, values) => {
        if (err || this.second > 0) { return; }
        this[handleHttpMethod('get')]({
          url: 'userLogin/getSmsCode',
          params: { ...values, type: 0}
        }).then((res) => {
          this.$message.success('验证码获取成功！');
          this.second = 60;
          let countDown = setInterval(() => {
            if (this.second > 1) {
              this.second--;
            } else {
              clearInterval(countDown);
              this.second = '';
            }
          }, 1000);
        });
      });
    },
    /* 下一步 */
    next () {
      this.form.validateFields(['phone', 'smscode'], (err, values) => {
        if (err) {
          this.stepStatus = 'error';
          return false;
        } else {
          this.stepStatus = 'process';
          values = Object.assign(values, {type: 'forget_password'});
          this.mobileVal.phone = values.phone;
          this[handleHttpMethod('post')]({
            url: 'userLogin/checkCode',
            params: { ...values, type: 0}
          }).then((res) => {
            this.currentStep++;
          });
        }
      });
    },
    /* 上一步 */
    prev () {
      this.currentStep--;
    },
    /* 表单提交 */
    handleSubmit  () {
      this.form.validateFields((err, values) => {
        values = {...values, ...this.mobileVal};
        if (err) {
          this.stepStatus = 'error';
          return false;
        } else {
          values.newPassword = values.confirmPassword = CryptoJS.MD5(values.confirmPassword).toString();
          this.stepStatus = 'finish';
          this[handleHttpMethod('put')]({
            url: '/user/forgetPassword',
            params: values
          }).then((res) => {
            this.$message.success('重置成功！').then((res) => {
              this.openKeys = ['0'];
              this.selectedKeys = ['0-0'];
              this.userInfo = {};
              this.menuList = [];
              localStorage.clear();
              this.$router.push({ name: 'login' });
            });
          });
        }
      });
    },
    samePassword (rule, value, callback) {
      let pwdVal = this.form.getFieldValue('newPassword');
      if (value !== pwdVal) {
        callback(new Error('两次密码不一致'));
      } else {
        callback();
      }
    }
  }
};
</script>

<style lang="scss">
/*忘记密码*/
.forget-pwd {
  margin: 24px;
  padding: 24px;
  background-color: #fff;
  .content {
    width: 500px;
    .row-form-item {
      .ant-form-item:first-child {
        width:70%;
      }
    }
  }
}
/*忘记密码*/
</style>
