const db=wx.cloud.database();
const app=getApp();
const _ =db.command;
let huati_id;
let openid;
let userphoto;
//引入工具类
import common from "../../util/common";
Page({

    /**
     * 页面的初始数据
     */
    data: {

        //key是解决发布和失焦两个事件异步问题的钥匙
        // key:false,
        huati_data:[],
        huati_hd:"",
        scroll_top:'0',
        scroll_start:false,
        loading:false,
        author_photo:"",
        glid:"9999999"
    },



    //获取当前用户的openid
    get_openid(){
        wx.cloud.callFunction({
            name:"gpnu_login"
        }).then(res=>{
            openid=res.result.openid
            this.get_userphoto() 
        })
    },




    //从user数据库中获取用户头像
    get_userphoto(){
        db.collection("user").where({
            _openid:openid
        }).get().then(res=>{
            userphoto=res.data[0].userinfo.userphoto
        })
    },




    //获取该条话题的全部信息
    get_huati_data(){
        let tem_huati_data; //临时变量
        db.collection("huati").where({
            _id:huati_id
        }).get().then(res=>{
            tem_huati_data=res.data
            this.setData({
                huati_data:tem_huati_data
            })
            //获取楼主的头像
            db.collection("user").where({
                _openid:this.data.huati_data[0]._openid
            }).get().then(res=>{
                this.setData({
                    author_photo:res.data[0].userinfo.userphoto
                })
            })
        })
    },


    //发布话题互动
    fabu(){
        wx.showToast({
            title: '发布成功',
            icon:"success",
            duration:500
        })
        let time=new Date().getTime();
        // time=common.getTime(time,0);
        let old_huati_data_detail=this.data.huati_data[0]._detail
        let new_huati_data_detail=old_huati_data_detail.concat([{pic:userphoto,nr:this.data.huati_hd,time:time,openid:openid}])

        //修改data中的huati_data,实时渲染用户发的话题互动
        this.setData({
            'huati_data[0]._detail':new_huati_data_detail,
            key:false,
            show:false,
            huati_hd:""
        })

        //将发布的话题互动数据入库
        db.collection("huati").where({
            _id:huati_id
        }).update({
            data:{
                _detail:new_huati_data_detail
            }
        }).then(res=>{
        })
       
    },  


      //删除话题互动
      delete_huati_hd(event){
        var that = this
        //用index来找到需要删除的对应楼层
        var index=event.currentTarget.dataset.index;
        //自己的openid
        var my_openid = app.userInfo._openid;
        //拿到管理id
        var glid = that.data.glid;
        //拿到话题主人的openid
        var huati_author_openid=that.data.huati_data[0]._openid;

        if(huati_author_openid!=my_openid && glid!=my_openid && that.data.huati_data[0]._detail[index].openid!=my_openid){
            wx.showToast({
                title: '无权删除',
                icon:'none',
                duration: 800
              })
              return
        }

        wx.showModal({
            title: '提示',
            content: '删除后无法恢复',
            showCancel:'true',
            confirmText:'确认删除',
            confirmColor:'#FF4D49',
            cancelText:'取消',
            success(res){
                console.log("点击弹出层时用户的点击情况：",res)
                console.log("这里啊",that.data.huati_data[0]._openid)
                if(res.confirm==true){
                    //提前判断资格
                    if(huati_author_openid==my_openid||glid==my_openid||that.data.huati_data[0]._detail[index].openid==my_openid){
                        let new_huati_data=that.data.huati_data;
                        new_huati_data[0]._detail.splice(index,1);
                        //从话题库中删除对应接楼楼层的数据
                        db.collection("huati").where({
                            _id:huati_id
                        }).update({
                            data:{
                                _detail:new_huati_data[0]._detail
                            }
                        }).then(res=>{
                            console.log("从数据库中删除指定接楼内容成功！",res)
                            wx.showToast({
                              title: '删除成功',
                              mask:true,
                              icon:'none',
                              duration:800
                            })
                            //修改data里面的数据。实时刷新页面情况
                            that.setData({
                                huati_data:new_huati_data
                            })
                        })
                    }else{}
                }else if(res.cancel) {}
                
            }  
        })    
    },



    //失焦获得话题互动的内容
    get_textarea(event){
        this.setData({
            huati_hd:event.detail.value,
        })
    },




    //弹出层，填写想要发布的话题
    showPopup() {
        if(app.userInfo.userinfo.login=='未知'){
            wx.showToast({
                title: '还未登录哦😺',
                icon:'none',
                mask:true,
              })            
        }
        else{
            this.setData({ show: true });
        }
    },


    //取消
    onClose() {
        this.setData({ 
            huati_hd:"",
            show: false,
         });
    },


    //开始滑动，置顶功能球出现
    start_scroll(event){
        if(event.detail.scrollTop>=20){
            this.setData({
                scroll_start:true
            })
        }
    },

    //回到顶部，置顶功能球消失
    stop_scroll(){
        this.setData({
            scroll_start:false
        })
    },


    //点击置顶按钮
    zhiding(){
        this.setData({
            scroll_top:"0"
        })
    },  


    //点击置底按钮
    zhidi(){
        this.setData({
            scroll_top:"5000",
        })
    }, 

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        huati_id=options.id;
        this.get_huati_data()
        this.get_openid()
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
        //获取管理员id
        this.setData({
            glid:app.glid
        })
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
        app.shuaxin=true
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.get_huati_data()
        wx.stopPullDownRefresh(); 
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