import {
    getAppSafetyDefectsRecord,
    addAppSafetyDefectsRecord,
    uploadFile,
    downloadFile
} from '../../../api/api.js';
const switchKeys = ['towerFoundation','steelBands','crossArms','fittings','conductors','insulators',
    'guyWires', 'equipment', 'safetySignage', 'complianceWithSafetyDistance', 'obstacles'];
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: 0,
        readonly: false,
        formData: {
            inspectionType: '变台巡查',
            longitudeLatitude: '',
            beforeRectificationPhotoList: [],
            duringRectificationPhotoList: [],
            afterRectificationPhotoList: [],
        },
    },
    BackPage(flag) {
        if(typeof flag === 'boolean' && flag) {
            const pages = getCurrentPages()
            let beforePage = pages[pages.length - 2]; // 前一个页面
            beforePage.setKeyDisable();
        }
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
        this.setData({
            readonly: !!options?.readonly,
            id: options?.id,
            formData: {
                ...this.data.formData,
                safetyDefectContent: options.safetyDefectContent,
                unit: options.unit,
                responsiblePerson: options.inspector,
            }
        })
        if (options?.id) {
            getAppSafetyDefectsRecord(options.id, res => {
                console.warn(res)
                const data = res.data;
                data.beforeRectificationPhotoList = data.beforeRectificationPhoto ? data.beforeRectificationPhoto.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                })) : [];
                data.duringRectificationPhotoList = data.duringRectificationPhoto ? data.duringRectificationPhoto.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                })) : [];
                data.afterRectificationPhotoList = data.afterRectificationPhoto ? data.afterRectificationPhoto.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                })) : [];
                if (data.discoveryTime) {
                    data.date0 = data.discoveryTime.split(' ')[0];
                    data.date1 = data.discoveryTime.split(' ')[1];
                }
                if (data.completionTime) {
                    data.date2 = data.completionTime.split(' ')[0];
                    data.date3 = data.completionTime.split(' ')[1];
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

    saveData() {
        const formData = this.data.formData;
        formData.beforeRectificationPhoto = formData.beforeRectificationPhotoList.map(z => z.url).join(',');
        formData.duringRectificationPhoto = formData.duringRectificationPhotoList.map(z => z.url).join(',');
        formData.afterRectificationPhoto = formData.afterRectificationPhotoList.map(z => z.url).join(',');
        const discoveryTime = (formData.date0 && formData.date1) ? (formData.date0 + " " + formData.date1 + ':00') : "";
        const completionTime = (formData.date2 && formData.date3) ? (formData.date2 + " " + formData.date3 + ':00') : "";
        switchKeys.map(key => {
            formData[key] = formData[key] ? 1 : 0;
        });
        wx.showToast({
            title: "保存中",
            icon: "loading"
        })
        addAppSafetyDefectsRecord({
            ...formData,
            discoveryTime,
            completionTime
        }, res => {
            wx.showToast({
                title: "保存成功",
                icon: "success"
            })
            setTimeout(() => {
                this.BackPage(true);
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