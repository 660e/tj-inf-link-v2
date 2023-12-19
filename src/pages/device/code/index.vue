<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="编码管理" :buttons="[[{ label: '规则配置', icon: 'edit', command: 'edit' }]]" @handle="handle" />
    <div class="layout-content">
      <div class="layout-main">
        <div class="text-h5 text-primary text-center q-pt-xl q-pb-md">编码赋码规则</div>
        <div class="text-subtitle2 text-center q-pa-md" :class="[$q.dark.isActive ? 'bg-blue-10' : 'bg-blue-1']">{{ example.text.join('') }}</div>
        <div class="text-h5 text-primary text-center q-pt-xl q-pb-md">编码赋码实例</div>
        <div class="text-subtitle2 text-center q-pa-md" :class="[$q.dark.isActive ? 'bg-blue-10' : 'bg-blue-1']">{{ example.code.join('') }}</div>
        <div class="text-negative text-center q-pt-xl">
          当重新配置规则与之前配置规则不符合时，使用之前编码赋码规则的设备的编码赋码识别将会失效
          <br />
          <br />
          使用之前规则的设备需要更新编码赋码，请尽量在初始化时定制好编码赋码规则
        </div>
      </div>
    </div>
    <!-- 规则配置 -->
    <setting-dialog ref="settingDialog" @confirm="findDeviceCodeRule" />
  </div>
</template>

<script>
import { extend } from 'quasar';
import { deviceCodeApi } from '@/api/wsat-service-device/device-code.js';
import SettingDialog from './dialogs/setting.vue';
export default {
  components: {
    SettingDialog
  },
  data() {
    return {
      breadcrumbs: [],
      rules: [],
      props: [],
      example: {
        text: [],
        code: []
      }
    };
  },
  mounted() {
    this.breadcrumbs = [{ label: '设备管理' }, { label: '编码管理' }];
    this.findDeviceCodeRule();
  },
  methods: {
    findDeviceCodeRule() {
      this.example = {
        text: [],
        code: []
      };
      deviceCodeApi.findDeviceCodeRule().then(ruleResponse => {
        Promise.all(ruleResponse.data.map(r => deviceCodeApi.findDeviceCodeProperty(r.id))).then(propResponse => {
          this.rules = ruleResponse.data;
          this.props = propResponse;
          ruleResponse.data.forEach((r, i) => {
            switch (r.ruleType) {
              case 1:
              case 2:
                this.example.text.push(`${r.isBeginParagraph ? '-[' : '['}${r.ruleName || 'XX'}]`);
                this.example.code.push(`${r.isBeginParagraph ? '-' : ''}${propResponse[i].data.length ? propResponse[i].data[0].code : 'XX'}`);
                break;
              case 3:
                this.example.text.push(`${r.isBeginParagraph ? '-[' : '['}0001]`);
                this.example.code.push(`${r.isBeginParagraph ? '-' : ''}0001`);
                break;
            }
          });
        });
      });
    },
    handle() {
      const rules = extend(true, [], this.rules);
      const props = extend(true, [], this.props)
        .map(e => e.data)
        .flat()
        .filter(e => e);
      this.$refs.settingDialog.open(rules, props);
    }
  }
};
</script>
