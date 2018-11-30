import {ajax} from 'src/utils/ajax/index.js'
export const getData = () => {
  return new Promise((resolve, reject) => {
    ajax({
      url: 'https://op.juhe.cn/onebox/exchange/query',
      method: 'GET',
      data: {
        key: '67e6ccccf58cb3dce37cae024d1da89c'
      }
    }).then(res => {
      resolve(res)
    })
  })
}
