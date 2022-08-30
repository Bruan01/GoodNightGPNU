// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'wan-an-gpnu-4gm1hsj6bb4b58fb',
        traceUser: true,
      });
    }

    this.globalData = {};
    this.shuaxin=false;
    this.fenxiang="false";
    this.fxssid="";
    this.glid="9999";
    this.message=[];   //未读信息
    this.systeminfo="";
    this.loveinfo="";
    this.ssinfo={
      lovenb:"",
      plnb:"",
      looknb:""
    }; 
    this.userInfo={
      _id:"",
      _openid:"",
      allow:true,
      ban:false,
      msgnb:[0,0],
      message:[],
      pinglunguode:[],
      online:false,
      wenzhang:[],
      userinfo:{
        userphoto:"/images/logo2.jpg",
        username:"晚安广师君",
        anonymous:"",
        login:"未知",
        sex:"",
        birthday:"",
        xueyuan:"",
        special:"",
        region:"",
        wx_code:"",
        qq_code:"",
        phone:"",
        introduce:""
      }
    };
  },

  //进入小程序就上线
  onShow(){
    var db=wx.cloud.database()
    // 用户_id不为空，说明之前已经登陆过，数据库中有该用户数据
    if(this._id!=""){
      console.log("上线啦————————————————————")
      db.collection('user').where({_openid:this._openid})
      .update({
        data:{online:true}  //设为在线
      })
    }
  },


  //不在小程序就下线
  onHide(){
    var db=wx.cloud.database()
    
    if(this._id!=""){
      console.log("下线啦————————————————————")
      db.collection("user").where({_openid:this._openid})
      .update({
        data:{online:false}  //设为下线
      })
    }
  },


});
