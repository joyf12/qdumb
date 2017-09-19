//获取app实例
var app = getApp();
//引入配置文件
var config = require('../../config.js')
//地图控件数组
var controlsArray;


var lock_no;
var lockno;

var getLentRecordTask;//获取转借记录定时器

var getTravelOrderTask;
var fromId;
//扫码、注册图片
var img_main = "/images/Login_registration_icon.png";
var Img_main = function () {
  if (app.globalData.isLogin) {
    img_main = "/images/Scan_code_icon.png";
  } else {
    img_main = "/images/Login_registration_icon.png";
  }
  return img_main
}

Page({
  data: {
    latitude: '', //纬度
    longitude: '',//经度
    scale: 17, //缩放比例
    markers: [], //地图标记
    controls: [], //地图控件
    lockArray: [],  //周围站点
    accountBalance: '', //用户余额
    accountDeposit: '', //用户押金
    gono: '', //雨伞编号
    orderId: '', //订单id
    test: ''
  },
  onLoad: function (options) {
 
    var that = this;
    //通过id进行map组件绑定
    this.mapCtx = wx.createMapContext('cqcx');
    //获取手机系统信息
    wx.getSystemInfo({
      success: function (res) {
        app.globalData.windowWidth = res.windowWidth;
        app.globalData.windowHeight = res.windowHeight;

        //控件数组
        controlsArray = [
          //当前位置控件
          {
            id: 1,
            position: {
              left: (res.windowWidth - 85 / 3.5) / 2,
              top: (res.windowHeight - 152 / 3.5) / 2 - 152 / 7,
              width: 85 / 3.5,
              height: 152 / 3.5
            },
            iconPath: '/images/Current_location_icon.png',
            clickable: false
          }, {
            //回位控件
            id: 2,
            position: {
              left: 20,
              top: res.windowHeight - 70,
              width: res.windowWidth / 3 / 278 * 100,
              height: res.windowWidth / 3 / 278 * 100
            },
            iconPath: '/images/Location_icon .png',
            clickable: true
          }, {
            //注册登录/扫码借车
            id: 3,
            position: {
              left: (res.windowWidth * 2 / 3) / 2,
              top: res.windowHeight - 70,
              width: res.windowWidth / 3,
              height: res.windowWidth / 3 / 278 * 100
            },
            iconPath: Img_main(),
            clickable: true
          }, {
            //钱包控件
            id: 4,
            position: {
              left: res.windowWidth - res.windowWidth / 3 / 278 * 100 - 20,
              top: res.windowHeight - 70,
              width: res.windowWidth / 3 / 278 * 100,
              height: res.windowWidth / 3 / 278 * 100
            },
            iconPath: '/images/Wallet_icon.png',
            clickable: true
          }
        ];

        that.setData({
          controls: controlsArray
        });
      }
    });

    //获取当前的位置，得到经纬度，加载周围车辆
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log('获取当前位置信息成功');
        var latitude = res.latitude;
        var longitude = res.longitude;
        var scale = that.data.scale;
        //动态加载经纬度范围内的车锁信息
        wx.request({
          url: config.getShareBikeInfo,
          header: {
            'content-type': 'application/json'
          },
          data: {
            latitude: latitude,
            longitude: longitude,
            scale: scale
          },
          method: 'GET',
          success: function (res) {
            console.log('获取周围站点成功');
            console.log(res);
            var lockArray = res.data
            that.setData({
              lockArray: lockArray
            });
            //拿到总数量
            var lockArrayLength = that.data.lockArray.length
            //声明定常数组
            var LockMarkers = new Array(lockArrayLength);
            //遍历数组
            for (var i = 0; i < lockArrayLength; i++) {
              LockMarkers[i] = {
                latitude: that.data.lockArray[i].latitude,
                longitude: that.data.lockArray[i].longitude,
                title: that.data.lockArray[i].lock_no,
                name: '锁编号' + that.data.lockArray[i].lock_no,
                iconPath: '/images/Umbrella_icon .png',
                width: 20,
                height: 20
              }
            };
            //更新markers数组数据
            that.setData({
              markers: LockMarkers
            });
          }

        });
        //通过获获取当前位置拿到经纬度，给地图经纬度赋值
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      }
    });

  },

  onShow: function () {
    var that = this
    app.globalData.token = wx.getStorageSync('token');
    console.log('主页面的token:');
    console.log(app.globalData.token);
    //获取网络类型
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
          //有网络的情况下
          //当前账户不为空获取用户信息和未完成订单
          if (app.globalData.isLogin) {
            that.getInfo();
            that.getNoFinishedTravelOrder1();
          }

        }
      }
    });
  },

  //地图视图改变
  regionchange(e) {
    var that = this;
    if (e.type == "end") {
      //拿到地图中心点经纬度
      this.mapCtx.getCenterLocation({
        success: function (res) {
          var latitude = res.latitude;
          var longitude = res.longitude;
          var scale = that.data.scale;
          //获取锁的信息
          wx.request({
            url: config.getShareBikeInfo,
            data: {
              latitude: latitude,
              longitude: longitude,
              scale: scale
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              var lockArray = res.data
              that.setData({
                lockArray: lockArray
              });

              //拿到总数量
              var lockArrayLength = that.data.lockArray.length
              //声明定常数组
              var LockMarkers = new Array(lockArrayLength);
              //遍历数组
              for (var i = 0; i < lockArrayLength; i++) {
                LockMarkers[i] = {
                  latitude: that.data.lockArray[i].latitude,
                  longitude: that.data.lockArray[i].longitude,
                  title: that.data.lockArray[i].lock_no,
                  name: '锁编号' + that.data.lockArray[i].lock_no,
                  iconPath: '/images/Umbrella_icon .png',
                  width: 20,
                  height: 20
                }
              };
              //更新markers数组数据
              that.setData({
                markers: LockMarkers
              });

            }
          })
        }
      });
    }
  },

  //地图控件点击事件
  controltap(e) {
    var that = this;
    var windowWidth = app.globalData.windowWidth;
    var windowHeight = app.globalData.windowHeight;
    switch (e.controlId) {
      case 1: {
      }
        break;
      //回到当前位置的控件点击事件
      case 2: {
        this.mapCtx.moveToLocation();
        console.log(e.controlId)
      } break;
      //扫码控件的点击事件
      case 3: {
        // 1.判断是否登陆
        //2.判断是否有押金、是否有余额
        //3.判断
        var accountDeposit = that.data.accountDeposit;//押金
        var accountBalance = that.data.accountBalance; //余额

        wx.getNetworkType({
          success: function (res) {
            var networkType = res.networkType;
            if (networkType == "none") {
              wx.showToast({
                title: '无网络！',
                icon: 'loading',
                duration: 2000
              });
            } else {
              console.log(networkType);

              if ("" !== app.globalData.telPhone) {
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
                    if (res.data.success == 1000) {
                      var accountBalance = res.data.data.accountBalance;
                      var accountDeposit = res.data.data.accountDeposit;
                      console.log('用户当前余额：' + accountBalance);
                      console.log('用户当前押金:' + accountDeposit);
                      that.setData({
                        accountBalance: accountBalance,
                        accountDeposit: accountDeposit
                      });
                    }
                  },

                  fail: function (res) {
                    console.log('获取用户信息失败');
                  }
                });
              }

              //1.判断登陆状态
              if (app.globalData.isLogin) {
                //2.判断押金状态
                if (accountDeposit <= 0) {
                  wx.showModal({
                    title: '提示',
                    showCancel: false,
                    confirmText: '去充值',
                    content: '您的账户押金不足，请充值后再尝试开锁',
                    success: function (res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: '/pages/Personal_center/Personal_center'
                        });
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  });
                  //3.判断余额状态
                } else if (accountBalance <= 0) {
                  wx.showModal({
                    title: '提示',
                    showCancel: false,
                    confirmText: '去充值',
                    content: '您的账户余额不足，请充值后再尝试开锁',
                    success: function (res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: '/pages/Personal_center/Personal_center'
                        });
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  });
                  //4.进入扫码
                } else {
                  //判断是否可以点击扫码
                  console.log(app.globalData.accountState)
                  if (app.globalData.isScanCode == true && app.globalData.accountState==1) {
                    //开始扫码
                    wx.scanCode({
                      success: function (res) {
                        //截取扫码内容
                        var strArray = res.result.split("=");
                        var gonoArray = res.result;
                        //根据扫码的内容进行分发处理

                        //1.转借伞 
                        if (gonoArray.indexOf("gono") != -1 || gonoArray.indexOf("gno") != -1) {
                          console.log('进入转借伞');
                          var gono = strArray[1];

                          that.setData({
                            gono: gono
                          });
                          //申请订单转让
                          wx.request({
                            url: config.applyOrderTransfer,
                            data: {
                              gid: gono,
                              uid: wx.getStorageSync('telPhone'),
                            },
                            header: {
                              'content-type': 'application/json',
                              "token": app.globalData.token
                            },
                            success: function (res) {

                              console.log('开始请求转借伞');
                              console.log(res);
                              fromId = res.data.data;
                              console.log(fromId);
                              var errorMsg;

                              if (1000 == res.data.success) {
                                wx.showLoading({
                                  title: '转借中',
                                });

                                //开始定时器获取转借申请记录
                                getLentRecordTask = setInterval(that.getLentRecord, 5000);
                              } else if (1001 == res.data.success) {
                                errorMsg = "找不到此伞的出借记录";
                              } else {
                                errorMsg = "找不到此用户的记录";
                              }
                            },
                            fail: function (res) {
                              console.log('请求转借失败');
                            },
                          });
                        } else {
                          console.log('进去开锁');
                          wx.showToast({
                            title: '开锁中...',
                            icon: 'loading',
                            duration: 10000
                          });

                          //正常借伞
                          var lockno = strArray[1];
                          wx.request({
                            url: config.scanCodeUrl,
                            data: {
                              uid: wx.getStorageSync('telPhone'),
                              lockno: lockno,
                            },
                            header: {
                              'content-type': 'application/json',
                              "token": app.globalData.token
                            },
                            success: function (res) {
                              var errorMsg;
                              if (1000 == res.data.success) {
                                app.globalData.orderId = res.data.data.orderId;
                                //定时请求订单状态 
                                getTravelOrderTask = setInterval(that.getTravelOrder, 1000);
                                return;
                              } else if (1001 == res.data.success) {
                                errorMsg = "用户当前状态无法借伞";
                              } else if (1003 == res.data.success) {
                                errorMsg = "用户借伞数量异常";
                              } else if (1010 == res.data.success) {
                                errorMsg = "找不到此用户";
                              } else if (1004 == res.data.success) {
                                errorMsg = "此伞已经被预定";
                              } else if (1002 == res.data.success) {
                                errorMsg = "找不到此伞编号";
                              } else if (1005 == res.data.success) {
                                errorMsg = "此伞正在使用中";
                              } else {
                                errorMsg = "借伞失败";
                              }

                              wx.showModal({
                                title: '提示',
                                content: res.data.msg,
                                success: function (res) {
                                  if (res.confirm) {
                                    console.log('用户点击确定')
                                  } else {
                                    console.log('用户点击取消')
                                  }

                                }
                              });
                            },
                            fail: function (res) {
                              console.log('请求开锁失败');
                            }
                          });
                        }
                      },
                      fail: function (res) {
                        console.log('扫码失败');
                      },
                    });
                  }else{
                    wx.showModal({
                      title: '提示',
                      content: '用户状态异常，请联系客服处理',
                      showCancel:false
                    })
                  }

                }

              } else {
                //未登录去进行登陆
                wx.navigateTo({
                  url: '/pages/Login_registration/Login_registration'
                });
              }

            }
          },
        });

      }
        break;
      //钱包控件的点击事件
      case 4: {
        //判断是否登陆
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
              if (app.globalData.isLogin) {
                //1.登陆状态
                wx.navigateTo({
                  url: '/pages/Personal_center/Personal_center'
                });
              } else {
                //2.未登录状态
                wx.navigateTo({
                  url: '/pages/Login_registration/Login_registration'
                });
              };
            }
          }
        });
      }
        break;

      case 5: {

      }
    }
  },

  // getNoFinishedTravelOrder
  // getNoFinishedTravelOrder

  //1.登陆成功后拉去未完成订单
  getNoFinishedTravelOrder1: function () {
    var that = this;
    wx.request({
      url: config.getNoFinishedTravelOrder,
      data: {
        uid: app.globalData.telPhone
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log(res);
        console.log(res.data.success);
        if (res.data.success == 1000) {
          var goodsNo = res.data.data.goodsNo;
          app.globalData.orderId = res.data.data.id;
          
          console.log('未完成订单的伞编号:' + goodsNo);
          console.log('未完成订单的订单号id' + app.globalData.orderId);
          that.setData({
            orderId: app.globalData.orderId
          });
          wx.redirectTo({
            url: '/pages/Charge_by_umbrella/Charge_by_umbrella?goodsNo=' + goodsNo
          })
          // wx.showModal({
          //   title: '提示',
          //   content: '您上次的用伞订单未正常结束，进入上次用伞界面？',
          //   showCancel:false,
          //   success: function (res) {
              
          //     if (res.confirm) {
          //       console.log('用户点击确定');
          //       wx.redirectTo({
          //         url: '/pages/Charge_by_umbrella/Charge_by_umbrella?goodsNo=' + goodsNo,
          //         success: function (res) {
          //           console.log('跳转骑行界面成功');
          //         },
          //         fail: function (res) {
          //           console.log('跳转骑行界面失败');
          //         }
          //       })
          //     }else if (res.cancel) {
          //       console.log('用户点击取消');

          //     }
          //   }
          // })
        } else if (res.data.success == 1001) {
          console.log('账户为空');
        } else {
          console.log('无未完成');
        }
      },
      fail: function (res) {
        console.log('访问未完成订单接口失败');
      }
    });
  },

  getNoFinishedTravelOrder: function () {
    var that = this;
    wx.request({
      url: config.getNoFinishedTravelOrder,
      data: {
        uid: app.globalData.telPhone
      },
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log(res);
        console.log(res.data.success);
        if (res.data.success == 1000) {
          var goodsNo = res.data.data.goodsNo;
          app.globalData.orderId = res.data.data.id;

          console.log('未完成订单的伞编号:' + goodsNo);
          console.log('未完成订单的订单号id' + app.globalData.orderId);
          that.setData({
            orderId: app.globalData.orderId
          });
          //跳转到借伞计费界面
          wx.redirectTo({
            url: '/pages/Charge_by_umbrella/Charge_by_umbrella?goodsNo=' + goodsNo,
            success: function (res) {
              console.log('跳转骑行界面成功');
            },
            fail: function (res) {
              console.log('跳转骑行界面失败');
            }
          });
        } else if (res.data.success == 1001) {
          console.log('账户为空');
        } else {
          console.log('无未完成');
        }
      },
      fail: function (res) {
        console.log('访问未完成订单接口失败');
      }
    });
  },
  //2.获取转借申请记录
  getLentRecord: function () {
    var that = this;
    wx.request({
      url: config.getSellRecord,
      data: {
        gid: that.data.gono,
        fromId: fromId
      },
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      method: 'GET',
      success: function (res) {
        console.log('拉去转借订单成功');
        console.log(res)
        //延时1秒执行
        setTimeout(function () {
          wx.hideLoading(); //隐匿提示框
          clearInterval(getLentRecordTask); //清除转借定订单时器
        }, 1000);
        if (res.data.data.state == 1) {
          console.log('已取消');
          wx.hideLoading();
          wx.request({
            url: config.responseOrderTransfer,
            data: {
              gid: that.data.gono,
              uid: app.globalData.telPhone,
              state: '1',
              fromId: fromId
            },
            header: {
              'content-type': 'application/json',
              "token": app.globalData.token
            },
            method: 'GET',
            success: function (res) {
              console.log(that.data.gono);
              console.log('设置状态为1');
              console.log(res);
            },
            fail: function (res) {
              console.log('拉去转借订单失败');
            },
          });

          clearInterval(getLentRecordTask);  //清除转借订单定时器
        } else if (res.data.data.state == 2) {
          console.log('对方已经确认');
          //对方同意进行转借，从未完成订单拉去转借订单进行用伞计费
          that.getNoFinishedTravelOrder();
          wx.hideLoading(); //隐匿提示框
          clearInterval(getLentRecordTask); //清除转借订单定时器
          wx.showToast({
            title: '对方已确认',
            duration: 2000
          })
          wx.request({
            url: config.responseOrderTransfer,
            data: {
              gid: that.data.gono,
              uid: app.globalData.telPhone,
              state: '2',
              fromId: fromId
            },
            header: {
              'content-type': 'application/json',
              "token": app.globalData.token
            },
            method: 'GET',
            success: function (res) {
              console.log(that.data.gono);
              console.log('设置状态为2');
              console.log(res);
            },
            fail: function (res) {
              console.log('拉去转借订单失败');
            },
          });
          wx.hideLoading();
        } else if (res.data.data.state == 3) {
          console.log('对方已拒绝请求');
          wx.hideLoading();
          clearInterval(getLentRecordTask); //清除转借订单定时器
          wx.showToast({
            title: '对方已拒绝',

            duration: 2000
          })
          wx.request({
            url: config.responseOrderTransfer,
            data: {
              gid: that.data.gono,
              uid: app.globalData.telPhone,
              state: '3',
              fromId: fromId
            },
            header: {
              'content-type': 'application/json',
              "token": app.globalData.token
            },
            method: 'GET',
            success: function (res) {
              console.log(that.data.gono);
              console.log('设置状态为3');
              console.log(res);
            },
            fail: function (res) {
              console.log('拉去转借订单失败');
            },
          });
          wx.hideLoading();
        } else {
          console.log('转借伞超时');
          //当转借状态为0的时候是为转借超时，重新请求转借接口，把状态设置为4
          console.log('转借伞超时：设置转借状态为4');
          clearInterval(getLentRecordTask); //清除转借订单定时器
          //延时2秒
          setTimeout(function () {
            wx.request({
              url: config.responseOrderTransfer,
              data: {
                gid: that.data.gono,
                uid: app.globalData.telPhone,
                state: '4',
                fromId: fromId
              },
              header: {
                'content-type': 'application/json',
                "token": app.globalData.token
              },
              method: 'GET',
              success: function (res) {
                console.log(that.data.gono);
                console.log('请求设置转借伞状态成功');
                console.log(res);
                if (res.data.success == 1002) {
                  console.log('去计费界面');
                  that.getNoFinishedTravelOrder();
                } else if (res.data.success == 1001) {
                  console.log('参数为空');
                } else {
                  console.log('设置状体成功');
                  wx.showToast({
                    title: '转借伞超时',
                    duration: 2000
                  })
                }
              },
              fail: function (res) {
                console.log('拉去转借订单失败');
              },
            });
          }, 2000);
        }
      },
      fail: function (res) {
        console.log('拉去转借订单失败');
      },
    });
  },
  //获取用户的信息
  getInfo: function () {
    var that = this
    wx.request({
      url: config.loaduserinfo,
      data: {
        uid: app.globalData.telPhone,
      },
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      method: 'GET',
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
          if (res.data.success == 1000) {
            var accountBalance = res.data.data.accountBalance;
            var accountDeposit = res.data.data.accountDeposit;
            console.log('用户当前余额：' + accountBalance);
            console.log('用户当前押金:' + accountDeposit);
            that.setData({
              accountBalance: accountBalance,
              accountDeposit: accountDeposit
            });
          }
        }

      },
      fail: function (res) {
        console.log('获取用户信息失败');
      }
    });
  },
  //定时获取订单状态
  getTravelOrder: function () {


    var that = this;
    var timestamp = Date.parse(new Date());
    wx.request({
      url: config.getTravelOrder,
      data: {
        orderId: app.globalData.orderId,
        random: timestamp
      },
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      method: 'GET',
      success: function (res) {
        if (res.data.data.state == 4) {

          wx.showLoading({
            title: '借伞超时',
          })

          //超时关闭定时器，设置扫码可点击
          clearInterval(getTravelOrderTask);
          setTimeout(function () {
            wx.hideLoading();
            app.globalData.isScanCode = true;
          }, 1000);

        } else if (res.data.data.state == 1) {
          //借伞成功跳转用伞界面、关闭定时器
          wx.redirectTo({
            url: '/pages/Charge_by_umbrella/Charge_by_umbrella?lockno=' + lockno + '&orderId=' + res.data.data.orderId,
          });
          clearInterval(getTravelOrderTask);
        } else if (res.data.data.state == 0) {
          //等待中 设置提示，
          app.globalData.isScanCode = false;
          wx.showLoading({
            title: '请按照提示开锁,完成借伞！',
          });
          //超时关闭定时器 设置扫码可点击
          setTimeout(function () {
            wx.hideLoading();
            clearInterval(getTravelOrderTask);
            app.globalData.isScanCode = true;
          }, 14000);

        }
      }
    });
  },
  onUnload: function () {
    clearInterval(getTravelOrderTask);
  }
})
