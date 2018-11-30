<template>
  <div class="container" >
    <swiper class="adv" circular="true" autoplay="true" interval="5000" duration="1000" indicatorDots="true" indicator-active-color="#f21818">
      <block v-for="item in imgUrls" v-bind:key="item.id">
        <swiper-item>
          <image mode="aspectFill" :src="item" class="adv-image"/>
        </swiper-item>
      </block>
    </swiper>
    <div class="item">
      <picker @change="bindPickerChange($event,'before','after')" :value="beforeIndex" :range="array">
        <div class="item-left">
          <div class="item-left-wapper">
            <img class="item-left_img" :src="data[before].img" alt="">
            <p class="item-left_name">{{before}}</p>
          </div>
          <img class="item-left_arrow" src="/assets/images/arrow.png" alt="">
        </div>
      </picker>
      <div class="item-right">
        <div class="item-right-wrapper">
          <input type="digit" placeholder="请输入金额" v-model="data[before].value" @focus="active = 'before'" @blur="active = ''" @input="input($event,'before','after')" placeholder-style="color:#b2b2b2;" :class="['item-right_input',active === 'before'?'padding': '']" >
          <image class="item-right_close" @click="clearValue('before')" v-if="active === 'before'"  src="/assets/images/close.png"></image>
        </div>
        <p class="item-right_desc">{{before}} {{data[before].label}}</p>
      </div>
    </div>
    <div class="item">
      <picker @change="bindPickerChange($event,'after','before')" :value="afterIndex" :range="array">
        <div class="item-left" @click="change">
          <div class="item-left-wapper">
            <img class="item-left_img" :src="data[after].img" alt="">
            <p class="item-left_name">{{after}}</p>
          </div>
          <img class="item-left_arrow" src="/assets/images/arrow.png" alt="">
        </div>
      </picker>
      <div class="item-right">
        <div class="item-right-wrapper">
          <input type="digit" placeholder="请输入金额"  @focus="active = 'after'" @blur="active = ''"  @input="input($event,'after','before')" v-model="data[after].value" placeholder-style="color:#b2b2b2;" :class="['item-right_input',active === 'after'?'padding': '']" >
          <image class="item-right_close"  @click="clearValue('after')" v-if="active === 'after'" src="/assets/images/close.png"></image>
        </div>
        <p class="item-right_desc">{{after}} {{data[after].label}}</p>
      </div>
    </div>
    <div class="desc" v-if="array.length > 0">
      <div class="desc-equal">1{{before}} = {{equal}}{{after}}</div>
      <div class="desc-item">数据仅供参考，交易时以银行柜台成交价为准。</div>
      <div class="desc-item">更新时间：{{updateTime}}</div>
    </div>
  </div>
</template>

<script>
import {getData} from './api.js'
import baseInfo from './base.js'
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
      imgUrls: [
        '/assets/images/demo1.jpg',
        '/assets/images/demo2.jpg'
      ]
    }
  },
  created () {
    try {
      let storageData = JSON.parse(wx.getStorageSync('calcu_data'))
      let storageArray = JSON.parse(wx.getStorageSync('calcu_array'))
      let updateTime = JSON.parse(wx.getStorageSync('calcu_update'))
      this.data = storageData
      this.array = storageArray
      this.updateTime = updateTime
    } catch (e) {
      this.init()
    }
  },
  computed: {
    equal () {
      let targetObj = this.data[this.before] || {}
      let currentObj = this.data[this.after] || {}
      let res = (+targetObj.bankConversionPri / +currentObj.bankConversionPri).toFixed(3)
      return res
    }
  },
  methods: {
    init () {
      getData().then(res => {
        this.updateTime = res.update
        res = this.formatData(res.list)
        let result = {}
        let array = []
        res = {
          ...res,
          '人民币': {
            'bankConversionPri': '100',
            'value': ''
          }
        }
        for (let i in res) {
          if (baseInfo[i]) { // 存在在base表中的返回
            result[i] = {
              ...res[i],
              ...baseInfo[i]
            }
            array.push(i)
          }
        }
        this.data = result
        this.array = array
        this.afterIndex = this.array.indexOf('美元')
        wx.setStorageSync('calcu_data', JSON.stringify(this.data))
        wx.setStorageSync('calcu_array', JSON.stringify(this.array))
        wx.setStorageSync('calcu_update', JSON.stringify(this.updateTime))
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
      this.data[this[target]].value = 0
    },
    bindPickerChange (e, current, target) {
      let targetValue = this.data[this[current]].value
      let index = e.mp.detail.value
      this[`${current}Index`] = index
      this[current] = this.array[index]
      this.data[this[current]].value = targetValue
      this.getReuslt(targetValue, this.data[this[current]], this.data[this[target]])
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
.adv{
  width: 750/@bs;
  height: 200/@bs;
  background-color: #f2f4f6;
  &-image{
    width: 750/@bs;
    height: 200/@bs;
  }
}
.item{
  height: 147/@bs;
  margin-left: 30/@bs;
  padding: 15/@bs 30/@bs 15/@bs 0;
  border-bottom: 1/@bs solid rgba(0,0,0,0.08);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  &-left{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 117/@bs;
    &-wrapper{
      display: flex;

    }
    &_img{
      width: 120/@bs;
      height: 80/@bs;
    }
    &_name{
      font-size: 26/@bs;
      color: #000;
      line-height: 36/@bs;
      text-align: center;
    }
    &_arrow{
      width: 16/@bs;
      height: 26/@bs;
      margin-left: 30/@bs;
    }
  }
  &-right{
    flex: 1;
    height: 117/@bs;
    text-align: right;
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin-left: 30/@bs;
    &-wrapper{
      display: flex;
      position: relative;
    }
    &_input{
      font-size: 34/@bs;
      color: #000000;
      line-height: 48/@bs;
      height: 48/@bs;
      flex: 1;
      transition: all 0.3s ease;
      &.padding{
        padding-right: 36/@bs;
      }
    }
    &_close{
      width: 30/@bs;
      height: 30/@bs;
      margin-left: 6/@bs;
      position: absolute;
      right: 0;
      top: 9/@bs;
      z-index: 100;
    }
    &_desc{
      color: #888;
      font-size: 26/@bs;
    }
  }
}
.desc{
  padding: 15/@bs 30/@bs;
  &-equal{
    color: #000;
    font-size: 26/@bs;
    line-height: 36/@bs;
    margin-bottom: 10/@bs;
  }
  &-item{
    color: #9B9B9B;
    line-height: 36/@bs;
    font-size: 26/@bs;
  }
}
</style>
