// pages/electrical/safetyequipment/index.js
import {
  getsafetyequipmentPage,
} from '../../../api/api.js';
Page({
  data: {
      refreshFlag: false,
      TabCur: 0,
      showMenu: wx.getStorageSync('menu').includes("safetyequipment"),
      dataList0: [],
      searchParam0: {
          "orderByAsc": false,
          "pageIndex": 1,
          "pageSize": 10
      },
  },
  onShow: function () {
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
      getsafetyequipmentPage(index, queryData,
          res => {
              let list = tdata['dataList' + index];
              if (isRefresh) {
                  list = [];
              }
              queryData.total = res.data.total;
              // Process dates to show only year, month, and day
              const processedList = res.data.list.map(item => ({
                  ...item,
                  rectificationCompletionDate: item.rectificationCompletionDate ? item.rectificationCompletionDate.slice(0, 10) : '',
                  acceptanceTime: item.acceptanceTime ? item.acceptanceTime.slice(0, 10) : ''
              }));
              this.setData({
                  ['dataList' + index]: list.concat(processedList),
                  refreshFlag: false,
              })
              console.log(this.data)
          });
  },
  // tabSelect(e) {
  //     this.setData({
  //         TabCur: e.currentTarget.dataset.id
  //     })
  //     // this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
  //     this.resetQuery();
  // },
  openDialog(e) {
      wx.navigateTo({
          url: "./add?TabCur=" + this.data.TabCur + "&readonly=true&id=" + e.currentTarget.dataset.id
      })
  },
  // getFileName(url) {
  //     const arr = url?.split('/');
  //     if (arr) {
  //         return arr[arr.length - 1];
  //     }
  //     return '';
  // },
  //跳转页面
  // navAuditMeter() {
  //     var that = this
  //     var tername = that.formParam.terminalname
  //     console.log('当前台区', tername)
  //     wx.setStorage({
  //         key: 'tername',
  //         data: tername,
  //         success: function () {
  //             wx.navigateTo({
  //                 url: "./meter"
  //             })
  //         }
  //     })
  //     // if (tername) {
  //     // 	console.log(tername)
  //     // 	wx.setStorage({
  //     // 		key: 'tername',
  //     // 		data: tername,
  //     // 		success: function() {
  //     // 			wx.navigateTo({
  //     // 				url: "./meter"
  //     // 			})
  //     // 		}
  //     // 	})

  //     // }
  // },
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
      wx.navigateTo({
          url: "./add?TabCur=" + this.data.TabCur
      })
  }
});