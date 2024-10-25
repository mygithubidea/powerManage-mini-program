import {
    getAppRectificationNotice,
    addAppRectificationNotice,
    exportAppRectificationNotice,
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
            userSignatureList: [],
            inspectorSignatureList: [],
            hazardPhotoList: [],
        },
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

    // 导出文件
    exportFile(e) {
        const formData = this.data.formData;
        // const url = `/app/inspectionRecord/exportAppInspectionRecord/${formData.id}`
        const that = this;
        wx.showToast({
            title: "下载中",
            icon: "loading"
        })

        exportAppRectificationNotice(formData.id, res => {
            // return res;
            let temp = res.statusCode == 200 ? res.data : res
            const fs = wx.getFileSystemManager(); //获取全局唯一的文件管理器
            console.log(temp);
            console.log(wx.env.USER_DATA_PATH);
            fs.writeFile({ //写文件
                // inspectionUnit
                filePath: `${wx.env.USER_DATA_PATH}/${formData.date0}安全整改通知书.pdf`,
                data: temp, // res.data就是获取到的二进制文件流
                // encoding: "binary", //二进制流文件必须是 binary
                encoding: "binary", //二进制流文件必须是 binary
                success(e) {
                    console.log('writeFile' ,e);
                    wx.openDocument({ // 打开文档
                        filePath: `${wx.env.USER_DATA_PATH}/${formData.date0}安全整改通知书.pdf`, //拿上面存入的文件路径
                        showMenu: true, // 显示右上角菜单
                        success: function (x) {
                            console.log("successfun", x);
                        },
                    })
                },
                fail: (err) => {
                    // 文件下载失败的相关处理
                    console.log('download fail', err);
                }
            })
            // wx.showToast({
            //     title: "保存成功",
            //     icon: "success"
            // })
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            readonly: !!options?.readonly,
            level: Number(options?.type) + 2,
        })
        if (options?.id) {
            getAppRectificationNotice(options.id, res => {
                console.warn(res)
                const data = res.data || {};
                if (data.inspectionTime) {
                    data.date0 = data.inspectionTime.split(' ')[0];
                    data.date1 = data.inspectionTime.split(' ')[1];
                }
                if (data.plannedRectificationDate) {
                    data.date2 = data.plannedRectificationDate.split(' ')[0];
                    data.date3 = data.plannedRectificationDate.split(' ')[1];
                }
                data.userSignatureList = data.userSignature ? data.userSignature.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                })) : [];
                data.inspectorSignatureList = data.inspectorSignature ? data.inspectorSignature.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                })) : [];
                data.hazardPhotoList = data.hazardPhoto && data.hazardPhoto.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                }));
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
    saveData() {
        const formData = this.data.formData;
        formData.level = this.data.level;
        formData.userSignature = formData.userSignatureList.map(z => z.url).join(',');
        formData.inspectorSignature = formData.inspectorSignatureList.map(z => z.url).join(',');
        formData.hazardPhoto = formData.hazardPhotoList.map(z => z.url).join(',');
        // const inspectionTime = formData.date0 + " " + (formData.date1 || '');
        // const plannedRectificationDate = formData.date2 + " " + formData.date3;
        wx.showToast({
            title: "保存中",
            icon: "loading"
        })
        addAppRectificationNotice({
            ...formData,
            // inspectionTime,
            // plannedRectificationDate
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