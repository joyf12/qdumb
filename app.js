App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var telPhone = wx.getStorageSync('telPhone')
    console.log("要缓存的手机号==》" + telPhone)
    if (telPhone) {         //在这里不能用true，用true改变不了状态，其它地方却可以，不知道为什么
      this.globalData.isLogin = !this.globalData.isLogin
      this.globalData.telPhone = telPhone;
      console.log("缓存中的手机号==》" + this.globalData.telPhone);
    }
  },
  //全局变量
  globalData: {
    telPhone: '',//手机号
    isLogin: false,//登陆状态
    hasFinishRegister: 0,//用户的标识状态
    windowWidth: 0,//屏幕的宽
    windowHeight: 0, //屏幕的高
    cost: '',//骑行消费金额
    use_time: '',//骑行时间
    balance: '',//钱包余额
    orderId: '',//本次骑行的订单号
    accountDeposit: '',//用户的押金余额
    realNameState: '0',//实名制认证的状态
    state: false,//自行车的状态
    isScanCode:true, //是否可以扫码
    token:'', //登录的token
    accountState:'',//用户状态，是否可以正常使用
  }
})
