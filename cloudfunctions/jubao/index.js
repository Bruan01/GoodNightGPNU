// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env:'wan-an-gpnu-4gm1hsj6bb4b58fb'
})

exports.main = async (event, context) => {
  var jbrid=event.jbrid
  const db=cloud.database()
  const _ = db.command

  //先看数据库中举报数加完是否达到
  db.collection("sshuo").doc(event.id).get().then((res)=>{
    var total=res.data.shuoshuo_xingxi.jubao[1]
    var lzid=res.data.shuoshuo_xingxi.userid
    if(total>9){
      return
    }
    if(total<=8){
      //加完小于等于九，可以直接加
      db.collection("sshuo").doc(event.id).update({
        data:{
          "shuoshuo_xingxi.jubao.0":_.push(jbrid),
          "shuoshuo_xingxi.jubao.1":_.inc(1)
        }
      })
      return
    }else{
      db.collection("sshuo").doc(event.id).update({
        data:{
          "shuoshuo_xingxi.jubao.0":_.push(jbrid),
          "shuoshuo_xingxi.jubao.1":_.inc(1),
          //清空评论
          'shuoshuo_xingxi.huifunr':[],
          'shuoshuo_xingxi.huifunb':0
        }
      })
      db.collection('user').doc(lzid).get().then((res)=>{
        var weiguinb=res.data.weiguinb
        console.log("weiguinb:",weiguinb)
        //发消息被举报了
        if(weiguinb>5){
          //违规超过5次封号
          db.collection('user').where({
            '_id':lzid,
            'wenzhang.id':event.id
          }).update({
            data: {
              'wenzhang.$.weigui':true,
              weiguinb:_.inc(1),
              ban:true
            }
          })
          return
        }else{
          db.collection('user').where({
            '_id':lzid,
            'wenzhang.id':event.id
          }).update({
            data: {
              'wenzhang.$.weigui':true,
              weiguinb:_.inc(1)
            }
          })
          return
        }
        
      })
      
    }
  })

}

