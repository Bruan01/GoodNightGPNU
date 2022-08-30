const app=getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,
    ss_xx:[],
    _ss_xx:[],
    lunbotu:[],      ////////////
    yincang:true,    ////////////
    shuaxin:"",
    search:"",
    zuixinorzuire:0,
    movehight:500,   ////////////
    movehight2:500,  ///////////
    jianting:false,
    message:[],
    index:-1,
    yizhou:"",
    kong:false,
    gonggao:{
      title:"版本更新"
    },
    //底部部件
    loading:true,
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




  // 点击进入头像！！！！！！！！！！！！！！！！！！
  touxiangxiangqing(event){
    var _id=app.userInfo._id
    if(_id==""){
      this.check_login()
      return
    }
    wx.navigateTo({
      url: '/pages/mytopic/mytopic?openid='+event.currentTarget.dataset.openid,
    })
  },


  //跳转传参，传递板块名！！！！！！！！！！！！！！
  tiaozhuan(bankuai){
    var bankuai=bankuai.currentTarget.dataset.bankuai
    wx.navigateTo({
      url:"../dongtai/dongtai?bankuai="+bankuai
    })
  },



 //点击跳到详情===============================================
  xiangqing(e){
    var id=e.currentTarget.dataset.id
    var love=e.currentTarget.dataset.love
    var index=e.currentTarget.dataset.index
    wx.cloud.callFunction({
      name:"look",
      data:{
        id:id,
      }
    }).then(res=>{
    })
    
    if(love){
      love='true'
    }else{
      love='false'
    }

    wx.navigateTo({
      url: "/pages/detail/detail?id="+id+"&fenxiang=false&liuyan=false&love="+love,
    })

    this.setData({
      index:index
    })
  },



  // 发表！！！！！！！！！！！！！！！！！！！！！！
  fabiao(){
    // 未登录不能发帖
    if (app.userInfo.userinfo.login == "未知") {
      wx.showToast({
        title: "您未登录不能发帖!",
        icon:"none",
        duration: 1500
      })
      return
    }
    else{
      this.setData({
        show:true
      })
    }
  },

  onClose(event) {
    this.setData({ show: false });
  },

  










  //消息监听===============================================
  jianting(){
    var _id=app.userInfo._id
    var that=this
    this.watcher = db.collection('user').doc(_id).watch({
      onChange: function(e) {
        app.userInfo=e.docs[0]
        var message=e.docs[0].message//message数组
        app.message=message
        that.jiantingchuli(message)
      },
      onError: function(err) {
        console.error('监听出现问题！', err)
      }
    })
  },


  

  /*
  下面存放监听变化代码,进行红点更新
  */
  jiantingchuli(e){
  var weidu=e.length//未读消息总数
  if(weidu!=0){
    //有未读，设置红点得看页面层级
    var ceng=getCurrentPages()
    if(ceng.length==1){
      //只有tabar页面才可以设置红点
      wx.setTabBarBadge({
        index: 3,
        text: weidu.toString()
      })
    }
    
    //2.新的消息震动提醒
    var message=this.data.message//本地已收到message数组、每条新的消息都纪录进去
    for(var i=0;i<weidu;i++){
      var id=e[i].id
      var yn=JSON.stringify(message).includes(id)
      if(!yn){
        //说明是新的消息,给他震动提醒
        message.push(e[i])
        this.setData({
          message:message
        })
        //震动
        wx.vibrateLong({
          type:'heavy'
        })
      }
    }
    
  }else{
    var ceng=getCurrentPages()
    if(ceng.length==1){
      //仅可在tabar页面设置红点
      wx.removeTabBarBadge({index: 3})
    }
  }
  
  },



 // 刷新===============================================
  shuaxin(){
    this.setData({
      shuaxin:"",
      search:"",
      kong:false,
      loading:true
    })
    var shuaxin=true
    this.jiazai(shuaxin)
  },


  //加载数据===============================================
  //(刷新状态下，data内ss_xx数组重新赋值)
  jiazai(shuaxin){
    var zuixinorzuire=this.data.zuixinorzuire
    var shuaxin2=this.data.shuaxin
    shuaxin=shuaxin2==""?shuaxin:shuaxin2

    if(shuaxin==true){
      var head=0
    }else{
      var head=this.data.ss_xx.length
    }

    /////////////////////
    if(zuixinorzuire==0){
      zuixinorzuire="_time"  //按照时间排取消时间限制，
      var yizhou=0
    }else{
      zuixinorzuire="shuoshuo_xingxi.look" //按照热度排行
      var yizhou=this.data.yizhou
    }


    //=============================
    db.collection('sshuo').where({
      'shuoshuo_xingxi.jubao.1':db.command.lte(9),
      _time:db.command.gt(yizhou)
    }).orderBy(zuixinorzuire,'desc')
    .skip(head).limit(head+5).get().then(async(res)=>{
      if(res.data.length<(head+5)&&res.data.length<5){
        this.setData({
          loading:false
        })
      }
      if(res.data==""){
        this.setData({
          kong:true,       
        })
        wx.stopPullDownRefresh({})
        // wx.showToast({
        //   title: '没有更多了',
        //   icon:'none',
        //   duration: 800
        // })
        return
      }else if(shuaxin==true){
        // 真刷新状态
        var ss_xx=await this.love(res.data)
      }else{
        // 加载并加入
        var ss_xx=this.data.ss_xx
        var xx=await this.love(res.data)
        ss_xx.push.apply(ss_xx,xx)
      }



      //写进本地
      this.setData({
        ss_xx:ss_xx,
        kong:true
      })

      // 刷新提示
      // if(shuaxin==true){
      //   wx.stopPullDownRefresh({})
      //   wx.showToast({
      //     title: '',  //刷新成功
      //     icon: 'none',
      //     duration: 100
      //   })
      // }else{}
    })
  },



  //处理点赞数据===============================================
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



  //点赞帖子（这里得加index）====================================
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
          wx.switchTab({url:"/pages/my/my"})
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
    }).then(res=>{
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



  //返回组件Tabs的监听=======================================
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
        _ss_xx:_ss_xx,
      })
      if(ss_xx.length==0){
        this.setData({
          kong:false
        })
        this.jiazai()
      }
    }
  },


  

  search(e){
    var text=e.detail.value
    if(text==""){
      wx.showToast({
        title: '不能为空',
        icon:"none",
      })
      return
    }else{
      wx.navigateTo({
        url:"../search/search?text="+text
      })
    }
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
    }
  },


  // 判断是不是管理员
  guanliyuan(e){
    var _openid = e
    db.collection('system').doc("d2fe6f20624bbbdf04d919f625e84b1a")
      .get().then((res)=>{
        console.log(res);

        var flag=res.data.glid.indexOf(_openid)
        console.log(flag);
        if(flag!=-1){
          app.glid=e
        }
      })
  },

  



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var tjid=options.id
    var fenxiang=options.fenxiang
    var liuyan=options.liuyan

    app.fenxiang="false"
    wx.showLoading({    /*调用云函数登录*/ 
      title: '检查登录',
      mask: true
    })

    wx.cloud.callFunction({
      name:"gpnu_login",
      data:{}
    }).then((res)=>{
      console.log("++++++++++++++++++++++++++++++++++++++++"+res);
      db.collection('user').where({_openid:res.result.openid}).get()
      .then((res)=>{
        app.userInfo=Object.assign(app.userInfo,res.data[0])
 
        this.jiazai()
        wx.hideLoading()


        if(app.userInfo._openid==""){
          wx.showToast({
            title: '未登录只可浏览',
            icon:'none',
            duration:1500
          })
        }else{
          //登录上了就监听user
          this.guanliyuan(app.userInfo._openid)
          this.jianting()
          this.setData({jianting:true})
        }

        if(tjid!="" && tjid!=undefined && tjid!=null){
          wx.navigateTo({
            url:"../detail/detail?id="+tjid+"&fenxiang=false"+"&liuyan="+liuyan
            // url:"../detail/detail?id="+tjid+"&fenxiang="+fenxiang+"&liuyan="+liuyan
          })
        }
      })
    })
  },
 


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //写出一周前的时间戳
    var now=new Date().getTime()//现在的时间
    var yizhou=(now-3600*7000*24)
    this.setData({
      yizhou:yizhou
    })
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      show:false,
    })
 
    this.checkred()
    // 这是发帖成功
    var shuaxin=app.shuaxin
    if(shuaxin){
      this.shuaxin()
      app.shuaxin=false
    }

    //这是检测是否登陆，开启监听
    if(app.userInfo._id!=""){
      //登录态
      if(!this.data.jianting){
        //开启监听
        this.jianting()
        this.setData({jianting:true})
      }
    }

    // 点赞页面返回更新点赞评论浏览状态
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



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},



    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.jiazai("")
  },

    /*
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.shuaxin()
    setTimeout(function () {
      // 不加这个方法真机下拉会一直处于刷新状态，无法复位
      wx.stopPullDownRefresh()
    }, 1000)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{title:"微信小程序-晚安广师君"}
  },

})