import {
    updateAppDistributionSubstationInspectionHistory,
    getAppDistributionSubstationInspectionHistory,
    uploadFile,
    downloadFile
} from '../../../api/api.js';
const switchKeys = ['conduit','lightningArrester','fuse','groundingResistance','oilColor',
    'safetySignage', 'obstacles'];
Page({
    // onBackPress: function(options) {
    //     console.warn('options', options)
    //   // 可以在这里编写你想要执行的代码
    //   // 返回 true 会阻止页面返回，false 则不会
    //   return false;  // 这里返回 false，表示不阻止返回操作
    // },
    /**
     * 页面的初始数据
     */
    data: {
        id: 0,
        readonly: false,
        formData: {
            longitudeLatitude: '',
            photoList: [],
        },
        switchDisableKeys: {},
        openKey: '',
    },
    BackPage() {
        wx.navigateBack();
    },

    gotoAddYhyd(e) {
        // console.log(e.currentTarget.dataset.reason)
        const formData = this.data.formData;
        const { transformerName, managementUnit, responsiblePerson } = formData;
        const safetyDefectContent = transformerName + e.currentTarget.dataset.reason + "异常"
        this.setData({
            openKey: e.currentTarget.dataset.key
        })
        wx.navigateTo({
          url: `./yhyd?safetyDefectContent=${safetyDefectContent}&unit=${managementUnit}&inspector=${responsiblePerson}`,
        })
    },

    setKeyDisable() {
        const obj = {...this.data.switchDisableKeys};
        obj[this.data.openKey] = true;
        this.setData({
            switchDisableKeys: obj
        })
        console.log(this.data.switchDisableKeys, this.data.switchDisableKeys.conduit)
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
        this.setData({
            readonly: !!options?.readonly,
            id: options?.id,
        })
        if (options?.id) {
            getAppDistributionSubstationInspectionHistory(options.id, res => {
                console.warn(res)
                const data = res.data;
                data.photoList = data.photo ? data.photo.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                })) : [];
                if (data.inspectionTime) {
                    data.date0 = data.inspectionTime.split(' ')[0];
                    data.date1 = data.inspectionTime.split(' ')[1];
                }
                switchKeys.map(key => {
                    data[key] = !!data[key];
                });
                this.setData({
                    formData: res.data
                })
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    changeForm(e) {
        console.log(e)
        const obj = this.data.formData;
        this.setData({
            formData: {
                ...obj,
                [e.target.dataset.key]: e.detail.value
            }
        })
    },
    signChange(e) {
        console.log('signChange', e)
        const key = e.currentTarget.dataset.signkey;
        // 上传文件到服务器
        uploadFile(e.detail.signatureImg, (res) => {
            const formData = this.data.formData;
            formData[key].push({
                name: this.getFileName(res.data),
                url: res.data
            });
            this.setData({
                formData: {
                    ...formData
                }
            })
        });

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

    getLocation() {
        if (this.data.readonly) return;
        wx.showLoading({ title: '正在获取位置'});  
        const that = this;
        wx.getLocation({
            success(res) {
                console.log(res)
                that.setData({
                    formData: {
                        ...that.data.formData,
                        longitudeLatitude: res.latitude + ', ' + res.longitude
                    }
                })
                wx.hideLoading();
            },
            fail(err) {
                wx.hideLoading();
                wx.showToast({
                  title: '获取定位失败',
                })
                console.error(err)
            }
        });
    },
    saveData() {
        const formData = this.data.formData;
        formData.photo = formData.photoList.map(z => z.url).join(',');
        const inspectionTime = (formData.date0 && formData.date1) ? (formData.date0 + " " + formData.date1 + ':00') : "";
        let errTxt = '';
        if(!formData.managementUnit) errTxt = '请输入管理单位';
        else if(!inspectionTime) errTxt = '请选择巡查时间';
        else if(!formData.longitudeLatitude) errTxt = '请获取经纬度';
        else if(!formData.oilLevel) errTxt = '请输入油位';
        else if(!formData.platformHeight) errTxt = '请输入变台高度';
        if(errTxt) {
            return wx.showToast({
                title: errTxt,
                icon: "error"
            })
        }
        console.warn('switchKeys', switchKeys)
        switchKeys.map(key => {
            formData[key] = formData[key] ? 1 : 0;
        });
        wx.showToast({
            title: "保存中",
            icon: "loading"
        })
        updateAppDistributionSubstationInspectionHistory({
            ...formData,
            status: 1,
            inspectionTime
        }, res => {
            wx.showToast({
                title: "保存成功",
                icon: "success"
            })
            setTimeout(() => {
                this.BackPage();
            }, 800);
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

    }
})