import Vue from 'vue';

import L from 'leaflet';
import 'proj4leaflet';
import 'leaflet.chinatmsproviders/src/leaflet.ChineseTmsProviders.js';

import 'leaflet/dist/leaflet.css';
import '@/css/leaflet.scss';

Vue.prototype.$L = L;
