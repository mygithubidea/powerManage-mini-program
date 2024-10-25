import {
    getAppInspectionRecord,
    addAppInspectionRecord,
    updateAppInspectionRecord,
    exportAppInspectionRecord,
    getOrganizationAndWirList,
    uploadFile,
    downloadFile
} from '../../../api/api.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        level: 0,
        readonly: false,
        showPop: false,
        WirList: [],
        checkboxKey: "",
        checkboxValues: [],
        formData: {
            meetingPlace: '',
            organizationList: [],
            inspectorSignatureList: [],
            attachmentList: [],
            inspectedUnitSignatureList: [],
            rectificationReportList: [],
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
        console.log('chooseFile tap');
        wx.chooseMessageFile({
            count: 1,
            type: "all",
            complete: function (res) {
                console.log('complete', res);
            },
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
        const that = this;
        wx.showToast({
            title: "下载中",
            icon: "loading"
        })

        exportAppInspectionRecord(formData.id, res => {
            let temp = res.statusCode == 200 ? res.data : res
            const fs = wx.getFileSystemManager(); //获取全局唯一的文件管理器
            console.log(temp);
            console.log(wx.env.USER_DATA_PATH);
            fs.writeFile({ //写文件
                filePath: `${wx.env.USER_DATA_PATH}/${formData.date0}安全检查记录.doc`,
                data: temp, // res.data就是获取到的二进制文件流
                // encoding: "binary", //二进制流文件必须是 binary
                encoding: "binary", //二进制流文件必须是 binary
                success(e) {
                    console.log('writeFile', e);
                    wx.openDocument({ // 打开文档
                        filePath: `${wx.env.USER_DATA_PATH}/${formData.date0}安全检查记录.doc`, //拿上面存入的文件路径
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
        })
    },
    // 打开多选弹窗
    openMultSelect(e) {
        const str = this.data.formData[e.target.dataset.key];
        const list = str ? str.split(',') : []
        this.setData({
            checkboxKey: e.target.dataset.key,
            showPop: true,
            checkboxValues: list,
            // 切换选中
            WirList: this.data.WirList.map(z => ({
                ...z,
                checked: list.includes(z.name),
            }))
        })
    },
    checkChange(e) {
        this.setData({
            checkboxValues: e.detail.value
        })
    },
    closePop() {
        this.setData({
            showPop: false
        })
    },
    confirmPop() {
        const formData = this.data.formData;
        this.setData({
            formData: {
                ...formData,
                [this.data.checkboxKey]: this.data.checkboxValues.join(',')
            }
        })
        this.setData({
            showPop: false
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            readonly: !!options?.readonly,
            level: Number(options?.type) + 1,
        })
        console.warn(options)
        if (options?.id) {
            getAppInspectionRecord(options.id, res => {
                console.warn(res)
                const data = res.data || {};
                this.setData({
                    checkboxValues: data.organization?.split(',') || []
                })
                data.inspectorSignatureList = data.inspectorSignature?.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                }));
                data.attachmentList = data.attachment && data.attachment.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                }));
                data.inspectedUnitSignatureList = data.inspectedUnitSignature && data.inspectedUnitSignature.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                }));
                data.rectificationReportList = data.rectificationReport && data.rectificationReport.split(',').map(url => ({
                    url,
                    name: this.getFileName(url)
                }));
                if (data.inspectionTime) {
                    data.date0 = data.inspectionTime.split(' ')[0];
                    data.date1 = data.inspectionTime.split(' ')[1];
                }
                this.setData({
                    formData: res.data
                })
                this.getWirList();
            })
        } else {
            this.getWirList();
        }
    },

    getWirList() {
        getOrganizationAndWirList({}, res => {
            let list = []
            if(res.data.length > 0) {
                res.data.map(z => {
                    list = list.concat(z.children)
                })
            }
            // const list = res.data?.[0]?.children || [];
            this.setData({
                WirList: list.map(z => ({
                    name: z.name,
                    value: z.name,
                    // value: z.id,
                    checked: this.data.checkboxValues.includes(z.name),
                }))
            })
            console.warn(this.data.checkboxValues)
            console.log(list)
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    bindMultiPickerChange: function (e) {
        const obj = this.data.formData;
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            formData: {
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
    saveData(e) {
        const isDraft = e.currentTarget.dataset.draft;
        const formData = this.data.formData;
        if (!formData.level) formData.level = this.data.level;
        if (isDraft) {
            formData.isDraft = '1';
        } else {
            formData.isDraft = '0';
        }
        formData.inspectorSignature = formData.inspectorSignatureList.map(z => z.url).join(',');
        formData.attachment = formData.attachmentList && formData.attachmentList.map(z => z.url).join(',');
        formData.inspectedUnitSignature = formData.inspectedUnitSignatureList &&
            formData.inspectedUnitSignatureList.map(z => z.url).join(',');
        formData.rectificationReport = formData.rectificationReportList &&
            formData.rectificationReportList.map(z => z.url).join(',');
        const inspectionTime = formData.date0 + " " + (formData.date1 || '');
        wx.showToast({
            title: "保存中",
            icon: "loading"
        })

        // 新增接口
        let fun = addAppInspectionRecord;
        // 修改草稿
        if (this.data.level == '5') {
            fun = updateAppInspectionRecord;
        }
        fun({
            ...formData,
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