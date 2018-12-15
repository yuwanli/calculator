<template>
  <div class="container" >
    <swiper class="adv"  v-if="imgUrls.length > 0" circular="true" autoplay="true" interval="5000" duration="500" indicatorDots="true" indicator-active-color="#f21818">
      <block v-for="item in imgUrls" v-bind:key="item.id">
        <swiper-item class="advItem">
          <image mode="aspectFill" :src="item.img" @click="adClick(item)" class="adv-image"/>
        </swiper-item>
      </block>
    </swiper>
    <div class="title">
      <div class="title-left">中行折算价</div>
      <div class="title-right">更新时间：{{updateTime}}</div>
    </div>
    <div class="tool" v-for="item in data" v-bind:key="item.id" @click="toIndex(item.name)">
      <image mode="aspectFill" class="tool-img" :src="item.img"></image>
      <div class="tool-name">{{item.name|| '人名币'}}</div>
      <div class="tool-label">{{item.label}}</div>
      <div class="tool-value">{{item.bankConversionPri}}</div>
    </div>
  </div>
</template>

<script>
import {getData} from '../api.js'
import baseInfo from '../base.js'
export default {
  data () {
    return {
      active: '',
      before: '人民币',
      after: '美元',
      data: {
        '人民币': {
          img: '/assets/images/zg.png'
        },
        '美元': {
          img: '/assets/images/mg.png'
        }
      },
      array: [],
      beforeIndex: 0,
      afterIndex: 0,
      updateTime: '',
      imgUrls: [],
      openId: ''
    }
  },
  created () {
    wx.cloud.init({
      traceUser: true
    })
    const db = wx.cloud.database()
    db.collection('ads').get().then(res => {
      this.imgUrls = res.data
    })
    wx.cloud.callFunction({
      name: 'getUserInfo',
      complete: res => {
        this.openId = res.result.OPENID
      }
    })
    this.init()
  },
  methods: {
    toIndex (str) {
      wx.navigateTo({
        url: `/pages/index/main?name=${str}`
      })
    },
    getValue (n) {
      return (+n).toFixed(2)
    },
    adClick (item) {
      wx.reportAnalytics('ad_click', {
        id: item.id,
        adv_name: item.name,
        open_id: this.openId
      })
      wx.showToast({
        title: item.url,
        icon: 'none',
        duration: 2000
      })
    },
    init () {
      getData().then(res => {
        this.updateTime = res.update
        res = this.formatData(res.list)
        let result = {}
        let array = []
        for (let i in res) {
          if (baseInfo[i]) { // 存在在base表中的返回
            res[i].bankConversionPri = (+res[i].bankConversionPri).toFixed(2)
            result[i] = {
              ...res[i],
              ...baseInfo[i]
            }
            array.push(i)
          }
        }
        this.data = result
        this.array = array
        this.afterIndex = this.array.indexOf(this.after)
        this.beforeIndex = this.array.indexOf(this.before)
        // wx.setStorageSync('calcu_data', JSON.stringify(this.data))
        // wx.setStorageSync('calcu_array', JSON.stringify(this.array))
        // wx.setStorageSync('calcu_update', JSON.stringify(this.updateTime))
      })
    },
    formatData (res) {
      let result = {}
      res.forEach(val => {
        result[val[0]] = {
          'bankConversionPri': val[5],
          'fBuyPri': val[2], // 现汇买入价
          'mBuyPri': val[3], /* 现钞买入价 */
          'mSellPri': val[4], /* 现钞卖出价 */
          'name': val[0]
        }
      })
      return result
    },
    clearValue (target) {
      // this.data[this[target]].value = ''
      this.data[this.before].value = ''
      this.data[this.after].value = ''
    },
    bindPickerChange (e, current, target) {
      let targetValue = this.data[this[current]].value
      let index = e.mp.detail.value
      if (this[`${current}Index`] !== index) {
        this[`${current}Index`] = index
        this[current] = this.array[index]
        this.data[this[current]].value = targetValue
        this.getReuslt(targetValue, this.data[this[current]], this.data[this[target]])
      }
    },
    input (e, current, target) {
      let targetObj = this.data[this[target]] // 目标对象
      let currentObj = this.data[this[current]] // 目标对象
      this.getReuslt(+e.mp.detail.value, currentObj, targetObj)
    },
    getReuslt (num = 0, currentObj, targetObj) {
      let res = ((+currentObj.bankConversionPri / +targetObj.bankConversionPri) * num)
      if (res) {
        targetObj.value = res.toFixed(2)
      } else {
        targetObj.value = ''
      }
    }
  }

}
</script>

<style lang="less" scoped>
@bs: 2px;
.container{
  background-color: #f2f4f6;
}
.title{
  display: flex;
  background-color: #fff;
  border-bottom: 1/@bs solid  #f2f4f6;
  height: 88/@bs;
  font-size: 20/@bs;
  flex-direction: row;
  padding: 0 24/@bs;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  left: 0;
  top: 0;
  &-left{
    font-size: 28/@bs;
    font-weight: bold;
  }
}
.adv{
  width: 750/@bs;
  height: 200/@bs;
  background-color: #f2f4f6;
  &-image{
    width: 750/@bs;
    height: 200/@bs;
  }
}
.tool{
  height: 160/@bs;
  display: flex;
  padding: 0 24/@bs;
  background-color: #fff;
  align-items: center;
  margin-bottom: 16/@bs;
  &-img{
    width: 80/@bs;
    height: 80/@bs;
    margin-right: 24/@bs;
    border-radius: 5/@bs;
  }
  &-name{
    font-size: 30/@bs;
    flex: 1;
    text-align: left;
  }
  &-label{
    font-size: 36/@bs;
    color: #ccc;
    margin-right: 10/@bs;
  }
  &-value{
    font-size: 36/@bs;
    color: #ccc;
  }
}
</style>
