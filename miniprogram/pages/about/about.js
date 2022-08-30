var db=wx.cloud.database()
var app=getApp()
Page({

  data: {
    youxiang:"1701166539@qq.com",
    weixin:"BRuan111",
    nm:"晚安广师君",
    ID:""
  },

  onLoad(){
   // this.huoqu()
    this.setData({
      ID:app.userInfo._id
    })
  },
  //复制
  fuzhi(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.item,
      success (res) {
        console.log("成功")
      }
    })
  },
  //获取
  // huoqu(){
  //   db.collection('system').where({'_id':'002'})
  //     .get().then((res)=>{
  //       this.setData({
  //         youxiang:res.data[0].youxiang,
  //         weixin:res.data[0].weixin,
  //         nm:res.data[0].nm
  //       })
  //     })
  // }
})