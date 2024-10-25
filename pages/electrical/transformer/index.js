import {
    getAppDistributionSubstationInspectionPage,
    getAppDefectRiskTablePage,
    getAppSafetyDefectsRecordPage
} from '../../../api/api.js';
Page({
    data: {
        refreshFlag: false,
        TabCur: 0,
        showMenu: [
            wx.getStorageSync('menu').includes("transformer1"),
            wx.getStorageSync('menu').includes("transformer2"),
            wx.getStorageSync('menu').includes("transformer3"),
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
            "inspectionType": "变台巡查",
            "orderByAsc": false,
            "pageIndex": 1,
            "pageSize": 10
        },
        searchParam2: {
            "inspectionType": "变台巡查",
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
                "inspectionType": "变台巡查",
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
        let queryFun = getAppDistributionSubstationInspectionPage;
        if (tdata.TabCur == 1) {
            queryFun = getAppDefectRiskTablePage
        } else if (tdata.TabCur == 2) {
            queryFun = getAppSafetyDefectsRecordPage
        }
        queryFun(queryData,
            res => {
                let list = tdata['dataList' + index];
                if (isRefresh) {
                    list = [];
                }
                queryData.total = res.data.total;
                // this.data.refreshFlag = false;
                res.data.list.map(z => {
                    if(z.beforeRectificationPhoto) {
                        z.beforeRectificationPhotoList = z.beforeRectificationPhoto?.split(',') || []
                    }
                    if(z.duringRectificationPhoto) {
                        z.duringRectificationPhotoList = z.duringRectificationPhoto?.split(',') || []
                    }
                    if(z.afterRectificationPhoto) {
                        z.afterRectificationPhotoList = z.afterRectificationPhoto?.split(',') || []
                    }
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
    goRecord(e) {
        // 加上线路和杆号
        const dataset = e.currentTarget.dataset;
        wx.navigateTo({
            url: `./record?transformerName=${dataset.transformername}`
        })
    },
    viewDefectRisk(e) {
        const dataset = e.currentTarget.dataset;
        wx.navigateTo({
            url: `./viewDefectRisk?id=${dataset.id}`
        })
    },
    openDialog(e) {
        wx.navigateTo({
            url: "./add?readonly=true&id=" + e.currentTarget.dataset.id
        })
    },
    goYHYD(e) {
        wx.navigateTo({
            url: "./yhyd?readonly=true&id=" + e.currentTarget.dataset.id
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