const app=getApp()
const db = wx.cloud.database({env:"wan-an-gpnu-4gm1hsj6bb4b58fb"})

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id:"",
    userphoto:"",
    username:""
  },

  
  changetx(){
    wx.showToast({
      title: '暂未实现该功能！',
      icon: 'none',
      duration: 800
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _id = app.userInfo._id;
    db.collection('user').doc(_id).get().then(res=>{
      this.setData({
        _id:_id,
        userphoto:res.data.userinfo.userphoto,
        username:res.data.userinfo.username,
      })
    })
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