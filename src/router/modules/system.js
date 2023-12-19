import Layout from '@/layouts';

export default {
  path: '/system',
  component: Layout,
  children: [
    {
      path: 'dataitem',
      name: 'system-dataitem',
      meta: {
        keepAlive: true
      },
      component: () => import('@/pages/system/dataitem')
    },
    {
      path: 'dataitem/:id',
      name: 'system-dataitem-config',
      component: () => import('@/pages/system/dataitem/pages/config.vue')
    },
    {
      path: 'dept',
      name: 'system-dept',
      component: () => import('@/pages/system/dept')
    },
    {
      path: 'log',
      name: 'system-log',
      component: () => import('@/pages/system/log')
    },
    {
      path: 'menu',
      name: 'system-menu',
      component: () => import('@/pages/system/menu')
    },
    {
      path: 'message',
      name: 'system-message',
      component: () => import('@/pages/system/message')
    },
    {
      path: 'role',
      name: 'system-role',
      component: () => import('@/pages/system/role')
    },
    {
      path: 'status',
      name: 'system-status',
      component: () => import('@/pages/system/status')
    },
    {
      path: 'user',
      name: 'system-user',
      component: () => import('@/pages/system/user')
    }
  ]
};
