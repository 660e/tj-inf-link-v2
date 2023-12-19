import Layout from '@/layouts';

export default {
  path: '/combination',
  component: Layout,
  children: [
    {
      path: 'group',
      name: 'combination-group',
      component: () => import('@/pages/combination/group')
    },
    {
      path: 'list',
      name: 'combination-list',
      meta: {
        keepAlive: true
      },
      component: () => import('@/pages/combination/list')
    },
    {
      path: 'list/:id',
      name: 'combination-list-monitor',
      component: () => import('@/pages/combination/list/pages/monitor.vue')
    }
  ]
};
