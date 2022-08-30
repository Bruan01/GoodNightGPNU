//引入工具类
import common from "../../util/common";
// openid是被访问者的id
let openid;
//visit_openid是访问者的id
let visit_openid;
let visit_id;
const app=getApp();
const db=wx.cloud.database();
const _ =db.command;
const $ = db.command.aggregate
Page({

    /**
     * 页面的初始数据
     */
    data: {
        openid:"",
        datalist:{},
        sshuo_dongtai:[],
        sshuo_boke:[],
        sshuo_dongtai_love:[],
        sshuo_boke_love:[],
        //总粉丝数，总获赞数，总浏览量
        total_fans:0,
        total_dianzannb:0,
        total_look:0, 
        active: 0,
        loading1:true,
        loading2:true,
        show1: false,
        show2:false,
        //tab_id是用来判断当前处于动态还是博客
        tab_id:"1",
        //same用来判断访问者和被访问者是否为同一个人
        same:false,
        //workid是删除时要用的作品id
        workid:"",
        //jubao是用来存放举报人的id和这条作品的总举报数
        jubao:[],
        // jubao_work_index用来标识需要举报的作品在sshuo_dongtai中的位置
        jubao_work_index:"",
        //是否关注了该主页的主人
        guanzhu:false
    },

  

    //获取访问者的openid和_id
    get_visit_openid(){
        wx.cloud.callFunction({
            name:"gpnu_login"
        }).then(res=>{
            visit_openid=res.result.openid
            //在获取访问者的openid后再获取粉丝列表数据，防止异步
            this.get_fans_list()
            if(openid==visit_openid){
                this.setData({
                    same:true
                })
            }else{
                this.setData({
                    same:false
                })
            }
            //使用visit_openid来获取该用户的_id
            db.collection("user").where({
                _openid:visit_openid
            }).get().then(res=>{
                visit_id=res.data[0]._id
                 //在获取访问者的openid和_id后再获取说说数据，防止异步
                this.get_sshuo_Data()
            })
        })
    },



    //删除博客前获得需要删除的博客的作品id
    get_boke_workid(event){
        this.setData({
            show2:true,
            workid:event.currentTarget.dataset.workid,
            jubao:event.currentTarget.dataset.jubao,
            jubao_work_index:event.currentTarget.dataset.index,
        })
    },




    //删除动态前获得需要删除的作品的作品id
    get_dongtai_workid(event){
        this.setData({
            workid:event.currentTarget.dataset.workid,
            jubao:event.currentTarget.dataset.jubao,
            jubao_work_index:event.currentTarget.dataset.index,
        })
    },



    
    //删除博客时对数据库和data数据进行修改
    delete_boke_data(){
        let old_sshuo_boke=this.data.sshuo_boke;
        let old_sshuo_boke_love=this.data.sshuo_boke_love;
        let old_total_dianzannb=this.data.total_dianzannb;
        let old_total_look;
        //遍历该用户的所有作品，找到要删除的作品对应的数组下标
        old_sshuo_boke.forEach((item,index)=>{
            if(item._id==this.data.workid){
                old_total_look=item.shuoshuo_xingxi.look;
                old_sshuo_boke.splice(index,1);
                old_sshuo_boke_love.splice(index,1);
                old_total_dianzannb=old_total_dianzannb-item.shuoshuo_xingxi.dianzannb;
                return
            }
        })
        //先更新修改this.data中的数据，即便及时渲染
        this.setData({
            sshuo_boke:old_sshuo_boke,
            sshuo_boke_love:old_sshuo_boke_love,
            total_dianzannb:old_total_dianzannb,
            total_look:this.data.total_look-old_total_look,
            // total_works:old_total_works,
            //关闭弹出层
            show2:false
        })
        //删除sshuo数据库中的对应的作品记录
        db.collection("sshuo").where({
            _id:this.data.workid
        }).remove()
         //删除user数据库中的对应作品记录
         db.collection("user").where({
            _openid:openid
        }).update({
            data:{
                wenzhang:_.pull({
                    id:this.data.workid
                })
            }
        })
    },



    //删除动态时对数据库和data数据进行修改
    delete_dongtai_data(){
        let old_sshuo_dongtai=this.data.sshuo_dongtai;
        let old_sshuo_dongtai_love=this.data.sshuo_dongtai_love;
        let old_total_dianzannb=this.data.total_dianzannb;
        let old_total_look;
        //遍历该用户的所有作品，找到要删除的作品对应的数组下标
        old_sshuo_dongtai.forEach((item,index)=>{
            if(item._id==this.data.workid){
                old_total_look=item.shuoshuo_xingxi.look;
                old_sshuo_dongtai.splice(index,1);
                old_sshuo_dongtai_love.splice(index,1);
                old_total_dianzannb=old_total_dianzannb-item.shuoshuo_xingxi.dianzannb;
                // old_total_works=old_total_works-1;
                return
            }
        })
        //先更新修改this.data中的数据，即便及时渲染
        this.setData({
            sshuo_dongtai:old_sshuo_dongtai,
            sshuo_dongtai_love:old_sshuo_dongtai_love,
            total_dianzannb:old_total_dianzannb,
            total_look:this.data.total_look-old_total_look,
            //关闭弹出层
            show1:false
        })
        //删除sshuo数据库中的对应的作品记录
        db.collection("sshuo").where({
            _id:this.data.workid
        }).remove()
        //删除user数据库中的对应作品记录
        db.collection("user").where({
            _openid:openid
        }).update({
            data:{
                wenzhang:_.pull({
                    id:this.data.workid
                })
            }
        })
    },



    //作品主人自己在自己主页删除指定作品
    delete_works(){
        let glid=app.glid;
        //要删除的作品在sshuo_dongtai数组中的下标
        if(this.data.same||glid==visit_openid){
            //调用delete_data函数进行删除作品和数据修改
            if(this.data.tab_id=='1'){
                this.delete_dongtai_data()
            }
            else{
                this.delete_boke_data()
            }
            //提示删除成功
            wx.showToast({
                title: '删除成功',
                icon:"success",
                duration:800,
                mask:true
              })
        }else{
            //不是本人删除作品，提示权限不足
            wx.showToast({
              title: '权限不足',
              icon:"error",
              duration:800,
              mask:true
            })
            //关闭弹出层
            if(this.data.tab_id=='1'){
                this.setData({
                    show1:false
                })
            }
            else{
                this.setData({
                    show2:false
                })
            }
            
        }   
    },


    

    //举报作品，超过10次删除该条作品
    jubao_works(){
        let have=true;
        this.data.jubao[0].forEach(item=>{
            if(item==visit_id){
                if(this.data.tab_id=='1'){
                    this.setData({
                        show1:false
                    })
                }
                else{
                    this.setData({
                        show2:false
                    })
                }
                wx.showToast({
                  title: '已举报过',
                  icon:'error',
                  duration:1000,
                  mask:true
                })
                have=false
                return
            }
        })
        if(have==true){
            //先修改data里的数据
            this.setData({
                'jubao[0]':this.data.jubao[0].concat([visit_id]),
                'jubao[1]':this.data.jubao[1]+1,
            })
            if(this.data.tab_id=='1'){
                //将sshuo_dongtai里的举报数据修改下，实时渲染
                let tem_sshuo_dongtai=this.data.sshuo_dongtai
                tem_sshuo_dongtai[this.data.jubao_work_index].shuoshuo_xingxi.jubao=this.data.jubao
                this.setData({
                    sshuo_dongtai:tem_sshuo_dongtai,
                    show1:false
                })
                wx.showToast({
                title: '举报成功',
                duration:800,
                mask:true
                })
                //再修改数据库的数据
                db.collection("sshuo").where({
                    _id:this.data.workid
                }).update({
                    data:{
                        "shuoshuo_xingxi.jubao":this.data.jubao,
                    }
                }).then(res=>{
                })
            }
            if(this.data.tab_id=='2'){
                //将sshuo_boke里的举报数据修改下，实时渲染
                let tem_sshuo_boke=this.data.sshuo_boke
                tem_sshuo_boke[this.data.jubao_work_index].shuoshuo_xingxi.jubao=this.data.jubao
                this.setData({
                    sshuo_boke:tem_sshuo_boke,
                    show2:false
                })
                wx.showToast({
                title: '举报成功',
                duration:800,
                mask:true
                })
                //再修改数据库的数据
                db.collection("sshuo").where({
                    _id:this.data.workid
                }).update({
                    data:{
                        "shuoshuo_xingxi.jubao":this.data.jubao,
                    }
                }).then(res=>{
                })
            }
            
        }
        if(this.data.jubao[1]>=10){
            if(this.data.tab_id=='1'){
                this.delete_dongtai_data();
            }
            if(this.data.tab_id=='2'){
                this.delete_boke_data();
            }
        }
    },


    

    //点击每条作品的右上角的三个点，会出现popup弹出层
    showPopup() {
        this.setData({ show1: true });
    },
    
    onClose() {
        this.setData({ 
            show1:false,
            show2:false
        
        });
    },



    //tab标签栏
    onChange(event) {
        wx.showToast({
            title: `切换到${event.detail.title}`,
            icon: 'none',
            duration:500
        });
        if(event.detail.title=="🌞动态"){
            this.setData({
                tab_id:"1"
            })
        }
        if(event.detail.title=="⭐️博客"){
            this.setData({
                tab_id:"2"
            })
        }
    },






    // 获取个人信息资料
    get_pre_Data(){
        wx.cloud.callFunction({
            name:"data_get",
            data:{
                openid:openid
            }
        }).then(res=>{
            this.setData({
                datalist:res.result.data[0]
            })
        })
    },



    //获取说说数据,顺便修改发布日期的格式（将时间戳转换为正常日期）
    get_sshuo_Data(size1=0,size2=0){
        //再获取说说数据
        let dianzan1=false;
        let dianzan2=false;
        //获取动态的数据
        db.collection("sshuo").where({
            flag:0,
            _openid:openid
        })
        .limit(5).orderBy('_time','desc').skip(size1).get()
        .then(res=>{
            if(res.data.length<=4&&this.data.sshuo_dongtai.length<=5){
                this.setData({
                  loading1:false
                })
            }
            if(res.data.length==0){
                this.setData({
                  loading1:false
                })
            }
            res.data.forEach((item,index)=>{
                let time=common.getTime(item._time,0);
                item._time=time;
                //判断是否点过赞
                item.shuoshuo_xingxi.dianzanid.forEach(item1=>{
                    if(item1==visit_id){
                        dianzan1=true
                    }
                })
                if(dianzan1==false){
                    this.setData({
                        sshuo_dongtai_love:this.data.sshuo_dongtai_love.concat([false])
                    })
                }
                else{
                    this.setData({
                        sshuo_dongtai_love:this.data.sshuo_dongtai_love.concat([true])
                    })
                    dianzan1=false
                } 
                //判断是否点过赞结束               
            })
            let old_shuoshuo_dongtai=this.data.sshuo_dongtai;
            let new_shuoshuo_dongtai=old_shuoshuo_dongtai.concat(res.data);
            this.setData({
                sshuo_dongtai:new_shuoshuo_dongtai
            })
        })


        //获取博客的数据
        db.collection("sshuo").where({
            flag:1,
            _openid:openid
        })
        .limit(5).orderBy('_time','desc').skip(size2).get()
        .then(res=>{
            if(res.data.length<=4&&this.data.sshuo_boke<=5){
                this.setData({
                  loading2:false
                })
            }
            if(res.data.length==0){
                this.setData({
                  loading2:false
                })
            }
            res.data.forEach((item,index)=>{
                // 将时间转换为正常时间格式
                let time=common.getTime(item._time,0);
                item._time=time;
                //判断是否点过赞
                item.shuoshuo_xingxi.dianzanid.forEach(item1=>{
                    if(item1==visit_id){
                        dianzan2=true
                    }
                })
                if(dianzan2==false){
                    this.setData({
                        sshuo_boke_love:this.data.sshuo_boke_love.concat([false])
                    })
                }
                else{
                    this.setData({
                        sshuo_boke_love:this.data.sshuo_boke_love.concat([true])
                    })
                    dianzan2=false
                } 
                //判断是否点过赞结束   

            })
            let old_shuoshuo_boke=this.data.sshuo_boke;
            let new_shuoshuo_boke=old_shuoshuo_boke.concat(res.data)
            this.setData({
                sshuo_boke:new_shuoshuo_boke
            })
        })
    },


    //获取该主页用户的总作品数，总获赞数，总浏览量
    get_total(){
        //获取该主页用户的总作品数
        // db.collection("sshuo").where({
        //     _openid:openid
        // }).count()
        // .then(res=>{
        //     this.setData({
        //         total_works:res.total
        //     })
        // })


        //获取该主页用户的总获赞数，总浏览量
        db.collection("sshuo")
        .aggregate()
        .match({
            _openid:openid
        })
        .group({
            _id:null,
            total_look: $.sum('$shuoshuo_xingxi.look'),
            total_dianzannb: $.sum('$shuoshuo_xingxi.dianzannb')
          })
        .end().then(res=>{
            if(res.list.length!=0){
                this.setData({
                    total_look:res.list[0].total_look,
                    total_dianzannb:res.list[0].total_dianzannb
                })
            }
        })
    },



    //动态部分点赞
    dianzan(event){
        let index=event.currentTarget.dataset.index
        //没点过赞的情况
        if(this.data.sshuo_dongtai_love[index]==false){
            db.collection("sshuo").where({
                _id:event.currentTarget.dataset.id
            }).update({
                data:{
                    'shuoshuo_xingxi.dianzannb':this.data.sshuo_dongtai[index].shuoshuo_xingxi.dianzannb+1,
                    'shuoshuo_xingxi.dianzanid':this.data.sshuo_dongtai[index].shuoshuo_xingxi.dianzanid.concat([visit_id])
                }
            }).then(res=>{
            })
            //定义一个临时‘动态说说’数组
            let tem_dongtai=this.data.sshuo_dongtai
            tem_dongtai[index].shuoshuo_xingxi.dianzannb+=1
            //定义一个临时‘点赞是否’数组
            let tem_love=this.data.sshuo_dongtai_love
            tem_love[index]=!tem_love[index]
            //将对应作品的点赞实时渲染出来
            this.setData({
              "sshuo_dongtai":tem_dongtai,
              "sshuo_dongtai_love":tem_love
            })
            //将主页信息的点赞数进行实时更新渲染
            this.setData({
                total_dianzannb:this.data.total_dianzannb+1
            })
        }
        //点过赞的情况
        else{
            // 找到指定元素在数组中的位置
            let index0;
            this.data.sshuo_dongtai[index].shuoshuo_xingxi.dianzanid.forEach((item,index1)=>{
                if(item==openid){
                    index0=index1
                }
            })
            //删除dianzanid数组中对应用户的id,注意splice()返回的是被删除的那个数据
            this.data.sshuo_dongtai[index].shuoshuo_xingxi.dianzanid.splice(index0,1)
            db.collection("sshuo").where({
                _id:event.currentTarget.dataset.id
            }).update({
                data:{
                    'shuoshuo_xingxi.dianzannb':this.data.sshuo_dongtai[index].shuoshuo_xingxi.dianzannb-1,
                    'shuoshuo_xingxi.dianzanid':this.data.sshuo_dongtai[index].shuoshuo_xingxi.dianzanid
                }
            }).then(res=>{
            })
            //定义一个临时‘动态说说’数组
            let tem_dongtai=this.data.sshuo_dongtai
            tem_dongtai[index].shuoshuo_xingxi.dianzannb-=1
            //定义一个临时‘点赞是否’数组
            let tem_love=this.data.sshuo_dongtai_love
            tem_love[index]=!tem_love[index]
            //将点赞实时渲染出来
            this.setData({
              "sshuo_dongtai":tem_dongtai,
              "sshuo_dongtai_love":tem_love
            })
            //将主页信息的点赞数进行实时更新渲染
            this.setData({
                total_dianzannb:this.data.total_dianzannb-1
            })
        }
       
    },


    //动态详情页
    dongtai_xiangqing(event){
        let id=event.currentTarget.dataset.id
        let index=event.currentTarget.dataset.index
        wx.cloud.callFunction({
            name:"look",
            data:{
            id:id,
            }
        }).then(res=>{
        })
        wx.navigateTo({
            url: "/pages/detail/detail?id="+id+"&fenxiang=false&liuyan=false&love="+this.data.sshuo_dongtai_love[index],
        })
    },


    //博客详情页
    boke_xiangqing(event){
        let id=event.currentTarget.dataset.id
        let index=event.currentTarget.dataset.index
        wx.cloud.callFunction({
            name:"look",
            data:{
            id:id,
            }
        }).then(res=>{
        })
        wx.navigateTo({
            url: "/pages/detail/detail?id="+id+"&fenxiang=false&liuyan=false&love="+this.data.sshuo_boke_love[index],
        })
    },



    //获取该主页主人的关注列表并判断进入到这个主页的人是否关注了主页的主人
    //并获取总粉丝数
    get_fans_list(){
        db.collection("user").where({
            _openid:openid
        }).get().then(res=>{
            //获取总粉丝数
            this.setData({
                total_fans:res.data[0].fans.length
            })
            //判断进入到这个主页的人是否关注了主页的主人
            res.data[0].fans.forEach((item,index)=>{
                if(visit_openid==item.openid){
                    this.setData({
                        guanzhu:true
                    })
                }
            })
        })
    },






    //点击关注按钮,向数据库添加数据
    guanzhu(){
        this.setData({
            guanzhu:true,
            total_fans:this.data.total_fans+1
        })
        let time=new Date().getTime();
        db.collection("user").where({
            _openid:visit_openid
        }).get().then(res=>{
            db.collection("user").where({
                _openid:openid
            }).update({
                data:{
                    fans:_.push({openid:visit_openid,time:time,username:res.data[0].userinfo.username,userphoto:res.data[0].userinfo.userphoto})
                }
            })
        })
        db.collection("user").where({
            _openid:openid
        }).get().then(res=>{
            db.collection("user").where({
                _openid:visit_openid
            }).update({
                data:{
                    concerned:_.push({openid:openid,time:time,username:res.data[0].userinfo.username,userphoto:res.data[0].userinfo.userphoto})
                }
            })
        })      
    },


    //取消关注,删除对方的粉丝数组中我的数据，和删除我自己的关注数据中对方的数据
    cancel_guanzhu(){
        this.setData({
            guanzhu:false,
            total_fans:this.data.total_fans-1
        })
        db.collection("user").where({
            _openid:visit_openid
        }).update({
            data:{
                concerned: _.pull({
                    openid:openid
                })
            }
        })
        db.collection("user").where({
            _openid:openid
        }).update({
            data:{
                fans: _.pull({
                    openid:visit_openid
                })
            }
        })
    },

    


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        openid=options.openid
        this.setData({
           openid:openid
        })
        this.get_pre_Data()
        this.get_visit_openid()
        this.get_total()
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
        //刷新页面的作品数据
        if((this.data.sshuo_dongtai.length!=0&&!app.shuaxin)||(this.data.sshuo_boke.length!=0&&!app.shuaxin)){
            this.setData({
                sshuo_dongtai:[],
                sshuo_boke:[],
                sshuo_dongtai_love:[],
                sshuo_boke_love:[],
                //总作品数，总获赞数，总浏览量
                // total_works:0,
                total_dianzannb:0,
                total_look:0, 
                active: 0,
                loading1:true,
                loading2:true,
                show1: false,
                show2:false,
                //workid是删除时要用的作品id
                workid:"",
                //jubao是用来存放举报人的id和这条作品的总举报数
                jubao:[],
                // jubao_work_index用来标识需要举报的作品在sshuo_dongtai中的位置
                jubao_work_index:""
            })
            this.get_sshuo_Data()
            this.get_total()
        }
        // 刷新页面的个人信息，如性别,个人简介等
        let shuaxin=app.shuaxin
        if(shuaxin){
            this.get_pre_Data()
            app.shuaxin=false
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
        //返回主页刷新页面
        app.shuaxin=true
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
        this.get_sshuo_Data(this.data.sshuo_dongtai.length,this.data.sshuo_boke.length)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})