// components/music/music.ts
let barWidth = 0
let barLeft = 0
let music = {
  duration: 0
}
let audioContext = null

Component({
  lifetimes: {
    ready() {
      console.log('music created')
      audioContext = wx.createInnerAudioContext({ useWebAudioImplement: false })
      audioContext.src = 'assets/暴躁的兔子 - 心碎莫扎特.mp3'
      audioContext.autoplay = true
      audioContext.onCanplay(() => {
        this.setData({
          paused: false
        })
        music.duration = audioContext.duration
      })
      const query = wx.createSelectorQuery().in(this)
      query.select('.bar').boundingClientRect(function (res) {
        barWidth = res.width
        barLeft = res.left
      }).exec()
      audioContext.onTimeUpdate(() => this.timeUpdateListener(this))
      const lyricArr = this.data.lyric.split('\n')
      const lyricMap = []
      lyricArr.forEach(lyric => {
        if (lyric) {
          const time = lyric.match(/\d{2}:\d{2}.\d{3}/)![0]
          const content = lyric.slice(11)
          lyricMap.push({ time, content })
        }
      })
      this.setData({
        lyricList: lyricMap
      })
    },
    detached () {
      console.log('组件实例从页面节点树移除')
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    lyric: "[00:00.000] 作词 : 暴躁的兔子\n[00:01.000] 作曲 : 暴躁的兔子\n[00:02.000] 编曲 : WOLFGANG PANDER\n[00:03.000] 制作人 : 暴躁的兔子\n[00:15.594]人们都说爱情总让人难过\n[00:19.595]不错你听他哭着错过\n[00:23.339]怎么连我也不再洒脱\n[00:26.839]被你掐住脉搏但你却不爱我\n[00:30.532]没关系我根本不在意\n[00:33.784]你对我爱理不理\n[00:35.277]我也不会被你扫了兴\n[00:37.284]我正被算计\n[00:39.032]对你一见中意\n[00:41.037]我知道你是我的软肋\n[00:43.032]是我治不好的病\n[00:44.538]我总是死性不改 被情迫害\n[00:48.782]沉迷于痴心妄想的梦不愿醒来\n[00:52.536]爱或不爱 结局难猜\n[00:56.037]你是我坚定的信仰上辈子欠的债\n[01:00.282]I'm Fall in love\n[01:01.785]心甘情愿\n[01:04.035]固执的爱固执的疯癫\n[01:07.534]躁动的心为痴情发电\n[01:11.035]我背的情话能演半部流星花园\n[01:17.284]你不知道\n[01:18.286]她们都想要我的VX\n[01:20.037]我不给还把腰带给勒紧\n[01:21.786]为你遵守了男德\n[01:23.032]你怎么舍得我辗转反侧\n[01:25.530]越来越强大的内心\n[01:27.279]应对你越来越费劲\n[01:29.284]查遍了所有攻略\n[01:30.788]山穷水尽\n[01:32.537]拉扯\n[01:33.785]我追求你就像是一种\n[01:36.280]拔河\n[01:37.285]心思被你牵着\n[01:39.780]大哥\n[01:40.784]我才是你命中注定莫扎特\n[01:44.537]为什么你就是不愿爱我\n[01:49.904]为什么你就是不愿爱我\n[01:56.900]你不说也没关系因为我\n[02:00.900]我总是死性不改 被情迫害\n[02:05.072]沉迷于痴心妄想的梦不愿醒来\n[02:08.827]爱或不爱 结局难猜\n[02:12.325]你是我坚定的信仰上辈子欠的债\n[02:16.752]I'm Fall in love\n[02:18.257]心甘情愿\n[02:20.251]固执的爱固执的疯癫\n[02:24.005]躁动的心为痴情发电\n[02:26.250]我背的情话能演半部流星花园\n[02:28.576] 混音 : Gfanfan\n[02:30.902] 企划统筹 : 贾焱祺\n[02:33.228] 监制 : 丁柏昕\n[02:35.554] 音乐营销 : 网易飓风\n",
    lyricList: [],
    activeLyric: '我们去抓水母吧',
    playProgress: 0,
    progressBall: '-8px',
    paused: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    timeUpdateListener (that) {
      const time = that.normalizeTime(audioContext.currentTime).toString()
      const playedRatio = audioContext.currentTime / audioContext.duration
      that.setData({
        playProgress: 100 * playedRatio + '%',
        progressBall: playedRatio * barWidth - 8 + 'px'
      })
      for(let i = 0; i < that.data.lyricList.length; i++) {

        if (that.compareTime(time, that.data.lyricList[i].time) !== that.compareTime(time, that.data.lyricList[i + 1]?.time)) {
          that.setData({
            activeLyric: that.data.lyricList[i].content
          })
          break
        }
      }
    },
    normalizeTime (time: number): string {
      const integer = Math.floor(time)
      const m = Math.floor(integer / 60).toString()
      const s = (integer % 60).toString()
      const ms = String(time).split('.')[1].slice(0, 3).toString()

      return `${m.padStart(2, '0')}:${s}.${ms}`
    },
    compareTime (currentTime, lyricTime) {
      if (!lyricTime) return 'less'

      if (parseInt(currentTime.slice(0, 2)) > parseInt(lyricTime.slice(0, 2))) {
        return 'greater'
      } else if (parseInt(currentTime.slice(0, 2)) < parseInt(lyricTime.slice(0, 2))) {
        return 'less'
      } else {
        if (parseInt(currentTime.slice(3, 5)) > parseInt(lyricTime.slice(3, 5))) {
          return 'greater'
        } else if (parseInt(currentTime.slice(3, 5)) < parseInt(lyricTime.slice(3, 5))) {
          return 'less'
        } else {
          if (parseInt(currentTime.slice(6, 9)) > parseInt(lyricTime.slice(6, 9))) {
            return 'greater'
          } else if (parseInt(currentTime.slice(6, 9)) < parseInt(lyricTime.slice(6, 9))) {
            return 'less'
          }
        }
      }
    },
    handleThouchStart () {
      audioContext.offTimeUpdate(() => this.timeUpdateListener(this))
    },
    handleThouchEnd () {
      audioContext.onTimeUpdate(() => this.timeUpdateListener(this))
    },
    controlProgress (touchEvent) {
      let offsetLeft = touchEvent.touches[0].pageX - barLeft
      if (offsetLeft < 0) offsetLeft = -8
      if (offsetLeft > barWidth) offsetLeft = barWidth - 8
      const currentTime = offsetLeft / barWidth * music.duration
      this.setData({
        playProgress: 100 * offsetLeft / barWidth + '%',
        progressBall: offsetLeft + 'px'
      })
      audioContext.seek(currentTime)
    },
    play () {
      console.log(this.data.paused, audioContext.paused)
      if (audioContext.paused) {
        audioContext.play()
        this.setData({
          paused: false
        })
      } else {
        audioContext.pause()
        this.setData({
          paused: true
        })
      }
    }
  }
})
