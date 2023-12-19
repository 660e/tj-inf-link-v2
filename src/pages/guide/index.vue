<template>
  <div class="layout-container">
    <iot-header title="流程导图" />
    <div class="layout-content flex-center">
      <div class="grid-container">
        <div style="grid-area: a" class="flex flex-center">
          <q-btn
            @click="$router.push({ name: 'product-model', params: { create: 'create' } })"
            label="添加产品模型"
            color="indigo-1"
            text-color="primary"
            rounded
          />
        </div>
        <div style="grid-area: b" class="flex flex-center">
          <q-btn @click="$router.push({ name: 'device-group' })" label="分组管理" color="indigo-1" text-color="primary" rounded />
        </div>
        <div style="grid-area: c" class="flex flex-center column">
          <img src="@/assets/guide/c.png" style="width: 70px" class="q-mb-sm" />
          <q-btn @click="$router.push({ name: 'product-list', params: { create: 'create' } })" label="添加产品" color="primary" rounded />
        </div>
        <div style="grid-area: d" class="flex flex-center column">
          <img src="@/assets/guide/d.png" style="width: 70px" class="q-mb-sm" />
          <q-btn @click="$router.push({ name: 'product-list' })" label="发布产品" color="primary" rounded />
        </div>
        <div style="grid-area: e" class="flex flex-center column">
          <img src="@/assets/guide/e.png" style="width: 70px" class="q-mb-sm" />
          <q-btn @click="$router.push({ name: 'device-list', params: { create: 'create' } })" label="添加设备" color="primary" rounded />
        </div>
        <div style="grid-area: f" class="flex flex-center column">
          <img src="@/assets/guide/f.png" style="width: 70px" class="q-mb-sm" />
          <q-btn @click="$router.push({ name: 'device-list' })" label="启用设备" color="primary" rounded />
        </div>
        <div style="grid-area: g" class="flex flex-center column">
          <img src="@/assets/guide/g.png" style="width: 70px" class="q-mb-sm" />
          <q-btn label="定义物模型" color="indigo-1" text-color="primary" rounded />
        </div>
        <div style="grid-area: h" class="flex flex-center column">
          <img src="@/assets/guide/h.png" style="width: 70px" class="q-mb-sm" />
          <q-btn @click="$router.push({ name: 'combination-list' })" label="绑定感知对象" color="indigo-1" text-color="primary" rounded />
        </div>
        <div style="grid-area: i" class="flex justify-center items-start">
          <q-btn @click="$router.push({ name: 'alarm-rule' })" label="告警规则" color="indigo-1" text-color="primary" rounded />
        </div>
        <div style="grid-area: j" class="flex justify-center items-start">
          <q-btn @click="$router.push({ name: 'linkage-rule' })" label="场景联动规则" color="indigo-1" text-color="primary" rounded />
        </div>
        <div style="grid-area: o; height: 100px" class="flex flex-center"><em class="arrow vertical"></em></div>
        <div style="grid-area: p; height: 100px" class="flex flex-center"><em class="arrow vertical"></em></div>
        <div style="grid-area: q; width: 100px" class="flex justify-center items-end q-pb-md"><em class="arrow horizontal"></em></div>
        <div style="grid-area: r; width: 300px" class="flex justify-center items-end q-pb-md"><em class="arrow horizontal"></em></div>
        <div style="grid-area: s; width: 100px" class="flex justify-center items-end q-pb-md"><em class="arrow horizontal"></em></div>
        <div style="grid-area: t; height: 200px" class="flex flex-center"><em class="arrow vertical flip-vertical"></em></div>
        <div style="grid-area: u; height: 200px" class="flex flex-center"><em class="arrow vertical flip-vertical"></em></div>
        <div style="grid-area: v; height: 100px" class="relative-position">
          <div class="dashed-1"></div>
          <div class="dashed-2"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./index.scss" lang="scss" scoped />
