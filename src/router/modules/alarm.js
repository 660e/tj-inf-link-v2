import Layout from '@/layouts';

export default {
  path: '/alarm',
  component: Layout,
  children: [
    {
      path: 'rule',
      name: 'alarm-rule',
      component: () => import('@/pages/alarm/rule')
    },
    {
      path: 'status',
      name: 'alarm-status',
      component: () => import('@/pages/alarm/status')
    },
    {
      path: 'type',
      name: 'alarm-type',
      component: () => import('@/pages/alarm/type')
    }
  ]
};
