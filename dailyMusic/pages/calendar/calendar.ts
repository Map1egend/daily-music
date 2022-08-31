// pages/calendar/calendar.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentDay: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    const today = new Date()
    console.log(this)
    this.setData({
        currentDay: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  bindDateChange: function(e) {
      this.setData({
          currentDay: e.detail.value
      })
  }
})