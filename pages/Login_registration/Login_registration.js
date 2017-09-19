var app = getApp();
var config = require('../../config.js')
var maxTime = 60  //最大时间
var currentTime = 0  //当前时间
var interval = null //定时器
var hintMsg = null
//校验手机号
function IsTel(s) {
  if (s != null) {
    var length = s.length;
    if (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(14[0-9]{1})|)+\d{8})$/.test(s)) {
      return true;
    } else {
      return false;
    }
  }
}

Page({
  name: "login",
  data: {
    telPhone: '',//手机号
    checkCode: '',//验证码
    time: 0,//时间
    color: '',//颜色
    data: 0 //判断条件
  },
  //输入的手机号
  getPhoneNum: function (e) {
    var that = this
    this.telPhone = e.detail.value
    var istel = IsTel(e.detail.value)
    if (istel) {
      that.setData({
        data: 1
      })
    }
  },

  //输入的验证码
  getCheckNum: function (e) {
    this.checkCode = e.detail.value
  },

  //开始登陆
  start: function () {
    var that = this;
    wx.getNetworkType({

      success: function (res) {
        var networkType = res.networkType
        if (networkType == "none") {
          wx.showToast({
            title: '当前无网络！',
            icon: 'loading',
            duration: 2000
          });
        } else {
          wx.request({
            url: config.wxAppmobileLogin,
            data: {
              uid: that.telPhone,
              code: that.checkCode,
            },
            method: 'GET',

            success: function (res) {
              console.log(res);
              console.log(res.data.token);
              console.log(res.data.data.accountState)
              app.globalData.accountState = res.data.data.accountState;
              var success = res.data.success;
              app.globalData.isConnected = true;
              if (success == 1000) {

                console.log('获取token成功保存到本地缓存中');
                wx.setStorageSync('token', res.data.token);
                console.log('取出token进行查看');
                console.log(wx.getStorageSync('token'));
                //给小程序全局变量赋值
                app.globalData.token = wx.getStorageSync('token');
                ///本地缓存当前用户账号
                wx.setStorageSync('telPhone', that.telPhone);
                //设置小程序的登陆变量
                app.globalData.isLogin = true;
                //给小程序用户账号变量赋值
                app.globalData.telPhone = wx.getStorageSync('telPhone');
                console.log('全局变量中的手机号码' + app.globalData.telPhone);
                var isReCharge = res.data.data.isrecharge;
                var isCertificate = res.data.data.iscertificate;
                var isNew = res.data.data.isNew;
                if (isNew == false) {
                  wx.redirectTo({
                    url: '/pages/index/index',
                  });
                } else {
                  if (isReCharge == false) {
                    wx.redirectTo({
                      url: '/pages/Deposit_recharge/Deposit_recharge',
                    });
                  } else if (isCertificate == false) {
                    wx.redirectTo({
                      url: '/pages/Real_name_authentication/Real_name_authentication',
                    });
                  } else {
                    wx.redirectTo({
                      url: '/pages/index/index',
                    });
                  }
                }

              } else {
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  success: function (res) {

                  }
                });
              }
            },
            fail: function (res) {
              app.globalData.isConnected = false;
              if (app.globalData.isConnected) {
                wx.showToast({
                  title: '登录失败！',
                  icon: 'success',
                  duration: 3000
                });
              }
            }
          });
        }
      }
    });

  },


  //获取验证码的点击事件
  getCheckCode: function () {

    var that = this
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        var networkType = res.networkType
        console.log(networkType);
        if (networkType == "none") {
          wx.showToast({
            title: '当前无网络！',
            icon: 'loading',
            duration: 2000
          });
        } else {
          if (currentTime <= 0) {
            wx.request({
              url: config.requestCheckCodeUrl,
              data: { uid: that.telPhone },
              method: 'GET',
              success: function (res) {
                console.log(res);
                app.globalData.isConnected = true;
                console.log('获取验证码成功：' + res.data.data);
                that.setData({
                  data: 2
                });
              },
              fail: function (res) {
                  console.log(res);
              },
            });
            currentTime = maxTime
            interval = setInterval(function () {
              currentTime--
              that.setData({
                time: currentTime
              })
              if (currentTime <= 0) {
                currentTime = -1
                clearInterval(interval)
                that.setData({
                  data: 3
                })
              }
            }, 1000)

          }
        }
      }
    });
  },
  //用伞服务条款的点击事件
  Vehicle: function () {
    wx.navigateTo({
      url: '/pages/Umbrella_service_clause/Umbrella_service_clause',
    })
  },

})

