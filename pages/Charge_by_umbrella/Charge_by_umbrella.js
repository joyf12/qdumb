var app = getApp();
var config = require('../../config.js')
var controlsArray;
var lockTask;
var intervalTask;
var qian;
var costTask;
var count = 0;

var showState = true;
Page({
  data: {
    latitude: '',
    longitude: '',
    scale: 17,
    controls: [],
    isture: true,
    lockno: '',
    use_time: '0',
    cost: '0.0',
    goodsNo: '',
    LendState: false
  },
  onLoad: function (options) {
    var that = this;
    //获取页面扫码传过来的锁编号
    var lockno = options.lockno;
    var goodsNo = options.goodsNo;
    console.log('锁的编号:' + lockno);
    console.log('伞的编号:' + goodsNo);
    that.setData({
      lockno: lockno,
      goodsNo: goodsNo,
    });
    //定时获订单的状态
    lockTask = setInterval(this.run, 3000);
  },
  onReady: function () {
    var that = this;
    //创建地图
    this.mapCtx = wx.createMapContext('cqcx');
    //获取手机的屏幕信息
    wx.getSystemInfo({
      success: function (res) {
        app.globalData.windowWidth = res.windowWidth;
        app.globalData.windowHeight = res.windowHeight;
        //设置地图上的控件
        controlsArray = [{
          id: 1,
          position: {
            left: 20,
            top: res.windowHeight - res.windowHeight / 3,
            width: res.windowWidth / 3 / 278 * 100,
            height: res.windowWidth / 3 / 278 * 100
          },
          iconPath: '/images/Location_icon .png',
          clickable: true
        }];
        that.setData({
          controls: controlsArray
        });
      }
    });

    //在地图上获取当前位置信息
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      }
    });
    that.getCost();
  },
  onShow: function () {
    var that = this;
  },
  controltap(e) {
    var that = this;
    var windowWidth = app.globalData.windowWidth;
    var windowHeight = app.globalData.windowHeight;
    switch (e.controlId) {
      case 1: {
        this.mapCtx.moveToLocation();
        console.log(e.controlId)
      };
    };
  },
  jiefei: function () {
    var that = this;
    wx.showModal({
      title: '提交还伞后未结费问题',
      content: '如确定已还伞，请点击提交。您的账户会暂时无法用伞，我们会尽快处理，请您耐心等候！或直接拨打客服电话0769-33349999',
      confirmText: '提交',
      success: function (res) {
        if (res.confirm) {
          clearInterval(costTask);
          wx.request({
            url: config.feedbackTravelOrder,
            data: {
              orderId: app.globalData.orderId
            },
            method: 'GET',
            header: {
              'content-type': 'application/json',
              "token": app.globalData.token
            },
            success: function (res) {
              // app.globalData.typ=false;
              wx.showToast({
                title: '反馈成功',
                icon: 'success',
                duration: 2000
              });

              wx.redirectTo({
                url: '/pages/index/index'
              });
            },
            fail: function (res) {
              console.log('订单反馈失败');
            },
          });


        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }

    })
  },
  run: function () {
    var that = this;
    var timestamp = Date.parse(new Date());
    wx.request({
      url: config.getTravelOrder,
      data: {
        orderId: app.globalData.orderId,
        random: timestamp
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log(res);

        var goodsNo = res.data.data.goodsNo;
        var use_time = that.data.use_time;
        var lockno = that.data.lockno;
        console.log('骑行时间' + use_time);
        console.log('锁编号：' + lockno);
        console.log('伞编号：' + goodsNo);

        that.setData({
          goodsNo: goodsNo
        });

        if (1000 != res.data.success) {
          console.log('找不到此锁');
        } else {
          console.log('还车的状态：');
          console.log(res.data.data.sellState);
          console.log(res.data.data.state);

          //转借伞
          if (res.data.data.sellState === 0) {
            console.log('出让');
          } else if (res.data.data.sellState === 1) {

            if (showState) {
              wx.showModal({
                title: '提示',
                content: '对方申请转借',
                cancelText: '拒绝',
                confirmText: '同意',
                success: function (res) {
                  if (res.confirm) {
                    wx.request({
                      url: config.responseOrderTransfer,
                      data: {
                        gid: that.data.goodsNo,//物品编号
                        uid: app.globalData.telPhone,
                        state: '2',
                        fromId: app.globalData.orderId
                      },
                      method: 'GET',
                      header: {
                        'content-type': 'application/json',
                        "token": app.globalData.token
                      },
                      success: function (res) {
                        console.log('成功');
                        if (that.data.LendState) {
                          wx.showToast({
                            title: '本次转借订单已过期！',
                            icon: 'success',
                            duration: 2000
                          })
                          that.setData({
                            LendState: false
                          })

                        }

                      },
                      fail: function () {
                        console.log('失败');
                      }
                    });

                    console.log('用户点击确定')

                  } else if (res.cancel) {
                    console.log('用户点击取消')
                    wx.request({
                      url: config.responseOrderTransfer,
                      data: {
                        gid: that.data.goodsNo,//物品编号
                        uid: app.globalData.telPhone,
                        state: '3',
                        fromId: app.globalData.orderId
                      },
                      method: 'GET',
                      header: {
                        'content-type': 'application/json',
                        "token": app.globalData.token
                      },
                      success: function (res) {
                        console.log('成功');
                      },
                      fail: function () {
                        console.log('失败');
                      }
                    })
                  }
                }
              })
              showState = false;
            } else {
              showState = true;
            }

          } else if (res.data.data.sellState === 0) {
            console.log('已出让');
          } else if (res.data.data.sellState === 4) {
            console.log('借伞状态为4');

            //
            that.setData({
              LendState: true
            });
          }
          //正常还伞
          if (res.data.data.state == 2) {
            app.globalData.isScanCode = true;
            wx.redirectTo({
              url: '/pages/Umbrella_fee/Umbrella_fee',
              success: function (res) {
                that.setData({
                  lockno: ''
                })
              },
              fail: function (res) {
              }
            });

          } else if (res.data.data.state == 4) {
            app.globalData.isScanCode = true;
            wx.redirectTo({
              url: '/pages/index/index',
            })
          } else if (res.data.data.state >= 1) {
            //定时获取使用金额
            that.getCost();
          }
        }
      },
      fail: function (res) {
        console.log('请求后台获取锁的状态失败');
      }
    });
  },
  //获取未完成订单
  getCost: function () {
    var that = this;
    wx.request({
      url: config.getNoFinishedTravelOrder,
      data: {
        orderId: app.globalData.orderId
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log(res);
        if (res.data.success == 1000) {
          console.log(res.data);
          var duration = res.data.data.duration;
          var aCost = res.data.data.cost;
          var use_times = that.formatSecond(duration);
          that.setData({
            cost: aCost.toFixed(1),
            use_time: use_times,
          });
        } else {
          console.log('获取未完成订单异常信息：' + res.data.msg);
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '网络错误！',
          icon: 'success',
          duration: 3000
        });
        console.log('拿到本次的骑行单号，请求后台失败');
      },
    });
  },
  //时间格式
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
  //页面关闭函数
  onUnload: function () {
    var that = this;
    clearInterval(lockTask);//关闭获取锁状态的任务
    clearInterval(intervalTask);//关闭获取获取骑行时间的任务
    clearInterval(costTask);//关闭获取当前消费金额的任务
  },
})



