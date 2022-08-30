var app=getApp()
var db=wx.cloud.database()
var _=db.command
Page({

  data: {
    wenzhang:[],
    x:[],
    xx:[],
    userphoto:""
  },

  // 生命周期函数--监听页面加载
  onLoad: function (e) {
    var wenzhang=app.userInfo.pinglunguode
    var userphoto=app.userInfo.userinfo.userphoto      
    var zs=wenzhang.length
    var x=[]
    for(var i=0;i<zs;i++){
      x[i]=0
    }

    this.setData({
      wenzhang:wenzhang,
      x:x,
      xx:x,
      userphoto:userphoto
    })


  },


  //删除自己的帖子
  delete1(e){
    var that=this
    wx.showModal({
      title: '提示',
      content: '确认删除此条记录？',
      showCancel:true,
      confirmText:'确认删除',
      confirmColor:'#FF4D49',
      cancelText:'取消',
      cancelColor:'#000000',
      success (res) {
      if (res.confirm) {
        var ssid=e.currentTarget.dataset.ssid
        var index=e.currentTarget.dataset.index
        var wenzhang=that.data.wenzhang
        wenzhang.splice(index,1);//删除指定index记录
        that.setData({
          wenzhang:wenzhang
        })
        app.userInfo.pinglunguode=wenzhang
        var x=that.data.x
        x[index]=0
        that.setData({
          x:x
        })
        wx.showToast({
          title: '删除成功',
          icon:"none"
        })
        db.collection('user').where({
          _id:app.userInfo._id
        }).update({
          data: {
            pinglunguode:_.pull({
              id:_.eq(ssid)
            })
          }
        })
      } else if (res.cancel) {
          wx.showToast({
            title: '取消删除',
            icon:'none'
          })
        }
      }
    })
  },
  //生命周期函数--监听页面显示
  onShow: function () {
    
  },


  //查看评论的说说
  chakan(ssid){
    //要查看的说说的id
    var ssid=ssid.currentTarget.dataset.ssid
    
    if(this.data.canshu==false){
      wx.cloud.callFunction({
        name:"look",
        data:{
          id:ssid
        }
      })
    }
    wx.navigateTo({
      url:"../detail/detail?id="+ssid+"&fenxiang=false&liuyan=false"
    })
    wx.cloud.callFunction({
      name:"look",
      data:{
        id:ssid,
        type:'sshuo'
      }
    })
  },
  //滑动删除
  change(e){
    var x=e.detail.x
    var xx=this.data.xx
    var index=e.currentTarget.dataset.index
    var zs=this.data.wenzhang.length

    if(xx[index]==0 && x<-37.5){
      xx[index]=-75
    }else if(xx[index]==-75 && x>-37.5){
      xx[index]=0
    }
    for(var i=0;i<zs;i++){
      if(i!=index){
        xx[i]=0
      }else{
      }
    }
    this.setData({
      xx:xx
    })
  },
  change1(e){
    var x=this.data.xx
    this.setData({
      x:x
    })
  }
})