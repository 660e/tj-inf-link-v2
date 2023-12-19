<template>
  <iot-dialog :visible="visible" :width="1000" title="调整消息接收人" @confirm="confirm" @cancel="cancel" dense>
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
import { msgInfoApi } from '@/api/wsat-service-alarm/msg-info.js';
import { extend } from 'quasar';

export default {
  data() {
    return {
      visible: false,
      row: {},
      data: [],
      selected: [],
      columns: [],
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      }
    };
  },
  mounted() {
    this.columns = [
      { label: '用户名', name: 'userName', field: 'userName', align: 'left' },
      { label: '手机号', name: 'phoneNum', field: 'phoneNum', align: 'left' },
      { label: '邮箱', name: 'email', field: 'email', align: 'left' }
    ];
  },
  methods: {
    open(row) {
      this.onRequest(this.pagination);
      this.visible = true;
      this.row = extend(true, {}, row);
      this.$nextTick(() => {
        this.selected = row.userInfoList.map(e => {
          e.id = e.userId;
          return e;
        });
      });
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
      this.row.userInfoList = this.selected.map(e => {
        return {
          userId: e.userId,
          userAccount: e.userAccount,
          userName: e.userName,
          mobile: e.mobile,
          email: e.email
        };
      });
      msgInfoApi.updateMsgRule(this.row).then(response => {
        if (response) {
          this.$q.notify({ type: 'positive', message: '更新成功' });
          this.$emit('confirm');
          this.cancel();
        }
      });
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.pagination.rowsNumber = 0;
    }
  }
};
</script>
