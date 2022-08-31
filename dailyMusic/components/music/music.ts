// components/music/music.ts
import http from '../../utils/http'

let barWidth = 0
let barLeft = 0
let music = {
  duration: 0
}
let audioContext: InnerAudioContext = null

Component({
  lifetimes: {
    ready() {
      console.log('music created')
      /* audioContext = wx.createInnerAudioContext({ useWebAudioImplement: false })
      audioContext.src = 'http://127.0.0.1:3000/daily/1661904000000/audio.mp3'
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
      const lyricMap: Array<{ time: string, content: string}> = []
      lyricArr.forEach(lyric => {
        if (lyric) {
          const time: string = lyric.match(/\d{2}:\d{2}.\d{3}/)![0]
          const content: string = lyric.slice(11)
          lyricMap.push({ time, content })
        }
      })
      this.setData({
        lyricList: lyricMap
      }) */
    },
    detached () {
      console.log('组件实例从页面节点树移除')
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    date: {
        type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    audioUrl: '',
    coverUrl: '',
    bgiUrl: '',
    lyric: '',
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

        if (that.compareTime(time, that.data.lyricList[i].time) !== that.compareTime(time, that.data.lyricList[i + 1].time)) {
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
    },
    getId (date) {
      let publishTime = date? new Date(date) : new Date()
      publishTime.setHours(8)
      publishTime.setMinutes(0)
      publishTime.setSeconds(0)
      publishTime.setMilliseconds(0)

      return +publishTime + ''
    },
    initAudio () {
      if(audioContext) audioContext.destroy()
      audioContext = wx.createInnerAudioContext({ useWebAudioImplement: false })
      audioContext.src = this.data.audioUrl
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
      console.log(this.data.lyric)
      const lyricMap: Array<{ time: string, content: string}> = []
      lyricArr.forEach(lyric => {
        if (lyric) {
          console.log(lyric, lyric.match(/\d{2}:\d{2}\.\d{3}/))
          const time: string = lyric.match(/\d{2}:\d{2}\.\d{1,3}/)![0]
          const content: string = lyric.slice(11)
          lyricMap.push({ time, content })
        }
      })
      this.setData({
        lyricList: lyricMap
      })
    }
  },
  observers: {
    date: function (newDate) {
      console.log(newDate)
        http('/music/song/url', {
          id: this.getId(newDate)
        }).then((res: any) => {
          console.log(res)
          if (res.statusCode === 200) {
            let { cover, audio, lyric, bgi } = res.data
            this.setData({
              audioUrl: audio,
              coverUrl: cover,
              bgiUrl: bgi,
              lyric
            })
            this.initAudio()
          }
        })
    }
  }
})
