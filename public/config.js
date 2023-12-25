var $CONFIG = {
  url: {
    oauth: 'http://139.9.143.248:28001/oauth2/token',
    websocket: 'ws://139.9.143.248:28005/websocket/devices/'
  },
  params: {
    oauth: {
      client_id: 'tdf-cloud-ui-vue',
      client_secret: 'swagger',
      grant_type: 'password'
    }
  },
  ui: {
    login: {
      logo: {
        show: true,
        src: '/img/logo.png',
        style: {
          width: '100%'
        }
      },
      text: {
        show: false,
        content: '',
        style: {}
      },
      captcha: true,
      copyright: '太极计算机股份有限公司 © 版权所有 服务热线 010-57702888',
      sso: false,
      sso_role: '14962bdc26b54ee0a88923d29c9612e2'
    },
    layout: {
      logo: {
        show: true,
        src: '/img/inf-link.png',
        style: {
          height: '30px'
        }
      },
      text: {
        show: false,
        content: '',
        style: {}
      }
    }
  },
  aes: true,
  license: false
};
