const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env:'wan-an-gpnu-4gm1hsj6bb4b58fb'
})


exports.main = async (event, context) => {
  console.log(event.media)
  try {
    const res = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: Buffer.from(event.media)
      }
    })
    return res
  } catch (err) {
    return err
  }
}

