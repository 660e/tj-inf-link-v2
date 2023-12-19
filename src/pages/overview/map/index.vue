<template>
  <div class="col flex relative-position">
    <div id="map" class="col"></div>
    <div class="hidden" v-if="!loading">
      <popup v-for="(o, i) in objects" :key="i" :dict="dict" :type="type" :object="o" />
    </div>
    <q-btn v-if="!aside" @click="aside = true" class="absolute" color="primary" icon="list" style="top: 10px; right: 10px; z-index: 999" round />
    <transition name="fade" mode="out-in">
      <div v-show="aside" class="glassy rounded-borders shadow-3 fixed absolute flex q-pt-md" style="width: 350px; right: 10px; bottom: 10px">
        <div class="col q-gutter-y-md flex column">
          <div class="q-px-md flex justify-between">
            <q-btn
              :label="`筛选（${devices.length}）`"
              :loading="loading"
              :icon="filter ? 'navigate_next' : 'navigate_before'"
              @click="filter = !filter"
              align="left"
              class="text-primary q-pr-sm"
              dense
              outline
            >
              <template v-slot:loading>
                <q-spinner-dots />
              </template>
            </q-btn>
            <q-btn
              @click="
                aside = false;
                filter = false;
              "
              label="收起"
              icon-right="navigate_next"
              align="right"
              class="text-primary q-pl-sm"
              dense
              outline
            />
          </div>
          <div v-if="type === 1" class="q-px-md flex q-gutter-x-sm">
            <q-card v-for="o in overview" :key="o.key" class="col flex flex-center column">
              <div :class="`text-${o.color}`" class="text-subtitle2">{{ o.value !== null ? o.value : '...' }}</div>
              <div>{{ o.label }}</div>
            </q-card>
          </div>
          <q-scroll-area :thumb-style="{ width: '6px', borderRadius: '3px' }" class="col">
            <q-list dense>
              <q-item v-for="d in devices" :key="d.id" @click="view(d)" clickable v-ripple>
                <q-item-section>
                  <div class="flex justify-between">
                    <div class="flex q-gutter-x-sm items-center">
                      <q-icon name="devices" size="16px" :color="color(d.onlineStatus)[0]" />
                      <span class="ellipsis" style="max-width: 260px">{{ d.name }}</span>
                      <q-icon v-if="latlng(d.location)" name="location_on" size="16px" color="grey-7" />
                      <q-icon v-else-if="area(d.positionDescription)" name="change_history" size="16px" color="grey-7" />
                    </div>
                    <q-icon @click="to(d)" name="info_outline" size="16px" color="primary" />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </div>
      </div>
    </transition>
    <transition name="fade" mode="out-in">
      <filters v-show="filter" @search="search" style="width: 250px; right: 370px" />
    </transition>
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { isArray, average } from '@/utils/data.js';

import markerBlue from '@/assets/map/marker-blue.svg';
import markerDark from '@/assets/map/marker-dark.svg';
import markerGreen from '@/assets/map/marker-green.svg';
import markerGrey from '@/assets/map/marker-grey.svg';
import markerRed from '@/assets/map/marker-red.svg';
import markerShadow from '@/assets/map/marker-shadow.svg';

import popup from './components/popup.vue';
import filters from './components/filters.vue';

export default {
  name: 'overview-map',
  components: {
    popup,
    filters
  },
  data() {
    return {
      map: null,
      Icon: this.$L.Icon.extend({
        options: {
          iconSize: [25, 41],
          iconAnchor: [12.5, 41],
          shadowUrl: markerShadow,
          shadowSize: [41, 41]
        }
      }),
      dict: {},
      type: null,
      overview: [
        { key: 'totalDeviceNum', label: '总数', color: 'primary' },
        { key: 'curOnlineDeviceNum', label: '在线', color: 'primary' },
        { key: 'openDeviceNum', label: '启用', color: 'primary' },
        { key: 'closeDeviceNum', label: '未启用', color: 'negative' },
        { key: 'curOfflineDeviceNum', label: '离线', color: 'grey' }
      ],
      loading: false,
      aside: true,
      filter: false,
      devices: [],
      objects: []
    };
  },
  mounted() {
    extendApi.getDateItemBycodes(['onlineStatus']).then(response => (this.dict = response));
    this.map = this.$L
      .map('map', {
        center: [39.91328, 116.403931],
        zoom: 11
      })
      .addLayer(this.$L.tileLayer.chinaProvider('GaoDe.Normal.Map'));
  },
  methods: {
    search({ filters, type }) {
      this.clear();
      this.loading = true;
      this.type = type;
      switch (type) {
        case 1: {
          const p0 = devicesApi.statistics();
          const p1 = devicesApi.getDevicesList({ pageNum: 1, pageSize: 0, ...filters });
          Promise.all([p0, p1]).then(response => {
            this.overview.forEach(e => (e.value = response[0].data[e.key]));
            this.marker(response[1].data);
            this.polygon(response[1].data);
          });
          break;
        }
        case 2:
          perceivedApi.getPerceived({ pageNum: 1, pageSize: 999, ...filters }).then(response => {
            this.marker(
              response.data.map(e => {
                e.location = e.position;
                return e;
              })
            );
          });
          break;
      }
    },
    marker(data) {
      this.devices = data;
      this.objects = this.devices
        .filter(d => this.latlng(d.location))
        .map(d => {
          const marker = this.$L
            .marker(this.latlng(d.location), {
              icon: new this.Icon({ iconUrl: this.color(d.onlineStatus)[1] })
            })
            .addTo(this.map);
          return {
            device: d,
            marker
          };
        });
      this.loading = false;
    },
    polygon(data) {
      data.forEach(e => {
        if (this.area(e.positionDescription)) {
          this.$L.polygon(this.area(e.positionDescription).scope).addTo(this.map);
        }
      });
    },
    view(device) {
      if (this.latlng(device.location)) {
        this.map.setView(this.latlng(device.location));
      } else if (this.area(device.positionDescription)) {
        this.map.setView(this.area(device.positionDescription).center);
      }
    },
    clear() {
      this.overview.forEach(e => (e.value = null));
      this.devices = [];
      this.objects.forEach(o => o.marker.remove());
    },
    latlng(location) {
      if (location) {
        const [lat, lng] = location.split(',').map(l => Number(l));
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 ? [lat, lng] : false;
      } else {
        return false;
      }
    },
    area(area) {
      let scope;
      try {
        scope = JSON.parse(`[${area}]`);
      } catch {
        return false;
      }
      if (scope && scope.every(e => isArray(e)) && scope.length > 2) {
        return {
          scope: [scope],
          center: [average(scope.map(e => e[0])), average(scope.map(e => e[1]))]
        };
      } else {
        return false;
      }
    },
    color(status) {
      switch (status) {
        case 0:
          return ['red', markerRed];
        case 1:
          return ['green', markerGreen];
        case 2:
          return ['grey', markerGrey];
        case 3:
          return ['dark', markerDark];
        default:
          return ['blue', markerBlue];
      }
    },
    to(device) {
      switch (this.type) {
        case 1:
          this.$router.push({
            name: 'device-list-details',
            params: {
              id: device.id
            },
            query: {
              type: 'config',
              label: device.label,
              tab: 1,
              from: 'overview-map'
            }
          });
          break;
        case 2:
          this.$router.push({
            name: 'combination-list-monitor',
            params: {
              id: device.id
            },
            query: {
              tab: 1,
              from: 'overview-map'
            }
          });
          break;
      }
    }
  }
};
</script>

<style src="./index.scss" lang="scss" scoped />
