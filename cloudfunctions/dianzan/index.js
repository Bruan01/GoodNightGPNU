// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'wan-an-gpnu-4gm1hsj6bb4b58fb'
})

const db=cloud.database()
const _ =db.command


// 云函数入口函数
exports.main = async (event, context) => {
  var dzrid=event.dzrid

  console.log("----------------------",event.id,dzrid);

  if(dzrid==null || dzrid==undefined || dzrid==""){
    return
  }
  db.collection("sshuo").doc(event.id).get().then((res)=>{
    var dianzanid = res.data.shuoshuo_xingxi.dianzanid
    var yn = dianzanid.indexOf(dzrid)

    if(yn==-1){  //没有点赞
      db.collection("sshuo").doc(event.id).update({
        data:{
          "shuoshuo_xingxi.dianzanid":_.push(dzrid),
          "shuoshuo_xingxi.dianzannb":_.inc(1)
        }
      })
      return
    }else{      //已经点赞，取消点赞
      db.collection("sshuo").doc(event.id).update({
        data:{
          "shuoshuo_xingxi.dianzanid": _.pull(dzrid.toString()),
          "shuoshuo_xingxi.dianzannb":_.inc(-1)
        }
      })
      return
    }
  })
}