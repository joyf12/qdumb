var app = getApp();
var config = require('../../config.js')
var util = require('../../util/util.js')
var pageSize = 10;
var pageNumber = 1;
var pageSize1 = 10;
var pageNumber1 = 1;
var hasEnd = false;
var hasEnd1 = false;
var uid = wx.getStorageSync('telPhone');


Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    duration: 500,
    userAccount: '',
    accountDeposit: '0',
    balance: '0',
    rechargeAmount: '',
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    hasMore: true,
    hasRefesh: false,
    pageData: [],
    pageList: [],
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    createTime: '',
    test: true,
    deposit: '',
    appGetCredit: '0',
   
  },

  onLoad: function () {
  
    var that = this;
    // 缓存中同步获取用户手机号
    var telPhone = wx.getStorageSync('telPhone');
    that.setData({
      userAccount: telPhone
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

    // 预读系统高度和宽度
    wx.getSystemInfo({

      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }


    });
    // 根据网络类型获取用户信息
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
          that.queryBalance();
        }

      }
    });
  },
  onShow: function () {
    var that = this;
    console.log('个人中心界面的token：');
    console.log(app.globalData.token);
    //加载用户积分
    wx.request({
      url: config.appGetCredit,
      method: 'GET',
      data: {
        uid: wx.getStorageSync('telPhone')
      },
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {

        console.log('获取用户积分');
        console.log(res);
        console.log(res.data.data);
        var appGetCredit = res.data.data;
        that.setData({
          appGetCredit: appGetCredit
        });
      }
    })
  },

  //获取用户余额、押金
  queryBalance: function () {
    console.log("当前用户帐号:" + app.globalData.telPhone)
    var that = this;
    wx.request({
      url: config.loaduserinfo,
      data: {
        uid: app.globalData.telPhone
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        //token校验
        if (res.statusCode == 403) {
          wx.showModal({
            title: '登陆过期！',
            content: '您的账号登陆已过期，请重新登陆。',
            confirmText: '重新登陆',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.clearStorageSync();
                app.globalData.isLogin = false;
                wx.redirectTo({
                  url: '/pages/Login_registration/Login_registration',
                });
                console.log('用户点击确定')
              }
            }
          })
        } else {
          console.log(res);
          var balance = res.data.data.accountBalance;
          var accountDeposit = res.data.data.accountDeposit;
          console.log(balance);
          console.log(accountDeposit);
          that.setData({
            balance: balance.toFixed(1),
            accountDeposit: accountDeposit.toFixed(1)
          });
        }

      }

    });
  },

  //注销登陆
  Logout: function () {

    wx.clearStorageSync();
    app.globalData.isLogin = false;
    wx.redirectTo({
      url: '/pages/index/index',
    });

  },

  //==============充值金额====================//
  RechargeEventHandle: function () {
    var that = this;

    wx.showActionSheet({
      itemList: ['1元', '5元', '10元', '20元', '50元', '100元'],

      success: function (res) {
        console.log(res);
        var rechargeAmount;
        if (res.tapIndex == 0) {
          rechargeAmount = 1;
        } else if (res.tapIndex == 1) {
          rechargeAmount = 5;
        } else if (res.tapIndex == 2) {
          rechargeAmount = 10;
        } else if (res.tapIndex == 3) {
          rechargeAmount = 20;
        } else if (res.tapIndex == 4) {
          rechargeAmount = 50;
        } else if (res.tapIndex == 5) {
          rechargeAmount = 100;
        }else{
          console.log('没有选择');
        }

        console.log(rechargeAmount);
        that.setData({
          rechargeAmount: rechargeAmount
        });
        if (rechargeAmount>0){
          wx.login({

            success: function (res) {
              console.log('选择充值的金额：' + rechargeAmount);
              console.log("code:" + res.code);
              that.getOpenId(res.code);
            },
            fail: function () {
              wx.showToast({
                title: '网络错误！',
                icon: 'success',
                duration: 2000
              });
            }
          });
        }else{
        console.log('未选择金额');
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    });

    

  },
  getOpenId: function (code) {
    var that = this;
    wx.request({
      url: config.getWxXCXOpenId + "&code=" + code,
      data: {},
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log('返回openId')
        console.log(res.data.openid)
        that.generateOrder(res.data.openid)
      },
      fail: function () {
        console.log('访问微信服务器后去数据失败');
      }
    })
  },
  /**生成商户订单 */
  generateOrder: function (openid) {
    console.log('openid:' + openid);
    console.log("开始充值车费:");
    var that = this
    wx.request({
      url: config.sendPayDetailsUrl,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      data: {
        uid: app.globalData.telPhone,
        openId: openid,
        total: that.data.rechargeAmount,
        body: '2',
      },
      success: function (res) {
        console.log("发起预支付结果1：" + res.data.success);
        if (res.data.success) {
          console.log("发起预支付结果2：" + res.data.timeStamp);
          console.log("发起预支付结果3：" + res.data.nonceStr);
          console.log("发起预支付结果4：" + res.data.package);
          console.log("发起预支付结果5：" + res.data.paySign);
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: 'MD5',
            paySign: res.data.paySign,

            success: function (res) {

              wx.showToast({
                title: "支付成功",
                icon: 'success',
                duration: 3000
              });

              wx.redirectTo({
                url: '/pages/Personal_center/Personal_center',
                success: function (res) {
                  console.log('回到钱包页面成功');
                },
                fail: function () {
                  console.log('回到钱包页面失败');
                }
              });

            },
            fail: function (res) {
              console.log(res);
              wx.showToast({
                title: "支付失败",
                icon: 'success',
                duration: 3000
              })
            },
            complete: function () {
              console.log("支付完成");
            }
          });
        }
      },
    });
  },
  //===============支付押金=======================//
  RechargeEventHandle2: function () {
    console.log("开始充值押金:");
    var that = this;

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
          wx.login({
            success: function (res) {
              console.log("res.code:" + res.code);
              that.getOpenId2(res.code);
            },
            fail: function (res) {
              console.log('访问微信登陆接口获取code失败');
            }
          });
        }

      }
    });

  },
  getOpenId2: function (code) {
    var that = this;
    wx.request({
      url: config.getWxXCXOpenId + "&code=" + code,
      data: {},
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log('返回openId')
        console.log(res.data.openid)

        that.generateOrder2(res.data.openid)
      },
      fail: function (res) {
        console.log('请求微信后台接口接口成功');
      }
    });
  },
  generateOrder2: function (openid) {
    var that = this
    var accountDeposit = that.data.deposit;//设置充值的押金

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
      method: 'GET',
      success: function (res) {
        console.log("发起预支付结果1：" + res.data.success);
        if (res.data.success) {
          console.log("发起预支付结果2：" + res.data.timeStamp);
          console.log("发起预支付结果3：" + res.data.nonceStr);
          console.log("发起预支付结果4：" + res.data.package);
          console.log("发起预支付结果5：" + res.data.paySign);
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: 'MD5',
            paySign: res.data.paySign,
            success: function (res) {
              console.log("支付成功");

              console.log(res);
              wx.showToast({
                title: "支付成功"
              })
            },
            fail: function (res) {
              console.log(res);
              console.log("支付失败");
            },
            complete: function () {
              console.log("支付完成");
            }
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: "支付失败",
          icon: 'success',
          duration: 3000
        })
        console.log('访问统一支付接口失败');
      }
    });
  },
  //退押金
  returnDeposit: function () {
    var that = this;
    if(app.globalData.accountState!=1){
        wx.showModal({
          title: '提示',
          content: '用户状态异常，请联系客服退费',
          showCancel:false
        })
    }else{
      wx.request({
        url: config.ReturnDepositMoney,
        data: {
          uid: app.globalData.telPhone
        },
        header: {
          'content-type': 'application/json',
          "token": app.globalData.token
        },
        success: function (res) {
          console.log(res.data)
          if (res.data.success == 1000) {
            wx.showModal({
              title: '押金退还成功',
              showCancel: false,
              confirmText: '我知道了',
              content: '押金已退还，如有疑问您可以拨打客服服务热线寻求帮助！\n    0769-33349999',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }

            });
          } else {
            wx.showModal({
              title: '押金退还失败',
              showCancel: false,
              confirmText: '我知道了',
              content: '押金退还失败，请重新申请退款 ，如有疑问您可以拨打客服服务热线寻求帮助！\n    0769-33349999',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            });
          }
        }
      })
    }
    

  },
  //充值协议的点击事件
  Agreement: function () {
    wx.navigateTo({
      url: '/pages/Recharge_protocol/Recharge_protocol',
    });
  },
  //查看充值记录
  toRechargeRecords: function () {
    wx.navigateTo({
      url: '/pages/Recharge_record/Recharge_record'
    })
  },
  //查看借伞记录
  toUmbrellaRecords: function () {
    wx.navigateTo({
      url: '/pages/Borrow_umbrella_record/Borrow_umbrella_record'
    })
  },
  //查看积分记录
  toScoringRecords: function () {
    wx.navigateTo({
      url: '/pages/Integral_record/Integral_record'
    })
  },
})
