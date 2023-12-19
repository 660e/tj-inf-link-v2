<template>
  <iot-dialog :visible="visible" :width="1000" title="规则配置" @confirm="confirm" @cancel="cancel">
    <q-form>
      <q-card v-for="(rule, index) in forms" :key="index" class="q-mb-md">
        <q-card-section>
          <div class="flex justify-between items-center" style="font-size: 14px">
            <span>规则{{ index + 1 }}</span>
            <span v-if="forms.length > 1" @click="remove(forms, index)">
              <b class="cursor-pointer text-negative">删除</b>
            </span>
          </div>
          <q-separator class="q-my-md" />
          <div class="row">
            <q-toggle v-model="rule.isBeginParagraph" :true-value="1" :false-value="0" label="分隔符" dense />
            <q-input v-model="rule.ruleName" label="名称" class="q-mx-md col" dense outlined />
            <q-btn-toggle v-model="rule.ruleType" :options="ruleTypeOptions" :disable="!!rule._o.table.length" />
          </div>
          <q-separator class="q-my-md" />
          <!-- 1-固定内容 content -->
          <div v-if="rule.ruleType === 1" class="row q-gutter-x-md">
            <q-input v-model="rule._c.code" label="固定内容" class="col-2" dense outlined />
            <q-input v-model="rule._c.codeDesc" label="描述" class="col" dense outlined />
          </div>
          <!-- 2-选项 option -->
          <template v-if="rule.ruleType === 2">
            <div class="row q-gutter-x-md">
              <q-select
                v-model="rule.relationRuleId"
                :options="getRules(rule.id)"
                :disable="!!rule._o.table.length"
                label="关联规则"
                class="col-2"
                dense
                emit-value
                map-options
                options-dense
                outlined
              />
              <q-select
                v-if="rule.relationRuleId !== '0'"
                v-model="rule._o.prop"
                :options="getProps(rule.relationRuleId)"
                label="关联属性"
                class="col-2"
                dense
                emit-value
                map-options
                options-dense
                outlined
              />
              <q-input v-model="rule._o.code" label="名称" class="col-2" @blur="update" dense outlined />
              <q-input v-model="rule._o.codeDesc" label="描述" class="col" @blur="update" dense outlined />
              <q-btn @click="create(rule, 'prop')" icon="subdirectory_arrow_left" />
            </div>
            <iot-table-simple :data="rule._o.table" :columns="columns" class="q-mt-md">
              <template v-slot:handle="{ props }">
                <q-icon @click="remove(rule._o.table, props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
              </template>
            </iot-table-simple>
          </template>
          <!-- 3-自增 increment -->
          <div v-if="rule.ruleType === 3" class="row q-gutter-x-md">
            <q-select
              v-model="rule.relationRuleId"
              :options="getRules(rule.id, true)"
              label="关联规则"
              class="col-2"
              dense
              emit-value
              map-options
              options-dense
              outlined
            />
            <q-banner class="bg-grey-2 col" dense rounded>自增</q-banner>
          </div>
        </q-card-section>
      </q-card>
      <q-btn @click="create(forms, 'rule')" label="添加" color="primary" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { deviceCodeApi } from '@/api/wsat-service-device/device-code.js';
import { extend } from 'quasar';
export default {
  data() {
    return {
      visible: false,
      forms: [],
      columns: [],
      ruleTypeOptions: []
    };
  },
  mounted() {
    this.columns = [
      { label: '名称', name: 'code', field: 'code', align: 'left' },
      { label: '描述', name: 'codeDesc', field: 'codeDesc', align: 'left' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
    extendApi.getDateItemByParentcode({ code: 'ruleType' }).then(response => {
      this.ruleTypeOptions = response.map(e => ({ label: e.name, value: Number(e.code) }));
    });
  },
  methods: {
    create(data, name) {
      switch (name) {
        case 'rule':
          data.push({
            id: this.uid(),
            isBeginParagraph: 1,
            isRelation: 0,
            relationRuleId: '0',
            ruleName: '',
            rulePosition: 0,
            ruleType: 1,
            _c: { code: '', codeDesc: '' },
            _o: { disable: false, prop: '', code: '', codeDesc: '', table: [] }
          });
          break;
        case 'prop':
          data._o.table.push({
            code: data._o.code,
            codeDesc: data._o.codeDesc,
            codeRuleId: data.id,
            id: this.uid(),
            pid: data._o.prop || '-1'
          });
          data._o.prop = '';
          data._o.code = '';
          data._o.codeDesc = '';
          break;
      }
      this.update();
    },
    remove(data, index) {
      data.splice(index, 1);
      this.update();
    },
    getRules(exclude, required) {
      const options = this.forms.filter(e => e.ruleType === 2 && e.id !== exclude).map(e => ({ label: e.ruleName, value: e.id }));
      if (!required) {
        options.unshift({ label: '不关联', value: '0' });
      }
      return options;
    },
    getProps(relation) {
      return this.forms.find(e => e.id === relation)._o.table.map(e => ({ label: `${e.code}（${e.codeDesc}）`, value: e.id }));
    },
    open(rules, props) {
      this.forms = rules;
      this.forms.forEach(r => {
        r._c = { code: '', codeDesc: '' };
        r._o = { disable: false, prop: '', code: '', codeDesc: '', table: [] };
        switch (r.ruleType) {
          case 1: {
            const p = props.find(p => p.codeRuleId === r.id);
            r._c.code = p.code;
            r._c.codeDesc = p.codeDesc;
            break;
          }
          case 2:
            extend(
              r._o.table,
              props.filter(p => p.codeRuleId === r.id)
            );
            break;
        }
      });
      this.visible = true;
    },
    confirm() {
      // rules
      const rules = this.forms.map((r, i) => {
        return {
          id: r.id,
          isBeginParagraph: r.isBeginParagraph,
          isRelation: r.ruleType === 3 ? 1 : r.relationRuleId !== '0' ? 1 : 0,
          relationRuleId: r.relationRuleId,
          ruleName: r.ruleName,
          rulePosition: i,
          ruleType: r.ruleType
        };
      });
      // props
      const props = this.forms.map(r => {
        switch (r.ruleType) {
          case 1:
            return {
              code: r._c.code,
              codeDesc: r._c.codeDesc,
              codeRuleId: r.id,
              id: this.uid(),
              pid: '-1'
            };
          case 2:
            return r._o.table;
        }
      });
      // submit
      const p0 = deviceCodeApi.addDeviceCodeRule(rules);
      const p1 = deviceCodeApi.addDeviceCodeProperty(props.flat());
      Promise.all([p0, p1]).then(response => {
        if (response.every(e => e.httpCode === 200)) {
          this.$q.notify({ type: 'positive', message: '规则配置成功' });
          this.$emit('confirm');
          this.cancel();
        }
      });
    },
    cancel() {
      this.visible = false;
    },
    uid() {
      return new Date().getTime().toString();
    },
    update() {
      this.$forceUpdate();
    }
  }
};
</script>
