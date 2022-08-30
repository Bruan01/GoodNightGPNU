var util = require('../../util/common');
const app = getApp();
//环境id记得修改
const db=wx.cloud.database({env: 'wan-an-gpnu-4gm1hsj6bb4b58fb',});
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //时间选择器
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    maxDate: new Date(2025, 12, 30).getTime(),
    currentDate: new Date().getTime(),
    //
    //是否跳转页
    flag:false,
    nowDate:'',
    countdown: '', //倒计时
    days: '00', //天
    hours: '00', //时
    minutes: '00', //分
    seconds: '00', //秒
  },
  //展开时间选择器
  show_timechoose(){
    this.setData({
      show_timechoose:true
    })
  },

  //获取时间
  onInput(event) {
    this.setData({
      afterchoose_time:util.getTime(event.detail,2),
      currentDate: event.detail,
    });
  },
  //添加时间
  addTime(e){
    wx.showToast({
      title: '暂未实现，敬请期待~',
      duration: 2000,
      mask: true,
      icon:"none"
    })
},

//返回默认倒计时
todjs(){
  wx.showToast({
    title: '暂未实现，敬请期待！',
    duration: 2000,
    mask: true,
    icon:"none"
  })
},

//递归函数本体 时间倒数
countTime() {
  //查找记录
  db.collection("ddl").doc(this.data._id).get().then(res=>{
      this.setData({
        thing:res.data.NAME,
        nowDate:res.data.DDL
      })
      let days,hours, minutes, seconds;
      let nowDate = this.data.nowDate;
      let that = this;
      let now = new Date().getTime();
      let end = new Date(nowDate).getTime(); //设置截止时间
      let leftTime = end - now; //时间差            
  
  if (leftTime >= 0) {
    days = Math.floor(leftTime / 1000 / 60 / 60 / 24);
    hours = Math.floor(leftTime / 1000 / 60 / 60 % 24);
    minutes = Math.floor(leftTime / 1000 / 60 % 60);
    seconds = Math.floor(leftTime / 1000 % 60);
    seconds = seconds < 10 ? "0" + seconds : seconds
    minutes = minutes < 10 ? "0" + minutes : minutes
    hours = hours < 10 ? "0" + hours : hours
    that.setData({
      countdown: days+":"+hours + "：" + minutes + "：" + seconds,
      days,
      hours,
      minutes,
      seconds
    })
    //递归每秒调用countTime方法，显示动态时间效果
       setTimeout(that.countTime, 1000);
      }   
      else {
        that.setData({
          countdown: '已截止'
        })
      }
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