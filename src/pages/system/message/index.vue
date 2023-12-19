<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="消息中心" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar :buttons="[{ label: '消息接收管理', command: 'setting' }]" @handle="handle" @refresh="refresh" />
        <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 消息接收管理 -->
    <setting-dialog ref="settingDialog" />
    <!-- 详情 -->
    <details-dialog ref="detailsDialog" />
  </div>
</template>

<script>
import { msgInfoApi } from '@/api/wsat-service-alarm/msg-info.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';
import dayjs from 'dayjs';

import SettingDialog from './dialogs/setting.vue';
import DetailsDialog from './dialogs/details.vue';

export default {
  components: {
    SettingDialog,
    DetailsDialog
  },
  data() {
    return {
      breadcrumbs: [{ label: '系统管理' }, { label: '消息中心' }],
      fields: [],
      filters: {},
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
    this.fields = [{ label: '标题', key: 'title', type: 'input' }];
    this.columns = [
      { label: '标题', name: 'title', field: 'title', align: 'left' },
      { label: '时间', name: 'occurTime', field: 'occurTime', align: 'left', format: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss') },
      { label: '类型', name: 'msgType', field: 'msgType', align: 'left' },
      {
        label: '状态',
        name: 'isRead',
        field: 'isRead',
        align: 'left',
        format: val => (val ? '已读' : '未读'),
        badge: val => (val ? 'positive' : 'negative')
      },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: row => (row.isRead ? '标记为未读' : '标记为已读'), command: 'mark' },
          { label: '详情', command: 'details' },
          { label: '删除', command: 'remove', color: 'negative' }
        ]
      }
    ];
    extendApi.getDateItemBycodes(['msgType']).then(response => {
      this.columns.find(e => e.name === 'msgType').format = val => {
        return response.msgType.find(e => e.value === val) ? response.msgType.find(e => e.value === val).label : '-';
      };
      this.onRequest(this.pagination);
    });
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      msgInfoApi.MsgInfoQuery(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command, row }) {
      switch (command) {
        case 'setting':
          this.$refs.settingDialog.open();
          break;
        case 'mark':
          popconfirm({
            message: `是否将${row.title}标记为${row.isRead ? '未读' : '已读'}`
          }).onOk(() => {
            msgInfoApi.updateMsgInfoVo({ id: row.id, isRead: row.isRead ? 0 : 1 }).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '操作成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'details':
          this.$refs.detailsDialog.open(row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.title}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            msgInfoApi.deleteMsgInfoVo(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.refresh();
              }
            });
          });
          break;
      }
    }
  }
};
</script>
