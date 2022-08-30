// pages/my/my.js
//引入工具类
import common from "../../util/common";
const app=getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      userphoto:"/images/logo2.jpg",
      username:"晚安广师君",
      anonymous:"",
      login:"未知",
      wenzhang:[],
      message:[],
      fenxiang:"false",
      openid:"",
      //用户总关注数，总粉丝数，总话题数
      total_guanzhu:"",
      total_fans:"",
      total_huati:"",
      //用户同意协议
      xieyi:"false",
      xianshixieyi:0
  },

  //用户同意协议
  tongyixieyi(e){
    if(e.detail.value.length!=0){
      this.setData({
        xieyi:e.detail.value[0]
      })
    }else{
      this.setData({
        xieyi:"false"
      })
    }
  },

  //用户同意协议
  xianshixieyi(){
    wx.navigateTo({
      url: "/pages/xieyi/xieyi"
    })
  },




   //跳转到个人主页
   to_myinfornation(){
    wx.navigateTo({
      url: '/pages/myinfornation/myinfornation?openid='+this.data.openid,
    })
  },


  fensi(event){
    wx.navigateTo({
      url: '/pages/fans_list/fans_list?flag='+event.currentTarget.dataset.flag
    })
  },  



  /*这是用户授权登录向数据库提交 */
  GetUserInfo(){
    if(this.data.xieyi=="false"){
      wx.showToast({
        title: '请先勾选用户协议！',
        icon:"none"
      })
      return
    }

    let userinfo;  

    wx.getUserProfile({
      desc: 'desc',
    }).then((res)=>{
      userinfo=res.userInfo  //存储用户信息

      if(this.data.login==false && userinfo){
        wx.showLoading({
          title: '登陆中...',
        })

        db.collection('user').add({   //向数据库增加该用户信息
          data:{
            allow:true,
            ban:false,
            online:true,
            message:[],
            msgnb:[0,0],
            fans:[], //粉丝列表
            concerned:[],  //关注列表
            pinglunguode:[],
            wenzhang:[],
            huati:[],
            food_list:["酸菜鱼","麻辣烫","螺蛳粉","麻辣香锅","牛肉面"],
            weiguinb:0,
            bottle_pick:[],//漂流瓶捡到的
            NUM:8,//漂流瓶抽奖次数 默认8次 注册时就有的
            userinfo:{
              sex:"",
              userphoto:userinfo.avatarUrl,
              username:userinfo.nickName,
              anonymous:"",
              login:true,
            },
          }
        }).then((res)=>{
          db.collection('user').doc(res._id).get().then((res)=>{

            app.userInfo=Object.assign(app.userInfo, res.data)

            wx.hideLoading()

            this.setData({
              openid:res.data._openid,
              userphoto:app.userInfo.userinfo.userphoto,
              username:app.userInfo.userinfo.username,
              anonymous:app.userInfo.userinfo.anonymous,
              login:true,
              wenzhang:app.userInfo.wenzhang,
              message: app.userInfo.userinfo.message
            })
            this.get_total()
            wx.showToast({
              title: '登陆成功！',
            })
            if(app.fenxiang=="true"){
              app.fenxiang=="false"
              wx.navigateTo({
                url:"/pages/detail/detail?id="+app.fxssid+"&fenxiang=false"
              })
            }
          })
        })
      }
    })
  },



  //未登陆下的重试
  weidengluchongshi(){
    let logined=app.userInfo.userinfo.login;
    if(logined!=true){   //若不是登录态，调用云函数登录
      wx.showLoading({
        title: '尝试登陆',
      })

      wx.cloud.callFunction({
        name:"gpnu_login",
        data:{}
      }).then((res)=>{
        let openid=res.result._openid;
        db.collection("user").where({_openid:res.result.openid})
        .get().then((res)=>{
          app.userInfo=Object.assign(app.userInfo,res.data[0]);
          if(app.userInfo.userinfo.login==true){
            this.setData({
              openid:res.data._openid,
              userphoto:app.userInfo.userinfo.userphoto,
              username:app.userInfo.userinfo.username,
              anonymous:app.userInfo.userinfo.anonymous,
              login:app.userInfo.userinfo.login,
              wenzhang:app.userInfo.wenzhang,
              message:app.userInfo.message,
            })
            this.get_total()
            wx.hideLoading()
            if(app.fenxiang=="true"){
              app.fenxiang=="false"
              wx.navigateTo({
                url:"/pages/detail/detail?id="+app.fxssid+"&fenxiang=false"
              })
            }
          }else{
            this.setData({login:false})
            app.userInfo.userinfo=Object.assign(app.userInfo.userinfo,{login:false})
            wx.showToast({
              title: '未授权登录',
              icon:'none',
              duration:800
            })
          }
        })
      });
    }
    else{
      wx.cloud.callFunction({
        name:"gpnu_login",
        data:{}
      }).then((res)=>{
          this.setData({
            openid:res.result.openid
          })
          this.get_total()
      })
    }
  },

  
  //查看我的头像
  chakantouxiang(){
    var url=app.userInfo.userinfo.userphoto
    wx.previewImage({
      urls: [url],
    })
  },

  //


   //总关注数，总粉丝数，总话题数
  get_total(){
    db.collection("user").where({
      _openid:app.userInfo._openid
    }).get().then(res=>{
      this.setData({
        total_guanzhu:res.data[0].concerned.length,
        total_fans:res.data[0].fans.length,
        total_huati:res.data[0].huati.length,
      })
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.weidengluchongshi()
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
    this.checkred()
    this.setData({
      userphoto: app.userInfo.userinfo.userphoto,
      username: app.userInfo.userinfo.username,
      anonymous: app.userInfo.userinfo.anonymous,
      login: app.userInfo.userinfo.login,
      wenzhang: app.userInfo.wenzhang,
      message:app.userInfo.message,
    })
    let logined=app.userInfo.userinfo.login;
    if(logined==true){
      this.get_total()
    }
 
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
    var _id=app.userInfo._id
    db.collection('user').doc(_id).get().then((res)=>{
      this.setData({
        openid:res.data._openid,
        userphoto:res.data.userinfo.userphoto,
        username:res.data.userinfo.username,
        anonymous:res.data.userinfo.anonymous,
        login:res.data.userinfo.login,
        wenzhang:res.data.wenzhang,
        message:res.data.message,
      })
      app.userInfo=res.data
      wx.stopPullDownRefresh({})
      // wx.showToast({
      //   title: "刷新成功",
      //   icon: 'none',
      //   duration: 800
      // })
    })
    this.get_total()
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
    return{title:"微信小程序-晚安广师君"}
  },


  //刷新消息红点(用于更新非tabar页面未设置的红点)
  checkred(){
    var weidu=app.message.length
    if(weidu!=0){
      //有未读
      wx.setTabBarBadge({
        index: 3,
        text: weidu.toString()
      })
    }else{
      wx.removeTabBarBadge({index: 3})
    }
  },

})