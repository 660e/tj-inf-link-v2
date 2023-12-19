import Layout from '@/layouts';

export default {
  path: '/video',
  component: Layout,
  children: [
    {
      path: 'monitor',
      name: 'video-monitor',
      component: () => import('@/pages/video/monitor')
    }
  ]
};
