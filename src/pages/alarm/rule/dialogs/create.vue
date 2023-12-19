<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" :buttons="buttons" @handle="handle" dense>
    <q-stepper v-model="step" ref="stepper" color="primary" class="col column no-shadow" animated>
      <!-- 1 -->
      <q-step :name="1" ref="forms" title="基础配置" icon="edit" :done="step > 1">
        <div class="row">
          <iot-form-item
            :value.sync="forms.ruleName"
            :validator="$v.forms.ruleName"
            label="规则名称"
            type="text"
            maxlength="32"
            class="col q-mr-md"
          />
          <iot-form-item
            :value.sync="forms.alarmTypeCode"
            :options="alarmTypeCodeOptions"
            :validator="$v.forms.alarmTypeCode"
            label="规则类型"
            type="select"
            class="col"
          />
        </div>
        <div class="row">
          <iot-form-item
            :value.sync="forms.productId"
            :options="linkageProductOptions"
            :validator="$v.forms.productId"
            @input="linkageProductInput"
            option-label="name"
            option-value="id"
            label="产品名称"
            type="select"
            class="col q-mr-md"
            filter
          />
          <iot-form-item
            :value.sync="forms.deviceId"
            :options="linkageDeviceOptions"
            @input="linkageDeviceInput"
            label="设备名称"
            type="select"
            class="col"
            filter
          />
        </div>
        <iot-form-item :value.sync="forms.alarmLevel" :options="alarmLevelOptions" label="告警级别" type="radio" />
        <iot-form-item :value.sync="forms.isIgnore" :options="isIgnoreOptions" label="是否忽略" type="radio" />
        <iot-form-item v-if="forms.isIgnore" :value.sync="forms.isHandle" :options="isHandleOptions" label="是否处理" type="radio" />
        <iot-form-item :value.sync="forms.flag" label="是否启用" type="toggle" :true-value="1" :false-value="0" />
        <iot-form-item :value.sync="surface.debounce" label="开启防抖" type="toggle" />
        <template v-if="surface.debounce">
          <iot-form-item :value.sync="forms.alarmSuppress.type" :options="alarmSuppressTypeOptions" label="防抖类型" type="radio" />
          <iot-form-item label="触发条件">
            <div class="flex items-center" style="font-size: 14px">
              <template v-if="forms.alarmSuppress.type !== 2">
                <q-input
                  v-model.number="forms.alarmSuppress.minuteTimeRange"
                  type="number"
                  min="1"
                  style="width: 70px"
                  dense
                  hide-bottom-space
                  outlined
                />
                <span style="padding-left: 10px">分钟内</span>
              </template>
              <span>发生</span>
              <template v-if="forms.alarmSuppress.type !== 1">
                <span style="padding-right: 10px">超过</span>
                <q-input
                  v-model.number="forms.alarmSuppress.alarmNumber"
                  type="number"
                  min="1"
                  style="width: 70px"
                  dense
                  hide-bottom-space
                  outlined
                />
                <span style="padding-left: 10px">次</span>
              </template>
            </div>
          </iot-form-item>
        </template>
        <div class="row">
          <iot-form-date label="生效日期" v-model="surface.date" class="col q-mr-md" range />
          <iot-form-time label="生效时间" v-model="surface.time" class="col" range />
        </div>
        <iot-form-item :value.sync="forms.ruleDescribe" label="描述" type="textarea" maxlength="100" />
      </q-step>
      <!-- 2 -->
      <q-step :name="2" title="规则配置" icon="edit" :done="step > 2">
        <div v-for="(a, i) in forms.alarmRuleConditionList" :key="i">
          <q-card>
            <q-card-section>
              <div class="flex justify-between items-center" style="font-size: 14px">
                <span>规则{{ i + 1 }}</span>
                <span v-if="forms.alarmRuleConditionList.length > 1" @click="del(forms.alarmRuleConditionList, i)">
                  <b class="cursor-pointer text-negative">删除</b>
                </span>
              </div>
              <q-separator class="q-my-md" />
              <div class="row">
                <iot-form-item
                  :value.sync="a.propertyLabel"
                  :options="propertyOptions"
                  :clearable="false"
                  @input="propertyLabelInput(a)"
                  option-label="name"
                  option-value="id"
                  label="属性名"
                  type="select"
                  class="col q-mr-md"
                />
                <iot-form-item
                  :value.sync="a.triggerCondition"
                  :options="a._o"
                  :clearable="false"
                  @input="triggerConditionInput(a)"
                  label="操作符"
                  type="select"
                  class="col"
                />
              </div>
              <div v-if="a.triggerCondition" class="row">
                <!-- fn: getTriggerConditionOptions -> a._t -->
                <iot-form-item v-if="a._t === 1" :value.sync="a._v[0]" label="触发值" type="text" class="col" />
                <div v-else-if="a._t === 2" class="col row items-center">
                  <h6 style="width: 80px; font-size: 14px; font-weight: 400; text-align: right; padding-right: 10px; line-height: 1">触发值</h6>
                  <iot-form-item :value.sync="a._v[0]" type="number" class="col" />
                  <span class="q-px-md">~</span>
                  <iot-form-item :value.sync="a._v[1]" type="number" class="col" />
                </div>
                <iot-form-item v-else-if="a._t === 3 || a._t === 4" :value.sync="a._v[0]" label="触发值" type="number" class="col" />
                <iot-form-item v-if="a._t === 3" :value.sync="a.rateTimeScope" label="时间范围" type="number" min="0" class="col q-ml-md" />
                <div v-else class="col q-ml-md"></div>
              </div>
            </q-card-section>
          </q-card>
          <div :class="[i === forms.alarmRuleConditionList.length - 1 ? 'q-pt-md' : 'q-py-md']">
            <q-btn v-if="i === forms.alarmRuleConditionList.length - 1" @click="add({ name: 'condition' })" label="添加" color="primary" />
            <q-btn-toggle
              v-else
              v-model="a.splicing"
              :options="[
                { label: 'AND', value: 'AND' },
                { label: 'OR', value: 'OR' }
              ]"
            />
          </div>
        </div>
      </q-step>
      <!-- 3 -->
      <q-step :name="3" title="通知配置" icon="edit">
        <iot-form-item :value.sync="forms.notifyList[0].notifyUserType" :options="notifyUserTypeOptions" label="通知规则" type="radio" />
        <iot-form-item :value.sync="forms.notifyList[0].notifyMethod" :options="notifyMethodOptions" label="通知方式" type="radio" />
        <template v-if="forms.notifyList[0].notifyUserType === 2">
          <iot-table-simple :data="surface.users1" :columns="columns">
            <template v-slot:handle="{ props }">
              <q-icon class="cursor-pointer text-negative" name="delete_outline" size="xs" @click="del(surface.users1, props.rowIndex)" />
            </template>
          </iot-table-simple>
          <div class="q-py-sm">
            <span class="text-primary cursor-pointer" @click="handle({ command: 'bind-user' })">绑定已有用户</span>
          </div>
          <iot-table-simple :data="surface.users2" :columns="columns">
            <template v-slot:handle="{ props }">
              <q-icon class="cursor-pointer text-negative" name="delete_outline" size="xs" @click="del(surface.users2, props.rowIndex)" />
            </template>
          </iot-table-simple>
          <div class="q-pt-sm">
            <span class="text-primary cursor-pointer" @click="handle({ command: 'add-user' })">自定义新用户</span>
          </div>
        </template>
      </q-step>
    </q-stepper>
    <!-- 绑定已有用户 -->
    <bind-user-dialog ref="bindUserDialog" @confirm="add" />
    <!-- 自定义新用户 -->
    <add-user-dialog ref="addUserDialog" @confirm="add" />
  </iot-dialog>
</template>

<script src="./create.js" />
<style src="@/pages/linkage/rule/dialogs/create.scss" lang="scss" scoped />
