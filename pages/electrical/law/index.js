import {
    getAppLawsRegulationsPage,
    downloadFile
} from '../../../api/api.js';
Page({
    data: {
        showpopup: false,
        refreshFlag: false,
        TabCur: 0,
        // menu: wx.getStorageSync('menu'),
        showMenu: [
            wx.getStorageSync('menu').includes("law1"),
            wx.getStorageSync('menu').includes("law2"),
            wx.getStorageSync('menu').includes("law3"),
        ],
        dataList0: [],
        dataList1: [],
        dataList2: [],
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
        downloadUrl: ''
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
        // queryData.level = Number(tdata.TabCur) + 1;
        const level = Number(tdata.TabCur) + 1;
        queryData.classify = {
            '1': '法律',
            '2': '标准',
            '3': '规程',
        }[level];

        getAppLawsRegulationsPage(queryData,
            res => {
                let list = tdata['dataList' + index];
                if (isRefresh) {
                    list = [];
                }
                queryData.total = res.data.total;
                // this.data.refreshFlag = false;
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

    closeDialog() {
        const {
            dialogKey
        } = this.data;
        this.setData({
            [dialogKey]: false
        });
    },
});