import {
    getAppSecurityMeetingsPage,
} from '../../../api/api.js';
Page({
    data: {
        refreshFlag: false,
        TabCur: 0,
        showMenu: [
            wx.getStorageSync('menu').includes("secConference1"),
            wx.getStorageSync('menu').includes("secConference2"),
            wx.getStorageSync('menu').includes("secConference3"),
        ],
        showBtn: [
            wx.getStorageSync('menu').includes("secConference1add"),
            wx.getStorageSync('menu').includes("secConference2add"),
            wx.getStorageSync('menu').includes("secConference3add"),
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
        const { data: tdata } = this;
        const queryData = tdata[`searchParam${index}`];
        queryData.level = Number(tdata.TabCur) + 1;

        getAppSecurityMeetingsPage(queryData, res => {
            const { total, list } = res.data;
            queryData.total = total;

            const processedList = list.map(item => {
                const minuteList = (item.minute?.split(',') || [])
                    .map(this.getFileName.bind(this))
                    .map(name => name.trim());

                return {
                    ...item,
                    minuteList,
                    minuteListStr: minuteList.join('\n')
                };
            });

            this.setData({
                [`dataList${index}`]: isRefresh ? processedList : [...tdata[`dataList${index}`], ...processedList],
                refreshFlag: false
            });

            // 仅在开发环境下打印数据
                console.log(this.data);
        });
    },
    tabSelect(e) {
        this.setData({
            TabCur: e.currentTarget.dataset.id
        })
        // this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
        this.resetQuery();
    },
    openDialog(e) {
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