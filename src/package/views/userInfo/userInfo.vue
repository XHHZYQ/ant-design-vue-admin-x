<template>
  <div class="user-center">
    <a-menu @click="select" v-model="selectedKeys" mode="inline">
      <a-menu-item key="1">基本信息</a-menu-item>
      <a-menu-item key="2">修改密码</a-menu-item>
      <!-- <a-menu-item key="3">消息通知</a-menu-item> -->
    </a-menu>

    <!--用户信息-->
    <section class="info-box" v-if="itemKey==='1'">
      <x-addEdit
        ref="form"
        class="info-form"
        :formList="userInfoList"
        :formKey="formKey"
        :addParam="addParam"
        :editParam="userEditParam"
        :detailParam="userdetailParam"
        :itemLayout="itemLayout">

        <template v-slot:submitBtn>
          <a-form-item :wrapper-col="{ span: 8, offset: 5}"><span class="info-text">修改个人信息></span></a-form-item>
          <a-form-item :wrapper-col="{ span: 8, offset: 5}">
            <a-button type="primary" size="large" @click="handleSubmit" :loading="btnLoading">确定</a-button>
          </a-form-item>
        </template>
      </x-addEdit>

      <div class="avatar">
        <div class="avatar-box">
          <img :src="avatarUrl" alt="">
        </div>
         <a-upload
          :beforeUpload="beforeUpload"
          :customRequest="customRequest"
          :fileList="[]"
          v-bind="{ accept: $store.state.imgAccept }">
          <a-button icon="upload" :loading="upLoading.loading">更换头像</a-button>
        </a-upload>
      </div>
    </section>

    <!--修改密码-->
    <x-addEdit
      ref="form"
      v-if="itemKey==='2'"
      class="pwd-form"
      :formList="formList"
      :addParam="pwdAddParam"
      :editParam="editParam"
      :itemLayout="{
        labelCol: { span: 3 },
        wrapperCol: { span: 9 }
      }">
    </x-addEdit>
  </div>
</template>
<script>
import { empty } from 'ant-design-vue-admin-x';
import CryptoJS from 'crypto-js';
import { handleHttpMethod } from '../../utils/common'

export default {
  name: 'userInfo',
  data () {
    return {
      fileData: '',
      userInfo: {},
      avatarUrl: '',
      selectedKeys: [],
      itemKey: '1',
      btnLoading: false,
      upLoading: { loading: false },
      itemLayout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 9 }
      },
      formKey: {
        userName: '',
        mobile: '',
        roleName: '',
        trueName: '',
        sex: ''
      },
      userInfoList: [
        {
          label: '账号名',
          inputType: 'text',
          options: [],
          placeholder: '',
          props: ['userName', {rules: []}]
        },
        {
          label: '手机号',
          inputType: 'text',
          options: [],
          placeholder: '',
          props: ['mobile', {rules: []}]
        },
        {
          label: '角色',
          inputType: 'text',
          options: [],
          placeholder: '',
          props: ['roleName', {rules: []}]
        },
        {
          label: '真实姓名',
          inputType: 'input',
          options: [],
          placeholder: '请输入真实姓名',
          props: ['trueName', {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: '请输入真实姓名' },
              { min: 1, max: 20, message: '真实姓名为1-20个字' }
            ]
          }]
        }
        // {
        //   label: '性别',
        //   inputType: 'select',
        //   options: this.$store.state.sexList,
        //   placeholder: '请选择性别',
        //   props: ['sex', {
        //     rules: [
        //       { required: true, message: '请选择性别' }
        //     ]
        //   }]
        // }
      ],
      addParam: {
        reqHandle: this.userReqHandle
      },
      userEditParam: {
        url: '',
        resHandle: '' // this.editResHandle
      },
      userdetailParam: {
        url: '',
        resHandle: ''
      },

      formList: [
        {
          label: '旧密码',
          inputType: 'input',
          options: [],
          placeholder: '请输入旧密码',
          type: 'password',
          props: ['oldPassword', {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: '请输入旧密码' }
              // { pattern: this.REG.passWord, message: this.MESSAGE.passWord }
            ]
          }]
        },
        {
          label: '新密码',
          inputType: 'input',
          options: [],
          placeholder: '请输入新密码',
          type: 'password',
          props: ['newPassword', {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: '请输入新密码' },
              { pattern: this.REG.passWord, message: this.MESSAGE.passWord }
            ]
          }]
        },
        {
          label: '确认密码',
          inputType: 'input',
          options: [],
          placeholder: '请输入确认密码',
          type: 'password',
          props: ['confirmPassword', {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: '请输入确认密码' },
              { pattern: this.REG.passWord, message: this.MESSAGE.passWord },
              { validator: this.samePassword }
            ]
          }]
        }
      ],
      pwdAddParam: {
        reqHandle: this.pwdReqHandle
      },
      editParam: {
        url: '/user/modify/password',
        resHandle: '' // this.editResHandle
      }
    };
  },
  watch: {
    itemKey (val) {
      this.$nextTick(() => {
        val === '1' && this.setUserInfo();
      });
    }
  },
  mounted () {
    if (this.$route.query.param === 'changePwd') {
      this.itemKey = '2';
      this.selectedKeys = ['2'];
    } else {
      this.itemKey = '1';
      this.selectedKeys = ['1'];
      this.setUserInfo();
    }
  },
  methods: {
    /* 设置用户信息值 */
    setUserInfo () {
      if (localStorage.userInfo && !Object.keys(this.userInfo).length) {
        this.userInfo = JSON.parse(localStorage.userInfo);
      }
      this.avatarUrl = this.userInfo.avatar;
      empty.$emit('setForm', this.userInfo);
    },
    /* 修改密码 */
    pwdReqHandle (parm) {
      delete parm.password;
      for (let key in parm) {
        parm[key] = CryptoJS.MD5(parm[key]).toString();
      }
      this[handleHttpMethod('put')]({
        url: '/user/editPassword',
        params: parm
      }).then((res) => {
        this.$message.success('修改成功').then((res) => {
          empty.$emit('setCacheData');
        });
      });
    },
    /* 修改用户信息 */
    userReqHandle (param) {
      this.submitUserInfo(param);
    },
    submitUserInfo (param) {
      this.btnLoading = true;
      this[handleHttpMethod('put')]({
        url: `/user/editUserInfo/${localStorage.userId}`,
        params: param
      }).then(({data}) => {
        this.btnLoading = false;
        this.avatarUrl = data.avatar;
        this.setLocal('userInfo', { ...this.userInfo, ...data });
        this.$message.success('修改成功！');
        this.$router.go(-1);
      });
    },
    /* 上传前钩子 */
    beforeUpload (file, fileList) {
      this.fileData = file;
      return true;
    },
    /* 自定义上传事件 */
    customRequest (e) {
      let formdata = new FormData();
      formdata.append('file', this.fileData);
      formdata.append('type', 1);
      this[handleHttpMethod('post')]({
        url: '/common/upload',
        params: formdata,
        btnLoading: this.upLoading,
        config: { headers: { 'Content-Type': 'multipart/form-data' } }
      }).then(({data}) => {
        this.submitUserInfo({ avatar: data.fileId });
      });
    },

    /* 详情返回处理 */
    userResHandle (res) {
      this.avatarUrl = res.avatar;
      return {};
    },
    /* 选择菜单 */
    select ({ item, key, selectedKeys }) {
      this.itemKey = key;
    },
    samePassword (rule, value, callback) {
      let pwdVal = this.$refs.form.form.getFieldsValue().newPassword;
      if (value !== pwdVal) {
        callback(new Error('两次密码不一致'));
      } else {
        callback();
      }
    },
    handleSubmit () {
      this.$refs.form.handleSubmit();
    }
  }
};
</script>

<style lang="scss" scoped>
/*用户信息*/
.user-center {
  padding: 10px 0 0 10px;
  display: flex;
  background-color: #fff;
  .ant-menu {
    width: 256px;
    height: 550px;
  }
  .info-box {
    padding: 40px 40px 0 0;
    display: flex;
    justify-content: space-between;
    width: 90%;
    .info-form {
      width: 60%;
    }
    .avatar {
      text-align: center;
      .avatar-box {
        margin-bottom: 30px;
        width: 144px;
        height: 144px;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  .pwd-form {
    padding-top: 40px;
    width: 90%;
  }
}

.info-text{
  color: #0099FF;
  cursor: pointer;
}
</style>
