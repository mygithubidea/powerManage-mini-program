import {
    getAppDistributionSubstationInspectionHistoryPage,
    getDistributionSubstationInspectionHistoryNumber,
} from '../../../api/api.js';
Page({
    data: {
        percent: 0,
        completedTaskCount: 0,
        totalTaskCount: 0,
        lineData: {},
        refreshFlag: false,
        TabCur: 0,
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
    onLoad: function (options) {
        console.log('options', options)
        this.setData({
            lineData: options
        });
        this.resetQuery()
    },
    BackPage() {
        wx.navigateBack();
    },
    getDistributionSubstationInspectionHistoryNumber() {
        getDistributionSubstationInspectionHistoryNumber(this.data.lineData, res => {
            let percent = 0;
            if (res.data.totalTaskCount > 0) {
                percent = (res.data.completedTaskCount / res.data.totalTaskCount * 100).toFixed(2);
            }
            this.setData({
                percent,
                ...res.data
            });
        });
    },
    resetQuery() {
        this.getDistributionSubstationInspectionHistoryNumber();
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
        if (tdata.TabCur == 0) queryData.status = 1;
        if (tdata.TabCur == 1) queryData.status = 0;
        getAppDistributionSubstationInspectionHistoryPage({
                ...tdata.lineData,
                ...queryData
            },
            res => {
                let list = tdata['dataList' + index];
                if (isRefresh) {
                    list = [];
                }
                queryData.total = res.data.total;
                // this.data.refreshFlag = false;
                res.data.list.map(z => {
                    z.minuteList = (z.minute?.split(',') || []).map(this.getFileName);
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
    openDetail(e) {
        wx.navigateTo({
            url: "./add?readonly=true&id=" + e.currentTarget.dataset.id
        })
    },
    openDialog(e) {
        wx.navigateTo({
            url: "./add?id=" + e.currentTarget.dataset.id
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