//行程里面的各项资源新增编辑
const api = require('../../utils/util.js')
const http = require('../../utils/request.js');
const app = getApp()

Page({
  data: {
    list: [],
    current: 1,
    size:15,
    pageType: '',
    pageName: '',
    phone: '123',
    detailPics: [], //上传的结果图片集合
    originalList: [],
    inputVal: [],
    info: {},
    infoList: [],
    infoIndex: 0,
    resourceName: '',
    remark: '',
    isShowInfoName: false,
    id: '',
    cashTypeList: [{name: '签单', type: 'guideSign'}, {name: '现付', type: 'guide'}], //收款方式列表
    selfv2cashTypeList: [{name: '现付', type: 'guide'},{name: '正签单', type: 'guidePositiveSign'}, {name: '返签单', type: 'guideReturnSign'}], //自费项收款方式列表
    cashTypeidx: 0,
    cashType: 'guide',
    guideRealReimbRemark: '', //记账备注
    isShowDialog: false,
    isShowGroup: false, //小组弹窗
    groupList: [],
    childList: [], //房间-门票-自费项-购物 子列表
    childItemIdx: '', // 用于子项目字典选择
    checked:false, //全选删除
    checkAllFont: "全选",
    remarkKeyWord: '',
    memberList: [],
    resourceId: '', //各项资源的公司选中名称
    resourceText: '',
    isGuideExtra: false, //加点
    mealTypeList: [{name: '早餐', type: 'breakfast'}, {name: '午餐', type: 'lunch'},{name: '晚餐', type: 'dinner'}], //用餐类别
    mealTypeIdx: 0,
    mealType: '',
    isShowSignNumber: false, //签单号列表
    signNumberList: [],
  },
    //小组
    getGroup: function(e){
        this.setData({
            infoIndex: e.currentTarget.dataset.index,
            isShowGroup: true,
        })
    },
    cancelGroup: function(){
        this.setData({
            isShowGroup: false,
            isShowSignNumber: false,
        })
    },
    //全选与反全选
    checkAll: function() {
        var that = this;
        that.data.checked = !that.data.checked
        for (let i = 0; i < that.data.groupList.length; i++) {
            that.data.groupList[i].checked = that.data.checked;
        }
        if (that.data.checked) {
            that.data.checkAllFont = "取消"
        } else {
            that.data.checkAllFont = "全选"
        }
        that.setData({
            groupList: that.data.groupList,
            checked: that.data.checked,
            checkAllFont: that.data.checkAllFont
        })
    },
    //多选，自定义选中样式
    checkChange: function(e) {
        var _list = this.data.groupList
        var _value = e.detail.value;
        for (let i = 0; i < _list.length; i++) {      
            for (let j = 0; j <= _value.length; j++) {
            if (_list[i].customerOrderId == _value[j]) {//如果选中的checkbox等于该checkbox，则将checked属性改为true，结束本次循环
                _list[i].checked = true
                break
            }
            _list[i].checked = false
            }
        }
        this.setData({
            list: _list
        })
        if (_value.length == _list.length) {
            this.setData({
                checked: true,
                checkAllFont: "取消"
            });
        } else {
            this.setData({
                checked: false,
                checkAllFont: "全选"
            });
        }
    },

    checkedGroup: function (e){
        let infoList = this.data.infoList,
        infoIndex = this.data.infoIndex,
        resourceName = this.data.resourceName;
        let memberList = this.data.groupList.filter(item => item.checked == true);
        if(resourceName == 'hotel'){
            memberList.forEach(item => {
                item.count = (item.adultCount + item.childCount) / 2;
                item.guideRealReimbMoney =  (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(infoList[infoIndex].times || 1) * Number(infoList[infoIndex].price || 0) - Number(infoList[infoIndex].mCollect || 0);
            })
        }
        if(resourceName == 'restaurant'){
            memberList.forEach(item => {
                item.count = (item.adultCount + item.childCount);
                memberList.forEach(item => {
                    item.guideRealReimbMoney =  (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(infoList[infoIndex].times || 1) * Number(infoList[infoIndex].price || 0);
                })
            })
        }
        if(resourceName == 'visa'){
            memberList.forEach(item => {
                item.guideRealReimbMoney =  (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(infoList[infoIndex].price || 0);
            })
        }
        if(resourceName == 'scenic'){
            memberList.forEach(item => {
                item.guideRealReimbMoney = (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(infoList[infoIndex].price || 0) + (Number(item.childCount || 0) - Number(item.childFreeCount || 0)) * Number(infoList[infoIndex].childPrice || 0);
            })
        }
        if(resourceName == 'transportCompany'){
            memberList.forEach(item => {
                item.guideRealReimbMoney =  Number(item.count || 0)  * Number(infoList[infoIndex].price || 0) - Number(infoList[infoIndex].subsidy || 0);
            })
        }
        if(resourceName == 'insurance'){
            memberList.forEach(item => {
                item.guideRealReimbMoney =  Number(item.count || 0)  * Number(infoList[infoIndex].price || 0);
            })
        }

        if(resourceName == 'selfCompany'){
            memberList.forEach(item => {
                item.count = (item.adultCount + item.childCount);
                item.guideRealReimbReceiveCount = (item.adultCount + item.childCount);
                item.guideRealReimbReceiveMoney = Number(infoList[infoIndex].sellPrice || 0) * Number(item.count || 0);
                item.guideRealReimbMoney = Number(infoList[infoIndex].price || 0) * (Number(item.guideRealReimbReceiveCount || 0) - Number(item.freeCount || 0));
            })
        }
        memberList.forEach(item => {
            item.remark = '';
        })
        this.setData({
            isShowGroup: false,
            infoList: infoList,
            memberList: memberList,
        })
    },
    //编辑-点击客人信息
    getEditMember(e){
        let keyName = e.currentTarget.dataset.name;
        let oldVal = this.data.infoList,
            infoIndex = this.data.infoIndex;
        if(keyName == 'all'){
            oldVal[infoIndex]['memberContactInfo'] = '';
            this.setData({
                isShowGroup: false,
                memberList: [],
                infoList: oldVal,
            })
        }else {
            // var oldVal=this.data.info,
            // oldVal[infoIndex][keyName] = e.currentTarget.dataset.value;
            oldVal[infoIndex]['memberContactInfo'] = e.currentTarget.dataset.member;
            let memberList = [{[keyName]: e.currentTarget.dataset.value, customerOrderId: e.currentTarget.dataset.id}],
            childList = this.data.childList,
            resourceName = this.data.resourceName;
            if(resourceName == 'hotelv2' || resourceName == 'scenicv2' || resourceName == 'selfv2Company'){
                // if(resourceName == 'hotelv2'){
                //     let guideRealReimbMoney = 0;
                //     childList.forEach(item => {
                //         item.guideRealReimbMoney = Number(oldVal[infoIndex].times) * Number(item.price || 0) * Number(item.count || 0);
                //         guideRealReimbMoney += item.guideRealReimbMoney;
                //     })
                //     memberList.forEach(item => {
                //         item.guideRealReimbMoney = guideRealReimbMoney;
                //     })
                //     oldVal[infoIndex]['guideRealReimbMoney'] = guideRealReimbMoney;
                // }
                this.setData({
                    isShowGroup: false,
                    // memberList: memberList,
                    infoList: oldVal,
                    customerOrderId: e.currentTarget.dataset.id,
                })
            }else {
                this.setData({
                    isShowGroup: false,
                    // info: oldVal,
                    infoList: oldVal,
                    customerOrderId: e.currentTarget.dataset.id,
                })
            }
        }
    },
    //签单号列表选择
    getEditSignNumber(e){
      let keyName = e.currentTarget.dataset.name;
      let oldVal = this.data.infoList,
      infoIndex = this.data.infoIndex;
      oldVal[infoIndex][keyName] = e.currentTarget.dataset.value;
      let memberList = [{[keyName]: e.currentTarget.dataset.value, customerOrderId: e.currentTarget.dataset.id}],
      childList = this.data.childList,
      resourceName = this.data.resourceName;
      if(resourceName == 'hotelv2' || resourceName == 'scenicv2'){
          if(resourceName == 'hotelv2'){
              let guideRealReimbMoney = 0;
              childList.forEach(item => {
                  item.guideRealReimbMoney = Number(oldVal[infoIndex].times) * Number(item.price || 0) * Number(item.count || 0);
                  guideRealReimbMoney += item.guideRealReimbMoney;
              })
              memberList.forEach(item => {
                  item.guideRealReimbMoney = guideRealReimbMoney;
              })
              oldVal[infoIndex]['guideRealReimbMoney'] = guideRealReimbMoney;
          }
          this.setData({
              isShowGroup: false,
              memberList: memberList,
              signNumber: e.currentTarget.dataset.id,
          })
      }else {
          this.setData({
              isShowGroup: false,
              // info: oldVal,
              infoList: oldVal,
              signNumber: e.currentTarget.dataset.id,
          })
      }
    },
    //客人信息子项目
    getMemberKeyWord(e){
        // let info = this.data.info,
        let info = this.data.infoList,
        infoIndex = this.data.infoIndex,
        resourceName = this.data.resourceName;
        let keyName = e.currentTarget.dataset.name;
        let nowIdx = e.currentTarget.dataset.idx;
        var oldVal=this.data.memberList;
        oldVal[nowIdx][keyName] = e.detail.value;

        if(resourceName == 'hotel'){
            if(keyName == 'count' || keyName == 'freeCount'){
                oldVal[nowIdx]['guideRealReimbMoney'] = (Number(oldVal[nowIdx].count || 0) - Number(oldVal[nowIdx].freeCount || 0)) * Number(info[infoIndex].times || 1) * Number(info[infoIndex].price || 0) - Number(info[infoIndex].mCollect || 0);
            }
        }
        if(resourceName == 'restaurant'){
            if(keyName == 'count' || keyName == 'freeCount'){
                oldVal[nowIdx]['guideRealReimbMoney'] = (Number(oldVal[nowIdx].count || 0) - Number(oldVal[nowIdx].freeCount || 0)) * Number(info[infoIndex].times || 1) * Number(info[infoIndex].price || 0);
            }
        }
        if(resourceName == 'visa' || resourceName == 'selfCompany'){
            if(keyName == 'count' || keyName == 'freeCount'){
                oldVal[nowIdx]['guideRealReimbMoney'] = (Number(oldVal[nowIdx].count || 0) - Number(oldVal[nowIdx].freeCount || 0)) * Number(info[infoIndex].price || 0);
            }
        }
        if(resourceName == 'selfCompany'){
            //计算实收金额
            if(keyName == 'count'){
                oldVal[nowIdx]['guideRealReimbReceiveMoney'] = Number(oldVal[nowIdx].count || 0) * Number(info[infoIndex].sellPrice || 0);
            }
            if(keyName == 'guideRealReimbReceiveCount' || keyName == 'freeCount'){
                oldVal[nowIdx]['guideRealReimbMoney'] = (Number(oldVal[nowIdx].guideRealReimbReceiveCount || 0) - Number(oldVal[nowIdx].freeCount || 0)) * Number(info[infoIndex].price || 0);
            }
        }
        if(resourceName == 'scenic'){
            if(keyName == 'count' || keyName == 'freeCount' || keyName == 'childCount' || keyName == 'childFreeCount'){
                oldVal[infoIndex]['guideRealReimbMoney'] = (Number(oldVal[nowIdx].count || 0) - Number(oldVal[nowIdx].freeCount || 0)) * Number(info[infoIndex].price || 0) + (Number(oldVal[nowIdx].childCount || 0) - Number(oldVal[nowIdx].childFreeCount || 0)) * Number(info[infoIndex].childPrice || 0);
            }
            if(keyName == 'sellPrice' || keyName == 'guideRealReimbReceiveCount'){
                oldVal[infoIndex]['guideRealReimbReceiveMoney'] = Number(info[infoIndex].sellPrice || 0) * Number(oldVal[nowIdx].guideRealReimbReceiveCount || 0);
            }
        }
        if(resourceName == 'transportCompany'){
            if(keyName == 'count'){
                oldVal[nowIdx]['guideRealReimbMoney'] = Number(oldVal[nowIdx].count || 0)  * Number(info[infoIndex].price || 0) - Number(info[infoIndex].subsidy || 0);
            }
        }
        if(resourceName == 'insurance'){
            if(keyName == 'count'){
                oldVal[nowIdx]['guideRealReimbMoney'] = Number(oldVal[nowIdx].count || 0)  * Number(info[infoIndex].price || 0);
            }
        }
        if(resourceName == 'hotel' || resourceName == 'restaurant'){
            if(keyName == 'count'){
                oldVal[nowIdx]['guideRealReimbMoney'] = Number(info[infoIndex].times) * Number(info[infoIndex].price || 0) * Number(e.detail.value);
            }
        }
        if(resourceName == 'visa' || resourceName == 'insurance' || resourceName == 'transportCompany'){
            if(keyName == 'count'){
                oldVal[nowIdx]['guideRealReimbMoney'] = Number(info[infoIndex].price || 0) * Number(e.detail.value);
            }
        }
        if(resourceName == 'selfCompany'){
            if(keyName == 'count'){
                oldVal[nowIdx]['guideRealReimbReceiveMoney'] = Number(info[infoIndex].sellPrice || 0) * Number(e.detail.value);
            }
            if(keyName == 'guideRealReimbReceiveCount'){
                oldVal[nowIdx]['guideRealReimbMoney'] = Number(info[infoIndex].price || 0) * Number(e.detail.value);
            }
        }
        this.setData({
            infoList: info,
            memberList: oldVal
        })
    },
    //删除客人信息child
    delMemberChildItem:function(e){
        var nowidx=e.currentTarget.dataset.idx;//当前索引
        var oldInputVal=this.data.inputVal;//所有的input值
        var oldarr=this.data.memberList;//循环内容
        oldarr.splice(nowidx,1);    //删除当前索引的内容，这样就能删除view了
        oldInputVal.splice(nowidx,1);//view删除了对应的input值也要删掉
        // if (oldarr.length < 1) {
        //     oldarr = [0]  //如果循环内容长度为0即删完了，必须要留一个默认的。这里oldarr只要是数组并且长度为1，里面的值随便是什么
        // }
        this.setData({
            memberList:oldarr,
            inputVal: oldInputVal
        })
    },
    //一般输入框
    myinput: function (e) {
        let infoIndex = e.currentTarget.dataset.index;
        let keyName = e.currentTarget.dataset.name;
        var oldVal=this.data.infoList;
        oldVal[infoIndex][keyName] = e.detail.value;
        let memberList = this.data.memberList,
            childList = this.data.infoList[infoIndex].childList,
        resourceName = this.data.resourceName;
        if(resourceName == 'hotel'){
            if(keyName == 'count' || keyName == 'freeCount' || keyName == 'times' || keyName == 'price' || keyName =='mCollect'){
                memberList.forEach(item => {
                    item.guideRealReimbMoney =  (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(oldVal[infoIndex].times || 1) * Number(oldVal[infoIndex].price || 0) - Number(oldVal[infoIndex].mCollect || 0);
                })
                oldVal[infoIndex]['guideRealReimbMoney'] = (Number(oldVal[infoIndex].count || 0) - Number(oldVal[infoIndex].freeCount || 0)) * Number(oldVal[infoIndex].times || 1) * Number(oldVal[infoIndex].price || 0) - Number(oldVal[infoIndex].mCollect || 0);
            }
        }
        if(resourceName == 'hotelv2'){
            let guideRealReimbMoney = 0;
            if(keyName == 'times'){
                childList.forEach(item => {
                    item.guideRealReimbMoney = Number(item.price || 0) * (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(e.detail.value)  + Number(item.otherFee || 0)
                    guideRealReimbMoney += item.guideRealReimbMoney;
                })
                memberList.forEach(item => {
                    item.guideRealReimbMoney = guideRealReimbMoney;
                })
                oldVal[infoIndex]['guideRealReimbMoney'] = guideRealReimbMoney;
            }
        }
        if(resourceName == 'restaurant'){
            if(keyName == 'count' || keyName == 'freeCount' || keyName == 'times' || keyName == 'price'){
                memberList.forEach(item => {
                    item.guideRealReimbMoney =  (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(oldVal[infoIndex].times || 1) * Number(oldVal[infoIndex].price || 0);
                })
                oldVal[infoIndex]['guideRealReimbMoney'] = (Number(oldVal[infoIndex].count || 0) - Number(oldVal[infoIndex].freeCount || 0)) * Number(oldVal[infoIndex].times || 1) * Number(oldVal[infoIndex].price || 0);
            }
        }
        if(resourceName == 'visa'){
            if(keyName == 'count' || keyName == 'freeCount' || keyName == 'price'){
                memberList.forEach(item => {
                    item.guideRealReimbMoney =  (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(oldVal[infoIndex].price || 0);
                })
                oldVal[infoIndex]['guideRealReimbMoney'] = (Number(oldVal[infoIndex].count || 0) - Number(oldVal[infoIndex].freeCount || 0)) * Number(oldVal[infoIndex].price || 0);
            }
        }
        if(resourceName == 'scenic'){
            if(keyName == 'count' || keyName == 'freeCount' || keyName == 'price' || keyName == 'childCount' || keyName == 'childFreeCount' || keyName == 'childPrice'){
                memberList.forEach(item => {
                    item.guideRealReimbMoney = (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(oldVal[infoIndex].price || 0) + (Number(item.childCount || 0) - Number(item.childFreeCount || 0)) * Number(oldVal[infoIndex].childPrice || 0);
                })
                oldVal[infoIndex]['guideRealReimbMoney'] = (Number(oldVal[infoIndex].count || 0) - Number(oldVal[infoIndex].freeCount || 0)) * Number(oldVal[infoIndex].price || 0) + (Number(oldVal[infoIndex].childCount || 0) - Number(oldVal[infoIndex].childFreeCount || 0)) * Number(oldVal[infoIndex].childPrice || 0);
            }
            if(keyName == 'sellPrice' || keyName == 'guideRealReimbReceiveCount'){
                memberList.forEach(item => {
                    item.guideRealReimbReceiveMoney = Number(oldVal[infoIndex].sellPrice || 0) * Number(item.guideRealReimbReceiveCount || 0);
                })
                oldVal[infoIndex]['guideRealReimbReceiveMoney'] = Number(oldVal[infoIndex].sellPrice || 0) * Number(oldVal[infoIndex].guideRealReimbReceiveCount || 0);
            }
        }
        if(resourceName == 'transportCompany'){
            if(keyName == 'count' || keyName == 'price' || keyName == 'subsidy'){
                memberList.forEach(item => {
                    item.guideRealReimbMoney =  Number(item.count || 0)  * Number(oldVal[infoIndex].price || 0) - Number(oldVal[infoIndex].subsidy || 0);
                })
                oldVal[infoIndex]['guideRealReimbMoney'] = Number(oldVal[infoIndex].count || 0)  * Number(oldVal[infoIndex].price || 0) - Number(oldVal[infoIndex].subsidy || 0);
            }
        }
        if(resourceName == 'insurance'){
            if(keyName == 'count' || keyName == 'price'){
                memberList.forEach(item => {
                    item.guideRealReimbMoney =  Number(item.count || 0)  * Number(oldVal[infoIndex].price || 0);
                })
                oldVal[infoIndex]['guideRealReimbMoney'] = Number(oldVal[infoIndex].count || 0)  * Number(oldVal[infoIndex].price || 0);
            }
        }
        if(resourceName == 'selfCompany'){
            //计算实收金额
            if(keyName == 'count' || keyName == 'sellPrice'){
                memberList.forEach(item => {
                item.guideRealReimbReceiveMoney =  Number(item.count || 0) * Number(oldVal[infoIndex].sellPrice || 0);
                })
                oldVal[infoIndex]['guideRealReimbReceiveMoney'] = Number(oldVal[infoIndex].count || 0) * Number(oldVal[infoIndex].sellPrice || 0);
            }
            if(keyName == 'guideRealReimbReceiveCount' || keyName == 'freeCount' || keyName == 'price'){
                memberList.forEach(item => {
                    item.guideRealReimbMoney =  (Number(item.guideRealReimbReceiveCount || 0) - Number(item.freeCount || 0)) * Number(oldVal[infoIndex].price || 0);
                })
                oldVal[infoIndex]['guideRealReimbMoney'] = (Number(oldVal[infoIndex].guideRealReimbReceiveCount || 0) - Number(oldVal[infoIndex].freeCount || 0)) * Number(oldVal[infoIndex].price || 0);
            }
        }
        this.setData({
            // info: oldVal,
            infoList: oldVal,
            memberList: memberList,
            childList: childList,
        })
        if(keyName == 'count' || keyName == 'dictionary' || keyName == 'orderDate'){
            if(resourceName != 'shop'){
                if(oldVal[infoIndex].resourceId && oldVal[infoIndex].dictionary){
                  if(!oldVal[infoIndex].price){
                    this.getFindContractPrice(infoIndex);
                  }
                  if(!oldVal[infoIndex].freeCount){
                    this.getFindFreeCount(infoIndex);
                  }
                }
            }
            
        }
        if(keyName == 'dictionary' || keyName == 'orderDate' || keyName == 'buyMoney'){
            if(resourceName == 'shop' || resourceName == 'scenic' || resourceName == 'selfCompany'){
                if(oldVal[infoIndex].resourceId){
                    this.getFindRate(infoIndex)
                }
               
            }
        }
    },
    //收款方式
    bindCashTypeChange: function (e) {
        let infoList = this.data.infoList;
        let infoIndex = e.currentTarget.dataset.index;
        infoList[infoIndex].cashTypeName = this.data.cashTypeList[e.detail.value]['name'];
        infoList[infoIndex].cashType = this.data.cashTypeList[e.detail.value]['type'];
        this.setData({
            infoList: infoList,
            cashTypeidx: e.detail.value,
            cashType: this.data.cashTypeList[e.detail.value]['type'],
        })
        if(this.data.cashType == 'guideSign' && infoList[infoIndex].resourceId && infoList[infoIndex].mealType){
          this.getSignNumber(infoIndex);
        }
    },
    //自费项付款方式
    bindChildCashTypeChange: function(e){
        let infoList = this.data.infoList;
        let infoIndex = e.currentTarget.dataset.index;
        let childList = this.data.infoList[infoIndex].childList;
        let inx = e.currentTarget.dataset.indx;
        childList[inx].name = this.data.selfv2cashTypeList[e.detail.value]['name'];
        childList[inx].cashType = this.data.selfv2cashTypeList[e.detail.value]['type'];
        this.setData({
            infoList: infoList,
            childList: childList,
        })
    },
    //用餐类别
    bindMealTypeChange: function (e) {
      let infoList = this.data.infoList;
      let infoIndex = e.currentTarget.dataset.index;
      infoList[infoIndex].mealTypeText = this.data.mealTypeList[e.detail.value]['name'];
      infoList[infoIndex].mealType = this.data.mealTypeList[e.detail.value]['type'];
      this.setData({
          infoList: infoList,
          mealTypeIdx: e.detail.value,
          mealType: this.data.mealTypeList[e.detail.value]['type'],
      })
    },
    //记账备注弹窗
    getRemark: function (e) {
        let childIdx = e.currentTarget.dataset.idx,
            childKeyName = e.currentTarget.dataset.name,
            childKeyValue = e.currentTarget.dataset.value,
            infoIndex = e.currentTarget.dataset.index;
        this.setData({
            isShowDialog: true,
            infoIndex: infoIndex,
            childIdx: childIdx,
            childKeyName: childKeyName,
            childKeyValue: childKeyValue,
            remarkKeyWord: childKeyValue,
        })
    },
    //取消
    cancelDailog(){
        this.setData({
            isShowDialog: false,
            guideRealReimbRemark: this.data.guideRealReimbRemark,
            remarkKeyWord: '',
            childKeyValue: '',
        })
    },
    //记账备注保存信息
    saveRemarkInfo: function(event) {
        let childIdx = this.data.childIdx,
        infoIndex = this.data.infoIndex,
        childKeyName = this.data.childKeyName,
        remarkKeyWord = this.data.remarkKeyWord,
        infoList = this.data.infoList,
        oldVal = this.data.memberList;
        if(childIdx != undefined){
            oldVal[childIdx][childKeyName] = remarkKeyWord;
            this.setData({
                infoList: infoList,
                isShowDialog: false,
                memberList: oldVal,
                remarkKeyWord: '',
            })
           
        }else {
            infoList[infoIndex].guideRealReimbRemark = this.data.remarkKeyWord;
            this.setData({
                infoList: infoList,
                isShowDialog: false,
                guideRealReimbRemark: this.data.remarkKeyWord,
                remarkKeyWord: '',
            })
        }
    },
    //添加子项目-房间&门票
    getKeyWord(e){
        let infoIndex = e.currentTarget.dataset.index,
        infoList = this.data.infoList;
        let keyName = e.currentTarget.dataset.name;
        let nowIdx = e.currentTarget.dataset.idx;
        var oldVal = this.data.infoList[infoIndex].childList;
        oldVal[nowIdx][keyName] = e.detail.value;
        let resourceName = this.data.resourceName,
        memberList = this.data.memberList;
        if(resourceName == 'scenicv2'){
            let guideRealReimbMoney = 0;
            if(keyName == 'count' || keyName == 'price'){
                oldVal.forEach(item => {
                    item.guideRealReimbMoney = Number(item.price || 0) * Number(item.count || 0);
                    guideRealReimbMoney += item.guideRealReimbMoney;
                })
                memberList.forEach(item => {
                    item.guideRealReimbMoney = guideRealReimbMoney;
                })
                infoList[infoIndex]['guideRealReimbMoney'] = guideRealReimbMoney;
            }
        }
        if(resourceName == 'hotelv2'){
            let guideRealReimbMoney = 0;
            if(keyName == 'count' || keyName == 'freeCount' || keyName == 'price' || keyName == 'otherFee'){
                oldVal.forEach(item => {
                    item.guideRealReimbMoney = Number(item.price || 0) * (Number(item.count || 0) - Number(item.freeCount || 0)) * Number(infoList[infoIndex].times || 1)  + Number(item.otherFee || 0);
                    guideRealReimbMoney += item.guideRealReimbMoney;
                })
                memberList.forEach(item => {
                    item.guideRealReimbMoney = guideRealReimbMoney;
                })
                infoList[infoIndex]['guideRealReimbMoney'] = guideRealReimbMoney;
            }
        }
        if(resourceName == 'selfv2Company'){
            let guideRealReimbMoney = 0;
            if(keyName == 'count' || keyName == 'price' || keyName == 'otherFee'){
                oldVal.forEach(item => {
                    item.guideRealReimbMoney = Number(item.price || 0) * Number(item.count || 0) + Number(item.otherFee || 0);
                    guideRealReimbMoney += item.guideRealReimbMoney;
                })
                memberList.forEach(item => {
                    item.guideRealReimbMoney = guideRealReimbMoney;
                })
                infoList[infoIndex]['guideRealReimbMoney'] = guideRealReimbMoney;
            }
        }

        if(keyName == 'buyMoney'){
            if(resourceName == 'shop'){
                if(infoList[infoIndex].resourceId){
                    this.getFindRate(infoIndex)
                }
               
            }
        }
        this.setData({
            infoList: infoList,
            memberList: memberList,
            childList: oldVal
        })
    },
    //房间门票子项目操作
    addChildListItem(e){
        let infoIndex = e.currentTarget.dataset.index,
        infoList = this.data.infoList;
        var old= this.data.infoList[infoIndex].childList,
        resourceName = this.data.resourceName;
        let cashType = '';
        if(resourceName == 'selfv2Company'){
            if(this.data.pageType == 'add'){
                cashType = this.data.travelAgencyConfig.guideAppDefaultCashType;
            }else {
                cashType = infoList[infoIndex].cashType;
            }
        let cashTypeName = api.getcashTypeText(cashType);
            old.push({price: '', cashType: cashType, name: cashTypeName});
        }else{
            old.push({price: ''});
        }
        this.setData({
            infoList: infoList,
            childList: old,
        })
    },
    //删除input
    delChildItem:function(e){
        let resourceName = this.data.resourceName,
        memberList = this.data.memberList,
        infoIndex = e.currentTarget.dataset.index,
        infoList = this.data.infoList;
        var nowidx=e.currentTarget.dataset.idx;//当前索引
        var oldInputVal=this.data.inputVal;//所有的input值
        var oldarr=this.data.infoList[infoIndex].childList;//循环内容
        if (!!oldarr[nowidx].id) {
            const nowidxId = oldarr[nowidx].id;
            oldarr[nowidx] = {
                id: nowidxId,
                isDelete: 1,
            }
        } else {
            oldarr.splice(nowidx,1);    //删除当前索引的内容，这样就能删除view了
        }
        oldInputVal.splice(nowidx,1);//view删除了对应的input值也要删掉
        // if (oldarr.length < 1) {
        //     oldarr = [0]  //如果循环内容长度为0即删完了，必须要留一个默认的。这里oldarr只要是数组并且长度为1，里面的值随便是什么
        // }
        if(resourceName == 'hotelv2' || resourceName == 'scenicv2'){
            let guideRealReimbMoney = 0;
                oldarr.forEach(item => {
                    if(resourceName == 'hotelv2'){
                        item.guideRealReimbMoney = Number(infoList[infoIndex].times || 0) * Number(item.price || 0) * Number(item.count || 0);
                    }
                    if(resourceName == 'scenicv2'){
                        item.guideRealReimbMoney = Number(item.price || 0) * Number(item.count || 0);
                    }
                    guideRealReimbMoney += item.guideRealReimbMoney;
                })
                memberList.forEach(item => {
                    item.guideRealReimbMoney = guideRealReimbMoney;
                })
                infoList[infoIndex]['guideRealReimbMoney'] = guideRealReimbMoney;
        }
        this.setData({
            infoList: infoList,
            memberList: memberList,
            childList:oldarr,
        })
    },
    //删除客人信息
    delChildMemberItem:function(e){
        var nowidx=e.currentTarget.dataset.idx;//当前索引
        // var oldInputVal=this.data.inputVal;//所有的input值
        var oldarr=this.data.memberList;//循环内容
        oldarr.splice(nowidx,1);    //删除当前索引的内容，这样就能删除view了
        // oldInputVal.splice(nowidx,1);//view删除了对应的input值也要删掉
        // if (oldarr.length < 1) {
        //     oldarr = [0]  //如果循环内容长度为0即删完了，必须要留一个默认的。这里oldarr只要是数组并且长度为1，里面的值随便是什么
        // }
        this.setData({
            memberList:oldarr,
            guideRealReimbRemark: '',
            // inputVal: oldInputVal
        })
    },
    //加点选中
    checkAddChecked: function(e) {
        var that = this;
        let infoIndex = e.currentTarget.dataset.index,
        infoList = this.data.infoList;
        this.data.infoList[infoIndex].isGuideExtra = !this.data.infoList[infoIndex].isGuideExtra;
        that.setData({
            infoList: infoList,
            isGuideExtra: this.data.isGuideExtra,
        })
    },
    getSearchList(e){
        let method = e.currentTarget.dataset.method,
        type = e.currentTarget.dataset.type,
        code = e.currentTarget.dataset.code,
        infoIndex = e.currentTarget.dataset.index;
        this.setData({
            childItemIdx: e.currentTarget.dataset.idx,
            infoIndex: infoIndex,
        })
        wx.navigateTo({
            url: '../searchList/searchList?id='+ this.data.id + '&method=' + method + '&type=' + type + '&code=' + code + '&resourceId=' + this.data.info.resourceId,
        })
    },
    //上传图片
    previewImage: function (e) {
        var current = e.target.dataset.src;
        let infoIndex = e.currentTarget.dataset.index,
        infoList = this.data.infoList;
        wx.previewImage({
            current: current,
            urls: this.data.infoList[infoIndex].detailPics
        })
    },
    delImg: function (e) {
        let index = e.currentTarget.dataset.index,
        indx = e.currentTarget.dataset.indx,
        infoList = this.data.infoList;
        let imageList = infoList[index].detailPics;
        imageList.splice(indx, 1);
        infoList[index].detailPics = imageList;
        let original = infoList[index].originalList;
        original.splice(indx, 1);
        infoList[index].originalList = original;  
        this.setData({
            infoList: infoList,
        });
    },
    //上传图片
    uploadDetailImage: function (e) { //这里是选取图片的方法
        let infoIndex = e.currentTarget.dataset.index,
        infoList = this.data.infoList;
        var that = this;
        var detailPics = this.data.infoList[infoIndex].detailPics,
        originalList = this.data.infoList[infoIndex].originalList;
        if (detailPics.length >= that.data.count) {
        wx.showToast({
            title: '最多选择' + that.data.count + '张！',
        })
        return;
        }
        wx.chooseMedia({
        count: that.data.count, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function (res) {
            var imgs = res.tempFiles;
            let size = res.tempFiles.every(item => {   //限制上传图片大小为2M,所有图片少于2M才能上传
                return item.size <= 2000000
              })
              if (size) {
                wx.uploadFile({
                    filePath: res.tempFiles[0].tempFilePath,
                    name: 'file',
                    url: app.apiUrl + '/back/erp/upload.do?method=appUploadImage&token=' + wx.getStorageSync('user').token,
                  //   formData: {
                  //       token: wx.getStorageSync('user').token
                  //   },
                    success: (res) => {
                        let data = JSON.parse(res.data);
                          that.data.infoList[infoIndex].detailPics = [...detailPics, data.url];
                          that.data.infoList[infoIndex].originalList = [...originalList, data.original];
                          that.setData({
                              infoList: infoList,
                          })
                    }
                  })
              }else{
                api.showTips('上传图片不能大于2M!')
              }
        },
        })
    },

    //保存
    saveRescource(e){
        let url = '',
        resourceName = this.data.resourceName,
        travelAgencyConfig = this.data.travelAgencyConfig,
        infoList = this.data.infoList;
        if(this.data.pageType =='add'){
            let addResourceName = api.toSUpper(this.data.resourceName);
            if(addResourceName == 'Transportcompany'){
                addResourceName = 'TransportCompany';
            }
            if(addResourceName == 'Selfcompany'){
                addResourceName = 'SelfCompany';
            }
            if(addResourceName == 'Selfv2company'){
                addResourceName = 'Selfv2Company'
            }
            url = app.apiUrl + '/back/erp/app/guide/addReimb.do?method=add'+ addResourceName +'OrderReimb'
          }else{
            url = app.apiUrl + '/back/erp/app/guide/reimb.do?method='+ this.data.resourceName +'OrderReimb'
          }
        let param = {
            planGuideReimbId: this.data.pageType == 'add' ? this.data.id : '',
            // payType
            // orderDate: this.data.date,
            // cashType: this.data.cashType,
            // signNumber: this.data.signNumber,
            customerOrderId: this.data.customerOrderId,
            // guideRealReimbMoney: this.data.info.price,
            // guideRealReimbRemark: this.data.guideRealReimbRemark,
        };
        infoList.forEach(item => {
            if(resourceName != 'selfv2Company'){
                param.cashType = item.cashType;
            }
            param.orderDate = item.orderDate;
            param.signNumber = item.signNumber || '';
            param.guideRealReimbRemark = item.guideRealReimbRemark || '';
            param.guideRealReimbImage = item.originalList;
            param.guideRealReimbMoney = item.guideRealReimbMoney || 0;
        })
        if(resourceName == 'hotel'){
            infoList.forEach(item => {
                param.hotelId = item.resourceId;
                param.hotelType = item.dictionary;
                param.freeCount = item.freeCount;
                param.times = item.times;
                // param.price = item.price;
                param.count = item.count;
                // param.guideRealReimbMoney = item.guideRealReimbMoney;
                param.cashType = item.cashType;
                if(travelAgencyConfig.guideAppHidePriceInfoWithGuide == 1 && item.cashType == 'guide'){
                    param.price = 0;
                  }else if(travelAgencyConfig.guideAppHidePriceInfoWithGuideSign == 1 && item.cashType == 'guideSign') {
                    param.price = 0;
                  }else {
                    param.price = item.price;
                  }
            })
        }
        if(resourceName == 'hotelv2'){
            infoList.forEach(item => {
                param.hotelv2Id = item.resourceId;
                param.times = item.times;
                param.hotelv2RoomOrderJson = JSON.stringify(item.childList);
                param.guideRealReimbMoney = item.guideRealReimbMoney;
            })
        }
        if(resourceName == 'shop'){
            infoList.forEach(item => {
                param.shopId = item.resourceId;
                param.buyMemberCount = item.buyMemberCount;
                param.shopGoodsOrderJson = JSON.stringify(item.childList);
                if(travelAgencyConfig.guideAppCanInputDriverAndAccompanyRebate == 1){
                    param.driverRebate = item.driverRebate;
                    param.accompanyRebate = item.accompanyRebate;
                }
            })

        }
        if(resourceName == 'selfCompany'){
            infoList.forEach(item => {
                param.selfCompanyId = item.resourceId;
                param.selfType = item.dictionary;
                param.sellPrice = item.sellPrice;
                // param.price = item.price;
                if(travelAgencyConfig.guideAppHidePriceInfoWithGuide == 1 && item.cashType == 'guide'){
                    param.price = 0;
                  }else if(travelAgencyConfig.guideAppHidePriceInfoWithGuideSign == 1 && item.cashType == 'guideSign') {
                    param.price = 0;
                  }else {
                    param.price = item.price;
                  }
            })
        }
        if(resourceName == 'selfv2Company'){
            infoList.forEach(item => {
                param.guideRealReimbMoney = item.price;
                param.selfv2CompanyId = item.resourceId;
                param.selfv2Type = item.dictionary;
                param.sellPrice = item.sellPrice;
                param.price = item.price;
                param.count = item.count;
                param.guideRealReimbReceiveCount = item.guideRealReimbReceiveCount;
                param.guideRealReimbReceiveMoney = item.guideRealReimbReceiveMoney;
                param.selfProjectCompanyOrderJson = JSON.stringify(item.childList);
            })
        }
        if(resourceName == 'scenic'){
            infoList.forEach(item => {
                param.scenicId = item.resourceId;
                param.ticketType = item.dictionary;
                param.isGuideExtra = item.isGuideExtra == false ? 0 : 1;
                // if(param.isGuideExtra == 1){
                    param.guideRealReimbReceiveCount = item.guideRealReimbReceiveCount || 0;
                    param.sellPrice = item.sellPrice || 0;
                    if(travelAgencyConfig.guideAppCanInputDriverAndAccompanyRebate == 1){
                        param.driverRebate = item.driverRebate || 0;
                        param.accompanyRebate = item.accompanyRebate || 0;
                    }
                    param.guideRealReimbReceiveMoney = item.guideRealReimbReceiveMoney || 0;
                    param.childSellPrice = item.childSellPrice || 0;
                    param.childPrice = item.childPrice || 0;
                    param.guideRealReimbReceiveChildCount = item.guideRealReimbReceiveChildCount || 0;
                    param.childCount = item.childCount || 0;
                    param.childFreeCount = item.childFreeCount || 0;
                    param.accompanySellPrice = item.accompanySellPrice || 0;
                    param.accompanyPrice = item.accompanyPrice || 0;
                    param.guideRealReimbReceiveAccompanyCount = item.guideRealReimbReceiveAccompanyCount || 0;
                    param.accompanyCount = item.accompanyCount || 0;
                    param.accompanyFreeCount = item.accompanyFreeCount || 0;
                    param.guideRealReimbMoney = item.guideRealReimbMoney || 0;
                // }
                param.count = item.count || 0;
                param.freeCount = item.freeCount || 0;
                param.price = item.price || 0;
            })
        }
        if(resourceName == 'scenicv2'){
            infoList.forEach(item => {
                param.scenicv2Id = item.resourceId;
                param.scenicv2TicketOrderJson = JSON.stringify(item.childList);
            })
        }

        if(resourceName == 'restaurant'){
            infoList.forEach(item => {
                param.restaurantId = item.resourceId;
                param.foodType = item.dictionary;
                param.mealType = item.mealType;
                param.freeCount = item.freeCount;
                param.times = item.times;
                param.count = item.count;
                // param.price = item.price;
                if(travelAgencyConfig.guideAppHidePriceInfoWithGuide == 1 && item.cashType == 'guide'){
                    param.price = 0;
                  }else if(travelAgencyConfig.guideAppHidePriceInfoWithGuideSign == 1 && item.cashType == 'guideSign') {
                    param.price = 0;
                  }else {
                    param.price = item.price;
                  }
            })
        }

        if(resourceName == 'visa'){
            infoList.forEach(item => {
                param.visaId = item.resourceId;
                param.visaType = item.dictionary;
                param.freeCount = item.freeCount;
                param.count = item.count;
                // param.price = item.price;
                if(travelAgencyConfig.guideAppHidePriceInfoWithGuide == 1 && item.cashType == 'guide'){
                    param.price = 0;
                  }else if(travelAgencyConfig.guideAppHidePriceInfoWithGuideSign == 1 && item.cashType == 'guideSign') {
                    param.price = 0;
                  }else {
                    param.price = item.price;
                  }
            })
        }

        if(resourceName == 'transportCompany'){
            infoList.forEach(item => {
                param.transportCompanyId = item.resourceId;
                param.transportType = item.dictionary;
                param.startPosition = item.startPosition || '';
                param.destinationPosition = item.destinationPosition || '';
                param.shiftNumber = item.shiftNumber || '';
                param.count = item.count || 0;
                // param.price = item.price;
                if(travelAgencyConfig.guideAppHidePriceInfoWithGuide == 1 && item.cashType == 'guide'){
                    param.price = 0;
                  }else if(travelAgencyConfig.guideAppHidePriceInfoWithGuideSign == 1 && item.cashType == 'guideSign') {
                    param.price = 0;
                  }else {
                    param.price = item.price;
                  }
            })
        }

        if(resourceName == 'insurance'){
            infoList.forEach(item => {
                param.insuranceId = item.resourceId;
                param.insuranceType = item.dictionary;
                param.count = item.count;
                // param.price = item.price;
                if(travelAgencyConfig.guideAppHidePriceInfoWithGuide == 1 && item.cashType == 'guide'){
                    param.price = 0;
                  }else if(travelAgencyConfig.guideAppHidePriceInfoWithGuideSign == 1 && item.cashType == 'guideSign') {
                    param.price = 0;
                  }else {
                    param.price = item.price;
                  }
            })
        }

        if(this.data.memberList.length != 0){
        // if(this.data.pageType =='add'){
            this.data.memberList.forEach((item, index) => {
                param.customerOrderId = item.customerOrderId;
                if(resourceName != 'hotelv2'){
                    param.count = item.adultCount + item.childCount;
                }
                if(resourceName == 'selfCompany'){
                    param.guideRealReimbReceiveCount = item.guideRealReimbReceiveCount;
                    param.guideRealReimbReceiveMoney = item.guideRealReimbReceiveMoney;
                    param.count = item.count;
                    param.freeCount = item.freeCount;
                }
                if(resourceName == 'selfv2Company'){
                    param.guideRealReimbReceiveCount = item.guideRealReimbReceiveCount;
                    param.guideRealReimbReceiveMoney = item.guideRealReimbReceiveMoney;
                    param.guideRealReimbRemark = item.remark;
                }
                if(resourceName == 'scenic'){
                    param.count = item.count;
                    param.guideRealReimbReceiveCount = item.guideRealReimbReceiveCount;
                    param.freeCount = item.freeCount;
                    param.guideRealReimbReceiveChildCount = item.guideRealReimbReceiveChildCount;
                    param.childCount = item.childCount;
                    param.childFreeCount = item.childFreeCount;
                    param.guideRealReimbReceiveAccompanyCount = item.guideRealReimbReceiveAccompanyCount;
                    param.accompanyCount = item.accompanyCount;
                    param.accompanyFreeCount = item.accompanyFreeCount;
                    param.guideRealReimbMoney = item.guideRealReimbMoney;
                    if(travelAgencyConfig.guideAppCanInputDriverAndAccompanyRebate == 1){
                        param.driverRebate = item.driverRebate;
                        param.accompanyRebate = item.accompanyRebate;
                    }
                    // param.guideRealReimbReceiveMoney = item.guideRealReimbReceiveMoney;
                    // param.sellPrice = item.sellPrice;
                    // param.price = item.price;
                    // param.childSellPrice = item.childSellPrice;
                    // param.childPrice = item.childPrice;
                    // param.accompanySellPrice = item.accompanySellPrice;
                    // param.accompanyPrice = item.accompanyPrice;

                }
                // if(resourceName == 'scenicv2' || resourceName == 'restaurant'){
                    param.guideRealReimbMoney = item.guideRealReimbMoney || 0;
                // }
                param.guideRealReimbRemark = item.remark;
                http.requestPostApi(url, param, this, res => {
                    if (res.success === '1') {
                        if(index == this.data.memberList.length - 1){
                            api.showTips(res.message, () => {
                                wx.navigateBack({
                                    delta: 1
                                })
                            })
                        }
                    }
                })
            })
        }else {
            infoList.forEach((item, index) => {
                if(resourceName == 'selfCompany'){
                    param.guideRealReimbReceiveCount = item.guideRealReimbReceiveCount;
                    param.guideRealReimbReceiveMoney = item.guideRealReimbReceiveMoney;
                    param.count = item.count;
                    param.freeCount = item.freeCount;
                }
                // if(resourceName == 'selfv2Company'){
                //     param.guideRealReimbMoney = item.guideRealReimbMoney;
                //     param.guideRealReimbRemark = item.guideRealReimbRemark;
                // }
                if(resourceName == 'scenicv2'){
                    param.scenicv2Id = item.resourceId;
                    param.scenicv2TicketOrderJson = JSON.stringify(item.childList);
                }
                if(this.data.pageType == 'edit'){
                    param.id = item.id;
                }
                http.requestPostApi(url, param, this, res => {
                    if (res.success === '1') {
                        if(index == this.data.infoList.length - 1){
                            api.showTips(res.message, () => {
                                wx.navigateBack({
                                    delta: 1
                                })
                            })
                        }
                    }
                })
            })
        }
    },
    //获取可选游客名单
    getMemberList(){
        let url = app.apiUrl + '/back/erp/app/guide/common.do?method=findAllCusutomerOrderTripNumber',
        param = {
            planGuideReimbId: this.data.id,
        };
        app.http.requestPostApi(url, param, this, res => {
        if (res.success === '1') {
            this.setData({
                groupList: [...res.data]
            })
        }
        })
    },
    //日志
    getGuideLog(e){
        let type = e.currentTarget.dataset.type,
        id = e.currentTarget.dataset.id,
        childId = e.currentTarget.dataset.childid;
        type = api.toSUpper(type);
        let method = 'find'+type+'OrderLog';
        if(!!childId){
          wx.navigateTo({
            url: '../logList/logList?type=resourceChild&title='+e.currentTarget.dataset.title + '&id='+ childId + '&method=' + method,
          })
        }else {
          wx.navigateTo({
            url: '../logList/logList?type=resource&title='+e.currentTarget.dataset.type + '&id='+ id + '&method=' + method,
          })
        }
    },
    //获取协议价格
    getFindContractPrice(infoIndex){
        var oldVal=this.data.infoList,
            childList = this.data.infoList[infoIndex].childList,
            childItemIdx = this.data.childItemIdx;
        let url = app.apiUrl + '/back/erp/app/guide/contract.do?method=findContractPrice',
        param = {
            resourceId: oldVal[infoIndex].resourceId,
            resourceType: this.data.resourceName,
            type: oldVal[infoIndex].dictionary,
            orderDate: oldVal[infoIndex].orderDate,
            // orderEndDate
        };
        app.http.requestPostApi(url, param, this, res => {
            if (res.success === '1') {
                if(this.data.resourceName == 'hotelv2' || this.data.resourceName == 'scenicv2'){
                    childList[childItemIdx].price = res.data.price;
                }else {
                    oldVal[infoIndex].price = res.data.price;
                }
                this.setData({
                    infoList: oldVal,
                })
            }
        })
    },
    //获取协议免去数量
    getFindFreeCount(infoIndex){
        var oldVal=this.data.infoList,
            resourceName = this.data.resourceName,
            childList = this.data.infoList[infoIndex].childList,
            childItemIdx = this.data.childItemIdx;
        let url = app.apiUrl + '/back/erp/app/guide/contract.do?method=findFreeCount',
        param = {
            resourceId: oldVal[infoIndex].resourceId,
            resourceType: this.data.resourceName,
            type: oldVal[infoIndex].dictionary,
            orderDate: oldVal[infoIndex].orderDate,
            count: resourceName != 'hotelv2' ? (oldVal[infoIndex].count || 0) : (childList[childItemIdx].count || 0),
        };
        app.http.requestPostApi(url, param, this, res => {
            if (res.success === '1') {
                if(this.data.resourceName == 'hotelv2' || this.data.resourceName == 'scenicv2'){
                    childList[childItemIdx].freeCount = res.data.freeCount;
                }else {
                    oldVal[infoIndex].freeCount = res.data.freeCount;
                }
                this.setData({
                    infoList: oldVal,
                })
            }
        })
    },
    //获取协议返佣比例
    getFindRate(infoIndex){
        var oldVal=this.data.infoList;
        let url = app.apiUrl + '/back/erp/app/guide/contract.do?method=findRate',
        param = {
            resourceId: oldVal[infoIndex].resourceId,
            resourceType: this.data.resourceName,
            type: oldVal[infoIndex].dictionary,
            orderDate: oldVal[infoIndex].orderDate,
        };
        app.http.requestPostApi(url, param, this, res => {
            if (res.success === '1') {
                let resourceName = this.data.resourceName,
                    childItemIdx = this.data.childItemIdx,
                    infoList = this.data.infoList,
                    childList = this.data.infoList[infoIndex].childList;
                    if(resourceName == 'shop'){
                        childList.forEach((item, index) => {
                            if(index == childItemIdx){
                                item.driverRebate = (res.data.driverRate || 0) * (item.buyMoney || 0);
                                item.accompanyRebate = (res.data.accompanyRate || 0) * (item.buyMoney || 0);
                            }
                        })
                    }else if(resourceName == 'scenic'){
                        let receiveTotal = Number(infoList[infoIndex].count || 0) + Number(infoList[infoIndex].guideRealReimbReceiveChildCount || 0);
                        infoList[infoIndex].driverRebate = (receiveTotal - (Number(infoList[infoIndex].count || 0) * Number(infoList[infoIndex].price || 0) + Number(infoList[infoIndex].guideRealReimbReceiveChildCount || 0) * Number(infoList[infoIndex].childPrice || 0))) * (res.data.driverRate || 0);

                        infoList[infoIndex].accompanyRebate = (receiveTotal - (Number(infoList[infoIndex].count || 0) * Number(infoList[infoIndex].price || 0) + Number(infoList[infoIndex].guideRealReimbReceiveChildCount || 0) * Number(infoList[infoIndex].childPrice || 0))) * (res.data.accompanyRate || 0);
                    }else {
                        let receiveTotal = Number(infoList[infoIndex].count || 0) * Number(infoList[infoIndex].sellPrice || 0);
                        infoList[infoIndex].driverRebate = (receiveTotal - (Number(infoList[infoIndex].count || 0) * Number(infoList[infoIndex].price || 0))) * (res.data.driverRate || 0);
                        infoList[infoIndex].accompanyRebate = (receiveTotal - (Number(infoList[infoIndex].count || 0) * Number(infoList[infoIndex].price || 0))) * (res.data.accompanyRate || 0);
                    }
                this.setData({
                    infoList: oldVal,
                })
            }
        })
    },
    //获取签单号
    getSignNumberList(){
        var oldVal=this.data.infoList;
        let url = app.apiUrl + '/back/erp/app/guide/common.do?method=findSignNumberList',
        param = {
            planGuideReimbId: this.data.id,
            sheetType: this.data.resourceName,
        };
        app.http.requestPostApi(url, param, this, res => {
            if (res.success === '1') {
                if(res.data.length == 0){
                    api.showTips('无可用签单号')
                }else {
                    this.setData({
                      isShowSignNumber: true,
                      signNumberList: res.data,
                    })
                }
            }
        })
    },
    //获取资源已绑定的签单表
    getSignNumber(infoIndex){
        var oldVal=this.data.infoList;
        let url = app.apiUrl + '/back/erp/app/guide/common.do?method=findResourceSignNumber',
        param = {
            planGuideReimbId: this.data.id,
            resourceType: this.data.resourceName,
            resourceId: oldVal[infoIndex].resourceId,
        };
        if(this.data.resourceName == 'restaurant'){
          param.resourceItemType = oldVal[infoIndex].mealType;
        }
        app.http.requestPostApi(url, param, this, res => {
            if (res.success === '1') {
                if (res.success === '1') {
                    oldVal[infoIndex].signNumber = res.data.signNumber;
                    this.setData({
                        infoList: oldVal,
                    })
                }
            }
        })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

      wx.setNavigationBarTitle({
        title: this.data.pageName,
      })
        
      this.getMemberList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let resoureInfo = wx.getStorageSync('resoureInfo');
    var oldVal=this.data.infoList,
    infoIndex = this.data.infoIndex;
    let resourceName = this.data.resourceName,
    childItemIdx = this.data.childItemIdx,
    childList = this.data.infoList[infoIndex].childList;
    if(resourceName == 'hotelv2' || resourceName == 'shop' || resourceName == 'selfv2Company' || resourceName == 'scenicv2'){
        childList.forEach((item, index) => {
            if(index == childItemIdx){
                if(resourceName == 'hotelv2'){
                    item.roomType = !!resoureInfo.dictionary ? resoureInfo.dictionary : item.roomType;
                }
                if(resourceName == 'shop'){
                    item.goods = !!resoureInfo.dictionary ? resoureInfo.dictionary : item.goods;
                }
                if(resourceName == 'selfv2Company'){
                    item.project = !!resoureInfo.dictionary ? resoureInfo.dictionary : item.project;
                }
                if(resourceName == 'scenicv2'){
                    item.ticketType = !!resoureInfo.dictionary ? resoureInfo.dictionary : item.ticketType;
                }
            }
        })
        for (let [key,value] of Object.entries(resoureInfo)){
            oldVal[infoIndex][key] = !!resoureInfo[key] ? resoureInfo[key] : oldVal[infoIndex][key];   
        }

    }else {
        for (let [key,value] of Object.entries(resoureInfo)){ 
            oldVal[infoIndex][key] = !!resoureInfo[key] ? resoureInfo[key] : oldVal[infoIndex][key];        
        }
    }
    this.setData({
        infoList: oldVal,
        // childList: childList,
    })
    if(resoureInfo.resourceId && resoureInfo.dictionary){
        if(resourceName != 'shop'){
          if(!oldVal[infoIndex].price){
            this.getFindContractPrice(infoIndex);
          }
          if(!oldVal[infoIndex].freeCount){
            this.getFindFreeCount(infoIndex);
          }
        }
        if(resourceName == 'shop' || resourceName == 'scenic' || resourceName == 'selfCompany'){
            this.getFindRate(infoIndex);
        }
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})