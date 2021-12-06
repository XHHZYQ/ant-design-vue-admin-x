<template>
  <div>
    <div v-if="formIndex !== 0" style="height: 18px; background-color: #F3F5F8"></div>
    <div v-if="formItem.cardHead" class="ant-card-head" style="margin-bottom: 24px">
      <div class="ant-card-head-wrapper">
        <div class="ant-card-head-title">{{formItem.cardHead}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'cardHead',
  props: {
    formItem: { type: Object, default: () => ({}) },
    formIndex: { type: Number, default: () => 0 }
  },
  data () {
    return {};
  },
  created () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
