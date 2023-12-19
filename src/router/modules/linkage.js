import Layout from '@/layouts';

export default {
  path: '/linkage',
  component: Layout,
  children: [
    {
      path: 'device',
      name: 'linkage-device',
      component: () => import('@/pages/linkage/device')
    },
    {
      path: 'product',
      name: 'linkage-product',
      component: () => import('@/pages/linkage/product')
    },
    {
      path: 'record',
      name: 'linkage-record',
      component: () => import('@/pages/linkage/record')
    },
    {
      path: 'rule',
      name: 'linkage-rule',
      component: () => import('@/pages/linkage/rule')
    }
  ]
};
