const app=getApp()
const db = wx.cloud.database()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //昵称
    username:"",
    //头像
    avatarUrl:"",
    //存放图片的数组
    imgs: [],
    //输入框输入的内容
    shu_ru_nei_rong:"",
    //设置一个字数记录器
    shu_ru_nei_rong_length:"0/299",
    index:[0,0],
    //设置初始分类
    heji: [
      ["休闲", "知识", "表白墙", "觅友", "万能代", "吐槽", "寻物", "闲鱼", "其他"],["休闲"]
    ],
    sy:"0/299",
    //子类
    subclass:0
  },

  //开始选择
  kaishixuanze(e) {
    //设定一个data对象,方便赋值
    var data = {
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

            break
        }
      //默认其他
      case 0:
        break;
    }
    this.setData(data)
  },






  shouquan(){
    wx.getUserProfile({
      desc: '授权需要',
      success:res=>{
        this.setData({
          username:res.userInfo.nickName,
          avatarUrl:res.userInfo.avatarUrl,
        })
      }
    })
    
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






  /*提交表单 */
  async tijiao(e) {



    //整个表单数据
    var biaodan = e.detail.value
    //临时text。文本内容
    var text = biaodan.shu_ru_nei_rong

    if (text.length == 0 && this.data.imgs.length == 0) {
      wx.showToast({
        title: '再多说点吧！',
        icon: 'none',
        duration: 800,
      })
      return //这个return返回，停止继续执行
    }

    //默认为其他分类
    var bankuai = "休闲"
    //判断用户选择了哪一个分类
    if (biaodan.fenlei != null) {
      switch (biaodan.fenlei[0]) {
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
          _this.tixing(biaodan)
          return true
        } else if (res.cancel) {
          return false
        }
      }
    })
  },



  //提醒选择的板块
  async tixing(biaodan) {
    var text = biaodan.shu_ru_nei_rong //临时text。文本内容
    


    var img_arr = this.data.imgs //图片路径赋值给变量img

    //开始图片审核
    if (img_arr.length != 0) {
      //审核图片
      wx.showLoading({
        title: '图片处理...',
        mask: true
      })
      var media = ''
      //图片数组的长度，有多少张
      var img_arr_length = img_arr.length
      //一张一张处理图片
      for (var i = 0; i < img_arr_length; i++) {
        //将图片路径写入media变量中
        media = img_arr[i]
        //下面是对图片的大小进行限制
        //取图片的大小进行判断
        var size = await this.qudaxiao(media)
        //超过50k需要进行压缩！！
        if (size >= 51200) {
          media = await this.yasuo(media, 0.6, 300)
        }

        //验证压缩后大小
        var size = await this.qudaxiao(media)
        //img_arr.splice(i,1,media)

        //获取文件buffer
        media = await this.qubuffer(media)

      }
    } 


    //定义ss_xx
    //判断 默认选择器分类[0,0]
    biaodan.fenlei = biaodan.fenlei === null ? [0, 0] : biaodan.fenlei
    var shuoshuo_xingxi = {
      bankuai: biaodan.fenlei[0],
      subclass:biaodan.fenlei[1],
      username: app.userInfo.userinfo.username, //签名
      userphoto: app.userInfo.userinfo.userphoto, //头像
      nr: biaodan.shu_ru_nei_rong, //文本
      tp: [], //图片数组！！！！！！！！！数组缺少图片
      dianzanid: [], //别人的评论点赞
      dianzannb: 0, //点赞数
      huifunr:[],//别人的评论
      huifunb:0,//评论总数
      jubao: [
        [], 0
      ], //被举报的id合集，前面添加id，加完云函数记个数
      look: 0, //记录浏览量 
      userid: app.userInfo._id //楼主所在主体
    }
    var zs = img_arr.length //图片总数
    var ss_img = img_arr

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
        var path = ss_img[i]; //取当前图片路jing

        var size = await this.qudaxiao(path)
        if (size >= 1048576) {
          //超过1M需要进行压缩！！
          path = await this.yasuo(path, 0.92, 800)
        }
        var time = new Date().getTime()

        //直接拼接出云路径
        fileID[i] = "cloud://wan-an-gpnu-4gm1hsj6bb4b58fb.7761-wan-an-gpnu-4gm1hsj6bb4b58fb-1309987324/dontai_img/" + time.toString() + ".jpg"

        wx.cloud.uploadFile({
          cloudPath: "dontai_img/" + time + ".jpg", // 上传至云端的路径
          filePath: path, // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            //fileID.push(res.fileID)//！！！！！！！对返回的云储存地址进行整合
            success_upload_num ++ //记录成功获取云储存路径的图片数量
            if (success_upload_num == zs) {
              shuoshuo_xingxi.tp = fileID //！！！说说信息中的图片写入完毕
              //带图发帖！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
              this.post(shuoshuo_xingxi)
            }
          },
          fail: console.log("上传时不知为啥有错")
        })
      }
    } else {
      //纯文本发帖！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
      this.post(shuoshuo_xingxi)
    }
  },


  //真正的上传说说
  post(shuoshuo_xingxi) {
    //loading发布中
    wx.showLoading({
      title: '即将完成...',
      mask: true
    })
    //var sjk=ss_xx.bankuai.toString()+"0"//@@@转成字符串@@@
    //添加说说记录
    var _time=new Date().getTime()//发布时间
    db.collection('sshuo').add({
      data: {
        shuoshuo_xingxi,
        _time: _time,
        flag: 0
      }
    }).then((res) => {
    
      //ss发送成功了
      //设置app跳转到首页后要刷新
      app.shuaxin = true
      
      wx.hideLoading({}) //发布成功隐藏

      wx.showToast({
        title: '发表成功！',
        icon: "none",
        duration: 350
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
        "flag": 0,
        "nr": shuoshuo_xingxi.nr,
        "id": id,
        "weigui": false,
        "tp":shuoshuo_xingxi.tp
      }
      if (jl.nr == '') {
        //tp 图片数组
        jl.nr = '分享了' + shuoshuo_xingxi.tp.length + '张图片'
      }

      var wenzhang = []
      //获取之前的文章加到wenzhang
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


   // 预览图片
   previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },



  //实时获取input,写到data中储存为shu_ru_nei_rong
  shu_ru_nei_rong(e){
    var s=e.detail.value.length
    //读取输入内容的长度
    var y=s+"/"+299
    this.setData({
      shu_ru_nei_rong:e.detail.value,
      shu_ru_nei_rong_length:y
    })
  },

  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;

    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
  },

  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },

 // 添加图片
 chooseImg: function (e) {
  var that = this;
  //输出了js中的一大堆函数与信息
  //拿取图片的链接
  var imgs = this.data.imgs;
  //设置一个变量记录了能够添加图片的张数
  var ktj=8-imgs.length
  if (ktj<=0) {
    wx.showToast({
      title: '添加那么多图片干嘛，流量不用钱吗？',
      icon: 'none',
      duration: 2000,
    })
  }else{
    wx.chooseImage({
      // count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        // tempFilePaths每一个值都是一个图片链接
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
        for (var i = 0; i < tempFilePaths.length; i++) {
          //图片数量多于9张的不保存到数组中
          if (imgs.length >= 9) {
            that.setData({
              imgs: imgs
            });
            return false;
          } else {
            imgs.push(tempFilePaths[i]);
          }
        }
        that.setData({
          imgs: imgs
        });
      }
    });
  }
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