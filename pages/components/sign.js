var cxt = null; // 使用 wx.createContext 获取绘图上下文 cxt
var arrx = []; //所有点的X轴集合
var arry = []; //所有点的Y轴集合
var canvasw = 0; //画布的宽 
var canvash = 0; //画布的高


// var canvasTop=0;
// var canvasLeft=0;
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        title: '',
        readonly: {
            type: Boolean,
            default: true
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        isShow: false,
        signatureImg: ""
    },

    /**
     * 组件的方法列表
     */
    methods: {
        openDialog() {
            this.setData({
                isShow: true,
            }, function () {
                this.createdCanvas();
            })
        },
        closeDialog() {
            this.setData({
                isShow: false,
            });
        },
        //创建canvas上下文
        createdCanvas() {
            // wx.showLoading({
            //     title: '加载中...',
            //     mask: true
            // })

            cxt = wx.createCanvasContext('canvas', this);
            cxt.beginPath();
            var query = wx.createSelectorQuery().in(this).select('.handCenter');
            query.boundingClientRect(rect => {

                canvasw = rect.width / 2;
                canvash = rect.height / 2;
                // 设置背景色为白色,安卓默认黑色
                cxt.setFillStyle('#ffffff');
                // 填充整个画布
                cxt.fillRect(0, 0, canvasw * 2, canvash * 2);
                wx.hideLoading()
            }).exec();
        },
        //canvas发生错误时触发
        canvasIdErrorCallback(e) {
            console.error(e.detail.errMsg)
        },
        //canvas触摸开始
        canvasStart(e) {
            arrx.push(e.changedTouches[0].x);
            arry.push(e.changedTouches[0].y);
        },
        //canvas触摸过程中
        canvasMove(e) {
            let len = arrx.length;
            cxt.moveTo(arrx[len - 1], arry[len - 1]); //把路径移动到画布中指定的点,第一个参数为x轴，第二个参数为y轴
            arrx.push(e.changedTouches[0].x); //手指移动过程中canvas的横坐标存入到全局数组变量arrx中
            arry.push(e.changedTouches[0].y); //手指移动过程中canvas的纵坐标存入到全局数组变量arry中
            cxt.lineTo(e.changedTouches[0].x, e.changedTouches[0].y); //moveTo坐标到lineTo坐标的
            cxt.setLineWidth(4); //设置线条的宽度
            cxt.setLineCap('round'); //设置结束时 点的样式
            cxt.stroke(); //画线
            cxt.draw(true); //设置为true时，会保留上一次画出的图像，false则会清空(方式二设置为false,一为true)
        },
        getImg() {
            if (arrx.length == 0) {
                wx.showModal({
                    title: '提示',
                    content: '签名内容不能为空！',
                    showCancel: false
                });
                return false;
            };
            wx.showLoading({
                title: '签名生成中..',
                mask: true
            })
            let that = this;
            wx.canvasToTempFilePath({
                canvasId: 'canvas',
                fileType: 'jpg',
                success: function (res) {
                    console.log(res, 'filr');
                    that.setData({
                        signatureImg: res.tempFilePath
                    })
                    wx.hideLoading();
                    //子组件传递给父组件一个方法canvasDis，并传递一个参数src给父组件
                    that.triggerEvent("setSign", {
                        signatureImg: res.tempFilePath
                    })
                    that.closeDialog();
                }
            }, this);
        },
        cleardraw() {
            //清除画布
            arrx = [];
            arry = [];
            cxt.clearRect(0, 0, canvasw, canvash);
            cxt.draw();
            this.setData({
                signatureImg: ''
            });
        },
        canvasEnd(e) {}
    },
    ready() {
        // this.createdCanvas()
    },
    signature: function (e) {
        if (this.data.isConfirm) {
            return
        }
        let {
            index
        } = e.currentTarget.dataset
        this.setData({
            containerType: 'center',
            isOpen: true
        })
    },
    // 关闭半窗口
    closeContainer: function () {
        this.setData({
            isOpen: false,
            containerType: ''
        })
    },

    // 调用方法
    //签字
    handlChangeCanvasShow(e) {
        let that = this
        if (e.detail.signatureImg != '') {
            that.setData({
                signatureImg: e.detail.signatureImg
            })
            that.closeContainer()
            const signatureImg = e.detail.signatureImg
            const uploadFileUrl = this.data.opLoadUrl

            const _token = wx.getStorageSync('token')
            let headers = {
                Authorization: _token || '',
                'Content-Type': 'application/json'
            }

            wx.uploadFile({
                url: uploadFileUrl, // 接口地址
                filePath: signatureImg,
                header: headers,
                method: 'POST',
                name: 'file',
                success(res) {

                    let resData = JSON.parse(res.data)
                    let signUrl = resData.fileName
                    that.setData({
                        recvsign: signUrl
                    })
                },
            });
        }
    },
})