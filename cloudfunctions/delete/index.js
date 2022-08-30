// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'wan-an-gpnu-4gm1hsj6bb4b58fb'
})


exports.main = async (event, context) => {
//以下全部data内容
  var liuyan=event._data.liuyan
  var id0=event._data.id0//lv0的id
  var id1=event._data.id1//lv1,2的id
  var time=event._data.time
  var time1=event._data.time1
  var id=event._data.id
  var ku='sshuo'
  if(liuyan){
    var ku='tj'
  }
//以上全部data内容

  var _=cloud.database().command
 
  if(id1==""){
    //这是删除lv0评论
    cloud.database().collection(ku).doc(id).get().then((res)=>{
      console.log("打印取到的回复",res)
      var ss_xx=res.data.shuoshuo_xingxi
      var total=0
      console.log("total1：",total)
      console.log("chang:",ss_xx.huifunr.length)
      if(liuyan==false){
        for(var i=0;i<ss_xx.huifunr.length;i++){
          var dd=ss_xx.huifunr[i]
          if(dd.time==time && dd.plrid==id0){
            console.log("nbbb",dd.huifunb)
  
            if(dd.huifunb==undefined){
              total=-1
            }else{
              total=dd.huifunb+1
              total=-total
            }
            console.log("total4：",total)
            break
          }
        }
      }

      console.log("执行了删除lv0:total",total)
      cloud.database().collection(ku).doc(id).update({
        data: {
          'shuoshuo_xingxi.huifunr':_.pull({
            'time':_.eq(time),
            'plrid':_.eq(id0)
          }),
          'shuoshuo_xingxi.huifunb':_.inc(total)
        }
      })
    })
    
  }else{
    //这是删除lv1，2评论
    console.log("执行了删除lv1,2")
    cloud.database().collection(ku).where({
      _id:id,
      "shuoshuo_xingxi.huifunr.plrid":id0,
      "shuoshuo_xingxi.huifunr.time":time,
    }).update({
      data: {
        'shuoshuo_xingxi.huifunr.$.huifunb':_.inc(-1),
        'shuoshuo_xingxi.huifunr.$.huifu':_.pull({
          time:_.eq(time1),
          plrid:_.eq(id1)
        }),
        'shuoshuo_xingxi.huifunb':_.inc(-1)
      }
    })
  }
}

