<template>
  <q-popup-proxy>
    <div class="q-py-sm" style="width: 350px">
      <q-list v-if="notifications.length" style="max-height: 300px; overflow: auto" dense>
        <q-item v-for="(n, i) in notifications" :key="i" clickable v-ripple>
          <q-item-section>
            <q-item-label>{{ n.text }}</q-item-label>
            <q-item-label caption>{{ n.time }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="flex flex-center" style="height: 100px">暂无最新消息</div>
      <q-separator class="q-my-sm" />
      <q-list dense>
        <q-item tag="label" clickable v-ripple>
          <q-item-section>消息免打扰</q-item-section>
          <q-item-section side>
            <q-toggle v-model="dnd" @input="value => this.$q.localStorage.set('dnd', value)" dense />
          </q-item-section>
        </q-item>
        <q-item @click="to({ name: 'system-message' })" clickable v-ripple>
          <q-item-section>消息中心</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-popup-proxy>
</template>

<script>
// import dayjs from 'dayjs';
export default {
  data() {
    return {
      notifications: [],
      dnd: this.$q.localStorage.getItem('dnd'),
      timer: null
    };
  },
  mounted() {
    // this.timer = setInterval(() => {
    //   const n = {
    //     type: Math.trunc(Math.random() * 4) + 1,
    //     text: 'Lorem, ipsum dolor sit amet.',
    //     time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    //   };
    //   this.notifications.unshift(n);
    //   if (!this.$q.localStorage.getItem('dnd')) {
    //     this.$q.notify({
    //       actions: [{ label: '查看' }, { label: '已读' }, { label: '忽略' }],
    //       caption: n.time,
    //       color: n.type === 1 ? 'dark' : n.type === 2 ? 'info' : n.type === 3 ? 'warning' : n.type === 4 ? 'negative' : '',
    //       message: n.text,
    //       position: 'bottom-right',
    //       progress: true,
    //       timeout: 10000
    //     });
    //   }
    //   this.$emit('badge', this.notifications.length);
    // }, 60000);
  },
  destroyed() {
    // clearInterval(this.timer);
  },
  methods: {
    to(item) {
      this.$router.push(item);
    }
  }
};
</script>
