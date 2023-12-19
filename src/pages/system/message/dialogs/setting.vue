<template>
  <iot-dialog :visible="visible" :width="1000" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle" title="消息接收管理">
    <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" sticky>
      <template v-slot:handle="{ props }">
        <iot-table-handle :props="props" @handle="handle" />
      </template>
    </iot-table>
    <!-- 调整消息接收人 -->
    <bind-user-dialog ref="bindUserDialog" @confirm="refresh" />
  </iot-dialog>
</template>

<script>
import { msgInfoApi } from '@/api/wsat-service-alarm/msg-info.js';
import { popconfirm } from '@/utils/framework.js';

import BindUserDialog from './bind-user.vue';

export default {
  components: {
    BindUserDialog
  },
  data() {
    return {
      visible: false,
      data: [],
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
      { label: '消息类型', name: 'ruleName', field: 'ruleName', align: 'left' },
      {
        label: '状态',
        name: 'flag',
        field: 'flag',
        align: 'left',
        format: val => (val ? '启用' : '禁用'),
        badge: val => (val ? 'positive' : 'negative')
      },
      { label: '消息接收人', name: 'userInfoList', field: 'userInfoList', align: 'left', format: val => val.map(e => e.userName).join('；') },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: '调整消息接收人', command: 'bind' },
          { label: row => (row.flag ? '禁用' : '启用'), command: 'flag' }
        ]
      }
    ];
  },
  methods: {
    open() {
      this.onRequest(this.pagination);
      this.visible = true;
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage
      };
      msgInfoApi.pageQueryMsgRuleList(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command, row }) {
      switch (command) {
        case 'bind':
          this.$refs.bindUserDialog.open(row);
          break;
        case 'flag':
          popconfirm({
            message: `是否${row.flag ? '禁用' : '启用'}${row.ruleName}`
          }).onOk(() => {
            msgInfoApi.updateMsgRuleState({ id: row.id, flag: row.flag ? 0 : 1 }).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '操作成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'cancel':
          this.visible = false;
          break;
      }
    }
  }
};
</script>
