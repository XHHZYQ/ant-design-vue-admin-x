
export default {
  methods: {
    /* 清除数据 */
    clearData () {
      this.$store.dispatch('FedLogOut').then(() => {
        let path = `/login?redirect=${this.$route.fullPath}`;
        this.$router.push({ path });
      });

      localStorage.clear();
      location.reload();
    }
  }
};
