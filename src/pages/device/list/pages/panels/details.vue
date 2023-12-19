<template>
  <div class="q-pa-md">
    <q-expansion-item label="基本信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
      <q-list class="layout-details" style="margin: 0; padding: 8px 0" dense>
        <q-item>
          <q-item-section>设备名称：{{ device.name }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>设备sn码：{{ device.deviceSn }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>所属产品：{{ device.productName }}</q-item-section>
        </q-item>
        <!-- 2-MODBUS-TCP -->
        <template v-if="[2].includes(device.agreementType)">
          <q-item>
            <q-item-section>tcp连接方式：{{ device.tcpConnMode }}</q-item-section>
          </q-item>
        </template>
        <!-- 4-BACNET -->
        <template v-if="[4].includes(device.agreementType)">
          <q-item>
            <q-item-section>设备实例号：{{ device.instanceNumber }}</q-item-section>
          </q-item>
        </template>
        <!-- 2-MODBUS-TCP；4-BACNET；7-TCP客户端 -->
        <template v-if="[2, 4, 7].includes(device.agreementType)">
          <q-item>
            <q-item-section>服务器ip：{{ device.serverIp }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>服务器端口：{{ device.serverPort }}</q-item-section>
          </q-item>
        </template>
        <!-- 1-TCP服务端；5-HTTP/HTTPS客户端；6-UDP；8-HTTP/HTTPS服务端 -->
        <template v-if="[1, 5, 6, 8].includes(device.agreementType)">
          <q-item>
            <q-item-section>是否固定ip：{{ device.isFixedIp === 1 ? '是' : '否' }}</q-item-section>
          </q-item>
          <q-item v-if="device.isFixedIp === 1">
            <q-item-section>设备ip：{{ device.clientIp }}</q-item-section>
          </q-item>
        </template>
        <!-- 3-OPC-UA -->
        <template v-if="[3].includes(device.agreementType)">
          <q-item>
            <q-item-section>服务器地址：{{ device.endPointUrl }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>安全策略：{{ device.securityPolicy }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>安全模式：{{ device.securityMode }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>用户名：{{ device.userName }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>密码：{{ device.password }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>数字证书：{{ device.digitalrKey }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>密钥证书：{{ device.cipherKey }}</q-item-section>
          </q-item>
        </template>
        <!--  -->
        <q-item>
          <q-item-section>品牌厂商：{{ device.deviceBrand }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>设备型号：{{ device.deviceModel }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>固件版本：{{ device.firmwareVersion }}</q-item-section>
        </q-item>
        <q-item class="full-width">
          <q-item-section>数据标签：{{ device.tagname }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
    <q-expansion-item label="位置信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
      <q-list class="layout-details" style="margin: 0; padding: 8px 0" dense>
        <q-item>
          <q-item-section>位置坐标（经度）：{{ device.location ? device.location.split(',')[0] : '-' }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>位置坐标（纬度）：{{ device.location ? device.location.split(',')[1] : '-' }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>位置坐标（高度）：{{ device.location ? device.location.split(',')[2] : '-' }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>位置区域：{{ device.positionArea }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>所属范围：{{ device.positionSite }}</q-item-section>
        </q-item>
        <q-item class="full-width">
          <q-item-section>位置描述：{{ device.positionDescription }}</q-item-section>
        </q-item>
        <q-item class="full-width">
          <q-item-section>设备描述：{{ device.describe }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
    <q-expansion-item label="自定义信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
      <q-list class="layout-details" style="margin: 0; padding: 8px 0" dense>
        <q-item>
          <q-item-section>
            <iot-table-simple :data="device.kvList" :columns="columns" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
    <q-expansion-item label="运维信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
      <q-list class="layout-details" style="margin: 0; padding: 8px 0" dense>
        <q-item>
          <q-item-section>安装日期：{{ device.installationDate }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>保修起始日：{{ device.warrantyStartDate }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>保修有效期：{{ device.warrantyValidity }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>使用年限：{{ device.serviceLife }}个月</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>主管部门：{{ device.competentDepartment }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>权属单位：{{ device.ownershipUnit }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>维养单位：{{ device.maintenanceUnit }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>使用部门：{{ device.useDepartment }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>责任人：{{ device.responsible }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>施工单位：{{ device.constructionUnit }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>上次维修日期：{{ device.lastRepairDate }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>尺寸：{{ device.size }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>主要技术参数：{{ device.mainParameters }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>出厂编号：{{ device.factoryNo }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>出厂日期：{{ device.manufactureDate }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
    <q-expansion-item label="设备业务编码" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
      <q-list class="layout-details" style="margin: 0; padding: 8px 0" dense>
        <q-item>
          <q-item-section>设备业务编码：{{ device.sn }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
    <q-expansion-item label="设备分组" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
      <q-list class="layout-details" style="margin: 0; padding: 8px 0" dense>
        <q-item class="full-width">
          <q-item-section>设备分组：{{ device.groupName ? device.groupName.split(',').join('-') : '-' }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
    <q-expansion-item label="设备图片" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
      <div class="layout-details">
        <q-img
          v-for="(p, i) in [].concat(
            device.qrCode ? JSON.parse(device.qrCode) : [],
            device.equipmentPicture ? JSON.parse(device.equipmentPicture) : []
          )"
          :key="i"
          :src="p"
          :ratio="1"
          @click="zoom(p)"
          class="q-mr-md cursor-pointer"
          style="width: 200px"
        />
      </div>
    </q-expansion-item>
  </div>
</template>

<script>
import { openURL } from 'quasar';
export default {
  props: {
    device: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      columns: [
        { label: '名称', name: 'name', field: 'name', align: 'left' },
        { label: '数值', name: 'value', field: 'value', align: 'left' }
      ]
    };
  },
  methods: {
    zoom(src) {
      openURL(src);
    }
  }
};
</script>
