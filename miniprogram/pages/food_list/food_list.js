// pages/eat/eat.js
const db=wx.cloud.database();
let openid;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show:false,
        show1:false,
        show2:false,
        show3:false,
        show4:false,
        //菜谱
        food_list:"",
        //随机数
        random_nub:"",
        //要添加或删除的菜品
        food:"",
    },


    onChange(event) {
        const { picker, value, index } = event.detail;
    },

    //获取当前用户的openid
    get_openid(){
        wx.cloud.callFunction({
            name:"gpnu_login"
        }).then(res=>{
            openid=res.result.openid
            this.get_food_list()
        })
    },



    //获取菜单
    get_food_list(){
        db.collection("user").where({
            _openid:openid
        }).get().then(res=>{
            this.setData({
                food_list:res.data[0].food_list
            })
        })
    },



    //随机菜品
    random_food(){
        //生成随机数
        let length=this.data.food_list.length;
        let random_nub=Math.floor(Math.random()*length);
        this.setData({
            random_nub:random_nub
        })
        this.showPopup()
    },  




    //input获取输入栏的内容
    input_food(event){
        this.setData({
            food:event.detail.value
        })
    },



    //添加菜品
    add_food(){
        let same;
        this.data.food_list.forEach((item,index)=>{
            if(item==this.data.food){
                same=true
                return
            }
        })
        if(same==true){
            wx.showToast({
              title: '此菜品已在食谱中',
              mask:true,
              duration:1000,
              icon:'none'
            })
            //关闭弹出层
            this.onClose3()
        }
        else{
            //先修改data的数据
            this.setData({
                food_list:this.data.food_list.concat([this.data.food]),
            })
            //再修改user数据库中的food_list的数据
            db.collection("user").where({
                _openid:openid
            }).update({
                data:{
                    food_list:this.data.food_list
                }
            }).then(res=>{
            })
            //关闭弹出层
            this.onClose3()
            //显示添加成功
            wx.showToast({
            title: '添加成功',
            mask:true,
            duration:800
            })
        }

    },  




    //删除菜品
    delete_food(event){
        if(this.data.food_list.length>0){
            let food_index=event.detail.index;
            this.data.food_list.splice(food_index,1)
            this.setData({
                food_list:this.data.food_list,
            })
            //再修改数据库中food_list的数据
            db.collection("user").where({
                _openid:openid
            }).update({
                data:{
                    food_list:this.data.food_list
                }
            })
            //关闭弹出层
            this.onClose4()
            //显示添加成功
            wx.showToast({
            title: '删除成功',
            mask:true,
            duration:800
            })
        }
        else{
            //关闭弹出层
            this.onClose4()
            wx.showToast({
            title: '删除错误，食谱已空',
            icon:'none',
            mask:true,
            duration:800
            })
        }
        
    },


    //弹出层1---随机选择今天的菜品
    showPopup() {
        this.setData({ show: true });
    },

    onClose() {
        this.setData({ show: false });
    },


    //弹出层2---查看菜谱
    showPopup1() {
        this.setData({ show1: true });
    },

    onClose1() {
        this.setData({ show1: false });
    },



    //弹出层3---自定义
    showPopup2() {
        this.setData({ show2: true });
    },

    onClose2() {
        this.setData({ show2: false });
    },


    //弹出层4---添加菜品
    showPopup3() {
        this.setData({ 
            show2:false,
            show3: true 
        });
    },

    onClose3() {
        this.setData({ 
            show3: false,
            food:""

        });
    },


    //弹出层5---删除菜品
    showPopup4() {
        this.setData({ 
            show2:false,
            show4: true 
        });
    },

    onClose4() {
        this.setData({ 
            show4: false,
            food:""
        });
    },



    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
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