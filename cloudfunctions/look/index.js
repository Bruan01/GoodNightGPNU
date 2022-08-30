// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'wan-an-gpnu-4gm1hsj6bb4b58fb'
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event.id)
  var id=event.id

  cloud.database().collection('sshuo').doc(id).update({
    data:{
      'shuoshuo_xingxi.look':cloud.database().command.inc(1)
    }
  })

}