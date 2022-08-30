var util=require('../../util/util.js')
const db=wx.cloud.database()
var app=getApp()
var _=db.command
Page({
  //页面的初始数据
  data: {
    id:"",
    ss_xx:{},
    wbnr:"",
    _openid:"9999999",
    _id:"999999",
    fenxiang:"false",
    glid:"9999",
    dianzan:false,
    input:"留下你的精彩评论吧",
    focus:false,
    xx:"",
    liuyan:false,
    ku:'sshuo',

    bkpl:false,
  },


  bokepinglun(){
    var bkpl=this.data.bkpl
    if(bkpl==true){
      this.setData({
        bkpl:false
      })
    }else{
      this.setData({
        bkpl:true
      })
    }
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




  //点击楼主头像的点击事件跳转进主页
  navigatorTomytopic(event){
    var _id=app.userInfo._id
    if(_id==""){
      this.check_login()
      return
    }
    wx.navigateTo({
      url: '/pages/mytopic/mytopic?openid='+event.currentTarget.dataset.openid,
    })
  },

  //点击评论区头像的点击事件跳转进主页
  Tomytopic(event){
      var _id=app.userInfo._id
      if(_id==""){
        this.check_login()
        return
      }
      // 将用户_id转换为openid
      db.collection("user").doc(event.currentTarget.dataset.id).get()
      .then(res=>{
        wx.navigateTo({
          url: '/pages/mytopic/mytopic?openid='+res.data._openid,
        })
      })
  },


  //博客预览图片====================================================
  lookimg(event){
    wx.previewImage({
      urls: [event.currentTarget.dataset.url],
    })
  },

  //说说预览图片
  previewImg: function (event) {
    var index = event.currentTarget.dataset.urls[0];
    //所有图片
    var imgs = event.currentTarget.dataset.urls[1];
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },


  //加载对应说说id的内容====================================
  jiazai(id){
    var ku=this.data.ku
    db.collection(ku).where({'_id':id}).get().then(async(res)=>{
      if(res.data[0]!=undefined){
        var ss_xx=await this.readd(res.data[0])//处理超长名
        var dianzan=this.data.dianzan

        if(dianzan==-1 && this.data.liuyan==false ){
          //非总列表进入
          var yn=ss_xx.shuoshuo_xingxi.dianzanid.indexOf(app.userInfo._id)
          if(yn!=-1){
            this.setData({
              dianzan:true
            })
          }else{
            this.setData({
              dianzan:false
            })
          }
        }
        
        if(this.data.liuyan==false){
          app.ssinfo.lovenb=ss_xx.shuoshuo_xingxi.dianzannb
          app.ssinfo.plnb=ss_xx.shuoshuo_xingxi.huifunb
          app.ssinfo.looknb=ss_xx.shuoshuo_xingxi.look
          if(res.data[0].shuoshuo_xingxi.jubao[1]<10){
            this.setData({
              ss_xx:ss_xx
            })
          }else{
            this.setData({
              ss_xx:0
            })
          }
        }else{
          this.setData({
            ss_xx:ss_xx
          })
        }
        
      }else{
        this.setData({
          ss_xx:0
        })
      }
    })
  },


  //点赞帖子===============================================
  dianzan(e){
    //判断是否举报过
    //var dianzanid=e.currentTarget.dataset.dianzanid//取到dianzan数组
    var id=app.userInfo._id
    var ssid=e.currentTarget.dataset.id
    if(id==""){
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
        id:ssid,
        dzrid:id//点赞人id
      }
    })
    var ss_xx=this.data.ss_xx
    if(this.data.dianzan){
      ss_xx.shuoshuo_xingxi.dianzannb--
      app.ssinfo.lovenb--
      this.setData({
        dianzan:false,
        ss_xx:ss_xx
      })
      app.loveinfo='false'
    }else{
      ss_xx.shuoshuo_xingxi.dianzannb++
      app.ssinfo.lovenb++
      this.setData({
        dianzan:true,
        ss_xx:ss_xx
      })
      app.loveinfo='true'
    }
    
  },


  //举报帖子===============================================
  jubao(e){
    //判断是否举报过
    var jubao=e.currentTarget.dataset.jubao//取到jubao数组
    var id=app.userInfo._id

    if(id==""){
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

    var ban=app.userInfo.ban
    if(ban==true){
      wx.showToast({
        title: '账号被封！',
        icon:'none',
        duration:7000
      })
      return
    }
    var glid=app.glid
    var openid = this.data._openid
    if(openid!=glid){
      var yn=JSON.stringify(jubao[0]).includes(id)
      if(yn){
        wx.showToast({
          title: "举报过了",
          icon:"none"
        })
        return
      }
    }
    
    var that=this
    wx.showModal({
      title: '提示',
      content: '确认举报？(恶意举报将会封号)',
      showCancel:true,
      confirmText:'确认举报',
      confirmColor:'#FF4D49',
      cancelText:'取消',
      cancelColor:'#000000',
      success (res) {
        if (res.confirm) {
          var ssid=e.currentTarget.dataset.id//取到ssid
          var cc=that.data.ss_xx.shuoshuo_xingxi.nr
          if(cc.length==0){
            cc='分享的'+that.data.ss_xx.shuoshuo_xingxi.tp.length+'张图片'
          }
          wx.cloud.callFunction({
            name:"jubao",
            data:{
              id:ssid,
              time:new Date().getTime(),//发布时间
              ywnr:cc,//这里没有判断空文本的情况！！！
              jbrid:app.userInfo._id//举报人
            }
          })
          
          //更新本地举报
          var ss_xx=that.data.ss_xx
          ss_xx.shuoshuo_xingxi.jubao[0].push(id)
          ss_xx.shuoshuo_xingxi.jubao[1]++
          that.setData({
            ss_xx:ss_xx
          })

          wx.showToast({
            title: '举报成功',
            icon:"none"
          })
          
        } else if (res.cancel) {console.log('用户点击取消')}
      }
    })
    /////////////////////////////////
  },







  //长名字显示处理==========================================
  async readd(e){
    var nr=e
    //先循环每一个ss
    var chang=nr.shuoshuo_xingxi.huifunr.length
    //判断评论!=""则进行下面
    if(chang!=0){
      var huifunr=nr.shuoshuo_xingxi.huifunr
      //对huifunr循环查询判断name长度超长就加。。。11个为上限
      for(var ii=0;ii<huifunr.length;ii++){
        var l=huifunr[ii].name.length

        if(l>11){
          nr.shuoshuo_xingxi.huifunr[ii].name=nr.shuoshuo_xingxi.huifunr[ii].name.substring(0,11)+"..."
        }
        if(huifunr[ii].huifu.length>0){
          //有回复的回复
          for(var iii=0;iii<huifunr[ii].huifu.length;iii++){
            var l=huifunr[ii].huifu[iii].name.length
           
            if(l>11){
              //总长度超长，如果为回复类型要截取两者name
              var name=nr.shuoshuo_xingxi.huifunr[ii].huifu[iii].name
              var yuanname=nr.shuoshuo_xingxi.huifunr[ii].huifu[iii].yuanname
              var wz=name.indexOf("-》")
              if(wz>4){
                //需要对前面修剪
                var qian=name.substring(0,4)+"...-》"
                var hou=name.substr(wz+2,l-wz)

                name=qian+hou
                //加上再修剪
                if(name.length>11){
                  nr.shuoshuo_xingxi.huifunr[ii].huifu[iii].name=name.substring(0,11)+"..."
                }else{
                  nr.shuoshuo_xingxi.huifunr[ii].huifu[iii].name=name
                }

              }else{
                nr.shuoshuo_xingxi.huifunr[ii].huifu[iii].name=nr.shuoshuo_xingxi.huifunr[ii].huifu[iii].name.substring(0,11)+"..."
              }
              
            }

          }
        }
      }
    }
    return nr
  },



  //实时获取input,写到data中储存为wbnr
  wbnr(e){
    this.setData({
      wbnr:e.detail.value
    })
  },

  //失去焦点，收起键盘
  //键盘收起
  shijiao(){
    var wbnr=this.data.wbnr
    if(wbnr==""){
      this.setData({
        input:"留下你的精彩评论吧",
        xx:"",
      })
    }else{
    }
  },



  //发送评论
  async fasong(){
    var openid=app.userInfo._openid
    //未登录提示
    if(openid==""){
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
          wx.switchTab({url:"../my/my"})
          return
        } else if (res.cancel) {
        return
        }
        }
      })
      return
    }
    
    var text=this.data.wbnr
    if(text.length==0){
      wx.showToast({
        title: '没说什么',
        icon: 'none',
        duration: 800,
      })
      return
    }

    //检测账号是否被封
    var ban=app.userInfo.ban
    if(ban==true){
      wx.showToast({
        title: '账号被封！',
        icon:'none',
        duration:7000
      })
      return
    }
    //1.文本审核
    wx.showLoading({
      title: '传送中...',
      mask:true
    })
    var checkOk = await this.checkStr(text);
    //审核不通过
    if(!checkOk){ 
      wx.hideLoading({}),//审核不通过隐藏
      wx.showToast({
        title: '含有违法违规内容',
        icon: 'none',
        duration: 4000,
      })
      return//这个return返回，停止继续执行
    }
    wx.showLoading({
      title: '快送到了...',
      mask:true
    })



    //2.判断楼主与匿名
    var louzhu=false
    // var niming=false
    //是楼主的话继承发帖状态
    if(app.userInfo._id==this.data.ss_xx.shuoshuo_xingxi.userid ){
      //是楼主的话继承发帖状态
      louzhu=true
    }
    var pinglunguode=await this.fasongqian(app.userInfo._id)//更新了app中的userinfo判断是否评论过
    var first=JSON.stringify(pinglunguode).includes(this.data.id)



    //判断是回复帖子，还是回复评
    //3.写其他数据并整合
    var pinglunnr={
      liuyan:this.data.liuyan,
      title:this.data.ss_xx.title,
      photo:app.userInfo.userinfo.userphoto,
      name:app.userInfo.userinfo.username,
      time:new Date().getTime(),//发布时间
      plrid:app.userInfo._id,//评论人我的id
      wbnr:text,
      ywnr:this.data.ss_xx.shuoshuo_xingxi.nr,
      louzhu:louzhu,
      // niming:niming,
      ssid:this.data.id,
      lzid:this.data.ss_xx.shuoshuo_xingxi.userid,
      lv:0,//表示对帖子的直接评论
      huifu:[]
    }
    if(this.data.liuyan==true){
      pinglunnr.ywnr="【推文】"+this.data.ss_xx.title
    }
    if(pinglunnr.ywnr.length==0){
      pinglunnr.ywnr='分享的'+this.data.ss_xx.shuoshuo_xingxi.tp.length+'张图片'
    }


    var pd=[first,"",""]//判断用，first,__openid(被评论的),__time(被评论的)
    var riqi=util.dateFormat(pinglunnr.time,"yyyy-MM-dd hh:mm")//发送订阅消息所用日期格式
    pinglunnr.riqi=riqi
    //楼主才有此步骤，判断匿名
    var xx=this.data.xx//原回复
    //说明点击了回复按钮
    if(xx!=""){
      //说明点击了回复按钮，此时不知回复层级
      pd[1]=xx.lv0
      pd[2]=xx.time
      var lv=xx.lv//其实被回复人lv
      pinglunnr.bhfpl=xx.wbnr//被回复的评论
      pinglunnr.bhfid=xx.id
      if(lv==0){
        pinglunnr.lv=1
        var index=this.data.index
        var zhankai="ss_xx.shuoshuo_xingxi.huifunr["+index+"].zhankai"
        this.setData({
          [zhankai]:true,
        })
      }else{
        pinglunnr.lv=2
        pinglunnr.yuanname=pinglunnr.name
        pinglunnr.name=pinglunnr.name+"-》"+xx.name
      }
    }


    
    this.fbpl(pinglunnr,pd)//云函数上传发表
    wx.hideLoading({})
    //评论成功
    wx.showToast({
      title: '评论成功',
      icon: 'none',
      duration: 1000,
    })
    var huifunr=this.data.ss_xx.shuoshuo_xingxi.huifunr
    //这里本地进行判断
    app.ssinfo.plnb++
    var xx=this.data.ss_xx
    xx.shuoshuo_xingxi.huifunb=app.ssinfo.plnb
    this.setData({
      ss_xx:xx
    })
    if(pd[1]!=""){
      //这是回复别人
      var index=this.data.index
      huifunr[index].huifu.push(pinglunnr)
      huifunr[index].huifunb++
    }else{
      huifunr.push(pinglunnr)
    }
    
    this.setData({
      "ss_xx.shuoshuo_xingxi.huifunr":huifunr ,
      wbnr:"",
      xx:"",
      input:"留下你的精彩评论吧",
    })
  },


  //文本内容合法性检测
  async checkStr(text) {
    try {
        var res = await wx.cloud.callFunction({
            name: 'checkStr',
            data: {
            text:text,
            }
        });
        if (res.result.errCode == 0)
            return true;
            return false;
    } catch (err) {
        return false;
    }
  },

  

  //发送前刷新内容
  async fasongqian(e){
    return db.collection('user').doc(e).get().then((res)=>{
      app.userInfo=res.data
      return res.data.pinglunguode
    })
  },


  //用云函数发表评论
  async fbpl(pinglunnr,pd){
    try {
      var res = await wx.cloud.callFunction({
        name: 'fbpl',
        data: {
          pinglunnr:pinglunnr,
          pd:pd
        }
      });
      return res.result
  } catch (err) {
    return false;
  }
  },



  //删除评论
  changanshanchu(e){
    var _id=app.userInfo._id  //当前用户的_id
    var openid = this.data._openid
    //检测是否是自己的

    if(e.currentTarget.dataset.id1!=undefined){
      var pdwb=e.currentTarget.dataset.id1  //回复人_id
    }else{
      var pdwb=e.currentTarget.dataset.id0
    }


    //删除条件：1.自己发的。2.自己的帖子。3.自己是管理员
    if(pdwb!=_id && openid!=app.glid && _id!=this.data.ss_xx.shuoshuo_xingxi.userid ){
      wx.showToast({
        title: '无权删除',
        icon:'none',
        duration: 800
      })
      return
    }


    var index1=""
    var id1=""
    var time1=""
    var jianqu=0
    if(e.currentTarget.dataset.index1!=undefined){
      index1=e.currentTarget.dataset.index1
      id1=e.currentTarget.dataset.id1
      time1=e.currentTarget.dataset.time1
    }else{
      //判断该评论下的二级评论
      var nb=e.currentTarget.dataset.huifunb
      if(nb!=undefined&&nb!=0){
        jianqu=nb
      }
    }
    var that=this
    wx.showModal({
      title: '提示',
      content: '删除后无法恢复',
      showCancel:'true',
      confirmText:'确认删除',
      confirmColor:'#FF4D49',
      cancelText:'取消',
      success (res) {
      if (res.confirm) {
        var id=e.currentTarget.dataset.id0//这是这条l0评论的id
        var index=e.currentTarget.dataset.index
        var ss_xx=that.data.ss_xx.shuoshuo_xingxi

        if(e.currentTarget.dataset.index1==undefined){
          //这是lv0删除
          ss_xx.huifunr.splice(index,1);//删除指定index记录
        }else{
          //这是lv1，2删除
          ss_xx.huifunr[index].huifu.splice(index1,1)
        }
        
        that.setData({
          "ss_xx.shuoshuo_xingxi":ss_xx
        })
        wx.showToast({
          title: '删除成功',
          icon:"none"
        })
        app.ssinfo.plnb=app.ssinfo.plnb-1-jianqu
        var xx=that.data.ss_xx
        xx.shuoshuo_xingxi.huifunb=app.ssinfo.plnb
        that.setData({
          ss_xx:xx
        })
        var time=e.currentTarget.dataset.time
        var _data={
          id0:id,//这是这条lv0评论的id
          id1:id1,//这是这条lv1.2评论的id
          time:time,//这是这条lv0评论的
          time1:time1,//这是这条lv1.2评论的
          id:that.data.id,//这是这条ss的
          liuyan:that.data.liuyan,//用于云函数判断删除所在集合
        }
        //下面云函数delete评论
        wx.cloud.callFunction({
          name: 'delete',
          data: {
          _data
          }
        })
        //判断ss是否还有自己的评论，
        var haiyou=false
        var haiyou=JSON.stringify(ss_xx.huifunr).includes(app.userInfo._id)
        //没了就删掉自己评论过的记录
        if(haiyou==false){
          db.collection('user').doc(app.userInfo._id).update({
            data: {
              pinglunguode:_.pull({
                id:_.eq(that.data.id)
              })
            }
          })
          return
        }
      }else if (res.cancel) {}
      }
    })
  },



  //回复别人的评论1
  huifu(e){
    var index1=e.currentTarget.dataset.index1
    var xx=e.currentTarget.dataset.xx
    var xx1=e.currentTarget.dataset.xx1
    if(index1==undefined){
      //这是回复lv0
      var name=xx.name
      xx.id=xx.plrid
      xx.lv0=xx.plrid
    }else{
      xx.wbnr=xx1.wbnr
      xx.id=xx1.plrid
      xx.lv0=xx.plrid
      // if(xx1.niming){
      //   xx1.name="匿名用户"
      // }
      //这是回复lv1,2
      xx.lv=xx1.lv
      if(xx1.lv==1){
        var name=xx1.name
      }else{
        var name=xx1.yuanname
      }
    }

    xx.name=name//此处特殊整合信息！！！

    //拉起键盘进行回复
    this.setData({
      input:"回复 "+name,
      focus:true,//拉起键盘
      xx:xx,
      index:e.currentTarget.dataset.index,
    })
  },



  //展开评论
  zhankai(e){
    var index=e.currentTarget.dataset.index
    var zhankai="ss_xx.shuoshuo_xingxi.huifunr["+index+"].zhankai"
    this.setData({
      [zhankai]:true,
    })
  },



  //收起评论
  shouqi(e){
    var index=e.currentTarget.dataset.index
    var zhankai="ss_xx.shuoshuo_xingxi.huifunr["+index+"].zhankai"
    this.setData({
      [zhankai]:false,
    })
  },














  /**
   * 生命周期函数--监听页面加载===============================
   */
  onLoad: function (options) {
    app.fxssid=options.id
    var love=options.love
    var liuyan=options.liuyan
    if(liuyan=='true'){
      this.setData({
        liuyan:true,
        ku:'tj'
      })
    }
    if(love=='true'){
      var dianzan=true
    }else if(love=='false'){
      var dianzan=false
    }else{
      var dianzan=-1
    }
    this.setData({
      fenxiang:options.fenxiang,
      dianzan:dianzan,
      id:options.id
    })


    //判断是否为分享来的！！！！！！！！！！！！！
    if(options.fenxiang=="true"){
      wx.cloud.callFunction({
        name:'gpnu_login',
        data:{}
      }).then((res)=>{
        db.collection("user").where({
          _openid:res.result.openid
        }).get().then((res)=>{
          app.userInfo=Object.assign(app.userInfo,res.data[0]);
          var _openid=app.userInfo._openid
          // wx.hideLoading()
          if(_openid==""){
            /*如果没有登录信息则跳转到wd*/ 
            wx.showToast({
              title: '还未登录',
              icon:"none",
              duration:'1500'
            })
            app.fenxiang="true"
          }else{
            this.setData({
              _openid:_openid,
              id:options.id,
              _id:app.userInfo._id
            })
            this.jiazai(options.id)
          }
        })
      })
    }else{
      var _openid=app.userInfo._openid
      this.setData({
        _openid:_openid,
        _id:app.userInfo._id
      })
      this.jiazai(options.id)
    }

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
    return{
      title:"刚刚在晚安广师君看到个帖子，真是绝绝子！",
      path:"/pages/index/index?id="+this.data.id+"&fenxiang=true&liuyan="+this.data.liuyan
    }
  }
})