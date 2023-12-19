<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar>
        <q-btn @click="collapse" icon="menu" dense flat round />
        <q-toolbar-title class="flex items-center">
          <img v-show="ui.logo.show" :src="ui.logo.src" :style="ui.logo.style" />
          <span v-show="ui.text.show" v-text="ui.text.content" :style="ui.text.style"></span>
        </q-toolbar-title>
        <div class="q-gutter-x-xs">
          <!-- <q-btn @click="$store.commit('help', true)" icon="help" dense flat round /> -->
          <q-btn icon="upload" dense flat round>
            <upload-popup />
          </q-btn>
          <q-btn :icon="badge ? 'notifications_active' : 'notifications'" dense flat round>
            <q-badge v-if="badge" :label="badge" color="red" floating rounded />
            <notifications-popup @badge="badge => (this.badge = badge)" />
          </q-btn>
          <q-btn icon="account_circle" dense flat round>
            <account-popup :account="account" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="collapsed" :width="200" bordered>
      <q-list ref="menu">
        <template v-for="m in menus">
          <q-expansion-item v-if="m.children" :key="m.id" :label="m.name" icon="m.icon" v-model="m.expand" group="group">
            <q-item v-for="s in m.children" :key="s.id" :class="{ active: s.active }" clickable v-ripple>
              <q-item-section @click="to(s)">
                <div class="flex items-center">
                  <span class="q-pl-md">{{ s.name }}</span>
                  <q-icon v-if="s.type === 'link'" name="open_in_new" class="q-ml-sm" size="16px" />
                </div>
              </q-item-section>
            </q-item>
          </q-expansion-item>
          <q-item v-else :key="m.id" :class="{ active: m.active }" clickable v-ripple>
            <q-item-section avatar><q-icon name="m.icon" /></q-item-section>
            <q-item-section @click="to(m)">
              <div class="flex items-center">
                <span>{{ m.name }}</span>
                <q-icon v-if="m.type === 'link'" name="open_in_new" class="q-ml-sm" size="16px" />
              </div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>
    <q-page-container class="flex" :class="[$q.dark.isActive ? 'q-dark' : 'bg-white']">
      <keep-alive :include="include" :exclude="exclude">
        <router-view />
      </keep-alive>
    </q-page-container>
    <!-- 帮助 -->
    <help-dialog />
  </q-layout>
</template>

<script>
import { openURL } from 'quasar';
import { flattenTree, buildTree, getUrlParams } from '@/utils/data.js';
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { systemApi } from '@/api/tdf-service-sys/system.js';
import { constantRoutes } from '@/router';

import HelpDialog from './dialogs/help.vue';
import UploadPopup from './popups/upload.vue';
import NotificationsPopup from './popups/notifications.vue';
import AccountPopup from './popups/account.vue';

export default {
  components: {
    HelpDialog,
    UploadPopup,
    NotificationsPopup,
    AccountPopup
  },
  data() {
    return {
      ui: window.$CONFIG.ui.layout,
      badge: 0,
      collapsed: this.$store.getters.collapsed,
      account: {},
      dict: [],
      menus: [],
      names: [],
      include: [],
      exclude: []
    };
  },
  mounted() {
    const p0 = sysApi.getMenuTree();
    const p1 = systemApi.userDetails();
    Promise.all([p0, p1]).then(response => {
      this.account = {
        name: response[1].userName,
        gender: Number(response[1].gender),
        login: {
          uuid: response[1].id,
          role: response[1].roleId
        }
      };
      this.$q.sessionStorage.set('account', this.account);
      this.dict = flattenTree(response[0].router).map(e => {
        return {
          id: e.id,
          pid: e.parentId,
          name: e.meta.title,
          icon: e.meta.icon,
          type: e.menuDesc,
          path: e.component,
          active: false,
          expand: false
        };
      });
      // '/device/list' -> 'device-list'
      this.names = this.dict.filter(e => e.path && e.path.indexOf('/') === 0).map(e => e.path.slice(1, e.path.length).split('/').join('-'));
      this.include = flattenTree(constantRoutes)
        .filter(e => e.meta && e.meta.keepAlive)
        .map(e => e.name);
      this.init();
    });
  },
  methods: {
    init() {
      this.dict.forEach((d, i, a) => {
        if (d.type === 'frame' && encodeURIComponent(d.path) === getUrlParams(window.location.href).path) {
          d.active = true;
        } else {
          d.active = this.$route.matched[1].path.indexOf(d.path) === 0;
        }
        if (d.active) {
          a.forEach(e => (e.expand = e.id === d.pid));
        }
      });
      this.menus = buildTree(this.dict);
    },
    to(item) {
      switch (item.type) {
        case 'menu':
          this.$router.push(item.path);
          break;
        case 'link':
          openURL(item.path);
          break;
        case 'frame':
          this.$router.push({
            name: 'frame',
            query: {
              path: item.path
            }
          });
          break;
      }
    },
    collapse() {
      this.$store.commit('collapsed', !this.collapsed);
    }
  },
  watch: {
    '$route'(to, from) {
      this.init();
      // 通过左侧菜单跳转，不缓存include页面
      if (this.names.includes(to.name)) {
        this.exclude = [from.name];
      } else {
        this.exclude = [];
      }
      // 特殊情况：产品列表-设备 -> 设备列表
      if (to.name === 'device-list' && to.query.productId) {
        this.exclude = [];
      }
    },
    '$store.state.collapsed'(n) {
      this.collapsed = n;
    }
  }
};
</script>

<style src="./index.scss" lang="scss" scoped />
