import Layout from '@/layouts';

export default {
  path: '/device',
  component: Layout,
  children: [
    {
      path: 'code',
      name: 'device-code',
      component: () => import('@/pages/device/code')
    },
    {
      path: 'group',
      name: 'device-group',
      meta: {
        keepAlive: true
      },
      component: () => import('@/pages/device/group')
    },
    {
      path: 'upload',
      name: 'device-upload',
      component: () => import('@/pages/device/upload')
    },
    {
      path: 'statistics',
      name: 'device-statistics',
      component: () => import('@/pages/device/statistics')
    },
    {
      path: 'label',
      name: 'device-label',
      component: () => import('@/pages/device/label')
    },
    {
      path: 'list',
      name: 'device-list',
      meta: {
        keepAlive: true
      },
      component: () => import('@/pages/device/list')
    },
    {
      path: 'list/:id',
      name: 'device-list-details',
      component: () => import('@/pages/device/list/pages/details.vue')
    },
    {
      path: 'list/:id/child',
      name: 'device-list-child',
      meta: {
        keepAlive: true
      },
      component: () => import('@/pages/device/list/pages/child.vue')
    }
  ]
};
