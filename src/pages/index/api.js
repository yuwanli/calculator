import {ajax} from 'src/utils/ajax/index.js'
export const getData = () => {
  return new Promise((resolve, reject) => {
    ajax({
      url: 'http://web.juhe.cn:8080/finance/exchange/rmbquot',
      method: 'GET',
      data: {
        key: '7a7d785664167dbb4ca1571e12572b9f',
        type: '1'
      }
    }).then(res => {
      resolve(res)
    })
  })
}
