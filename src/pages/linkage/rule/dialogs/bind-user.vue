<template>
  <iot-dialog :visible="visible" :width="1000" title="绑定已有用户" @confirm="confirm" @cancel="cancel" dense>
    <iot-table
      :data="data"
      :selected="selected"
      :columns="columns"
      :pagination="pagination"
      @request="onRequest"
      @selected="onSelected"
      selection="multiple"
    />
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { extend } from 'quasar';

export default {
  data() {
    return {
      visible: false,
      data: [],
      selected: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.columns = [
      { label: '用户名', name: 'userName', field: 'userName', align: 'left' },
      { label: '手机号', name: 'mobile', field: 'mobile', align: 'left' },
      { label: '邮箱', name: 'email', field: 'email', align: 'left' }
    ];
  },
  methods: {
    open(data) {
      this.onRequest(this.pagination);
      this.visible = true;
      this.$nextTick(() => (this.selected = data));
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        sorts: [{ fieldName: 'userIndex', direction: 'asc' }],
        filters: {
          userName: '',
          state: '',
          deptId: ''
        }
      };
      extendApi.getUser(params).then(response => {
        this.pagination.page = response.page;
        this.pagination.rowsPerPage = response.pageSize;
        this.pagination.rowsNumber = response.total;
        this.data = response.list.map(e => {
          return {
            id: e.id,
            userId: e.id,
            userAccount: e.loginName,
            userName: e.userName,
            mobile: e.phoneNum,
            email: e.email
          };
        });
        this.$store.commit('loading', false);
      });
    },
    onSelected(selected) {
      this.selected = selected;
    },
    confirm() {
      this.$emit('confirm', { name: 'bind-user', data: extend(true, [], this.selected) });
      this.cancel();
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.pagination.rowsNumber = 0;
    }
  }
};
</script>
