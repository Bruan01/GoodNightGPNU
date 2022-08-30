const db=wx.cloud.database();
const app=getApp();
const _=db.command
let openid;
let userphoto;
let old_huati;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        glid:"9999999",
        huati:[],
        history_huati:[],
        scroll_top:'0',
        scroll_start1:false,
        scroll_start2:false,
        show: false,
        show_tip:false,
        loading1:true,
        loading2:true,
        huati_title:"",
        huati_nr:"",
        active:0,
        //tab_id是用来判断当前处于大厅还是历史
        tab_id:"1",
        //key是解决发布和失焦两个事件异步问题的钥匙
        // key:false
        //话题为空时的图片显示与否
        huati_kong:false,
        history_huati_kong:false

    },


    //每条话题的详情
    xiangqing(event){
        wx.navigateTo({
          url: '/pages/jielou_detail/jielou_detail?id='+event.currentTarget.dataset.id,
        })
    },

    


    //获取当前用户的openid
    get_openid(){
        this.get_huati()
        if(app.userInfo.userinfo.login!="未知"){
            this.get_userphoto() 
            this.get_history()
        }
        else{
            this.setData({
                loading2:false
            })
        }
    },

    
    //从user数据库中获取用户头像和该用户的历史话题
    get_userphoto(){
        db.collection("user").where({
            _openid:openid
        }).get().then(res=>{
            userphoto=res.data[0].userinfo.userphoto
            old_huati=res.data[0].huati
        })
    },


    //获取用户自己发过的话题
    get_history(size=0){
        let old_history_huati=this.data.history_huati;
        db.collection("huati").where({
            _openid:openid
        })
        .orderBy('_time','desc')
        .limit(10).skip(size)
        .get()
        .then(res=>{
            if(res.data.length==0&&size==0){
                this.setData({
                    history_huati_kong:true
                })
            }
            if(res.data.length<=9){
                this.setData({
                    loading2:false
                })
            }
            this.setData({
                history_huati:old_history_huati.concat(res.data)
            })
        })
    },


    
    //获取数据库所有话题
    get_huati(size=0){
        let old_huati=this.data.huati;
        db.collection("huati")
        .orderBy('_time','desc')
        .limit(10).skip(size)
        .get()
        .then(res=>{
            if(res.data.length==0&&size==0){
                this.setData({
                    huati_kong:true
                })
            }
            if(res.data.length<=9){
                this.setData({
                    loading1:false
                })
            }
            this.setData({
                huati:old_huati.concat(res.data)
            })
        })
    },



    //失焦获得话题标题内容
    get_text(event){
        this.setData({
            huati_title:event.detail.value
        })
    },


    //失焦获得话题开场白内容
    get_textarea(event){
        this.setData({
            huati_nr:event.detail.value
        })
    },

    

    //发布话题
    fabu(){
        wx.showToast({
            title: '发布成功',
            icon:"success",
            duration:800
        })
        let time=new Date().getTime();
        let tem_huati;
        db.collection("huati").add({
        data:{
            _time:time,
            _title:this.data.huati_title,
            _detail:[{pic:userphoto,nr:this.data.huati_nr,time:time,openid:app.userInfo._openid}],
            _userphoto:userphoto
        }
        }).then(res=>{
            db.collection("huati").where({
                _time:time
            })
            .get().then(res=>{
                tem_huati=res.data
                //修改data里面的数据
                this.setData({
                    huati:tem_huati.concat(this.data.huati),
                    history_huati:tem_huati.concat(this.data.history_huati),
                    key:false,
                    huati_title:"",
                    huati_nr:"",
                    //将话题空白的图关闭
                    huati_kong:false,
                    history_huati_kong:false
                })      
                console.log("lkhlkhlkhlkh",res.data[0]._id)
                old_huati=old_huati.concat({_id:res.data[0]._id})  
                db.collection("user").where({
                    _openid:openid
                }).update({
                   data:{
                        huati:old_huati
                   }
                }).then(res=>{
                })     
            })
        }) 
        this.onClose();
    },











    //---------------------------------------------------------------------
    //删除话题
    delete_huati(event){
        var that = this 
        //拿到该话题在数组中的index
        var index=event.currentTarget.dataset.index
        //拿到话题的open_id
        var huati_openid = event.currentTarget.dataset.openid
        console.log("huati_openid",huati_openid);
        //声明——id用于删除定位话题
        var _id = event.currentTarget.dataset.id
        //自己的openid
        var my_openid = app.userInfo._openid
        //拿到管理id
        var glid = that.data.glid

        if(huati_openid!=my_openid&&glid!=my_openid){
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
                if(res.confirm==true){
                    //提前判断资格
                    if(huati_openid==my_openid||glid==my_openid){
                        //开始删除huati数据库内容
                        db.collection("huati").doc(_id).remove().then(res=>{
                            console.log("删除成功！id为：",_id);
                            //开始删除用户数据库
                            db.collection("user").where({
                                _openid:huati_openid
                            }).update({
                                data:{
                                    huati:_.pull({_id:_id})
                                }
                            }).then(res=>{
                                console.log("从user库删除话题成功")
                                //更新data中的相应的话题，保证页面实时刷新
                                if(that.data.tab_id=='1'){
                                    that.data.huati.splice(index,1)
                                    that.setData({
                                        huati:that.data.huati,
                                        history_huati:[]
                                    })
                                    that.get_history()
                                    if(that.data.huati.length==0){
                                        that.setData({
                                            //删到话题库为空时，将代表空的图片显示出来
                                            huati_kong:true
                                        })
                                    }
                                    
                                }
                                if(that.data.tab_id=='2'){
                                    that.data.history_huati.splice(index,1)
                                    that.setData({
                                        history_huati:that.data.history_huati,
                                        huati:[]
                                    })
                                    that.get_huati()
                                    if(that.data.history_huati.length==0){
                                        that.setData({
                                            history_huati_kong:true
                                        })
                                    }
                                }                                   
                            })
                        })         
                    }
                }else if (res.cancel) {}
                
            }  
        })    
    },

    
//--------------------------------------------------------------------










    //tab栏
    onChange(event){
        wx.showToast({
          title: `切换到${event.detail.title}`,
          icon: 'none',
          duration: 500
        });
        if(event.detail.title=="🌟大厅"){
            this.setData({
                tab_id:"1"
            })
        }
        if(event.detail.title=="❄️历史"){
            this.setData({
                tab_id:"2"
            })
        }
        
    },

    
    //弹出层--发布话题，填写想要发布的话题
    showPopup() {
        if(app.userInfo.userinfo.login=='未知'){
            wx.showToast({
                title: '还未登录哦😺',
                icon:'none',
                mask:true,
              })            
        }else{
            this.setData({ show: true });
        }
    },

    onClose() {
        this.setData({ 
            show: false,
            huati_title:"",
            huati_nr:"",
        });
    },




    //开始滑动，置顶功能球出现
    start_scroll(event){
        if(event.detail.scrollTop>=200&&this.data.tab_id=="1"){
            this.setData({
                scroll_start1:true
            })
        }
        if(event.detail.scrollTop>=200&&this.data.tab_id=="2"){
            this.setData({
                scroll_start2:true
            })
        }
    },

    //回到顶部，置顶功能球消失
    stop_scroll(){
        if(this.data.tab_id=="1"){
            this.setData({
                scroll_start1:false
            })
        }
        if(this.data.tab_id=="2"){
            this.setData({
                scroll_start2:false
            })
        }

    },

    //触底了,再从数据库取数据来刷新页面
    scroll_bottom(){
        if(this.data.tab_id=="1"&&this.data.loading1==true){
            this.get_huati(this.data.huati.length)          
        }
        if(this.data.tab_id=="2"&&this.data.loading2==true){           
            this.get_history(this.data.history_huati.length)         
        }   
    },


    //点击置顶按钮
    zhiding(){
        this.setData({
            scroll_top:"0",
        })
    },  


    //点击置底按钮
    zhidi(){
        this.setData({
            scroll_top:"5000",
        })
    }, 

    //弹出 使用说明，提醒用户如何使用
    show_tip(){
        this.setData({
            show_tip:true
        })
    },


    //关闭 弹出层--tip使用说明
    close_tip(){
        this.setData({
            show_tip:false
        })
    },







    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        openid = app.userInfo._openid
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
//         if(app.shuaxin==false){
//             this.setData({
//                 huati:[],
//                 history_huati:[]
//             })
//             this.get_huati()
//             this.get_history()
//         }
        app.shuaxin=false
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

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            loading1:true,
            loading2:true,
            huati:[],
            history_huati:[]
        })
        this.get_huati()
        this.get_history()
        //刷新栏收缩
        wx.stopPullDownRefresh(); 
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      
    },

})