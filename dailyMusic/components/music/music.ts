// components/music/music.ts
import http from '../../utils/http'

Component({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  lifetimes: {
    ready() {
      console.log('music created')
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
    _barWidth: 0,
    _barLeft: 0,
    _audioContext: null,
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
      const time = that.normalizeTime(this.data._audioContext.currentTime).toString()
      const playedRatio = this.data._audioContext.currentTime / this.data._audioContext.duration
      that.setData({
        playProgress: 100 * playedRatio + '%',
        progressBall: playedRatio * this.data._barWidth - 8 + 'px'
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
      this.data._audioContext.offTimeUpdate(() => this.timeUpdateListener(this))
    },
    handleThouchEnd () {
      this.data._audioContext.onTimeUpdate(() => this.timeUpdateListener(this))
    },
    controlProgress (touchEvent) {
      let offsetLeft = touchEvent.touches[0].pageX - this.data._barLeft
      if (offsetLeft < 0) offsetLeft = -8
      if (offsetLeft > this.data._barWidth) offsetLeft = this.data._barWidth - 8
      const currentTime = offsetLeft / this.data._barWidth * this.data._audioContext.duration
      this.setData({
        playProgress: 100 * offsetLeft / this.data._barWidth + '%',
        progressBall: offsetLeft + 'px'
      })
      this.data._audioContext.seek(currentTime)
    },
    play () {
      if (this.data._audioContext.paused) {
        this.data._audioContext.play()
        this.setData({
          paused: false
        })
      } else {
        this.data._audioContext.pause()
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
      if(this.data._audioContext) this.data._audioContext.destroy()
      this.data._audioContext = wx.createInnerAudioContext({ useWebAudioImplement: false })
      this.data._audioContext.src = this.data.audioUrl
      this.data._audioContext.autoplay = true
      this.data._audioContext.onCanplay(() => {
        this.setData({
          paused: false,
        })
      })
      const query = wx.createSelectorQuery().in(this)
      query.select('.bar').boundingClientRect((res) => {
        this.setData({
          _barLeft: res.left,
          _barWidth: res.width
        })
      }).exec()
      this.data._audioContext.onTimeUpdate(() => this.timeUpdateListener(this))
      const lyricArr = this.data.lyric.split('\n')
      const lyricMap: Array<{ time: string, content: string}> = []
      lyricArr.forEach(lyric => {
        if (lyric) {
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
      if (!newDate) return
      http('/music/song/url', {
        id: this.getId(newDate)
      }).then((res: any) => {
        if (res.statusCode === 200 && res.data.status === 'success') {
          let { cover, audio, lyric, bgi } = res.data.message
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
