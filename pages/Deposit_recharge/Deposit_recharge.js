var app = getApp();
var config = require('../../config.js');

Page({
  data: {
    page_width: 320,
    page_height: 320,
    realNameState: '',
    deposit: ''
  },
  onLoad: function (options) {
    var that = this;

    // 动态设置map的宽和高
    wx.getSystemInfo({
      success: function (res) {
        console.log('获取系统高度' + res.windowHeight);
        console.log('获取系统宽度' + res.windowWidth);
        that.setData({
          page_width: res.windowWidth,
          page_height: res.windowHeight
        });
      }
    });
    //获取项目详情
    wx.request({
      url: config.getProjectDetail,
      data: {
        id: '0'
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {

        console.log('获得项目详情成功');
        var deposit = res.data.data.accountDeposit;
        console.log(res.data.data.accountDeposit);
        that.setData({
          deposit: deposit
        });
      },
      fail: function (res) {
        console.log('获取项目详情失败');
      }
    });
  },
  onShow: function () {
    var that = this;
    var uid = wx.getStorageSync('telPhone');
    wx.getNetworkType({
      success: function (res) {
        var networkType = res.networkType
        console.log(networkType);
        if (networkType == "none") {
          wx.showToast({
            title: '当前无网络！',
            icon: 'loading',
            duration: 2000
          });
        } else {
          //获取用户信息
          wx.request({
            url: config.loaduserinfo,
            data: {
              uid: uid,
            },
            header: {
              'content-type': 'application/json',
              "token": app.globalData.token
            },
            method: 'GET',
            success: function (res) {
              console.log('获得用户信息成功');
              console.log(res);
              if (res.data.data.isrecharge == true) {
                wx.redirectTo({
                  url: '/pages/Real_name_authentication/Real_name_authentication?uid=' + wx.getStorageSync('telPhone'),
                });
              }
            },
            fail: function (res) {
              console.log('未获取用户信息');
            }
          });


        }

      }
    });

  },
  onHide: function () {
    var that = this;
    var uid = wx.getStorageSync('telPhone');
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
          wx.request({
            url: config.loaduserinfo,
            data: {
              uid: uid,
            },
            method: 'GET',
            header: {
              'content-type': 'application/json',
              "token": app.globalData.token
            },
            success: function (res) {
              console.log('获得用户信息成功');
              console.log(res);
              if (res.data.data.isrecharge == true) {
                wx.redirectTo({
                  url: '/pages/Real_name_authentication/Real_name_authentication?uid=' + wx.getStorageSync('telPhone'),
                })
              }
            },
            fail: function (res) {
              console.log('未获取用户信息');
            }
          });
        }
      }
    });

  },

  //充值按钮的点击事件
  RechargeEventHandle: function () {
    var that = this;
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
          //访问微信登陆接口，从微信服务器获得code
          wx.login({
            success: function (res) {
              console.log("res.code:" + res.code);
              var code = res.code;
              that.getOpenId(res.code);

            },
            fail: function (res) {
              console.log('访问微信登陆接口获取code失败');
            }
          });
        }
      }
    });

  },
  //获取openid
  getOpenId: function (code) {
    var that = this;
    wx.request({
      url: config.getWxXCXOpenId,
      data: {
        code: code
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log(res);
        console.log('返回openId')
        console.log(res.data.openid)
        that.setData({
          code: that.data.code
        });
        that.generateOrder(res.data.openid)
      },
      fail: function () {
        wx.showToast({
          title: '当前无网络！',
          icon: 'success',
          duration: 2000
        });
      }
    })
  },
  /**生成商户订单 */
  generateOrder: function (openid) {
    var that = this
    var accountDeposit = that.data.deposit;//设置充值的押金

    //统一支付
    var uid = wx.getStorageSync('telPhone');
    console.log("获取到缓存中的手机号：" + uid);
    wx.request({
      url: config.sendPayDetailsUrl,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      data: {
        uid: uid,
        openId: openid,
        total: accountDeposit,
        body: '1',
      },
      success: function (res) {
        console.log("发起预支付结果1：" + res.data.success);
        if (res.data.success) {
          console.log("发起预支付结果2：" + res.data.timeStamp);
          console.log("发起预支付结果3：" + res.data.nonceStr);
          console.log("发起预支付结果4：" + res.data.package);
          console.log("发起预支付结果5：" + res.data.paySign);
          //访问支付接口
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: 'MD5',
            paySign: res.data.paySign,
            success: function (res) {
              console.log("支付成功");
              console.log(res);
              console.log("充值押金的金额数:" + accountDeposit);
              wx.showToast({
                title: "支付成功"
              });
              var uid = wx.getStorageSync('telPhone');;
              wx.request({
                url: config.loaduserinfo,
                data: {
                  uid: uid,
                },
                method: 'GET',
                header: {
                  'content-type': 'application/json',
                  "token": app.globalData.token
                },
                success: function (res) {
                  var realNameState = res.data.data.realNameState;
                  console.log('00000000000000' + res);
                  console.log(res);
                  console.log("===" + res);
                  console.log('请求后台得到用户的信息');
                  that.setData({
                    realNameState: realNameState
                  });
                },
                fail: function (res) {
                  console.log('请求后台失败，没有得到用户的信息');
                }
              });
              if (that.data.realNameState == 1) {
                wx.redirectTo({
                  url: '/pages/login_was_successful/login_was_successful',
                  success: function (res) {
                    console.log('跳转开始使用页面成功');
                  },
                  fail: function () {
                    console.log('跳转开始使用页面失败');
                  }
                });
              } else {
                wx.redirectTo({
                  url: '/pages/Deposit_recharge/Deposit_recharge?uid=' + that.data.telPhone,
                  success: function (res) {
                    console.log('跳转实名制认证页面成功');
                  },
                  fail: function () {
                    console.log('跳转实名制认证页面失败');
                  },

                });
              }
            },
            fail: function (res) {
              console.log(res);
              console.log("支付失败");
              wx.showToast({
                title: "支付失败"
              })
            },
            complete: function () {
              console.log("支付完成");
            }
          });
        }
      },
      fail: function (res) {
        console.log(res);
        console.log("访问后台支付地址失败");
      }
    });
  },
})
