const base = 'http://127.0.0.1:3000'

function fetchData(url: string, data: any, method="GET") {
  return new Promise((resolve,reject)=>{
    wx.request({
      url: base+url,
      method,
      header:{
        'Content-Type': ' application/json'
      },
      data,
      success:(res)=>{
        resolve(res)    //此处的res会交给then
      },
      fail:(err)=>{
        reject(err)  //此处的err会交给catch
      }
    })
  })
}
export default fetchData