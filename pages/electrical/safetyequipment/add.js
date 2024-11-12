import {
  getAppReportingOfHiddenDangers,
  addReportingOfHiddenDangers,
  addAppInternalHazardReport,
  uploadFile,
  downloadFile
} from '../../../api/api.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // dataList0: [
    //   {
    //     id: 1,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    //   {
    //     id: 2,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    //   {
    //     id: 3,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    //   {
    //     id: 4,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    //   {
    //     id: 5,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    //   {
    //     id: 6,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    //   {
    //     id: 7,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    //   {
    //     id: 8,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    //   {
    //     id: 9,
    //     toolsNameModel: 2,
    //     issueQuantity: 3,
    //     issueNumber: 4,
    //     appearanceInspection: 5
    //   },
    // ],
      addNewData: {},
      add_display: true, 
      readonly: false,
      formData: {
          hazardPhotoList: [],
          dataList0:[
            {
              id: 1,
              toolsNameModel: 2,
              issueQuantity: 3,
              issueNumber: 4,
              appearanceInspection: 5
            },
            
          ],
      },
  },

  changeFormDate(e) {
      const { key } = e.currentTarget.dataset;
      const fullDate = e.detail.value; // 格式为 "YYYY-MM-DD"
      
      this.setData({
        [`formData.${key}`]: fullDate
      });
    
      console.log(`Updated ${key}:`, fullDate); // 用于调试
    },
  changeFormSelect(e) {
    const { key } = e.currentTarget.dataset;
    const value = this.data.hazardAssessmentOptions[e.detail.value];
    this.setData({
      [`formData.${key}`]: value
    });
  },
  validateForm() {
  

    if (!this.data.formData.hazardAssessment) {
      wx.showToast({
        title: '请选择隐患评估',
        icon: 'none'
      });
      return false;
    }

    return true;
  },
  BackPage() {
      wx.navigateBack();
  },

  getFileName(url) {
      const arr = url?.split('/');
      if (arr) {
          return arr[arr.length - 1];
      }
      return '';
  },
  downloadFile(e) {
      downloadFile(e.currentTarget.dataset.downloadurl);
  },
  removeFile(e) {
      const dataSet = e.currentTarget.dataset;
      const formData = this.data.formData;
      formData[dataSet.filekey].splice(dataSet.index, 1);
      this.setData({
          formData: {
              ...formData
          }
      })
  },
  chooseFile(e) {
      const that = this;
      const key = e.currentTarget.dataset.filekey;
      // wx.chooseImage({
      wx.chooseMessageFile({
          count: 1,
          type: "all",
          // extension	Array.<string>		否	根据文件拓展名过滤，仅 type==file 时有效。每一项都不能是空字符串。默认不过滤。
          // sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          // sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
              var file = res.tempFiles[0]; //chooseMessageFile
              // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
              var tempFilePaths = res.tempFilePaths || [file.path];
              // return console.log(tempFilePaths);
              // 上传文件到服务器
              uploadFile(tempFilePaths[0], (res) => {
                  const formData = that.data.formData;
                  formData[key].push({
                      name: that.getFileName(res.data),
                      url: res.data
                  });
                  that.setData({
                      formData: {
                          ...formData
                      }
                  })
              });
          }
      })
  },
  chooseImage(e) {
      const that = this;
      const key = e.currentTarget.dataset.imagekey;
      wx.chooseImage({
          count: 10,
          type: "all",
          // extension	Array.<string>		否	根据文件拓展名过滤，仅 type==file 时有效。每一项都不能是空字符串。默认不过滤。
          // sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
              res.tempFiles.map((item, i) => {
                  that.multUpload(key, res, i)
              })
          }
      })
  },
  multUpload(key, res, index) {
      const that = this;
      var file = res.tempFiles[index]; //chooseMessageFile
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      var tempFilePaths = res.tempFilePaths || [file.path];
      // return console.log(tempFilePaths);
      // 上传文件到服务器
      uploadFile(tempFilePaths[index], (res) => {
          const formData = that.data.formData;
          formData[key].push({
              name: that.getFileName(res.data),
              url: res.data
          });
          that.setData({
              formData: {
                  ...formData
              }
          })
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      console.warn(options)
      if(!options?.TabCur) return; // 群众直接进来
      this.setData({
          readonly: !!options?.readonly,
          TabCur: options?.TabCur,
      })
      if (options?.id) {
          getAppReportingOfHiddenDangers(options.TabCur, options.id, res => {
              console.warn(res);
              const data = res.data;
              // Format dates to show only year, month, and day
              if (data.rectificationCompletionDate) {
                  data.rectificationCompletionDate = data.rectificationCompletionDate.slice(0, 10);
              }
              if (data.acceptanceTime) {
                  data.acceptanceTime = data.acceptanceTime.slice(0, 10);
              }
              data.hazardPhotoList = data.hazardPhoto && data.hazardPhoto.split(',').map(url => ({
                  url,
                  name: this.getFileName(url)
              }));
              data.attachmentList = data.attachment && data.attachment.split(',').map(url => ({
                  url,
                  name: this.getFileName(url)
              }));
              this.setData({
                  formData: data
              })
          })
      }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  changeFormNew(e) {
    const obj = this.data.addNewData;
    this.setData({
      addNewData: {
            ...obj,
            [e.target.dataset.key]: e.detail.value
        }
    })
},

  changeForm(e) {
      const obj = this.data.formData;
      this.setData({
          formData: {
              ...obj,
              [e.target.dataset.key]: e.detail.value
          }
      })
  },

  beforeUpload(e) {
      console.log(e)
      const config = {
          useCdnDomain: true,
          region: qiniujs.region.z2
      }
      const getUrl = qiniujs.getUploadUrl(config)
      getUrl.then(res => {
          this.qnUrl = res
      })
      const filePaht = e.tempFilePaths[0];
      const file = e.tempFiles[0]
      // wx.uploadFile({
      // 	url: '',
      // 	filePath,
      // 	name: 'file'
      // })
  },
  fail() {
      wx.showToast({
          title: '上传失败',
          icon: 'error'
      })
  },
  seturlAfterUpload(e) {
      console.log('子组件返回值', e)
      // var that = this.formParam
      //    var name = e.id+"Url"
      //    that[name] = e.data
      //    console.log("插入值"+that[name]+"插入名称"+name)

  },
  display_add_block(){
    this.setData({
      add_display: false
    })
   
  },

  displayRemoveBlock(){
    this.setData({
      add_display: true
    })
   
  },

  appendData: function() {
    // 将 addNewData 添加到 dataList0 数组中
    let updatedDataList0 = this.data.formData.dataList0.concat(this.data.addNewData);
    
    // 更新页面数据
    this.setData({
      formData: {
        dataList0: updatedDataList0
      },
      add_display: true,
      addNewData:{}
    });
  },

  saveData() {
      const formData = this.data.formData;
      // formData.hazardPhoto = formData.hazardPhotoList.map(z => z.url).join(',');
      wx.showToast({
          title: "提交中",
          icon: "loading"
      })
      if(this.data.TabCur==1){
        addReportingOfHiddenDangers(this.data.TabCur, formData, res => {
          wx.showToast({
              title: "提交成功",
              icon: "success"
          })
          setTimeout(() => {
              this.BackPage();
          }, 800);
      })
      }else{
        addAppInternalHazardReport(this.data.TabCur, formData, res => {
          wx.showToast({
              title: "提交成功",
              icon: "success"
          })
          setTimeout(() => {
              this.BackPage();
          }, 800);
      })
      }

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

  }
})