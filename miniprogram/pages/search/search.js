var db=wx.cloud.database()
const _ = db.command
var app=getApp()
Page({
  //页面的初始数据
  data: {
    ss_xx:[],
    _ss_xx:[],
    text:"",
    yincang:true,
    zuixinorzuire:0,
    index:-1,
    yizhou:"",
    kong:false,
    loading:false,
  },



  //用来检查用户是否登录，若未登录则弹出提示
  check_login(){
    wx.showModal({
      title: '提示',
      content: '登录后才可进行此操作！是否进行授权登录？',
      showCancel:true,
      confirmText:'是',
      confirmColor:'#000000',
      cancelText:'否',
      cancelColor:'#FF4D49',
      success (res) {
      if (res.confirm) {
        wx.switchTab({url:"/pages/my/my"})
        return
      } else if (res.cancel) {
        return
      }
      }
    })
  },



  //跳转到详情！！！！！！！！！！！
  xiangqing(){
    wx.navigateTo({
      url:"/pages/detail/detail"
    })
  },


  
  // 点击进入头像！！！！！！！！！！！！！！！！！！
  touxiangxiangqing(){
    var _id=app.userInfo._id
    if(_id==""){
      this.check_login()
      return
    }
    wx.navigateTo({
      url: '/pages/mytopic/mytopic',
    })
  },
  
  //刷新！！！！！！！！！！
  shuaxin(){
    var shuaxin=true
    this.jiazai(shuaxin)
  },


  
  //生命周期函数--监听页面加载！！！！！！！！！！！！
  onLoad: function (text) {
    this.setData({
      text:text.text
    })
    this.shuaxin()
  },




  //加载数据(刷新状态下，data内ss_xx数组重新赋值)！！！！！！！！！！！！
  jiazai(shuaxin){
    var text=this.data.text
    var zuixinorzuire=this.data.zuixinorzuire
    if(shuaxin){
      var head=0
    }else{
      var head=this.data.ss_xx.length
    }

/////////////////////
if(zuixinorzuire==0){
  //按照时间排取消时间限制，
  zuixinorzuire="_time"
  var yizhou=0
}else{
  //按照热度排行
  zuixinorzuire="shuoshuo_xingxi.look"
  var yizhou=this.data.yizhou
}
/////////////////////

    db.collection("sshuo").where(
      
      _.or([
        {
          "shuoshuo_xingxi.nr":{
            $regex:'.*'+ text,
            $options: 'i'
          }
        },
        {
          "shuoshuo_xingxi.title":{
            $regex:'.*'+ text,
            $options: 'i'
          }
        }
      ]),
      {'shuoshuo_xingxi.jubao.1':db.command.lte(9)},
      {_time:db.command.gt(yizhou)}

      
      ).orderBy(zuixinorzuire,'desc')
      .skip(head).get().then(async(res)=>{
        if(res.data==""){
          this.setData({
            kong:true
          })
          wx.hideLoading({})
          wx.stopPullDownRefresh({})
          wx.showToast({
            title: '没有更多了',
            icon: 'none',
            duration: 800
          })
          return
        }else if(shuaxin){
          var ss_xx=await this.love(res.data)
        }else{
          var ss_xx=this.data.ss_xx
          var xx=await this.love(res.data)
          ss_xx.push.apply(ss_xx,xx)
        }
        this.setData({
          ss_xx:ss_xx,
          kong:true
        })
        if(shuaxin){
          wx.stopPullDownRefresh({})
          wx.hideLoading({})
          wx.showToast({
            title: '搜索完毕',
            icon: 'none',
            duration: 800
          })
        }else{
        }
      })
  },






  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
    //写出一周前的时间戳
    var now=new Date().getTime()//现在的时间
    var yizhou=(now-3600*7000*24)
    this.setData({
      yizhou:yizhou
    })
  },

  //生命周期函数--监听页面显示
  onShow: function () {
    //点赞页面返回更新点赞评论浏览状态
    var index=this.data.index
    var ss_xx=this.data.ss_xx
    if(index>=0){
      ss_xx[index].shuoshuo_xingxi.look=app.ssinfo.looknb
      var loveinfo=app.loveinfo
      if(loveinfo=='true'){
        ss_xx[index].love=true
        app.loveinfo=""
      }else if(loveinfo=='false'){
        ss_xx[index].love=false
        app.loveinfo=""
      }
      ss_xx[index].shuoshuo_xingxi.huifunb=app.ssinfo.plnb
      ss_xx[index].shuoshuo_xingxi.dianzannb=app.ssinfo.lovenb
      this.setData({
        ss_xx:ss_xx,
        index:-1
      })
      
    }
  },

  //生命周期函数--监听页面隐藏
  onHide: function () {},
  //生命周期函数--监听页面卸载
  onUnload: function () {},
  //页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {},
  //页面上拉触底事件的处理函数！！！！！！！！！！！！！！！
  onReachBottom: function () {
    this.jiazai()
  },

  //点击跳到详情！！！！！！！！！！！！！！！！
  xiangqing(e){
    var id=e.currentTarget.dataset.id
    var love=e.currentTarget.dataset.love
    var index=e.currentTarget.dataset.index
    wx.cloud.callFunction({
      name:"look",
      data:{
        id:id,
        type:'ss'
      }
    })
    if(love){
      love='true'
    }else{
      love='false'
    }
    wx.navigateTo({
      url:"../detail/detail?id="+id+"&fenxiang=false&liuyan=false&love="+love
    })
    this.setData({
      index:index
    })

  },
 



  //返回组件Tabs的监听
  changetitle(e){
    var zuixinorzuire=this.data.zuixinorzuire
    if(e.detail!=zuixinorzuire){
      //暂存待机位
      var zhongjian=this.data._ss_xx
      //赋值待机位
      var _ss_xx=this.data.ss_xx
      var ss_xx=zhongjian
      this.setData({
        zuixinorzuire:e.detail,
        ss_xx:ss_xx,
        _ss_xx:_ss_xx
      })
      if(ss_xx.length==0){
        this.setData({
          kong:false
        })
        this.jiazai()
      }
    }
  },


  //下拉动作-刷新
  onPullDownRefresh: function () {
    this.shuaxin()
  },
  //处理点赞数据
async love(e){
  var l=e.length
  for(var i=0;i<l;i++){
    var yn=e[i].shuoshuo_xingxi.dianzanid.indexOf(app.userInfo._id)
    if(yn==-1){
      e[i].love=false
    }else{
      e[i].love=true
    }
  }
  return e
},
  //点赞帖子(这里得加index)
  dianzan(e){
    var _id=app.userInfo._id
    var id=e.currentTarget.dataset.id
    var index=e.currentTarget.dataset.index
    if(_id==""){
      wx.showModal({
        title: '提示',
        content: '登录后才可进行此操作！是否进行授权登录？',
        showCancel:true,
        confirmText:'是',
        confirmColor:'#000000',
        cancelText:'否',
        cancelColor:'#FF4D49',
        success (res) {
        if (res.confirm) {
          wx.switchTab({url:"../my/my/my"})
          return
        } else if (res.cancel) {
        return
        }
        }
      })
      return
    }
    wx.cloud.callFunction({
      name:"dianzan",
      data:{
        id:id,
        dzrid:_id
      }
    })
    var ss_xx=this.data.ss_xx
    if(this.data.ss_xx[index].love){
      ss_xx[index].love=false
      ss_xx[index].shuoshuo_xingxi.dianzannb--
    }else{
      ss_xx[index].love=true
      ss_xx[index].shuoshuo_xingxi.dianzannb++
    }
    this.setData({
      ss_xx:ss_xx
    })
  },
})