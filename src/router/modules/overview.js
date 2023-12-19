import Layout from '@/layouts';

export default {
  path: '/overview',
  component: Layout,
  children: [
    {
      path: 'statistics',
      name: 'overview-statistics',
      component: () => import('@/pages/device/statistics')
    },
    {
      path: 'map',
      name: 'overview-map',
      meta: {
        keepAlive: true
      },
      component: () => import('@/pages/overview/map')
    }
  ]
};
