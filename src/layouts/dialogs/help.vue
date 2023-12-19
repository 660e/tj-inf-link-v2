<template>
  <q-dialog v-model="visible">
    <q-stepper v-model="step" ref="stepper" alternative-labels animated header-nav>
      <q-step :name="1" title="1" prefix="1" :done="step > 1">1</q-step>
      <q-step :name="2" title="2" prefix="2" :done="step > 2">2</q-step>
      <q-step :name="3" title="3" prefix="3" :done="step > 3">3</q-step>
      <q-step :name="4" title="4" prefix="4" :done="step > 4">4</q-step>
      <q-step :name="5" title="5" prefix="5">5</q-step>
      <template v-slot:navigation>
        <q-stepper-navigation class="flex justify-between">
          <div class="flex items-center">route</div>
          <div class="q-gutter-x-md">
            <q-btn v-if="step > 1" @click="$refs.stepper.previous()" label="上一步" color="primary" flat />
            <q-btn @click="$refs.stepper.next()" color="primary" :label="step === 5 ? '关闭引导' : '下一步'" />
          </div>
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      step: 1
    };
  }
};
</script>
