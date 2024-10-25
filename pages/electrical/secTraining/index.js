import {
    getAppSafetyTrainingPage,
    getAppWarningCasePage,
    getAppEventNotificationPage,
    downloadFile,
} from '../../../api/api.js';
Page({
    data: {
        showpopup: false,
        refreshFlag: false,
        TabCur: 0,
        showMenu: [
            wx.getStorageSync('menu').includes("secTraining1"),
            wx.getStorageSync('menu').includes("secTraining2"),
            wx.getStorageSync('menu').includes("secTraining3"),
            wx.getStorageSync('menu').includes("secTraining4"),
        ],
        showBtn: [
            wx.getStorageSync('menu').includes("secTraining1add"),
            wx.getStorageSync('menu').includes("secTraining2add"),
        ],
        dataList0: [],
        dataList1: [],
        dataList2: [],
        dataList3: [],
        searchParam0: {
            "orderByAsc": false,
            "pageIndex": 1,
            "pageSize": 10
        },
        searchParam1: {
            "orderByAsc": false,
            "pageIndex": 1,
            "pageSize": 10
        },
        searchParam2: {
            "orderByAsc": false,
            "pageIndex": 1,
            "pageSize": 10
        },
        searchParam3: {
            "orderByAsc": false,
            "pageIndex": 1,
            "pageSize": 10
        },
        downloadUrl: []
    },
    onShow: function () {
        for(let i in this.data.showMenu) {
            if(this.data.showMenu[i]) {
                this.setData({
                    TabCur: i
                })
                break;
            }
        }
        this.resetQuery()
    },
    BackPage() {
        wx.navigateBack();
    },
    resetQuery() {
        this.setData({
            refreshFlag: true,
            ['searchParam' + this.TabCur]: {
                "orderByAsc": false,
                "pageIndex": 1,
                "pageSize": 10
            }
        })
        this.query(this.data.TabCur, true);
        setTimeout(() => {}, 500)
    },
    nextPage() {
        // 如果已经查到所有的，不继续查询
        const tdata = this.data;
        const queryData = tdata['searchParam' + tdata.TabCur];

        const dataList = tdata['dataList' + tdata.TabCur];
        if (queryData.total <= dataList.length) {
            return;
        }
        queryData.pageIndex += 1;
        this.query(tdata.TabCur);
    },
    query(index, isRefresh) {
        const tdata = this.data;
        const queryData = tdata['searchParam' + index];
        queryData.level = Number(tdata.TabCur) + 1;
        // 警示案例
        if(queryData.level == 3) {
            getAppWarningCasePage(queryData,
                res => {
                    let list = tdata['dataList' + index];
                    if (isRefresh) {
                        list = [];
                    }
                    queryData.total = res.data.total;
                    this.setData({
                        ['dataList' + index]: list.concat(res.data.list),
                        refreshFlag: false,
                    })
                    console.log(this.data)
                });
            return;
        }
        // 事件通报
        if(queryData.level == 4) {
            getAppEventNotificationPage(queryData,
                res => {
                    let list = tdata['dataList' + index];
                    if (isRefresh) {
                        list = [];
                    }
                    queryData.total = res.data.total;
                    this.setData({
                        ['dataList' + index]: list.concat(res.data.list),
                        refreshFlag: false,
                    })
                    console.log(this.data)
                });
            return;
        }
        getAppSafetyTrainingPage(queryData,
            res => {
                let list = tdata['dataList' + index];
                if (isRefresh) {
                    list = [];
                }
                queryData.total = res.data.total;
                // this.data.refreshFlag = false;
                res.data.list.map(z => {
                    z.trainingPhotosList = z.trainingPhotos ? z.trainingPhotos.split(',') : [];
                    console.warn(z.trainingPhotosList)
                })
                this.setData({
                    ['dataList' + index]: list.concat(res.data.list),
                    refreshFlag: false,
                })
                console.log(this.data)
            });
    },
    tabSelect(e) {
        this.setData({
            TabCur: e.currentTarget.dataset.id
        })
        // this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
        this.resetQuery();
    },
    openDialog(event) {
        const url = event.currentTarget.dataset.url;
        console.warn(url)
        this.setData({
            showpopup: true,
            downloadUrl: (url || '').split(','),
        })
    },
    downloadFile(e) {
        downloadFile(e.currentTarget.dataset.downloadurl);
    },
    gotoDetail(e) {
        wx.navigateTo({
            url: "./add?readonly=true&id=" + e.currentTarget.dataset.id
        })
    },
    getFileName(url) {
        const arr = url?.split('/');
        if (arr) {
            return arr[arr.length - 1];
        }
        return '';
    },
    //跳转页面
    navAuditMeter() {
        var that = this
        var tername = that.formParam.terminalname
        console.log('当前台区', tername)
        wx.setStorage({
            key: 'tername',
            data: tername,
            success: function () {
                wx.navigateTo({
                    url: "./meter"
                })
            }
        })
        // if (tername) {
        // 	console.log(tername)
        // 	wx.setStorage({
        // 		key: 'tername',
        // 		data: tername,
        // 		success: function() {
        // 			wx.navigateTo({
        // 				url: "./meter"
        // 			})
        // 		}
        // 	})

        // }
    },
    showDialog(e) {
        const {
            key
        } = e.currentTarget.dataset;
        this.setData({
            [key]: true,
            dialogKey: key
        });
    },
    //跳转页面
    gotoAdd() {
        let type = this.data.TabCur;
        wx.navigateTo({
            url: "./add?type=" + type
        })
    }
});