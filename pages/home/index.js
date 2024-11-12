import {
    getOrganizationAndWirList,
} from "../../api/api.js"
// pages/home/index.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showList: [],
        elements: [{
                title: '法律法规',
                name: 'law',
                cuIcon: 'square'
            },
            {
                title: '管理制度',
                name: 'managementSystem',
                cuIcon: 'square'
            },
            {
                title: '通知',
                name: 'notice',
                cuIcon: 'square'
            },
            {
                title: '安全会议',
                name: 'secConference',
                cuIcon: 'square'
            },
            {
                title: '安全培训',
                name: 'secTraining',
                cuIcon: 'square'
            },
            {
                title: '安全宣传',
                name: 'secPromotion',
                cuIcon: 'square'
            },
            {
                title: '应急管理',
                name: 'contingencyManagement',
                cuIcon: 'square'
            },
            {
                title: '安全投入',
                name: 'securityInvestment',
                cuIcon: 'square'
            },
            {
                title: '责任书',
                name: 'responsibilityLetter',
                cuIcon: 'square'
            },
            {
                title: '其他',
                name: 'other',
                cuIcon: 'square'
            },
            // {
            //     title: 'demo',
            //     name: 'demo',
            //     cuIcon: 'explore'
            // },
        ],
        patrols: [{
                title: '电站巡查',
                name: 'powerStation',
                cuIcon: 'square'
            },
            {
                title: '线路巡查',
                name: 'circuit',
                cuIcon: 'square'
            },
            {
                title: '变台巡查',
                name: 'transformer',
                cuIcon: 'square'
            },
            {
                title: '电表巡查',
                name: 'electricityMeter',
                cuIcon: 'square'
            },
        ],
        inspections: [{
                title: '检查记录',
                name: 'securityInspectionRecords',
                cuIcon: 'square'
            },
            {
                title: '隐患上报',
                name: 'reportingOfHiddenDangers',
                cuIcon: 'square'
            },
            {
                title: '整改通知',
                name: 'rectificationNotice',
                cuIcon: 'square'
            },
        ],
        patrols: [{
                title: '电站巡查',
                name: 'powerStation',
                cuIcon: 'square'
            },
            {
                title: '线路巡查',
                name: 'circuit',
                cuIcon: 'square'
            },
            {
                title: '变台巡查',
                name: 'transformer',
                cuIcon: 'square'
            },
            {
                title: '电表巡查',
                name: 'electricityMeter',
                cuIcon: 'square'
            },
        ],
      twovoteorders: [{
                title: '安全器具',
                name: 'safetyequipment',
                cuIcon: 'square'
            },
            {
                title: '操作票',
                name: 'operatingvote',
                cuIcon: 'square'
            },
          //   {
          //       title: '工作票',
          //       name: 'rectificationNotice',
          //       cuIcon: 'square'
          //   },
          //   {
          //     title: '派工单',
          //     name: 'rectificationNotice',
          //     cuIcon: 'square'
          // },
          ],
        

        data: {
            bulename: '未知',
            connected: false,
            searching: false,
            devicesList: [],
            charts: [],
            initialization: 0,
            itemList: [],
            hiddenmodalput: true,
            pass: '',
            disableds: "disabled",
            selected: ""
        },
    },

    getWirList() {
        getOrganizationAndWirList({}, res => {
            // var list = res.data?.[0]?.children || [];
            let list = []
            if(res.data.length > 0) {
                res.data.map(z => {
                    list = list.concat(z.children)
                })
            }
            list = list.map(z => z.name)
            // list = list.map(z => ({
            //     name: z.name,
            //     value: z.name,
            // }))
            wx.setStorageSync('WirList', JSON.stringify(list));
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const menu = wx.getStorageSync('menu');
        const tdata = this.data;
        const elementsNew = tdata.elements.map(z => ({
            ...z,
            isShow: menu.includes(z.name)
        }));
        const patrolsNew = tdata.patrols.map(z => ({
            ...z,
            isShow: menu.includes(z.name)
        }));
        const inspectionsNew = tdata.inspections.map(z => ({
            ...z,
            isShow: menu.includes(z.name)
        }));
        const twovoteorderNew = tdata.twovoteorders.map(z => ({
          ...z,
          isShow: menu.includes(z.name)
      }));
        this.setData({
            elements: elementsNew,
            patrols: patrolsNew,
            inspections: inspectionsNew,
            twovoteorders: twovoteorderNew,
        })
        
        console.log(menu)
        this.setData({
            showList: menu
        })

        this.getWirList();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

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