// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env:'wan-an-gpnu-4gm1hsj6bb4b58fb'
})

/*
消息类型：
1.pinglun
2.huifu
*/
exports.main = async (event, context) => {
  console.log("￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥",event.pinglunnr)
  var pinglunnr=event.pinglunnr
  var pd=event.pd
  var liuyan=pinglunnr.liuyan
  var ku='sshuo'
  var id=event.pinglunnr.ssid 
  var lzid=event.pinglunnr.lzid
  var plrid=event.pinglunnr.plrid
  const _ = cloud.database().command


  if(pd[1]!=""){
    //这说明是回复评论
    console.log("回复评论：",id,pd)

    return await cloud.database().collection(ku).where({
      "_id":id,
      "shuoshuo_xingxi.huifunr.plrid":pd[1],
      "shuoshuo_xingxi.huifunr.time":pd[2]
    }).update({
      data: {
        // 添加记录
        'shuoshuo_xingxi.huifunr.$.huifunb':_.inc(1),
        'shuoshuo_xingxi.huifunr.$.huifu':_.push(event.pinglunnr),
        'shuoshuo_xingxi.huifunb':_.inc(1),
      }
    }).then((res)=>{
      ////给自己加评论过的记录
      var pinglunguode={
        id:event.pinglunnr.ssid,
        time:event.pinglunnr.time,
        nr:event.pinglunnr.ywnr,
        plnr:event.pinglunnr.wbnr,
      }
      ////给别人发送消息(被回复者)
      //额外加个判断是否是留言
      var newmessage={
        id:event.pinglunnr.ssid+event.pinglunnr.time,
        ssid:event.pinglunnr.ssid,
        type:"huifu",
        time:event.pinglunnr.time,
        bhfpl:event.pinglunnr.bhfpl,
        plnr:event.pinglunnr.wbnr,
        name:event.pinglunnr.name,
        photo:event.pinglunnr.photo
      }
      if(liuyan==true){
        newmessage.liuyan=true
      }else{
        newmessage.liuyan=false
      }
      //判断是否回复的自己
      if(event.pinglunnr.bhfid!=plrid){
        //不是回复的自己
        console.log("============================================================不是回复自己");
        cloud.database().collection('user').doc(event.pinglunnr.bhfid).update({
          data: {
            message:_.push(newmessage)
          }
        }).then((res)=>{
          //console.log("!!!!",res)
          if(pd[0]!=true && liuyan==false){
            //首次评论家记录
            cloud.database().collection('user').doc(plrid).update({
              data:{
                pinglunguode:_.push(pinglunguode)
              }
            }).then((res)=>{
              console.log("成功")
              //前面重要的做完就在这里进行订阅消息的发送了             
            })
          }
          console.log("开始检测进行回复")
/////////////////////////////////////////////////////////////
              //1.获取待操作用户的信息
              cloud.database().collection('user').doc(event.pinglunnr.bhfid).get().then((res)=>{
                //2.取到用户数据进行判断在线状态
                console.log("取到用户数据进行判断在线状态:",res.data.online)
                console.log("取到用户数据进行判断授权状态:",res.data.allow)
                console.log("取到用户数据进行判断次数剩余状态:",res.data.msgnb)
                var online=res.data.online
                var allow=res.data.allow
                var msgnb=res.data.msgnb
                var openid=res.data._openid
                if(allow){
                  //开启了授权才可：
                  console.log("开启了授权才可")
                  if(!online){
                    //不在线才可
                    console.log("不在线才可")
                    if(msgnb[1]>0){
                      //可推送回复消息

                      //消息数据格式化
                      //name 10
                      //thing 20
                      var name=event.pinglunnr.yuanname
                      if(name==undefined){
                        name=event.pinglunnr.name
                      }

                      console.log("length:",name)
                      if(name.length>20){
                        name=name.substr(0,17)+"..."
                      }
                      if(newmessage.plnr.length>20){
                        newmessage.plnr=newmessage.plnr.substr(0,17)+"..."
                      }
                      if(newmessage.bhfpl.length>20){
                        newmessage.bhfpl=newmessage.bhfpl.substr(0,17)+"..."
                      }

                      console.log("推送回复消息")
                      console.log("name:",name)
                      console.log("plnr:",newmessage.plnr)
                      console.log("date:",event.pinglunnr.riqi)

                      cloud.openapi.subscribeMessage.send({
                        touser: openid,
                        page: 'pages/index/index',
                        lang: 'zh_CN',
                        
                        data: {
                          thing3: {
                            //评论人
                            value: name
                          },
                          thing2: {
                            //评论内容
                            value: newmessage.plnr
                          },
                          time4: {
                            //评论时间
                            value: event.pinglunnr.riqi
                          },
                          thing1: {
                            //原评论
                            value: newmessage.bhfpl
                          }
                        },
                        templateId: '',
                        //miniprogramState: 'developer'//开发板
                        //miniprogramState:'trial',//体验版
                        miniprogramState:'formal',//正式版
                      }).then((res)=>{
                        console.log("发送被回复订阅：",res)
                        //还没加结果判断处理
                        //1.扣除剩余次数
                        cloud.database().collection('user').doc(event.pinglunnr.bhfid).update({
                          data:{
                            'msgnb.1':cloud.database().command.inc(-1)
                            //减去一次
                          }
                        })
                      }).catch((res)=>{
                        console.log("打印错误信息：",res)
                        var first=JSON.stringify(res).includes('43101')
                        if(first){
                          //1.剩余次数直接清零
                          cloud.database().collection('user').doc(event.pinglunnr.bhfid).update({
                            data:{
                              'msgnb.1':0
                              //直接清零
                            }
                          })
                        }
                      })
                        
                    }
                  }
                }
              })
/////////////////////////////////////////////////////////////
          return true
        }).catch((res)=>{
          return false
        })
      }
    })

  }else{
    //这是正常评论说说
    console.log("这是评论说说：",id)
    return await cloud.database().collection(ku).doc(id).update({
      data: {
        // 表示将 done 字段置为 true
        shuoshuo_xingxi:{
          "huifunr":_.push(event.pinglunnr),
          "huifunb":_.inc(1)
        }
      }
    }).then((res)=>{
      ////给自己加评论过记录
      var pinglunguode={
        id:event.pinglunnr.ssid,
        time:event.pinglunnr.time,
        nr:event.pinglunnr.ywnr,
        plnr:event.pinglunnr.wbnr,
      }
      ////给别人发送消息(帖子主)
      var newmessage={
        id:event.pinglunnr.ssid+event.pinglunnr.time,
        ssid:event.pinglunnr.ssid,
        type:"pinglun",
        time:event.pinglunnr.time,
        ywnr:event.pinglunnr.ywnr,
        plnr:event.pinglunnr.wbnr,
        name:event.pinglunnr.name,
        photo:event.pinglunnr.photo
      }
      if(liuyan==true){
        newmessage.liuyan=true
      }else{
        newmessage.liuyan=false
      }
      //给帖子主发消息(自己不是帖子主)
      if(lzid!=plrid){
        console.log("这是给楼主发消息：",lzid)
        cloud.database().collection('user').doc(lzid).update({
          data: {
            message:_.push(newmessage)           
          }
        }).then((res)=>{
          //console.log("!!!!",res)
          if(pd[0]!=true && liuyan==false){
            cloud.database().collection('user').doc(plrid).update({
              data:{
                pinglunguode:_.push(pinglunguode)
              }
            }).then((res)=>{
              console.log("成功")
              
            })
          }
          console.log("开始检测进行评论")
/////////////////////////////////////////////////////////////
              //1.获取待操作用户的信息
              cloud.database().collection('user').doc(lzid).get().then((res)=>{
                //2.取到用户数据进行判断在线状态
                console.log("取到用户数据进行判断在线状态:",res.data.online)
                console.log("取到用户数据进行判断授权状态:",res.data.allow)
                console.log("取到用户数据进行判断次数剩余状态:",res.data.msgnb)
                var online=res.data.online
                var allow=res.data.allow
                var msgnb=res.data.msgnb
                var openid=res.data._openid
                if(allow){
                  //开启了授权才可：
                  console.log("开启了授权才可")
                  if(!online){
                    //不在线才可
                    console.log("不在线才可")
                    if(msgnb[0]>0){
                      //可推送评论消息

                      //消息数据格式化
                      //name 10
                      //thing 20

                      if(newmessage.name.length>20){
                        newmessage.name=newmessage.name.substr(0,17)+"..."
                      }
                      if(newmessage.plnr.length>20){
                        newmessage.plnr=newmessage.plnr.substr(0,17)+"..."
                      }
                      if(newmessage.ywnr.length>20){
                        newmessage.ywnr=newmessage.ywnr.substr(0,17)+"..."
                      }

                      console.log("推送评论消息")
                      cloud.openapi.subscribeMessage.send({
                        touser: openid,
                        page: 'pages/index/index',
                        lang: 'zh_CN',
                        data: {
                          thing2: {
                            //评论人
                            value: newmessage.name
                          },
                          thing3: {
                            //评论内容
                            value: newmessage.plnr
                          },
                          time4: {
                            //评论时间
                            value: event.pinglunnr.riqi
                          },
                          thing1: {
                            //评论原文
                            value: newmessage.ywnr
                          }
                        },
                        templateId: '',
                        //miniprogramState: 'developer'//开发板
                        //miniprogramState:'trial',//体验版
                        miniprogramState:'formal',//正式版
                      }).then((res)=>{
                        console.log("发送被评论订阅：",res)
                        //还没加结果判断处理
                        //1.扣除剩余次数
                        cloud.database().collection('user').doc(lzid).update({
                          data:{
                            'msgnb.0':cloud.database().command.inc(-1)
                            //减去一次
                          }
                        })

                      }).catch((res)=>{
                        console.log("打印错误信息：",res)
                        var first=JSON.stringify(res).includes('43101')
                        if(first){
                          //1.剩余次数直接清零
                          cloud.database().collection('user').doc(lzid).update({
                            data:{
                              'msgnb.0':0
                              //直接清零
                            }
                          })
                        }
                      })
                        
                    }
                  }
                }
              })
/////////////////////////////////////////////////////////////
          return true
        }).catch((res)=>{
          return false
        })
      }
    })
  }
}

