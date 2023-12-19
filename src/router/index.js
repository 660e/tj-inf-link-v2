import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

import Layout from '@/layouts';

import alarmRouter from './modules/alarm.js';
import combinationRouter from './modules/combination.js';
import deviceRouter from './modules/device.js';
import linkageRouter from './modules/linkage.js';
import overviewRouter from './modules/overview.js';
import productRouter from './modules/product.js';
import systemRouter from './modules/system.js';
import testRouter from './modules/test.js';
import videoRouter from './modules/video.js';

export const constantRoutes = [
  {
    path: '/',
    redirect: '/login',
    component: Layout,
    children: [
      {
        path: 'guide',
        name: 'guide',
        component: () => import('@/pages/guide')
      },
      {
        path: 'frame',
        name: 'frame',
        component: () => import('@/pages/frame.vue')
      },
      {
        path: 'doc',
        name: 'doc',
        component: () => import('@/pages/doc')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/login')
  },
  {
    path: '/sso',
    name: 'sso',
    component: () => import('@/login/sso.vue')
  },
  {
    path: '/license',
    name: 'license',
    component: () => import('@/login/license.vue')
  },
  alarmRouter,
  combinationRouter,
  deviceRouter,
  linkageRouter,
  overviewRouter,
  productRouter,
  systemRouter,
  ...testRouter,
  videoRouter,
  {
    path: '*',
    component: () => import('@/pages/404.vue')
  }
];

export const asyncRoutes = [{}];

const OP = Router.prototype.push;
Router.prototype.push = function push(l) {
  return OP.call(this, l).catch(e => e);
};

export default new Router({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes: constantRoutes,
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
});
