Page({
    data: {
        randomResult:'2022',
        minNum:1,
        maxNum:100,
        isDisabledStart:false,
        isDisabledStop:true,
        myNumber:''
    },
    getMinNum:function(e){
        //只能输入数字
        if(parseFloat(e.detail.value).toString() == "NaN"){
            wx.showToast({
              title: '只能输入数字哦 🍰',
              mask:false
            })
            this.setData({
                input_min:""
            })
        }
        else{
            this.setData({minNum: e.detail.value})
        }
    },
    getMaxNum: function (e) {
        //只能输入数字
        if(parseFloat(e.detail.value).toString() == "NaN"){
            wx.showToast({
                mask:false,
                title: '只能输入数字哦 🍰',
            })
            this.setData({
                input_max:""
            })
        }
        else{
            this.setData({maxNum: e.detail.value})
        }
    },
    startRandom:function(){
        this.setData({
            isDisabledStart:true,
            isDisabledStop: false
        });
        var that = this;
        //将计时器复制给myNumber
        that.data.myNumber = setInterval(function (){
            var minNum = that.data.minNum;
            var maxNum = that.data.maxNum;
            var result = parseInt(Math.random() * (maxNum - minNum+1)) + parseInt(minNum);
            that.setData({randomResult: result})
        },10);
    },
    stopRandom:function(){
        //清除计时器
        clearInterval(this.data.myNumber);
        this.setData({
            isDisabledStart: false,
            isDisabledStop:true
        })
    }
})