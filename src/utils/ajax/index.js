
export const ajax = (options) => {
  // serializeData(options)
  if (!options.hideLoading) {
    wx.showLoading({
      title: '加载中'
    })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: options.method,
      data: options.data,
      success: function (resp) {
        wx.hideLoading()
        resp = resp.data
        let errcode = parseInt(resp.error_code)
        if (errcode === 0) {
          resolve(resp.result)
        } else {
          wx.showToast({
            title: resp.errmsg || '未知错误',
            icon: 'none',
            duration: 2000
          })
          reject(resp)
        }
      }
    })
  })
}
