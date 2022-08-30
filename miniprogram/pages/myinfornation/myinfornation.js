const app=getApp()
//引入工具类
import common from "../../util/common";
//引入vant的地区数据
import { areaList } from '@vant/area-data';
// openid 是用来接受上级页面跳转时带过来的参数openid，即 被访问者的openid
let openid;
//visit_openid是用来接受 访问者的openid
let visit_openid;
//定义临时对象来存放从前端用户输入返回的数据，后利用该临时对象来更新数据库
let temlist={userphoto:'',username:'',sex:'',birthday:'',xueyuan:'',special:'',region:'',wx_code:'',qq_code:'',phone:'',introduce:''}; 
Page({
    /**
     * 页面的初始数据
     */

    data: {
        //个人信息列表
        //弃用datalist:{},别问我为啥不用对象把这么多属性包起来，因为这样做就无法双向绑定数据，我也很难受。。。
        //为什么个人信息项有的是false,因为这些信息项若为空且在非本人进入信息页的情况下则隐藏，不显示。birthday，region,qq_code,phone这四个便是这种选项
        userphoto:"",
        username:"",
        sex:"",
        birthday:false,    
        xueyuan:"",
        special:"",
        region:false,
        wx_code:"",
        qq_code:false,
        phone:false,
        introduce:"",
        //modify是用来判断是否对个人信息进行修改的Flag
        modify:false,

        //日历
        //flag是开启日历的旗帜
        show1: false,
        flag1:false,      
        currentDate: new Date().getTime(),
        minDate: new Date().getTime(),
        formatter(type, value) {
        if (type === 'year') {
            return `${value}年`;
        }
        if (type === 'month') {
            return `${value}月`;
        }
        return value;
        },
        //当前时间戳
        timestamp:'',
        //地区数据
        areaList,
        show2: false,
        flag2:false,
        
        //same判断访问者和被访问者是否为同一个人
        same:false,

        //right判断性别输入是否正确
        right:true,
    },


    //获取访问者的openid
    get_visit_openid(){
        wx.cloud.callFunction({
            name:"gpnu_login"
        }).then(res=>{
            visit_openid=res.result.openid
            //测试用的
            if(openid==visit_openid){
                this.setData({
                    same:true
                })
            }else{
                this.setData({
                    same:false
                })
            }
        })
    },


    

    //日历
    //点击打开日历
    show_Date() {
        this.setData({ 
            show1: true,
            flag1:true
        });
    },

    //点击日历的取消或者确定按钮后将日历弹出层收起来
    close_show_Date() {
        this.setData({
            show1: false,
            flag1:false
        });
    },
    //点击日历的确定后将时间戳转化为正常时间，并存进birthday
    finish_choice_Date(event){
        let timestamp=event.detail
        let birthday=common.getTime(timestamp,0)
        this.setData({
           birthday:birthday
        })
        temlist.birthday=birthday
        this.close_show_Date()
    },




    //地区
    //点击打开地区选择器
    show_Area(){
        this.setData({ 
            show2: true,
            flag2:true
        });
    },

     //点击地区的取消或者确定按钮后将地区弹出层收起来
    close_show_Area(){
        this.setData({
            show2: false,
            flag2:true
        })
    },

    //点击地区的确定后将地区存进region
    finish_choice_Area(event){
        let region_province=event.detail.values[0].name
        let region_city=event.detail.values[1].name
        let region_qu=event.detail.values[2].name
        let region=region_province+region_city+region_qu
        this.setData({
            region:region
        })
        temlist.region=region
        this.close_show_Area()
    },





    //实时获取当前时间的时间戳
    getTime(){
        var timestamp = Date.parse(new Date());  
        this.setData({
            timestamp:timestamp
        })
        
    },

    
    // 点击事件，正要修改个人信息，将modify调为true
    touch(){
        this.setData({
            modify:true
        });
    },


    // 点击事件，完成个人信息的修改，将modify调为false
    finish(){
        if(this.data.right){
            wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 1000
            })
            this.setData({
                modify:false
            });
            this.upData()
        }
        else{
            wx.showToast({
              title: '选项格式出错',
              mask:true,
              icon:'none',
              duration:1000
            })
        }  
      
    },




    


    // 通过调用云函数获取数据库的数据并设置data里的各项个人信息
    getData(){
        wx.cloud.callFunction({
            name:"data_get",
            data:{
                openid:openid
            }
        }).then(res=>{
            this.setData({
                // datalist:res.result.data
                userphoto:res.result.data[0].userinfo.userphoto,
                username:res.result.data[0].userinfo.username,
                sex:res.result.data[0].userinfo.sex,
                birthday:res.result.data[0].userinfo.birthday,
                xueyuan:res.result.data[0].userinfo.xueyuan,
                special:res.result.data[0].userinfo.special,
                region:res.result.data[0].userinfo.region,
                wx_code:res.result.data[0].userinfo.wx_code,
                qq_code:res.result.data[0].userinfo.qq_code,
                phone:res.result.data[0].userinfo.phone,
                introduce:res.result.data[0].userinfo.introduce
            }),
            this.temlist_init(),
            console.log(temlist)
        })
    },



    //更新数据库中的数据
    upData(){
        wx.cloud.callFunction({
            name:"data_up",
            data:{
                openid:openid,
                temlist:temlist
            }
        }).then(res=>{
        })
    },



    // bind:blur:"reData"事件返回的value与具有双向绑定功能的各项个人信息进行对比，若相同则将 temlist{} 中对应的个人信息进行修改
    reData(event){
        if(this.data.userphoto==event.detail.value){
            temlist.userphoto=this.data.userphoto
        }
        else if(this.data.username==event.detail.value){
            temlist.username=this.data.username
        }
        else if(this.data.sex==event.detail.value){
            if(event.detail.value=='男'||event.detail.value=='女'){
                temlist.sex=this.data.sex
                this.setData({
                    right:true
                })
            }
            else{
                this.setData({
                    right:false
                })
            }
        }
        else if(this.data.xueyuan==event.detail.value){
            temlist.xueyuan=this.data.xueyuan
        }
        else if(this.data.special==event.detail.value){
            temlist.special=this.data.special
        }
        else if(this.data.wx_code==event.detail.value){
            temlist.wx_code=this.data.wx_code
        }
        else if(this.data.qq_code==event.detail.value){
            temlist.qq_code=this.data.qq_code
        }
        else if(this.data.phone==event.detail.value){
            temlist.phone=this.data.phone
        }
        else if(this.data.introduce==event.detail.value){
            temlist.introduce=this.data.introduce
        }
    },



    //在使用getData()获取了数据库中的数据后，需要初始化 temlist{} 中的数据，因为我们定义了一个全局的 temlist{}，每次编译里面数据都为空，所以我们要让它初始化为上次修改后的模样
    temlist_init(){
        temlist.userphoto=this.data.userphoto
        temlist.username=this.data.username
        temlist.sex=this.data.sex
        temlist.birthday=this.data.birthday
        temlist.xueyuan=this.data.xueyuan
        temlist.special=this.data.special
        temlist.region=this.data.region
        temlist.wx_code=this.data.wx_code
        temlist.qq_code=this.data.qq_code
        temlist.phone=this.data.phone
        temlist.introduce=this.data.introduce
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       openid=options.openid,
       this.get_visit_openid()
       this.getTime()
       this.getData()
    //    this.temlist_init()   在此处初始化 temlist{} 会失败，因为上面的getData()在获取数据库中的数据需要一定的时间，所以我们直接把 temlist{} 的初始化直接放在getData()里面
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
       //返回个人空间并刷新页面
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

    },

    /**
     * 用户点击右上角分享
     */
    onShregionppMessage: function () {

    }
})