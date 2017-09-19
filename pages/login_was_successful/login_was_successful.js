var app = getApp();

Page({
  data: {
    page_width: 320,
    page_height: 320
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    var that = this;

    // 动态设置map的宽和高
    wx.getSystemInfo({
      success: function (res) {
        console.log('getSystemInfo');
        console.log(res.windowWidth);
        that.setData({
          page_width: res.windowWidth,
          page_height: res.windowHeight
        })
      }
    }),
      //注册成功，默认为直接登录
      app.globalData.isLogin = true;
    app.globalData.telPhone = wx.getStorageSync('telPhone');
    wx.setStorageSync('islogin', 'true');
  },
  //开始用车的点击事件
  startUseBike: function (e) {

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
          wx.redirectTo({
            url: '/pages/index/index'
          });
        }
      },
    });
  }
})