import axios from 'axios';

/**
 * 树结构扁平化
 *
 * @param  {array}  data
 * @param  {array}  keys
 * @param  {number} level
 * @return {array}
 *
 */
export function flattenTreeByKeys(data, keys, level = 0) {
  return data.reduce((accumulator, current) => {
    return [
      ...accumulator,
      keys.reduce(
        (acc, k) => {
          acc[k] = current[k];
          return acc;
        },
        { level }
      ),
      ...flattenTreeByKeys(current.children || [], keys, level + 1)
    ];
  }, []);
}

export function flattenTree(data, children = 'children') {
  return data.reduce((accumulator, current) => {
    return [...accumulator, current, ...flattenTree(current[children] || [])];
  }, []);
}

/**
 *
 */
export function buildTree(data, pid = 'pid') {
  const tree = [];
  const keys = {};
  const temp = JSON.parse(JSON.stringify(data));
  temp.forEach(e => (keys[e.id] = e));
  temp.forEach(e => {
    if (!e[pid]) {
      tree.push(e);
    }
    Object.keys(keys).forEach(k => {
      if (e.id === keys[k][pid]) {
        if (e.children) {
          e.children.push(keys[k]);
        } else {
          e.children = [keys[k]];
        }
      }
    });
  });
  return tree;
}

/**
 *
 */
export function qs(params) {
  if (isObject(params)) {
    const query = Object.keys(params).map(k => `${k}=${params[k]}`);
    return query.join('&');
  } else {
    return null;
  }
}

/**
 * 类型判断
 *
 * @param  {any}     source
 * @return {boolean}
 *
 */
export function isFunction(source) {
  return toString.call(source) === '[object Function]';
}

export function isObject(source) {
  return toString.call(source) === '[object Object]';
}

export function isArray(source) {
  return toString.call(source) === '[object Array]';
}

export function isString(source) {
  return toString.call(source) === '[object String]';
}

export function isNumber(source) {
  return toString.call(source) === '[object Number]';
}

export function isUndefined(source) {
  return toString.call(source) === '[object Undefined]';
}

export function isNull(source) {
  return toString.call(source) === '[object Null]';
}

export function isDate(source) {
  return toString.call(source) === '[object Date]';
}

export function isMath(source) {
  return toString.call(source) === '[object Math]';
}

export function isWindow(source) {
  return toString.call(source) === '[object Window]';
}

export function isBlob(source) {
  return toString.call(source) === '[object Blob]';
}

export function isBoolean(source) {
  return toString.call(source) === '[object Boolean]';
}

/**
 *
 */
export function exportFile(response, name, type) {
  let _d = document.createElement('a');
  document.body.appendChild(_d);
  _d.style.display = 'none';
  _d.href = window.URL.createObjectURL(new Blob([response], { type }));
  _d.setAttribute('download', name);
  _d.click();
  document.body.removeChild(_d);
}

/**
 *
 */
export function urlsToFiles(urls) {
  return new Promise(resolve => {
    Promise.all(urls.map(u => axios.get(u, { responseType: 'blob' }))).then(response => {
      resolve(
        response.map(b => {
          return new File([b.data], b.config.url.slice(b.config.url.lastIndexOf('/') + 1), { type: b.data.type });
        })
      );
    });
  });
}

/**
 *
 */
export function objectToLowerCase(source) {
  return Object.entries(source).reduce((accumulator, current) => {
    accumulator[current[0].toLowerCase()] = current[1];
    return accumulator;
  }, []);
}

/**
 *
 */
export function getUrlParams(url = '') {
  const params = url.split('?')[1];
  const paramsQuery = {};
  if (params) {
    params.split('&').forEach(param => {
      paramsQuery[param.split('=')[0]] = param.split('=')[1];
    });
  }
  return paramsQuery;
}

/*
 *
 */
export function average(source) {
  if (isArray(source) && source.every(e => isNumber(e))) {
    const sum = source.reduce((a, c) => a + c);
    return sum / source.length;
  }
}
