
// const ip = 'https://dlxj.cdxhyb.com:10373';
// const host = 'https://dlxj.cdxhyb.com:10373/api';

const ip = 'http://127.0.0.1:8888';
const host = 'http://127.0.0.1:8888/api';

const http = function (url, method = 'post', params, success) {
    var token = wx.getStorageSync('user').token;

    wx.request({
        url: (params.noApi ? ip : host) + url,
        method,
        header: {
            token,
        },
        data: params,
        success: function (res) {
            if (res.data.code == 200) {
                success(res.data);
            } else {
                wx.showToast({
                    icon: "none",
                    title: res.data.msg,
                })
            }
        },
        fail: function (res) {
            wx.showToast({
                icon: "none",
                title: res.data.msg,
            })
        },
    });
}

const fun = function () {};

export const uploadFile = (filePath, success = fun) => {
    var token = wx.getStorageSync('user').token;
    wx.uploadFile({
        // url: 'https://dlxj.cdxhyb.com:10373/api/common/upload', // 你的接口地址
        url: 'https://dlxj.cdxhyb.com:10373/ops/minio/upload', // 你的接口地址
        filePath: filePath, // 文件路径，如：tempFilePath[0] 图片, tempFilePath[1] 音乐, tempFilePath[2] 视频 tempFilePath[3] 其他文件, tempFilePath[4] 语音读, tempFilePath[5] 压缩文件, tempFilePath[6] 其他文件(压缩包), tempFilePath[7] 其他文件(音频), tempFilePath[8] 其他文件(视频), tempFilePath[9] 其他文件(未知), tempFilePath[10] 其他文件(其它)等等类型，请根据类型来决定你的逻辑，比如图片转码，或者上传到云存储等。
        name: 'file', // 文件字段名，默认为file
        header: {
            token,
        },
        success,
        // success: function (res) {
        //     // 上传成功，处理服务器返回的响应信息
        //     var data = res.data;
        //     // 缓存res.data作为字段
        //     // downloadFile(res.data)
        //     console.log(data);
        // },
        fail: function (res) {
            // 上传失败，处理上传错误
            console.error(res);
        }
    });
};
// 法律法规
export const getAppLawsRegulationsPage = (params, success = fun) => {
    return http(`/app/lawsRegulations/getAppLawsRegulationsPage`, 'post', params, success);
};

// 管理制度
export const getAppInstitutionalPage = (params, success = fun) => {
    return http(`/app/institutional/getAppInstitutionalPage`, 'post', params, success);
};

// 通知
export const getAppNoticePage = (params, success = fun) => {
    return http(`/app/notice/getAppNoticePage`, 'post', params, success);
};

// 安全会议
export const getAppSecurityMeetingsPage = (params, success = fun) => {
    return http(`/app/securityMeetings/getAppSecurityMeetingsPage`, 'post', params, success);
};
export const getAppSecurityMeetings = (id, success = fun) => {
    return http(`/app/securityMeetings/getAppSecurityMeetings/${id}`, 'post', {}, success);
};
export const addSecurityMeetings = (params, success = fun) => {
    return http(`/app/securityMeetings/addAppSecurityMeetings`, 'post', params, success);
};

// 安全培训
export const getAppSafetyTrainingPage = (params, success = fun) => {
    return http(`/app/safetyTraining/getAppSafetyTrainingPage`, 'post', params, success);
};
export const getAppSafetyTraining = (id, success = fun) => {
    return http(`/app/safetyTraining/getAppSafetyTraining/${id}`, 'post', {}, success);
};
export const addAppSafetyTraining = (params, success = fun) => {
    return http(`/app/safetyTraining/addAppSafetyTraining`, 'post', params, success);
};
// 安全培训-警示案例
export const getAppWarningCasePage = (params, success = fun) => {
    return http(`/app/warningCase/getAppWarningCasePage`, 'post', params, success);
};
// 安全培训-事件通报
export const getAppEventNotificationPage = (params, success = fun) => {
    return http(`/app/eventNotification/getAppEventNotificationPage`, 'post', params, success);
};

// 安全宣传
export const getAppSafetyPromotionPage = (params, success = fun) => {
    return http(`/app/safetyPromotion/getAppSafetyPromotionPage`, 'post', params, success);
};
export const getAppSafetyPromotion = (id, success = fun) => {
    return http(`/app/safetyPromotion/getAppSafetyPromotion/${id}`, 'post', {}, success);
};
export const addSafetyPromotion = (params, success = fun) => {
    return http(`/app/safetyPromotion/addAppSafetyPromotion`, 'post', params, success);
};

// 应急管理 TabCur == 0应急预案 TabCur == 1应急演练
export const getContingencyManagementPage = (TabCur, params, success = fun) => {
    if (Number(TabCur) === 0) {
        return http(`/app/emergencyPlan/getAppEmergencyPlanPage`, 'post', params, success);
    }
    return http(`/app/emergencyDrill/getAppEmergencyDrillPage`, 'post', params, success);
};
export const getAppContingencyManagement = (TabCur, id, success = fun) => {
    if (Number(TabCur) === 0) {
        return http(`/app/emergencyPlan/getAppEmergencyPlan/${id}`, 'post', {}, success);
    }
    return http(`/app/emergencyDrill/getAppEmergencyDrill/${id}`, 'post', {}, success);
};
export const addContingencyManagement = (TabCur, params, success = fun) => {
    if (Number(TabCur) === 0) {
        return;
    }
    return http(`/app/emergencyDrill/addAppEmergencyDrill`, 'post', params, success);
};

// 安全投入 TabCur == 0安全技术措施 TabCur == 1反事故措施
export const getAppSecurityInvestmentPage = (TabCur, params, success = fun) => {
    if (Number(TabCur) === 0) {
        return http(`/app/safetyProtectionBudgetRegister/getAppSafetyProtectionBudgetRegisterPage`, 'post', params, success);
    }
    return http(`/app/antiAccidentMeasures/getAppAntiAccidentMeasuresPage`, 'post', params, success);
};

// 责任书
export const getAppResponsibilityLetterPage = (params, success = fun) => {
    return http(`/app/responsibilityLetter/getAppResponsibilityLetterPage`, 'post', params, success);
};
export const getAppResponsibilityLetter = (id, success = fun) => {
    return http(`/app/responsibilityLetter/getAppResponsibilityLetter/${id}`, 'post', {}, success);
};
export const addAppResponsibilityLetter = (params, success = fun) => {
    return http(`/app/responsibilityLetter/addAppResponsibilityLetter`, 'post', params, success);
};

// 其他
export const getAppOtherTablePage = (params, success = fun) => {
    return http(`/app/otherTable/getAppOtherTablePage`, 'post', params, success);
};
export const getAppOtherTable = (id, success = fun) => {
    return http(`/app/otherTable/getAppOtherTable/${id}`, 'post', {}, success);
};
export const addAppOtherTable = (params, success = fun) => {
    return http(`/app/otherTable/addAppOtherTable`, 'post', params, success);
};

// 检查记录
export const getAppInspectionRecordPage = (params, success = fun) => {
    return http(`/app/inspectionRecord/getAppInspectionRecordPage`, 'post', params, success);
};
export const getAppInspectionRecord = (id, success = fun) => {
    return http(`/app/inspectionRecord/getAppInspectionRecord/${id}`, 'post', {}, success);
};
export const addAppInspectionRecord = (params, success = fun) => {
    return http(`/app/inspectionRecord/addAppInspectionRecord`, 'post', params, success);
};
export const updateAppInspectionRecord = (params, success = fun) => {
    return http(`/app/inspectionRecord/updateAppInspectionRecord`, 'post', params, success);
};
export const deleteAppInspectionRecord = (id, success = fun) => {
    return http(`/app/inspectionRecord/deleteAppInspectionRecord/${id}`, 'post', {}, success);
};

// 检查部门列表
export const getOrganizationAndWirList = (params, success = fun) => {
    return http(`/ops/organization/getOrganizationAndWirList`, 'post', {noApi: true}, success);
};


// 隐患上报 TabCur == 0内部报送 TabCur == 1外部报送
export const getReportingOfHiddenDangersPage = (TabCur, params, success = fun) => {
    if (Number(TabCur) === 0) {
        return http(`/app/internalHazardReport/getAppInternalHazardReportPage`, 'post', params, success);
    }
    return http(`/app/externalHazardReport/getAppExternalHazardReportPage`, 'post', params, success);
};
export const getAppReportingOfHiddenDangers = (TabCur, id, success = fun) => {
    if (Number(TabCur) === 0) {
        return http(`/app/internalHazardReport/getAppInternalHazardReport/${id}`, 'post', {}, success);
    }
    return http(`/app/externalHazardReport/getAppExternalHazardReport/${id}`, 'post', {}, success);
};
export const addReportingOfHiddenDangers = (TabCur, params, success = fun) => {
    if (Number(TabCur) === 0) {
        return;
    }
    return http(`/app/externalHazardReport/addExternalHazardReport`, 'post', params, success);
};

export const addAppInternalHazardReport = ( params, success = fun)=>{
  return http(`/app/internalHazardReport/addAppInternalHazardReport`, 'post', params, success);
};


// 整改通知
export const getAppRectificationNoticePage = (params, success = fun) => {
    return http(`/app/rectificationNotice/getAppRectificationNoticePage`, 'post', params, success);
};
export const getAppRectificationNotice = (id, success = fun) => {
    return http(`/app/rectificationNotice/getAppRectificationNotice/${id}`, 'post', {}, success);
};
export const addAppRectificationNotice = (params, success = fun) => {
    return http(`/app/rectificationNotice/addAppRectificationNotice`, 'post', params, success);
};
export const exportAppInspectionRecord = (id, success = fun) => {
    var token = wx.getStorageSync('user').token;
    wx.request({
        url: host + `/app/inspectionRecord/exportAppInspectionRecord/${id}`,
        method: 'post',
        header: {
            token,
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        responseType: 'arraybuffer',
        success: success
    });
};
export const exportAppRectificationNotice = (id, success = fun) => {
    var token = wx.getStorageSync('user').token;
    wx.request({
        url: host + `/app/rectificationNotice/exportAppRectificationNotice/${id}`,
        method: 'post',
        header: {
            token,
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        responseType: 'arraybuffer',
        success: success
    });
};

// 线路巡查
export const getAppLineInspectionTablePage = (params, success = fun) => {
    return http(`/app/lineInspectionTable/getAppLineInspectionTablePage`, 'post', params, success);
};
// 获取线路巡查历史记录总任务数量和已完成任务数量
export const getLineInspectionHistoryNumber = (params, success = fun) => {
    return http(`/app/lineInspectionHistory/getLineInspectionHistoryNumber`, 'post', params, success);
};
// 巡查记录
export const getAppLineInspectionHistoryPage = (params, success = fun) => {
    return http(`/app/lineInspectionHistory/getAppLineInspectionHistoryPage`, 'post', params, success);
};
export const getAppLineInspectionHistory = (id, success = fun) => {
    return http(`/app/lineInspectionHistory/getAppLineInspectionHistory/${id}`, 'post', {}, success);
};
export const updateAppLineInspectionHistory = (params, success = fun) => {
    return http(`/app/lineInspectionHistory/updateAppLineInspectionHistory`, 'post', params, success);
};
// 缺陷列表
export const getAppDefectRiskTablePage = (params, success = fun) => {
    return http(`/app/defectRiskTable/getAppDefectRiskTablePage`, 'post', params, success);
};
export const getAppDefectRiskTable = (id, success = fun) => {
    return http(`/app/defectRiskTable/getAppDefectRiskTable/${id}`, 'post', {}, success);
};
// 一患一档
export const getAppSafetyDefectsRecordPage = (params, success = fun) => {
    return http(`/app/safetyDefectsRecord/getAppSafetyDefectsRecordPage`, 'post', params, success);
};
export const getAppSafetyDefectsRecord = (id, success = fun) => {
    return http(`/app/safetyDefectsRecord/getAppSafetyDefectsRecord/${id}`, 'post', {}, success);
};
export const addAppSafetyDefectsRecord = (params, success = fun) => {
    return http(`/app/safetyDefectsRecord/addAppSafetyDefectsRecord`, 'post', params, success);
};

// 变台巡查
export const getAppDistributionSubstationInspectionPage = (params, success = fun) => {
    return http(`/app/distributionSubstationInspection/getAppDistributionSubstationInspectionPage`, 'post', params, success);
};
// 获取变台巡查历史记录总任务数量和已完成任务数量
export const getDistributionSubstationInspectionHistoryNumber = (params, success = fun) => {
    return http(`/app/distributionSubstationInspectionHistory/getDistributionSubstationInspectionHistoryNumber`, 'post', params, success);
};
// 电台巡查记录
export const getAppDistributionSubstationInspectionHistoryPage = (params, success = fun) => {
    return http(`/app/distributionSubstationInspectionHistory/getAppDistributionSubstationInspectionHistoryPage`, 'post', params, success);
};
export const getAppDistributionSubstationInspectionHistory = (id, success = fun) => {
    return http(`/app/distributionSubstationInspectionHistory/getAppDistributionSubstationInspectionHistory/${id}`, 'post', {}, success);
};
export const updateAppDistributionSubstationInspectionHistory = (params, success = fun) => {
    return http(`/app/distributionSubstationInspectionHistory/updateAppDistributionSubstationInspectionHistory`, 'post', params, success);
};


export const login = (params, success = fun) => {
    return http(`/app/accountLogin`, 'post', params, success);
};

export const getAppNavMenuTreeList = (params, success = fun) => {
    return http(`/app/sysAppMenu/getAppNavMenuTreeList`, 'post', params, success);
};

export const authToken = (params, success = fun) => {
    return http(`http://39.99.226.198:8888/authToken`, 'get', params);
};

/*
export const downloadFile = (url) => {
    wx.showToast({
        icon: 'loading',
        title: '下载中'
    })
    const downloadTask = wx.downloadFile({
        url: url,
        success: (res) => {
            if (res.statusCode === 200) {
                wx.saveFile({
                    tempFilePath: res.tempFilePath,
                    success: function (saveRes) {
                        var savedFilePath = saveRes.savedFilePath;
                        console.warn(saveRes)
                    }
                });
                console.log('下载成功', res);
            }
        }
    });
    console.warn(downloadTask)
}
*/


function getFileName(url) {
    const arr = url?.split('/');
    if (arr) {
        return arr[arr.length - 1];
    }
    return '';
}
// 下载导出数据
export const downloadFile = (url) => {
    console.log('开始下载', url);
    wx.showLoading({
        title: "下载中",
    });
    wx.downloadFile({
        url: url,
        header: {},
        success(res) {
            console.log('downloadFile', res);
            if (res.statusCode === 200) {
                let savePath = wx.env.USER_DATA_PATH + '/' + getFileName(url);
                console.log(savePath)
                wx.getFileSystemManager().saveFile({
                    //下载成功后保存到本地
                    tempFilePath: res.tempFilePath,
                    filePath: savePath,
                    fileType: savePath.split('.')[1], // 比如.pdf,.xlsx,.jpg,.png等类型
                    success(res) {
                        wx.hideLoading();
                        console.log('savePath', res);
                        let savePath = res.savedFilePath;
                        wx.showModal({
                            title: "下载成功",
                            content: "是否打开?",
                            confirmText: "打开",
                            success(res) {
                                if (res.confirm) {
                                    wx.openDocument({
                                        //打开
                                        filePath: savePath,
                                        showMenu: true,
                                        success(res) {
                                            console.log(res);
                                        },
                                    });
                                } else if (res.cancel) {}
                            },
                        });
                    },
                    fail(err) {
                        wx.hideLoading();
                        wx.showModal({
                            title: '提示',
                            content: "文件保存失败" + err,
                            showCancel: false, //是否显示取消按钮
                            success: function (result) {}
                        })
                    },
                });
            } else {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: "文件下载失败",
                    showCancel: false, //是否显示取消按钮
                    success: function (result) {},
                    fail: function (err) {
                        console.error(err)
                    }
                })
            }
        },
        fail(err) {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: "文件下载失败",
                showCancel: false, //是否显示取消按钮
                success: function (result) {}
            })
        }
    });
}