import Layout from '@/layouts';

export default {
  path: '/product',
  component: Layout,
  children: [
    {
      path: 'classification',
      name: 'product-classification',
      component: () => import('@/pages/product/classification')
    },
    {
      path: 'list',
      name: 'product-list',
      meta: {
        keepAlive: true
      },
      component: () => import('@/pages/product/list')
    },
    {
      path: 'list/:id',
      name: 'product-list-details',
      component: () => import('@/pages/product/list/pages/details.vue')
    },
    {
      path: 'model',
      name: 'product-model',
      component: () => import('@/pages/product/model')
    },
    {
      path: 'model/:id',
      name: 'product-model-attribute',
      component: () => import('@/pages/product/model/pages/attribute.vue')
    },
    {
      path: 'plugin',
      name: 'product-plugin',
      component: () => import('@/pages/product/plugin')
    },
    {
      path: 'mib',
      name: 'product-mib',
      component: () => import('@/pages/product/mib')
    }
  ]
};
