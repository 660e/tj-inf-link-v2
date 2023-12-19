import { Dialog } from 'quasar';

export function popconfirm(config) {
  return Dialog.create({
    class: 'popconfirm-dialog',
    message: config.message || '提示',
    ok: {
      label: config.ok && config.ok.text ? config.ok.text : '确定',
      color: config.ok && config.ok.color ? config.ok.color : 'primary'
    },
    cancel: {
      label: '取消',
      color: 'white',
      textColor: 'black'
    }
  });
}
