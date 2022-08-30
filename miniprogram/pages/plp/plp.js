// pages/plp/plp.js
var util = require('../../util/common')
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data:{
    //按钮标志
    btn_flag:true,
    //历史页面的用户暂存瓶子数组
    bottle_id_array:[],
    //已经按下
    down:false,
    //捞的奇怪的东西图片
    strange_pic:"/images/plp/watertree.png",
    //捞的垃圾图片
    rubbish_pic:"/images/plp/fishbone.png",
    //捞的奇怪的东西
    strange:false,
    //捞的垃圾
    rubbish:false,
    //历史展示详情未点开的标志
    history_is_show:true,
    //历史展示详情
    history_show_detail:{},
    //清除内容
    info_clear: "",
    //历史信息
    history_data: [],
    //字数限制
    current: 0,
    //写入数据库的变量
    nr: "",
    //猫
    pic: "https://media0.giphy.com/media/xUPGcuPLCKs0LiYnCg/200w.webp?cid=ecf05e473ul39w89u3ku07c9fosr7joggpx531qp7eojkipt&rid=200w.webp&ct=g",
    //pic:"/images/plus.png",
    //用于展示
    nr_show: "",
    pic_show: "",
    //显示历史
    history_Show: false,
    //扔瓶子界面显示函数
    put_bottle_Show: false,
    //捡瓶子 男
    pickUpBottle_man: false,
    //捡瓶子 女
    pickUpBottle_woman: false,
    //显示球球规则
    xianshiguize:true
  },


  //球
  guize(){
    var flag=this.data.xianshiguize
    if(flag==true){
      this.setData({
        xianshiguize:false
      })
    }else{
      this.setData({
        xianshiguize:true
      })
    }
  },


  //扔出一个漂流瓶写入数据库
  finish() {
    //已经按下按钮
    this.setData({
      down:true
    })
    db.collection("user").where({
      _openid: app.userInfo._openid
    }).get().then(res => {
      var _time = new Date().getTime()
      //注意添加index中登录的数据库基础字段sex
      var gender = res.data[0].userinfo.sex
      if (gender == "") {
        wx.showToast({
          title: '请先设置性别哦！',
          mask:true,
          icon:"none",
          duration:800
        })
        setTimeout(function(){
          /// 未设置性别 跳转---
          wx.navigateTo({
            url: '/pages/myinfornation/myinfornation?openid='+app.userInfo._openid,
          })
        },950)
        return
      } else {
        wx.showToast({
          title: '上传成功',
          mask:true,
        })
        //先声明一个图片路径变量为空
        var path_cloud = "";
        //判断是否有图片（不同于猫鱼），有图片才生成路径
        if(this.data.pic!="https://media0.giphy.com/media/xUPGcuPLCKs0LiYnCg/200w.webp?cid=ecf05e473ul39w89u3ku07c9fosr7joggpx531qp7eojkipt&rid=200w.webp&ct=g"){
          console.log("图片不为猫鱼，生成云路径");
          //直接拼接出云路径(存入plp中用于渲染)
           path_cloud = "cloud://wan-an-gpnu-4gm1hsj6bb4b58fb.7761-wan-an-gpnu-4gm1hsj6bb4b58fb-1309987324/plp_img/" + _time.toString() + ".jpg"
          //上传到云存储
          wx.cloud.uploadFile({
            cloudPath: "plp_img/" + _time + ".jpg", // 上传至云端的路径
            filePath: this.data.pic, // 小程序临时文件路径
            success: res => {
            success_upload_num++ //记录成功获取云储存路径的图片数量
            //展示完成提交信息
          },
          //sss
          })
        }
        console.log("提交数据",path_cloud);
        db.collection("plp").add({
          data: {
            _time: _time,
            info: {
              nr: this.data.nr,
              //云存储路径
              pic: path_cloud,
              gender: gender,
            }
          }
        }).then(res => {
          //收起并且清空内容
          this.setData({
            //恢复按钮
            down:false,
            nr:"",
            info_clear: "",
            put_bottle_Show: false,
            //猫鱼
            pic:"https://media0.giphy.com/media/xUPGcuPLCKs0LiYnCg/200w.webp?cid=ecf05e473ul39w89u3ku07c9fosr7joggpx531qp7eojkipt&rid=200w.webp&ct=g"
            //pic:"/images/plus.png"
          })
        })
      }

    })
  },

  //开启捡到漂流瓶提示 捡瓶子男
  pickUpBottle_man() {
    //隐藏背景
    this.setData({
      flag_show:false,//旧背景
    }) 
    //检验是否登录
     if(app.userInfo.userinfo.login == "未知"){
       wx.showToast({
         title: '还未登录哦😸',
        icon:'none',
        mask:true,
       })
     }else{ 
        //num小于0就不能抽奖
        if(this.data.NUM>0){
          this.setData({
            btn_flag:false,//隐藏再来一个按钮 
            xianshiguize:false,
            pickUpBottle_man: true
          })
          db.collection("plp").where({
            "info.gender": "男",
          }).get().then(res => {
            //抽取的长度
            var length = res.data.length;
            if (length == 0) {
              wx.showToast({
                title: '暂时无男生哦',
                mask:true,
                icon:"none",
              })
              return
            }
            
            //捞到了吗？再加一个随机数判断
            var ispick = Math.floor(Math.random() * 10);
            //9拿到垃圾
            if(ispick==9){
              //抽到东西次数减一
              db.collection('user').where({_openid:app.userInfo._openid}).update({data:{
                NUM:this.data.NUM-1,
              }}).then(res=>{
                this.setData({
                  //页面中的次数减一
                  NUM:this.data.NUM-1,
                  //将垃圾返回
                  rubbish:true,
                  btn_flag:true,//显示再来一个按钮  
                })
              })
            }
            //1拿到奇怪的东西
            else if(ispick==1||ispick==2){
              //将奇怪的东西返回
              //抽到东西次数减一
              db.collection('user').where({_openid:app.userInfo._openid}).update({data:{
                NUM:this.data.NUM-1,
              }}).then(res=>{
                this.setData({
                  //页面中的次数减一
                  NUM:this.data.NUM-1,
                  //将垃圾返回
                  strange:true,
                  btn_flag:true,//显示再来一个按钮  
                })
              })
            }
            else{
              wx.showLoading({
                title: '',
                duration:500,
              })
              //随机抽取
              var random_num = Math.floor(Math.random() * length);
              //定义一些局部变量，用于下文
              var nr_show = res.data[random_num].info.nr
              var pic_show = res.data[random_num].info.pic
              //抽取的瓶子id
              var bottle_id = res.data[random_num]._id;
              //将信息写入用户列表
              //找到对应当前用户
              db.collection("user").where({
                _openid: app.userInfo._openid,
              }).get().then(res => {
                //记录捡到的数据连接  
                var bottle_pick = res.data[0].bottle_pick;
                //开始查找是否存在id重复
                // var flag_ = bottle_pick.indexOf(bottle_id);
                var flag_ = -1;
                for (var i=0;i<bottle_pick.length;i++){
                  if(bottle_pick[i].bottle_id==bottle_id){
                    flag_ = 1
                  }
                }
                //没有才加入
                if (flag_ == -1) {
                  //没有见到过的才展示出来
                  this.setData({
                    flag_show:true,//显示背景
                    btn_flag:true,//显示再来一个按钮 
                    nr_show,
                    pic_show
                  })
                  console.log("pic_show",pic_show);
                  //可抽取的次数减一
                  //抽到东西次数减一
                  db.collection('user').where({_openid:app.userInfo._openid}).update({data:{
                    NUM:this.data.NUM-1,
                  }}).then(res=>{
                    this.setData({
                      //页面中的次数减一
                      NUM:this.data.NUM-1,
                    })
                  })
                  //数据库操作
                  var _time = new Date().getTime();
                  var format_time = util.getTime(_time,2)
                  var bottle_pick_new = bottle_pick.concat({bottle_id,_time,nr_show,pic_show,format_time});
                  db.collection("user").where({
                    _openid: app.userInfo._openid
                  }).update({
                    data: {
                      //存入 {id，时间}
                      "bottle_pick": bottle_pick_new
                    }
                  }).then(res => {
                    return
                  })
                } else {
                  //再次调用函数
                  this.pickUpBottle_man();
                }
              })
            }
          })
        }
        else{
          wx.showToast({
            title: '今日次数已用完哦🌵~',
            icon:'none',
            mask:true,
          })
        }

     }
  },

  //再捞一个
  nextbottle(){
    this.setData({
      flag_show:false,//旧背景
      btn_flag:false,//隐藏再来一个按钮
      rubbish:false,
      strange:false,
    })
    if(this.data.pickUpBottle_man==true){
      this.pickUpBottle_man();  
    }
    if(this.data.pickUpBottle_woman==true){
      this.pickUpBottle_woman();
    }
  },

  //删除历史信息
  delete_history(event){
    //拿到当前数据id数组
    var bottle_id_array = this.data.bottle_id_array
    //拿到当前漂流瓶id
    var _id = event.currentTarget.dataset.id;
    //暂存数据中是否有准备删除的漂流瓶
    if(bottle_id_array.length==1){
      wx.showToast({
        title: '已经到顶咯~ 😿',
        icon:"none",
        mask:false
      })
      db.collection("user").where({_openid: app.userInfo._openid,}).update({
        data: {
          //直接改成空
          "bottle_pick": [],
        }
      }).then(res=>{
        //开始更新数据
        wx.showToast({
          title: '删除成功~ 👏',
          mask:true,
          icon:"none",
          duration:300,
        })
        //直接让他变成空
        this.setData({
          history_data:""
        })
        
      })
      this.setData({
        history_data:"",//解决顶问题
      })
    }else{
      //找到id相同的对象
      var obj=bottle_id_array.find(function (obj) {
		    return obj.bottle_id === _id
      })
      //找到index
      var index = this.getIndexInArr(bottle_id_array,obj)
      bottle_id_array.splice(index,1);
      db.collection("user").where({_openid: app.userInfo._openid,}).update({
        data: {
          "bottle_pick": bottle_id_array,
        }
      }).then(res=>{
        //更新数据
        //以防万一在此排序
        bottle_id_array.sort(this.compare)
        this.setData({
          history_data:bottle_id_array
        })
        //开始更新数据
        wx.showToast({
          title: '删除成功~ 👏',
          mask:true,
          icon:"none",
          duration:500,
        })
      })  
    }
  },

//从数组中获取对象的索引
getIndexInArr(_arr,_obj) {
  var len = _arr.length;
  for(var i = 0; i < len; i++)
  {
    if(this.isObjectValueEqual(_arr[i],_obj)) {
      return i;
    }
  }
  return -1;
},

//判断对象是否相等
isObjectValueEqual(a, b) {
	if(typeof(a) != "object" && typeof(b) != "object"){
		if(a == b){
			return true;
		}else{
			return false;
		}
	}
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
},

  //开启捡到漂流瓶提示 捡瓶子女
  pickUpBottle_woman() {
    //隐藏背景
    this.setData({
      flag_show:false,//旧背景
    }) 
    //检验是否登录
     if(app.userInfo.userinfo.login == "未知"){
       wx.showToast({
         title: '还未登录哦😸',
        icon:'none',
        mask:true,
       })
     }else{ 
        //num小于0就不能抽奖
        if(this.data.NUM>0){
          this.setData({
            btn_flag:false,//隐藏再来一个按钮 
            xianshiguize:false,
            pickUpBottle_woman: true
          })
          db.collection("plp").where({
            "info.gender": "女",
          }).get().then(res => {
            //抽取的长度
            var length = res.data.length;
            if (length == 0) {
              wx.showToast({
                title: '暂时无女生哦',
                mask:true,
                icon:"none",
              })
              return
            }
            
            //捞到了吗？再加一个随机数判断
            var ispick = Math.floor(Math.random() * 10);
            //9拿到垃圾
            if(ispick==9){
              //抽到东西次数减一
              db.collection('user').where({_openid:app.userInfo._openid}).update({data:{
                NUM:this.data.NUM-1,
              }}).then(res=>{
                this.setData({
                  //页面中的次数减一
                  NUM:this.data.NUM-1,
                  //将垃圾返回
                  rubbish:true,
                  btn_flag:true,//显示再来一个按钮  
                })
              })
            }
            //1拿到奇怪的东西
            else if(ispick==1||ispick==2){
              //将奇怪的东西返回
              //抽到东西次数减一
              db.collection('user').where({_openid:app.userInfo._openid}).update({data:{
                NUM:this.data.NUM-1,
              }}).then(res=>{
                this.setData({
                  //页面中的次数减一
                  NUM:this.data.NUM-1,
                  //将垃圾返回
                  strange:true,
                  btn_flag:true,//显示再来一个按钮  
                })
              })
            }
            else{
              wx.showLoading({
                title: '',
                duration:500,
              })
              //随机抽取
              var random_num = Math.floor(Math.random() * length);
              console.log("random_num",random_num);
              //定义一些局部变量，用于下文
              var nr_show = res.data[random_num].info.nr
              var pic_show = res.data[random_num].info.pic
              //抽取的瓶子id
              var bottle_id = res.data[random_num]._id;
              //将信息写入用户列表
              //找到对应当前用户
              db.collection("user").where({
                _openid: app.userInfo._openid,
              }).get().then(res => {
                //记录捡到的数据连接  
                var bottle_pick = res.data[0].bottle_pick;
                //开始查找是否存在id重复
                // var flag_ = bottle_pick.indexOf(bottle_id);
                var flag_ = -1;
                for (var i=0;i<bottle_pick.length;i++){
                  if(bottle_pick[i].bottle_id==bottle_id){
                    flag_ = 1
                  }
                }
                //没有才加入
                if (flag_ == -1) {
                  //没有见到过的才展示出来
                  this.setData({
                    flag_show:true,//显示背景
                    btn_flag:true,//显示再来一个按钮 
                    nr_show,
                    pic_show
                  })
                  //可抽取的次数减一
                  //抽到东西次数减一
                  db.collection('user').where({_openid:app.userInfo._openid}).update({data:{
                    NUM:this.data.NUM-1,
                  }}).then(res=>{
                    this.setData({
                      //页面中的次数减一
                      NUM:this.data.NUM-1,
                    })
                  })
                  //数据库操作
                  var _time = new Date().getTime();
                  var format_time = util.getTime(_time,2)
                  var bottle_pick_new = bottle_pick.concat({bottle_id,_time,nr_show,pic_show,format_time});
                  db.collection("user").where({
                    _openid: app.userInfo._openid
                  }).update({
                    data: {
                      //存入 {id，时间}
                      "bottle_pick": bottle_pick_new
                    }
                  }).then(res => {
                    return
                  })
                } else {
                  //再次调用函数
                  this.pickUpBottle_woman();
                }
              })
            }
          })
        }
        else{
          wx.showToast({
            title: '今日次数已用完哦🌵~',
            icon:'none',
            mask:true,
          })
        }

     }
  },

  //预览图片
  preview(event){
    console.log(event.currentTarget.dataset);
    var src=""
    if(event.currentTarget.dataset.havesrc!=""){
      src=event.currentTarget.dataset.havesrc
    }else{
      src="cloud://wan-an-gpnu-4gm1hsj6bb4b58fb.7761-wan-an-gpnu-4gm1hsj6bb4b58fb-1309987324/sys/giphy_cat.png"
    }
    wx.previewImage({
      urls: [src],
    })
  },


  //关闭捡到漂流瓶提示
  hideRule: function () {
    this.setData({
      //解决男漂流瓶取后漂流瓶残留信息显示
      pic_show: "",
      nr_show: "",
      //----------------------------
      pickUpBottle_man: false,
      pickUpBottle_woman: false,
      //下拉历史
      history_Show:false,
      //让垃圾和奇怪的东西归一化
      rubbish:false,
      strange:false,
    })
  },
  //关闭捡到漂流瓶提示细节
  hideRule_history_detail(){
    this.setData({
      
      //保留历史前页
      history_Show: true,
      history_is_show:true,
      //关闭这一页
      history_show_detail:""
    })
  },
  //开启扔漂流瓶提示
  show_put_bottle: function () {
    //检验是否登录
    if(app.userInfo.userinfo.login == "未知"){
      wx.showToast({
        title: '还未登录哦😺',
        icon:'none',
        mask:true,
      })
    }else{
      this.setData({
        xianshiguize:false,
        put_bottle_Show: true
      })
    }
  },
  //重构比较函数
  compare(a, b) {
    //记录一下各种时间
    const _timeA = a._time
    const _timeB = b._time
    let comparison = 0;
    if (_timeA > _timeB) {
      comparison = -1;
    } else if (_timeA < _timeB) {
      comparison = 1;
    }
    return comparison;
  },
  
  //开启历史
  show_history: function () {
    if(app.userInfo.userinfo.login == "未知"){
      wx.showToast({
        title: '还未登录哦😺',
        icon:'none',
        mask:true,
      })
    }else{
      this.setData({
        xianshiguize:false,
        history_Show: true,
      })
      //拿用户bottle_pick
      db.collection("user").where({
        _openid: app.userInfo._openid
      }).get().then(res => {
        //定义瓶子id数组
        var bottle_id_array = res.data[0].bottle_pick;
        this.setData({
          //暂存id数组到data
          bottle_id_array:bottle_id_array
        })
        //判断瓶子上数是否增加，如果没增加就不用改变
        if (bottle_id_array.length != this.data.history_data.length) {
          //定义用于渲染的数据变量 history_data_temp  
          var history_data_temp = [];
          //拿到bottle后开始去plp中找

          //时间判断 排序
          bottle_id_array.sort(this.compare); 

          //更新数据
          this.setData({
            history_data: bottle_id_array
          })

        }else{
        }
      })
    }
  },
  //查看历史细节
  show_history_detail(event) {
    //拿到id
    var id = event.currentTarget.dataset.id;
    db.collection("plp").doc(id).get().then(res=>{
      this.setData({
        //根据性别判断 开始为空 注意恢复初始
        history_show_detail:res,
        history_is_show:false
      })
    })
  },
  //关闭扔漂流瓶提示
  hide_put_bottle: function () {
    this.setData({
      //将瓶子信息清空
      nr:"",//关于按钮颜色
      info_clear:"",
      put_bottle_Show: false,
      pic:"https://media0.giphy.com/media/xUPGcuPLCKs0LiYnCg/200w.webp?cid=ecf05e473ul39w89u3ku07c9fosr7joggpx531qp7eojkipt&rid=200w.webp&ct=g",
    })
  },

  // -----------------这是扔漂流瓶的js函数-----------------

  //插入一张图片
  imgAdding() {
    wx.chooseImage({
      count: 1,
    }).then(res => {
      this.setData({
        pic: res.tempFilePaths[0],
      })
    })
  },

  

  // 当输入框失去焦点时触发该事件，并返回输入框的内容数据
  shijiao_nr(event) {
    this.setData({
      nr: event.detail.value
    })
  },
  //输入内容的限制函数
  input_nr(event) {
    if (event.detail.cursor >= 200) {
      wx.showToast({
        title: '字数已超200~',
        mask:true,
      })
    }
  },
  //当标题失焦
  titleShijiao(event) {
    this.setData({
      title: event.detail.value
    })
  },
  //标题聚焦提示长度过限
  bindinput(event) {
    if (event.detail.value.length >= 30) {
      wx.showToast({
        title: '长度不能超过30...',
        duration: 1300,
        icon: "error",
        mask:true,
      })
    }
  },

  // -----------------这是扔漂流瓶的js函数-----------------



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
    //这样写会导致图片上传后制动跳转到上一页
    // //收起页面
    // this.setData({
    //   isRuleTrue:false,
    //   put_bottle_Show:false,
    // })
    //加载页面就拿数据库的num
    db.collection('user').where({_openid:app.userInfo._openid}).get().then(res=>{
      //拿到数据库里面的内容
      if(res.data.length!=0){
        this.setData({
          NUM:res.data[0].NUM
        })
      }
      else{
        this.setData({
          NUM:0
        })
      }
    })

    //时间检测更新
    var myDate = new Date(); 
    var date = myDate.toLocaleDateString(); 
    var hours = myDate.getHours();
    var minutes = myDate.getMinutes(); 
    //如果小时=24时就刷新次数 
    if(hours==24||hours==0){
      db.collection('user').where({_openid: app.userInfo._openid}).update({
        data: {
          "NUM":8,
        }
      })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})