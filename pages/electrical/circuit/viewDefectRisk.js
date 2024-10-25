import {
    getAppDefectRiskTable,
    downloadFile
} from '../../../api/api.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        formData: {
            downloadUrl: '',
        },
    },
    BackPage() {
        wx.navigateBack();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options?.id) {
            getAppDefectRiskTable(options.id, res => {
                console.warn(res);
                const data = res.data;
                data.downloadUrl = (data.annex || '').split(',');
                this.setData({
                    formData: res.data
                })
            })
        }
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