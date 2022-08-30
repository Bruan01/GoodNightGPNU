// pages/boke/boke.js
const app=getApp()
const db=wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:"标题...",
    array:[],
    tp:[],
    //------分类----------
    //博客选择对象
    data_boke_class:{index:[0,0]},
    title:"标题...",
    array:[],
    tp:[],
    //默认板块
    bankuai:"休闲",
    //融合按钮
    index:[0,0],
    //设置初始分类
    heji: [
      ["休闲", "知识", "表白墙", "觅友", "万能代", "吐槽", "寻物", "闲鱼", "其他"],["休闲"]
    ],
    //------分类----------
  },


   
  //开始选择
  kaishixuanzhe(e){
    //设定一个data对象,方便赋值
    var data = {
      bankuai:this.data.bankuai,
      index: this.data.index,
      heji: this.data.heji
    }
    switch (e.detail.column) {
      case 0:
        switch (e.detail.value) {
          case 0:
            data.index = [0, 0];
            data.heji[1] = ["休闲"];
        
            break;
          case 1:
            data.index = [1, 0];
            data.heji[1] = ["科技", "财经", "法知", "文学", "艺术", "其他"];
      
            break;
          case 2:
            data.index = [2, 0];
            data.heji[1] = ["表白", "捞人", "卖舍友"];
        
            break;
          case 3:
            data.index = [3, 0];
            data.heji[1] = ["运动", "学习", "逛街", "旅游", "游戏"];
            
            break;
          case 4:
            data.index = [4, 0];
            data.heji[1] = ["代拿", "代跑"];
      
            break;
          case 5:
            data.index = [5, 0];
            data.heji[1] = ["吐槽"];
        
            break;
          case 6:
            data.index = [6, 0];
            data.heji[1] = ["寻失","觅主"];
           
            break;
          case 7:
            data.index = [7, 0];
            data.heji[1] = ["出售","欲购"];
        
            break;
          case 8:
          data.index = [8, 0];
          data.heji[1] = ["其他"];
        
            break;
          

        }
        this.setData(data)
      //默认其他
      case 0:
        break;
    }


    //默认为其他分类
    var bankuai = "其他分类"
    //判断用户选择了哪一个分类
    if (data.index != null) {
      switch (data.index[0]) {
        case 0:
          data.index = [0, 0];
          data.heji[1] = ["休闲"];
      
          break;
        case 1:
          data.index = [1, 0];
          data.heji[1] = ["科技", "财经", "法知", "文学", "艺术", "其他"];
    
          break;
        case 2:
          data.index = [2, 0];
          data.heji[1] = ["表白", "捞人", "卖舍友"];
      
          break;
        case 3:
          data.index = [3, 0];
          data.heji[1] = ["运动", "学习", "逛街", "旅游", "游戏"];
          
          break;
        case 4:
          data.index = [4, 0];
          data.heji[1] = ["代拿", "代跑"];
    
          break;
        case 5:
          data.index = [5, 0];
          data.heji[1] = ["吐槽"];
      
          break;
        case 6:
          data.index = [6, 0];
          data.heji[1] = ["寻失","觅主"];
          
          break;
        case 7:
          data.index = [7, 0];
          data.heji[1] = ["出售","欲购"];
      
          break;

        case 8:
        data.index = [8, 0];
        data.heji[1] = ["其他"];
      
          break;
      }
    }
    this.setData({
      data_boke_class : data,
    })

  },



  

  //上传入库啦。。。
  post(){
    //将shuoshuo_xingxi里的图片路径改为云路径
    var nr = this.data.array
    var tp = this.data.tp
    var i=0
    var len1 = this.data.array.length
    var j=0

    for(i=0; i<len1; i++){
        if(nr[i].flag == 1){
          nr[i].nr = tp[j]
          j++
        }
    }



    var _time =new Date().getTime()
    var shuoshuo_xingxi={
      bankuai:this.data.data_boke_class.index[0],
      subclass:this.data.index[1],
      huifunr:[],
      huifunb:0,
      dianzanid:[],
      dianzannb:0,
      jubao:[[],0],
      look:0,
      tp:this.data.tp,
      title:this.data.title,
      nr:nr,
      userid:app.userInfo._id,
      username:app.userInfo.userinfo.username,
      userphoto:app.userInfo.userinfo.userphoto
    }




    db.collection("sshuo").add({
      data:{
        _time:_time,
        flag:1,
        shuoshuo_xingxi:shuoshuo_xingxi
      }
    }).then(res=>{

      app.shuaxin = true
      wx.hideLoading({}) //发布成功隐藏

      wx.showToast({
        title: '上传成功',
        duration:350
      })

      setTimeout(function(){
        wx.navigateBack({
          delta: 1,
        })
      },500)


      /// 未实现跳转，会报错 ///
      var id = res._id
      var jl = {
        "_time": _time,
        "flag": 1,
        "nr": shuoshuo_xingxi.nr,
        "id": id,
        "weigui": false,
        "tp":shuoshuo_xingxi.tp
      }

      var wenzhang=[]
      //将文章添加到user表中的文章
      db.collection("user").doc(app.userInfo._id).get().then((res) => {
        //wenzhang不知道哪来的？
        wenzhang = res.data.wenzhang
        wenzhang.push(jl)
        //记录到自己users里
        db.collection("user").doc(app.userInfo._id).update({
          data: {
            wenzhang: wenzhang
          }
        }).then((res) => {

          //进行全局数据我的本地储存
          app.userInfo.wenzhang = wenzhang
          this.setData({
            imgs: [],
            shu_ru_nei_rong: ""
          })
        })
      })


    })
  },



  //选择完毕
  xuanzewanbi(e) {
    this.setData({
      index: e.detail.value
    })
  },

  //添加文本框
  addtext(){
    this.setData({
      array:this.data.array.concat([{flag:0,nr:"text"}]),
    })
  },

  //添加图片框
  addimg(){
    wx.chooseImage({
      count: 1, 
    }).then((res)=>{
      this.setData({
        array:this.data.array.concat([{flag:1,nr:res.tempFilePaths[0]}]),
      })
    })
  },
  //预览图片
  lookimg(event){
    wx.previewImage({
      urls: [event.currentTarget.dataset.url],
    })
  },


  //删除文本或图片
  deltext(event){
    let array=this.data.array
    array.splice(event.currentTarget.dataset.index0,1)
    this.setData({
      array:array
    })
  },


  // 当输入框失去焦点时触发该事件，并返回输入框的内容数据
  shijiaotijiao(event){
    let array=this.data.array
    array[event.target.dataset.index0].nr=event.detail.value
    this.setData({
      array:array
    })
  },

  //当标题失焦
  titleShijiao(event){
    this.setData({
      title:event.detail.value
    })
  },
  //标题聚焦提示长度过限
  bindinput(event){
    if(event.detail.value.length>=38){
      wx.showToast({
        title: '长度不能超过38...',
        duration:1300,
        icon:"error"
      })
    }
  },


  async tijiao(){
    var bankuai = "休闲"
    var fenlei = this.data.data_boke_class.index[0]
      switch (fenlei) {
        case 0:
          bankuai = "休闲"
          break;
        case 1:
          bankuai = "知识"
          break;
        case 2:
          bankuai = "表白墙"
          break;
        case 3:
          bankuai = "觅友"
          break;
        case 4:
          bankuai = "万能代"
          break;
        case 5:
          bankuai = "吐槽"
          break;
        case 6:
          bankuai = "寻物"
          break;
        case 7:
          bankuai = "闲鱼"
          break;
        case 8:
          bankuai = "其他"
          break;
      }
    var _this = this
    wx.showModal({
      title: '提示',
      content: '您即将发送此帖到“' + bankuai + '”板块？',
      showCancel: true,
      confirmText: '是',
      confirmColor: '#000000',
      cancelText: '否',
      cancelColor: '#000000',
      success(res) {
        if (res.confirm) {
          _this.finish()
          return true
        } else if (res.cancel) {
          return false
        }
      }
    })
  },




  
  // //图片处理
  async finish(){
    var array=this.data.array
    var array_len=array.length
    var filepath=[]  //存储上传的图片的路径
    for(var i=0; i<array_len; i++){
      if(array[i].flag==1){
        filepath=filepath.concat([{index:i,nr:array[i].nr}]);
      }
    }
    

    //开始图片审核
    if (filepath.length != 0) {
      //审核图片
      wx.showLoading({
        title: '图片处理...',
        mask: true
      })
      var media = ''
      //图片数组的长度，有多少张
      var filepath_length = filepath.length

      //一张一张处理图片
      for (var i = 0; i < filepath_length; i++) {
        //将图片路径写入media变量中
        media = filepath[i].nr
        //下面是对图片的大小进行限制
        //取图片的大小进行判断
        var size = await this.qudaxiao(media)
        //超过100k需要进行压缩！！
        if (size >= 102400) {
          media = await this.yasuo(media, 0.6, 300)
        }

        //验证压缩后大小
        var size = await this.qudaxiao(media)
        //filepath.splice(i,1,media)

        //获取文件buffer
        media = await this.qubuffer(media)
      }
    }
    //所有审核通过

    var zs = filepath.length //图片总数
    var ss_img = filepath

    //上传图片
    //分情况讨论是否有图片需要上传
    if (zs != 0) {
      wx.showLoading({
        title: '就快好了...',
        mask: true
      })
      //一个存放图片id的数组
      var fileID = []
      var success_upload_num = 0

      for (var i = 0; i < zs; i++) {
        //取图片的大小进行判断
        var path = ss_img[i].nr; //取当前图片路jing

        var size = await this.qudaxiao(path)
        if (size >= 1048576) {
          //超过1M需要进行压缩！！
          path = await this.yasuo(path, 0.92, 800)
        }
        var time = new Date().getTime()


        //直接拼接出云路径
        fileID[i] = "cloud://wan-an-gpnu-4gm1hsj6bb4b58fb.7761-wan-an-gpnu-4gm1hsj6bb4b58fb-1309987324/boke_img/" + time.toString() + ".jpg"

       

        wx.cloud.uploadFile({
          cloudPath: "boke_img/" + time + ".jpg", // 上传至云端的路径
          filePath: path, // 小程序临时文件路径
          success: res => {
            success_upload_num ++ //记录成功获取云储存路径的图片数量
            if (success_upload_num == zs) {
              this.setData({
                tp:fileID
              })
              this.post()
              wx.hideLoading({})
            }
          },
          fail:error=>{
            wx.hideLoading({})
          }
        })
      }
    } else {
      //纯文本发帖！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
      this.post()
    }
  },









  //图片取大小 传入了图片路径集合
  //异步问题，比如上传图片需要读取返回的真实地址时，因为小程序异步的原因，程序会继续往下执行
  //往往是图片还没传完，下一步的函数都运行完了，这个时候根本取不到真实地址 用Promise解决

  async qudaxiao(media) {
    return new Promise((resolve, reject) => {
      //得到图片的真实大小信息
      wx.getFileInfo({
        filePath: media,
        success(res) {
          resolve(res.size)
        }
      })
    })
  },


  //图片取buffer
  async qubuffer(media) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: media,
        success: res => {
          resolve(res.data)
        }
      })
    })
  },



  //图片压缩 传入 图片路径 图片大小 设置的压缩图片的宽度 
  async yasuo(media, size, set_width) {
    //media=media.replace("wxfile","https")
    return new Promise((resolve, reject) => {
      //这是压缩时要用的获取宽高
      wx.getImageInfo({
        src: media,
        success(res) {
          var width = res.width //原图宽
          var height = res.height //原图高
          var set_width_ = set_width //最后应该设置的宽
          var set_width_ = Math.trunc(set_width * height / width) //最后应该设置的高
          //下面写压缩的步骤
          //获取到画布
          var huabu = wx.createCanvasContext("huabu", this)
          huabu.drawImage(media, 0, 0, set_width_, set_width_);
          huabu.draw(true, setTimeout(function () {
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: set_width_,
              height: set_width_,
              destWidth: set_width_,
              destHeight: set_width_,
              canvasId: 'huabu',
              fileType: 'jpg',
              quality: size, //压缩质量0-1默认0.92
              success(es) {
                resolve(es.tempFilePath)
              }
            }, this);
          }, 500))
        }
      })
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












