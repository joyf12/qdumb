var app = getApp();
var config = require('../../config.js');
var pageSize = 10;
var pageNumber = 1;
var hasEnd = false;
Page({
  data: {
    pageData: [],
    hasEnd: false
  },
  onShow: function () {
    console.log(hasEnd);
    console.log(pageNumber);
    var that = this;
    // 加载借伞记录
    wx.request({
      data: {
        uid: wx.getStorageSync('telPhone'),
        pageSize: pageSize,
        pageNumber: pageNumber
      },
      url: config.listUserTravelOrder,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        var pageData = res.data.data.pageData;
        console.log(pageData);
        var currentPage = res.data.data.currentPage;
        var totalPage = res.data.data.totalPage;
        if ((totalPage >= currentPage) && !hasEnd) {
          if (totalPage == currentPage) {
            hasEnd = true; //设置不再加载
          }
          //把拉去到的内容进行累加
          that.setData({
            pageData: pageData

          });
        } else {
          console.log('没有了 ');
        }
      }

    });
  },
  //下拉刷新
  onPullDownRefresh() {
    hasEnd = false;
    pageNumber = 1; 
    console.log(pageNumber);
    console.log(hasEnd);
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    wx.request({
      data: {
        uid: wx.getStorageSync('telPhone'),
        pageSize: pageSize,
        pageNumber: pageNumber
      },
      url: config.listUserTravelOrder,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log(res.data.data);
        var pageData = res.data.data.pageData;
        var currentPage = res.data.data.currentPage;
        var totalPage = res.data.data.totalPage;
        if ((totalPage >= currentPage) && !hasEnd) {
          if (totalPage == currentPage) {
            hasEnd = true; //设置不再加载
          }
          //拉去的内容进行展示，不在累加
          that.setData({
            pageData: pageData

          });
        } else {
          console.log('没有了 ');
        }
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }

    });
  },
  //上拉加载更多
  onReachBottom() {
    console.log("页面上啦");
    console.log(pageNumber);
    console.log(hasEnd);
    ++pageNumber;
    var that = this;
    wx.request({
      data: {
        uid: wx.getStorageSync('telPhone'),
        pageSize: pageSize,
        pageNumber: pageNumber
      },
      url: config.listUserTravelOrder,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "token": app.globalData.token
      },
      success: function (res) {
        console.log(res.data.data);
        var currentPage = res.data.data.currentPage;
        var totalPage = res.data.data.totalPage;
        if ((totalPage >= currentPage) && !hasEnd) {
          if (totalPage == currentPage) {
            hasEnd = true; //设置不再加载
          }
          //把拉去到的内容进行累加
          that.setData({
            pageData: that.data.pageData.concat(res.data.data.pageData)

          });
        } else {
          console.log('没有了 ');
        }

      }

    })

  },
  onUnload: function () {
    pageSize = 10;
    pageNumber = 1;
    hasEnd = false;
  },

})