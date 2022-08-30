var app = getApp()
Page({
  data: {
    audioList: [],
    audioIndex: 0,
    pauseStatus: true,
    listShow: false,
    timer: '',
    currentPosition: 0,
    duration:0,    
  },
  onLoad: function () {
    this.setData({
      audioList:[
        {
          src:'http://music.163.com/song/media/outer/url?id=524543708.mp3',
          poster: 'http://p2.music.126.net/2FNEb6ddXVUqVhpZcvGl3Q==/109951163085937203.jpg',
          name:'いつも何度でも',
          author: '里德可以Houche'
        },{
          src:'http://music.163.com/song/media/outer/url?id=36953764.mp3',
          poster: 'http://p1.music.126.net/La8OQSBOSIFkskQbFcLCog==/109951163464344970.jpg',
          name:'Coming Home',
          author: 'Peter Jeremias'
        },{
          src:'http://music.163.com/song/media/outer/url?id=1297742167.mp3',
          poster: 'http://p2.music.126.net/2bcwjIFFTiaS6Hg_4AdMJQ==/109951165424074168.jpg',
          name:'MELANCHOLY',
          author: 'White Cherry'
        },{
          src:'http://music.163.com/song/media/outer/url?id=1887515140.mp3',
          poster: 'http://p1.music.126.net/GxH2Iw8VbMT3gtYqjjqmYw==/109951166525300881.jpg',
          name:'Oz.《国王排名》ED',
          author: 'Kyle Xian'
        },{
          src:'http://music.163.com/song/media/outer/url?id=1807799505.mp3',
          poster: 'http://p2.music.126.net/5URIeP6GjMFg_hKhGloNTA==/109951165585701063.jpg',
          name:'唯一',
          author: '告五人'
        },{
          src:'http://music.163.com/song/media/outer/url?id=478507889.mp3',
          poster: 'http://p1.music.126.net/fL7FAeRby1s7JreBqoOKjg==/109951165175371079.jpg?param=130y130',
          name:'卡农',
          author: 'dylanf'
        },{
          src:'http://music.163.com/song/media/outer/url?id=419485661.mp3',
          poster: 'http://m.qpic.cn/psc?/V13fVhN13ThXQ1/ruAMsa53pVQWN7FLK88i5tOaI1XSsmpLp9eXX1.CBenHQgySMXx0dwMyjg*6U1bgPsYSfX6OCxQDMMa0hHpdNrQGlT8ltlJdRbsveWyZcfk!/mnull&bo=AAIAAgAAAAABByA!&rf=photolist&t=5',
          name:'钢琴协奏曲',
          author: '肖邦'
        }, {
          src:'http://music.163.com/song/media/outer/url?id=1394618521.mp3',
          poster: 'http://m.qpic.cn/psc?/V13fVhN13ThXQ1/ruAMsa53pVQWN7FLK88i5kxUpH9smpwvK7hfbIj1PLmJJmwPKEXj.CojjpgWyvBwEh6*fK.8zhs2pFpM6O.8WvMgiV6OVmidOsHM7vbVAyQ!/mnull&bo=OAQ2BAAAAAABBy4!&rf=photolist&t=5',
          name: '奏鸣曲',
          author: '莫扎特',
        }, {
          src: 'https://codehhr.gitee.io/musics/new_life.mp3',
          poster: 'http://m.qpic.cn/psc?/V13fVhN13ThXQ1/ruAMsa53pVQWN7FLK88i5tOaI1XSsmpLp9eXX1.CBekpnuj0V0qeFOyRR1hF0M2dogeipzLURZreLzQQ3G.emxWwfWrt.WTNRduvCl284Tk!/mnull&bo=OAQ4BAAAAAABByA!&rf=photolist&t=5',
          name: 'newlife',
          author: 'Pocky'
        }, {
          src: 'https://music.163.com/song/media/outer/url?id=1361298324.mp3',
          poster: 'http://p2.music.126.net/gQKV_Ey-F_g_W9dMGseo6A==/109951163126044887.jpg?param=140y140',
          name: '我在那一角落患过伤风',
          author: '冯曦妤',
        }
      ]
    })
    //  获取本地存储存储audioIndex
    var audioIndexStorage = wx.getStorageSync('audioIndex')
    if (audioIndexStorage) {
      this.setData({audioIndex: audioIndexStorage}) 
    }
  },




  onReady: function (e) {
    this.audioCtx = wx.createAudioContext('audio')
  },

  bindSliderchange: function(e) {
    let value = e.detail.value
    let that = this
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        let {status, duration} = res
        if (status === 1 || status === 0) {
          that.setData({
            sliderValue: value
          })
          wx.seekBackgroundAudio({
              position: value * duration / 100,
          })
        }
      }
    })
  },

  bindTapPrev: function() {
    let length = this.data.audioList.length
    let audioIndexPrev = this.data.audioIndex
    let audioIndexNow = audioIndexPrev
    if (audioIndexPrev === 0) {
      audioIndexNow = length - 1
    } else {
      audioIndexNow = audioIndexPrev - 1
    }
    this.setData({
      audioIndex: audioIndexNow,
      sliderValue: 0,
      currentPosition: 0,
      duration:0, 
    })
    let that = this
    setTimeout(() => {
      if (that.data.pauseStatus === true) {
        that.play()
      }
    }, 1000)
    wx.setStorageSync('audioIndex', audioIndexNow)
  },

  bindTapNext: function() {
    let length = this.data.audioList.length
    let audioIndexPrev = this.data.audioIndex
    let audioIndexNow = audioIndexPrev
    if (audioIndexPrev === length - 1) {
      audioIndexNow = 0
    } else {
      audioIndexNow = audioIndexPrev + 1
    }
    this.setData({
      audioIndex: audioIndexNow,
      sliderValue: 0,
      currentPosition: 0,
      duration:0, 
    })
    let that = this
    setTimeout(() => {
      if (that.data.pauseStatus === false) {
        that.play()
      }
    }, 1000)
    wx.setStorageSync('audioIndex', audioIndexNow)
  },

  bindTapPlay: function() {
    if (this.data.pauseStatus === true) {
      this.play()
      this.setData({pauseStatus: false})
    } else {
      wx.pauseBackgroundAudio()
      this.setData({pauseStatus: true})
    }
  },

  bindTapList: function(e) {
    this.setData({
      listShow: true
    })
  },

  closeList(){
    this.setData({
      listShow: false
    })
  },

  bindTapChoose: function(e) {
    this.setData({
      audioIndex: parseInt(e.currentTarget.id, 10),
      listShow: false
    })
    let that = this
    setTimeout(() => {
      if (that.data.pauseStatus === false) {
        that.play()
      }
    }, 1000)
    wx.setStorageSync('audioIndex', parseInt(e.currentTarget.id, 10))
  },

  play() {
    let {audioList, audioIndex} = this.data
    wx.playBackgroundAudio({
      dataUrl: audioList[audioIndex].src,
      title: audioList[audioIndex].name,
      coverImgUrl: audioList[audioIndex].poster
    })
    let that = this
    let timer = setInterval(function() {
      that.setDuration(that)
    }, 1000)
    this.setData({timer: timer})
  },

  setDuration(that) {
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        let {status, duration, currentPosition} = res
        if (status === 1 || status === 0) {
          that.setData({
            currentPosition: that.stotime(currentPosition),
            duration: that.stotime(duration),
            sliderValue: Math.floor(currentPosition * 100 / duration),
          })
        }
      }
    })
  },

  stotime: function(s) {
    let t = '';
    if(s > -1) {
      // let hour = Math.floor(s / 3600);
      let min = Math.floor(s / 60) % 60;
      let sec = s % 60;
      if (min < 10) { t += "0"; }
      t += min + ":";
      if (sec < 10) { t += "0"; }
      t += sec;
    }
    return t;
  },

  onShareAppMessage: function () {
    let that = this
    return {
      title: 'light轻音乐：' + that.data.audioList[that.data.audioIndex].name,
      success: function(res) {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function(res) {
        wx.showToast({
          title: '分享失败',
          icon: 'cancel',
          duration: 2000
        })
      }
    }
  }
})
