<template>
  <q-dialog v-model="visible">
    <q-card class="q-pa-md" style="width: 400px">
      <div class="q-pb-xs">添加通用标签</div>
      <q-select
        v-model="tag"
        :options="options"
        @input="tagInput"
        class="q-mb-md"
        option-label="tagname"
        option-value="id"
        dense
        hide-bottom-space
        options-dense
        outlined
      />
      <div class="q-pb-xs">已添加的标签（在标签末尾空白处单击，可添加自定义标签）</div>
      <q-select
        v-model="tags"
        @input="tagsInput"
        @new-value="newValue"
        borderless
        dense
        hide-bottom-space
        hide-dropdown-icon
        multiple
        option-label="tagname"
        option-value="id"
        use-chips
        use-input
      />
    </q-card>
  </q-dialog>
</template>

<script>
import { datalabelsApi } from '@/api/wsat-service-device/datalabels.js';

export default {
  data() {
    return {
      visible: false,
      id: null,
      tag: null,
      tags: [],
      options: []
    };
  },
  methods: {
    open(id) {
      this.id = id;
      const p0 = datalabelsApi.getlist({ pageNum: 1, pageSize: 9999 });
      const p1 = datalabelsApi.getlabelsBybeviceid(id);
      Promise.all([p0, p1]).then(response => {
        this.options = response[0].data;
        this.tags = this.options.filter(e => response[1].data.includes(e.id));
        this.visible = true;
      });
    },
    tagInput(tag) {
      if (!this.tags.some(e => e.id === tag.id)) {
        this.tags.push(tag);
        this.deviceaddlabels(this.tags.map(e => e.id));
      }
    },
    tagsInput(tags) {
      this.deviceaddlabels(tags.map(e => e.id));
    },
    deviceaddlabels(tags) {
      datalabelsApi.deviceaddlabels(this.id, tags).then(response => {
        this.$q.notify({ type: 'positive', message: `更新${response ? '成功' : '失败'}` });
        this.$emit('confirm');
      });
    },
    newValue(tag, done) {
      const params = {
        name: tag,
        username: this.$q.sessionStorage.getItem('account').name
      };
      datalabelsApi.addDatalabel(params).then(response => {
        done(response.data, 'add-unique');
      });
    }
  }
};
</script>
