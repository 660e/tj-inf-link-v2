<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" :buttons="buttons" @handle="handle" dense>
    <q-stepper v-model="step" ref="stepper" color="primary" class="col column no-shadow" animated>
      <!-- 1 -->
      <q-step :name="1" ref="forms" title="联动规则" icon="edit" :done="step > 1">
        <div class="row">
          <iot-form-item
            :value.sync="forms.ruleName"
            :validator="$v.forms.ruleName"
            label="场景名称"
            type="text"
            maxlength="32"
            class="col q-mr-md"
          />
          <div class="col"></div>
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
        <iot-form-item :value.sync="forms.flag" label="是否启用" type="toggle" :true-value="1" :false-value="0" />
        <iot-form-item :value.sync="surface.debounce" label="开启防抖" type="toggle" />
        <template v-if="surface.debounce">
          <iot-form-item label="触发条件">
            <div class="flex items-center" style="font-size: 14px">
              <q-input
                v-model.number="forms.alarmSuppress.minuteTimeRange"
                type="number"
                min="1"
                style="width: 70px"
                dense
                hide-bottom-space
                outlined
              />
              <span style="padding: 0 10px">分钟内发生超过</span>
              <q-input v-model.number="forms.alarmSuppress.alarmNumber" type="number" min="1" style="width: 70px" dense hide-bottom-space outlined />
              <span style="padding-left: 10px">次</span>
            </div>
          </iot-form-item>
        </template>
        <iot-form-item :value.sync="forms.ruleDescribe" label="描述" type="textarea" maxlength="100" />
      </q-step>
      <!-- 2 -->
      <q-step :name="2" title="触发条件" icon="edit" :done="step > 2">
        <div v-for="(c, i) in forms.triggerConditionList" :key="i">
          <q-card>
            <q-card-section>
              <div class="flex justify-between items-center" style="font-size: 14px">
                <span>条件{{ i + 1 }}</span>
                <span v-if="forms.triggerConditionList.length > 1" @click="del(forms.triggerConditionList, i)">
                  <b class="cursor-pointer text-negative">删除</b>
                </span>
              </div>
              <q-separator class="q-my-md" />
              <div class="row">
                <iot-form-item
                  :value.sync="c.propertyLabel"
                  :options="propertyOptions"
                  :clearable="false"
                  @input="propertyLabelInput(c)"
                  option-label="name"
                  option-value="id"
                  label="属性名"
                  type="select"
                  class="col q-mr-md"
                />
                <iot-form-item
                  :value.sync="c.triggerCondition"
                  :options="c._o"
                  :clearable="false"
                  @input="triggerConditionInput(c)"
                  label="操作符"
                  type="select"
                  class="col"
                />
              </div>
              <div v-if="c.triggerCondition" class="row">
                <!-- fn: getTriggerConditionOptions -> c._t -->
                <iot-form-item v-if="c._t === 1" :value.sync="c._v[0]" label="触发值" type="text" class="col" />
                <div v-else-if="c._t === 2" class="col row items-center">
                  <h6 style="width: 80px; font-size: 14px; font-weight: 400; text-align: right; padding-right: 10px; line-height: 1">触发值</h6>
                  <iot-form-item :value.sync="c._v[0]" type="number" class="col" />
                  <span class="q-px-md">~</span>
                  <iot-form-item :value.sync="c._v[1]" type="number" class="col" />
                </div>
                <iot-form-item v-else-if="c._t === 3 || c._t === 4" :value.sync="c._v[0]" label="触发值" type="number" class="col" />
                <iot-form-item v-if="c._t === 3" :value.sync="c.rateTimeScope" label="时间范围" type="number" min="0" class="col q-ml-md" />
                <div v-else class="col q-ml-md"></div>
              </div>
            </q-card-section>
          </q-card>
          <div :class="[i === forms.triggerConditionList.length - 1 ? 'q-pt-md' : 'q-py-md']">
            <q-btn v-if="i === forms.triggerConditionList.length - 1" @click="add({ name: 'condition' })" label="添加" color="primary" />
            <q-btn-toggle
              v-else
              v-model="c.splicing"
              :options="[
                { label: 'AND', value: 'AND' },
                { label: 'OR', value: 'OR' }
              ]"
            />
          </div>
        </div>
      </q-step>
      <!-- 3 -->
      <q-step :name="3" title="执行动作" icon="edit">
        <q-card v-for="(a, i) in forms.execActionList" :key="i" class="q-mb-md">
          <q-card-section>
            <div class="flex justify-between items-center" style="font-size: 14px">
              <span>服务调用{{ i + 1 }}</span>
              <span v-if="forms.execActionList.length > 1" @click="del(forms.execActionList, i)" class="cursor-pointer text-negative">删除</span>
            </div>
            <q-separator class="q-my-md" />
            <div class="row">
              <!-- <iot-form-item :value.sync="a.actionType" :options="actionTypeOptions" label="动作类型" class="col q-mr-md" type="radio" /> -->
              <iot-form-item
                v-if="forms.productId.indexOf('LK') === -1"
                :value.sync="a.deviceId"
                :options="deviceOptions"
                :clearable="false"
                @input="deviceInput(a)"
                option-label="name"
                option-value="id"
                label="设备名称"
                type="select"
                class="col"
                filter
              />
              <div class="col q-ml-md"></div>
            </div>
            <!--
            <div class="row" v-if="a.actionType === 1">
              <iot-form-item
                :value.sync="a.propertyLabel"
                :options="propertyOptions"
                :clearable="false"
                option-label="name"
                option-value="id"
                label="属性名称"
                key="propertyLabel"
                type="select"
                class="col q-mr-md"
              />
              <iot-form-item :value.sync="a.propValue" label="属性值" type="number" min="0" class="col" />
            </div>
            -->
            <div class="row" v-if="a.actionType === 2">
              <iot-form-item
                v-if="forms.productId.indexOf('LK') === -1"
                :value.sync="a.serviceId"
                :options="a._s"
                :clearable="false"
                @input="serviceIdInput(a)"
                option-label="name"
                option-value="id"
                label="服务名称"
                key="serviceId"
                type="select"
                class="col q-mr-md"
              >
                <template v-slot:after>
                  <div @click="toProductDetail(forms.productId)" class="text-subtitle2 text-primary q-ml-sm cursor-pointer">添加服务</div>
                </template>
              </iot-form-item>
              <iot-form-item
                v-else
                :value.sync="a.serviceId"
                :options="serviceOptions"
                :clearable="false"
                @input="serviceIdInput(a)"
                option-label="name"
                option-value="id"
                label="服务名称"
                key="serviceId"
                type="select"
                class="col q-mr-md"
              >
                <template v-slot:after>
                  <div @click="$router.push({ name: 'product-list' })" class="text-subtitle2 text-primary q-ml-sm cursor-pointer">添加服务</div>
                </template>
              </iot-form-item>
              <div class="col row">
                <q-banner v-if="!a.serviceParams || !Object.keys(a.serviceParams).length" class="bg-grey-2 col" dense rounded>无服务参数</q-banner>
                <div v-else class="col q-gutter-y-md">
                  <iot-form-item v-for="(v, k) in a.serviceParams" :key="k" :value.sync="a.serviceParams[k]" :label="k" type="text" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-btn @click="add({ name: 'actions' })" label="添加" color="primary" />
        <q-separator class="q-my-md" />
        <iot-form-item :value.sync="surface.alarm" label="告警输出" type="toggle" :style="{ paddingBottom: surface.alarm ? '20px' : 0 }" />
        <template v-if="surface.alarm">
          <div class="row">
            <iot-form-item
              :value.sync="forms.sceneLinkageAlarmRuleList[0].ruleName"
              label="规则名称"
              type="text"
              maxlength="32"
              class="col q-mr-md"
            />
            <iot-form-item
              :value.sync="forms.sceneLinkageAlarmRuleList[0].alarmTypeCode"
              :options="alarmTypeCodeOptions"
              label="规则类型"
              type="select"
              class="col"
            />
          </div>
          <iot-form-item :value.sync="forms.sceneLinkageAlarmRuleList[0].alarmLevel" :options="alarmLevelOptions" label="告警级别" type="radio" />
          <iot-form-item :value.sync="forms.sceneLinkageAlarmRuleList[0].isIgnore" :options="isIgnoreOptions" label="是否忽略" type="radio" />
          <iot-form-item
            v-if="forms.sceneLinkageAlarmRuleList[0].isIgnore === 0"
            :value.sync="forms.sceneLinkageAlarmRuleList[0].isHandle"
            :options="isHandleOptions"
            label="是否处理"
            type="radio"
          />
          <iot-form-item
            :value.sync="forms.sceneLinkageAlarmRuleList[0].flag"
            :true-value="1"
            :false-value="0"
            label="是否启用"
            type="toggle"
            style="padding: 0"
          />
        </template>
        <q-separator class="q-my-md" />
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
<style src="./create.scss" lang="scss" scoped />
