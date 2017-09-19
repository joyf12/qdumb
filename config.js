//测试环境
// var host = "sys.farina.cc:8443/umb"
//正式环境
var host = "sys.ibike365.cn/umb"
var config = {

  // 请求发送短信验证码地址
  requestCheckCodeUrl: `https://${host}/getCheckCode`,

  // 手机短信验证码登录
  wxAppmobileLogin: `https://${host}/wxAppMobileLogin`,

  // 获取账户余额
  requestBalanceUrl: `https://${host}/getUserMoney`,

  // 支付发送商品详情
  sendPayDetailsUrl: `https://${host}/requestWxPay`,

  // 实名认证接口
  realNameCheckUrl: `https://${host}/realnamecheck`,

  //扫码借车接口
  scanCodeUrl: `https://${host}/m?xwl=umb/webapi/wxscanCode`,

  //获取锁的信息
  getShareBikeInfo: `https://${host}/wxGetShareBikeInfo`,

  //获取锁的状态
  checklockstateUrl: `https://${host}/getTravelOrderState`,

  //获取会员的基本信息
  loaduserinfo: `https://${host}/loaduserinfo`,

  //获取骑行结费
  getTravelOrder: `https://${host}/getTravelOrder`,

  //拉去未完成订单
  getNoFinishedTravelOrder: `https://${host}/getNoFinishedTravelOrder`,

  //获取openid
  getWxXCXOpenId: `https://${host}/m?xwl=umb/webapi/wxgetWxXCXOpenId`,

  //提交锁异常的状态
  feedbackTravelOrder: `https://${host}/m?xwl=umb/webapi/appfeedbackTravelOrder`,

  //获取转借申请记录
  getSellRecord: `https://${host}/getSellRecord`,

  //获取订单转借 处理动作
  responseOrderTransfer: `https://${host}/responseOrderTransfer`,

  //申请订单转让
  applyOrderTransfer: `https://${host}/applyOrderTransfer`,

  //充值记录
  applistRechargeOrder: `https://${host}/applistRechargeOrder`,

  //借伞记录
  listUserTravelOrder: `https://${host}/listUserTravelOrder`,

  //获取项目详情
  getProjectDetail: `https://${host}/getProjectDetail`,

  //获取用户积分
  appGetCredit: `https://${host}/m?xwl=umb/webapi/appGetCredit`,

  //积分记录
  appGetCreditDetail: `https://${host}/m?xwl=umb/webapi/appGetCreditDetail`,

  //押金退款
  ReturnDepositMoney: `https://${host}/appreturnDeposit`,
}
module.exports = config