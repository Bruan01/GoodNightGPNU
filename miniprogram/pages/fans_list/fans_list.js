const { get } = require("../../util/util");

// pages/shouquan/shouquan.js
const db=wx.cloud.database({env:"wan-an-gpnu-4gm1hsj6bb4b58fb"})
const app=getApp()
const _ =db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id:"", //当前用户_id
    type: "",  //fans我的粉丝页 myconcerned关注的页
    shuju:[],
    gzbiaozhi:[],
    myconcerned:[]  //标志该用户是否关注了自己的粉丝和已关注
  },

  guanzhuorquxiao(event){
    var i = event.currentTarget.dataset.index0
    var gzbiaozhi = this.data.gzbiaozhi
    var openid = event.currentTarget.dataset.openid
    var my_openid=app.userInfo._openid

  

    if(gzbiaozhi[i]==1){
      //取消关注
      gzbiaozhi[i]=0
      // 删除我关注的 把我从对方的fans中删除
        db.collection('user').where({
          _openid:my_openid
        }).update({
          data:{
            concerned:_.pull({
              openid:openid
            })
          }
        })
        db.collection("user").where({
          _openid:openid
        }).update({
          data:{
            fans:_.pull({
              openid:my_openid
            })
          }
        })

    }else{
      //点击关注
      gzbiaozhi[i]=1;
      let time=new Date().getTime();
      db.collection("user").where({
        _openid:openid
      }).get().then(res=>{
          db.collection('user').where({
            _openid:my_openid
          }).update({
            data:{
              concerned:_.push({
                openid:openid,
                time: time,
                username:res.data[0].userinfo.username,
                userphoto:res.data[0].userinfo.userphoto,
              })
            }
          })
      })

      
     db.collection("user").where({
       _openid:my_openid
     }).get().then(res=>{
        db.collection("user").where({
          _openid:openid
        }).update({
          data:{
            fans:_.push({
              openid:my_openid,
              time:time,
              username:res.data[0].userinfo.username,
              userphoto:res.data[0].userinfo.userphoto,
            })
          }
        })
     })
    }


    this.setData({
      gzbiaozhi:gzbiaozhi
    })
  },


  //跳转到个人详情页
  tiaozhuan(event){
    console.log("跳转====================",event);
    wx.navigateTo({
      url: '/pages/mytopic/mytopic?openid='+event.currentTarget.dataset.openid,
    })
  },


  //加载数据
  jiazai(){
    //获取粉丝/关注的数据
    var _id=this.data._id
    var type=this.data.type
    db.collection('user').doc(_id).get()
    .then(res=>{
      var i=0
      var j=0
      var shuju = []
      var gzbiaozhi = []
      var len = 0

      if(type=="fans"){
        var myconcerned = res.data.concerned
        shuju = res.data.fans

        shuju.sort(this.compare)


        for(i=0; i<shuju.length;i++){
          for(j=0; j<myconcerned.length;j++){
            var flag = shuju[i].openid == myconcerned[j].openid
            if(flag){
              gzbiaozhi[i] = 1
              break
            }else{
              gzbiaozhi[i] = 0
            }
          }
        }


        this.setData({
          shuju:shuju,
          gzbiaozhi:gzbiaozhi
        })

        
      }else{
        shuju = res.data.concerned
        len = shuju.length
        for(i=0; i<len; i++){
          gzbiaozhi[i]=1
        }
        shuju.sort(this.compare)

        this.setData({
          shuju:shuju,
          gzbiaozhi:gzbiaozhi
        })
      }

    })

  },






  //时间戳排序函数  重构比较函数
  compare(a, b) {
    //记录一下各种时间
    const _timeA = a.time
    const _timeB = b.time
    let comparison = 0;
    if (_timeA > _timeB) {
      comparison = -1;
    } else if (_timeA < _timeB) {
      comparison = 1;
    }
    return comparison;
  },





  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var flag = options.flag
    var _id = app.userInfo._id
    this.setData({
      _id:_id,
      type:flag
    })
    //加载粉丝/关注的数据
    this.jiazai()
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