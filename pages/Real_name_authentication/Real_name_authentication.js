var app = getApp();
var config = require('../../config.js');

Page({
  data: {
    page_width: 320,
    page_height: 320,
    telPhone: '',
    realName: '',
    idNumber: '',

  },
  onLoad: function (options) {
    console.log('token');
    console.log(app.globalData.token);
    var that = this;
    var uid = wx.getStorageSync('telPhone');;
    console.log(uid);
    that.setData({
      telPhone: uid
    });
    console.log(that.data.telPhone);
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.windowHeight);
        console.log(res.windowWidth);
        that.setData({
          page_width: res.windowWidth,
          page_height: res.windowHeight
        })
      }
    });
  },
  getPhoneNum: function (e) {
    this.telPhone = that.data.
      console.log("telPhone:" + that.data.telPhone);
  },
  getRealName: function (e) {
    this.realName = e.detail.value
    console.log("realName:" + this.realName);
  },
  getIDNumber: function (e) {
    this.idNumber = e.detail.value
    console.log("idNumber:" + this.idNumber);
  },
  //跳过
  jump: function () {
    wx.redirectTo({
      url: '/pages/login_was_successful/login_was_successful',
      success: function (res) {
        console.log('跳转注册成功页面');
      },
      fail: function () {
        console.log('跳转注册成功页面失败');
      }
    });
  },
  next: function () {
    var that = this;
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
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
            url: config.realNameCheckUrl,
            data: { uid: that.data.telPhone, user_name: that.realName, ID_number: that.idNumber },
            method: 'GET',
            header: {
              'content-type': 'application/json',
              "token": app.globalData.token
            },
            success: function (res) {
              console.log("实名制验证结果：" + res.data.success);
              if (1000 == res.data.success) {
                console.log("实名制验证通过")
                app.globalData.realNameState = res.data.data.realNameState;
                var hasFinishRegister = 3;
                var realNameState = 1;
                console.log("登陆到实名的标识:" + hasFinishRegister);
                console.log("实名制的状态:" + realNameState);

                //把实名制的状存到小程序变量
                app.globalData.realNameState = realNameState;
                wx.redirectTo({
                  url: '/pages/login_was_successful/login_was_successful',
                  success: function (res) {
                    console.log('跳转注册成功页面');
                  },
                  fail: function () {
                    console.log('跳转注册成功页面失败');
                  }

                })
              } else {
                wx.showModal({
                  title: '实名制认证失败',
                  showCancel: false,
                  confirmText: '我知道了',
                  content: '请输入正确姓名和18位身份证号，进行认证！',
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                });

              }
            },
            fail: function () {
              wx.showToast({
                title: '网路故障，请检查网络进行重新认证！',
                icon: 'loading',
                duration: 2000
              });
            }
          });
        }
      }
    });
  },
})