<template>
  <iot-dialog :visible="visible" :width="1000" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle" title="详情">
    <div class="q-pa-md">
      <table v-if="name === '操作记录'">
        <tr>
          <th>客户端ip</th>
          <td>{{ row.clientIp }}</td>
          <th>操作人员账号</th>
          <td>{{ row.optUserAccount }}</td>
        </tr>
        <tr>
          <th>用户操作模块</th>
          <td>{{ row.module }}</td>
          <th>操作类型</th>
          <td>{{ valueComputed(row.optType, 'optType') }}</td>
        </tr>
        <tr>
          <th>操作api名</th>
          <td>{{ row.logApiName }}</td>
          <th>操作api所在类</th>
          <td>{{ row.logClassName }}</td>
        </tr>
        <tr>
          <th>操作时间</th>
          <td>{{ row.optStartTimeStr }}</td>
          <th>完成时间</th>
          <td>{{ row.optEndTimeStr }}</td>
        </tr>
        <tr>
          <th>请求耗时</th>
          <td>{{ row.useTime }}</td>
          <th>操作结果</th>
          <td>{{ valueComputed(row.result, 'optResult') }}</td>
        </tr>
        <tr>
          <th>日志信息</th>
          <td colspan="3">{{ row.logMessage }}</td>
        </tr>
        <tr>
          <th>异常信息</th>
          <td colspan="3">{{ row.errorInfo }}</td>
        </tr>
      </table>
      <table v-if="name === '远程调用'">
        <tr>
          <th>发起方名称</th>
          <td>{{ row.logMethodName }}</td>
          <th>发起方所在类</th>
          <td>{{ row.logClassName }}</td>
        </tr>
        <tr>
          <th>协议类型</th>
          <td>{{ row.agreementType }}</td>
          <th>请求目标ip</th>
          <td>{{ row.reqIp }}</td>
        </tr>
        <tr>
          <th>请求目标端口</th>
          <td>{{ row.reqPort }}</td>
          <th>请求目标api</th>
          <td>{{ row.reqApiName }}</td>
        </tr>
        <tr>
          <th>请求参数值</th>
          <td>{{ row.reqParam }}</td>
          <th>远程调用请求时间</th>
          <td>{{ row.reqStartTimeStr }}</td>
        </tr>
        <tr>
          <th>调用完成时间</th>
          <td>{{ row.reqEndTimeStr }}</td>
          <th>远程调用耗时</th>
          <td>{{ row.useTime }}</td>
        </tr>
        <tr>
          <th>调用结果</th>
          <td colspan="3">{{ row.result }}</td>
        </tr>
        <tr>
          <th>解析信息</th>
          <td colspan="3">{{ row.decodeMessage }}</td>
        </tr>
        <tr>
          <th>原始日志</th>
          <td colspan="3">{{ row.logMessage }}</td>
        </tr>
        <tr>
          <th>异常信息</th>
          <td colspan="3">{{ row.errorInfo }}</td>
        </tr>
      </table>
      <table v-if="name === '设备上报'">
        <tr>
          <th>上报所在类</th>
          <td>{{ row.logMethodName }}</td>
          <th>协议类型</th>
          <td>{{ row.agreementType }}</td>
        </tr>
        <tr>
          <th>系统/设备ip</th>
          <td>{{ row.ip }}</td>
          <th>访问时间</th>
          <td>{{ row.dcTimeStr }}</td>
        </tr>
        <tr>
          <th>方法类</th>
          <td colspan="3">{{ row.logClassName }}</td>
        </tr>
        <tr>
          <th>解析信息</th>
          <td colspan="3">{{ row.decodeMessage }}</td>
        </tr>
        <tr>
          <th>原始日志</th>
          <td colspan="3">{{ row.logMessage }}</td>
        </tr>
      </table>
      <table v-if="name === '命令下发'">
        <tr>
          <th>产品名称</th>
          <td>{{ row.productName }}</td>
          <th>设备名称</th>
          <td>{{ row.deviceName }}</td>
        </tr>
        <tr>
          <th>服务标签</th>
          <td>{{ row.serviceLabel }}</td>
          <th>服务名称</th>
          <td>{{ row.serviceName }}</td>
        </tr>
        <tr>
          <th>协议</th>
          <td>{{ valueComputed(row.agreementType, 'agreementType') }}</td>
          <th>服务执行时间</th>
          <td>{{ dayjs(row.execTime).format('YYYY-MM-DD HH:mm:ss') }}</td>
        </tr>
        <tr>
          <th>执行结果</th>
          <td colspan="3">{{ valueComputed(row.status, 'optResult') }}</td>
        </tr>
        <tr>
          <th>服务参数</th>
          <td colspan="3">{{ row.serviceParamsJson }}</td>
        </tr>
        <tr>
          <th>下发命令</th>
          <td colspan="3">{{ row.downCommand }}</td>
        </tr>
        <tr>
          <th>返回结果</th>
          <td colspan="3">{{ row.resultInfo }}</td>
        </tr>
      </table>
      <table v-if="name === '系统异常'">
        <tr>
          <th>微服务名称</th>
          <td>{{ row.hostName }}</td>
          <th>异常方法名</th>
          <td>{{ row.logMethodName }}</td>
        </tr>
        <tr>
          <th>异常类名称</th>
          <td>{{ row.logClassName }}</td>
          <th>异常发生时间</th>
          <td>{{ row.occurTimeStr }}</td>
        </tr>
        <tr>
          <th>日志信息</th>
          <td colspan="3">{{ row.logMessage }}</td>
        </tr>
        <tr>
          <th>异常信息</th>
          <td colspan="3">{{ row.errorInfo }}</td>
        </tr>
      </table>
    </div>
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      visible: false,
      name: '',
      row: {},
      computed: {
        optResult: [],
        optType: [],
        agreementType: []
      }
    };
  },
  mounted() {
    extendApi.getDateItemBycodes(['optResult', 'optType', 'agreementType']).then(response => {
      this.computed.optResult = response.optResult;
      this.computed.optType = response.optType;
      this.computed.agreementType = response.agreementType;
    });
  },
  methods: {
    open(name, row) {
      this.name = name;
      this.row = row;
      this.visible = true;
    },
    handle({ command }) {
      switch (command) {
        case 'cancel':
          this.visible = false;
          break;
      }
    },
    valueComputed(val, key) {
      const item = this.computed[key].find(e => e.value === val);
      return item ? item.label : '-';
    },
    dayjs
  }
};
</script>

<style lang="scss" scoped>
table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  th {
    width: 140px;
    text-align: right;
  }
  td {
    word-break: break-all;
  }
  th,
  td {
    border: 1px rgba(0, 0, 0, 0.12) solid;
    padding: 10px 16px;
  }
}
</style>
