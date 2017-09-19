// 骑行结费
var app = getApp();

var config = require('../../config.js')

Page({
  data: {
    cost: '0',
    use_time: '',
    balance: 0,
    count: '',
    orderId: '',
  },
  onLoad: function (options) {
    app.globalData.state = false;
    var that = this;

    //请求后台获取对应的消费金额
    var uid = wx.getStorageSync('telPhone');
    wx.request({
      url: config.loaduserinfo,
      data: {
        uid: uid
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log('获取用户信息成功+++');
        console.log(res);
        var accountBalance = res.data.data.accountBalance;
        console.log('用户的余额：' + accountBalance);
        var accountDeposit = res.data.data.accountDeposit;
        console.log('用户的押金' + accountDeposit);

      
        that.setData({
          balance: accountBalance.toFixed(2)
        });
      },
      fail: function (res) {
        console.log('获取用户信息失败');
        wx.showToast({
          title: '网络错误！',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  onShow: function () {
    var that = this;
    //从缓存中拿到本次的订单号

    try {
      var orderId = app.globalData.orderId;
      if (orderId) {
        console.log('拿到本次骑行单号');
        console.log(orderId);
      }
    } catch (e) {
      console.log('请求订单号失败');
    }
    that.setData({
      orderId: orderId
    });

    //  TODO 未完成
    //  拿到本次的骑行单号，请求后台\
    wx.getNetworkType({
      success: function (res) {
        var networkType = res.networkType
        console.log(networkType);
        if (networkType == "none") {
          wx.showToast({
            title: '无网络！',
            icon: 'loading',
            duration: 2000
          });
        } else {
          wx.request({
            url: config.getTravelOrder,
            data: {
              orderId: that.data.orderId
            },
            method: 'GET',
            header: {
              'content-type': 'application/json',
              "token": app.globalData.token
            },
            success: function (res) {
              console.log(res);
              console.log('拿到本次的骑行单号，请求后台成功');
              var duration = res.data.data.duration;
              var aCost = res.data.data.cost;

              var use_times = that.formatSecond(duration);
              console.log('本次骑行的时间：' + use_times);
              console.log('当前消费金额：' + aCost);
              console.log('测试时间' + duration);
              that.setData({
                orderId: orderId,
                cost: aCost.toFixed(1),
                use_time: use_times,
              })
            },
            fail: function (res) {
              console.log('拿到本次的骑行单号，请求后台失败');
            }
          });

        }
      },
    })

  },
  //回到主页面的点击事件
  getlocation: function () {
    app.globalData.orderId = '';
    wx.redirectTo({
      url: '/pages/index/index',
      success: function (res) {
        console.log('成功跳转主页面')
      },
      fail: function (res) {
        console.log('跳转主页面失败');
      }
    });
  },
  //计算骑行时间
  formatSecond: function (value) {
    var theTime = parseInt(value);// 秒 
    var theTime1 = 0;// 分 
    var theTime2 = 0;// 小时 
    if (theTime > 60) {
      theTime1 = parseInt(theTime / 60);
      theTime = parseInt(theTime % 60);
      if (theTime1 > 60) {
        theTime2 = parseInt(theTime1 / 60);
        theTime1 = parseInt(theTime1 % 60);
      }
    }
    var result = "" + parseInt(theTime) + "秒";
    if (theTime1 > 0) {
      var result = "" + parseInt(theTime1) + "分" + parseInt(theTime) + "秒";
    }
    if (theTime2 > 0) {
      result = "" + parseInt(theTime2) + "小时" + parseInt(theTime1) + "分" + parseInt(theTime) + "秒";
    }
    console.log(result);
    return result;
  },
});
