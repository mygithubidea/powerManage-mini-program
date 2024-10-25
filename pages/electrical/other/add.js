import {
    getAppOtherTable,
    addAppOtherTable,
    uploadFile,
    downloadFile
} from '../../../api/api.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        level: '0',
        readonly: false,
        formData: {
            meetingPlace: '',
            annexList: [],
        },
        unitSelectList: [],
    },
    changeFormSelect(e) {
        const key = e.currentTarget.dataset.key;
        this.setData({
            formData: {
                ...this.data.formData,
                [key]: this.data.unitSelectList[e.detail.value]
            }
        })
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
        const that = this;
        wx.getStorage({
            key: 'WirList',
            success (res) {
                const list = res.data ? JSON.parse(res.data) : []
                that.setData({ unitSelectList: list })
            }
        })
        this.setData({
            readonly: !!options?.readonly,
            level: Number(options?.type) + 1,
        })
        if (options?.id) {
            getAppOtherTable(options.id, res => {
                console.warn(res)
                const data = res.data || {};
                data.annexList = data.annex && data.annex.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                }));
                if (data.uploadTime) {
                    data.date0 = data.uploadTime.split(' ')[0];
                    data.date1 = data.uploadTime.split(' ')[1];
                }
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

    chooseLocation() {
        if (this.data.readonly) return;
        const that = this;
        wx.chooseLocation({
            success(res) {
                console.log(res)
                that.setData({
                    formData: {
                        ...that.data.formData,
                        meetingPlace: res.address
                    }
                })
            }
        })
    },
    saveData() {
        const formData = this.data.formData;
        formData.level = this.data.level;
        formData.annex = formData.annexList.map(z => z.url).join(',');
        const uploadTime = formData.date0 + " " + (formData.date1 || '');
        console.log(uploadTime)
        if(!formData.annex) return wx.showToast({
            title: "请上传附件",
            icon: "none"
        })
        wx.showToast({
            title: "保存中",
            icon: "loading"
        })
        addAppOtherTable({
            ...formData,
            uploadTime
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