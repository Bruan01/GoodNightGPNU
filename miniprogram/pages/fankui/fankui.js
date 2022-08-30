const app = getApp()
const db = wx.cloud.database({env:"wan-an-gpnu-4gm1hsj6bb4b58fb"})
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  formsubmit(event){
    wx.showToast({
      title: '提交成功!',
      icon:"none",
      duration:800
    })
    setTimeout(function(){
      wx.navigateBack({
        delta: 1,
      })
    },950)




    //反馈的信息上传到数据库system表
    var fankui={}
    fankui.text=event.detail.value.text
    fankui.type=event.detail.value.radio
    fankui.fkrid=app.userInfo._id



    db.collection('system').doc('d2fe6f20624bbbdf04d919f625e84b1a').update({
      data:{
        fankui:_.push(fankui)
      }
    }).then(res=>{
      console.log("上传成功!")
    })


  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})