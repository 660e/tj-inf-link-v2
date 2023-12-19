# Inf-Link 物联网平台

### 开发环境

下载[Node.js](https://nodejs.org/en/)并安装

* NodeJs：v16.20.0+
* npm：8.10.0+
* Quasar: 1.19.4+
* Vue: 2.x
* Echarts: 5.3.0+


### 安装依赖

在工程根目录下打开命令行

```bash
npm i
```

### 以开发模式启动应用程序

```bash
quasar dev
```

### 构建应用程序

```bash
quasar build
```

### 自定义配置

```javascript
var $CONFIG = {
  url: {
    // 认证接口地址，用于获取token  (注意： springboot 3.x使用oauth2)
    oauth: 'http://192.168.67.14:8884/oauth2/token',
    // ws地址
    websocket: 'ws://192.168.67.14:8084/websocket/devices/'
  },
  params: {
    // 认证参数
    oauth: {
      client_id: 'tdf-cloud-ui-vue',
      client_secret: 'swagger',
      grant_type: 'password'
    }
  },
  ui: {
    // 登录页面配置
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
      captcha: true, // 是否开启验证码
      sso: false, // 是否使用太极统一认证
      sso_role: '14962bdc26b54ee0a88923d29c9612e2' // 使用太极统一认证登录后，账号的默认权限
    },
    // 布局配置
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
  // 账号密码aes加密
  aes: {
    enable: false,
    url: '/sso/extend/slogin/token',
    key: 'Wlkj@5U4#$bXzICg',
    iv: '1234567890123456'
  }
};
```
