import {
    login,
    getAppNavMenuTreeList,
} from '../../api/api.js';

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
        username: '',
        password: '',
		// username: "admin",
		// password: "admin123",
    },
    // 新增外部报送
    goReport() {
        wx.navigateTo({
            url: "/pages/electrical/reportingOfHiddenDangers/add?TabCur=1"
        })
    },
	// 登录处理
	login(e) {
		const queryData = {
			username: this.data.username,
			password: this.data.password,
		};
		login(queryData,
			res => {
				let user = {
					token: res.data.token,
				}
				wx.removeStorageSync('user');
                wx.setStorageSync('user', user);
                
                // api.showModel(res.message);
                const menu = []
                const getCode = (list) => {
                    list && list.map(z => {{
                        menu.push(z.code)
                        Array.isArray(z.children) && getCode(z.children)
                    }})
                }
                console.log('menu', menu)
                getAppNavMenuTreeList({}, res => {
                    getCode(res.data);
                    // const menu = []
                    // res.data && res.data.map(z => {{
                    //     z.children && z.children.map(x => {
                    //         console.log(x)
                    //         menu.push(x.code)
                    //     })
                    // }})
                    wx.setStorageSync('menu', menu);
                    wx.navigateTo({
                        url: `/pages/home/index`
                    });
                })
			});
	},
	// 注册
	// register() {
	// 	wx.navigateTo({
	// 		url: '/pages/register/register'
	// 	});
	// },
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
        console.log(options)
	},
})