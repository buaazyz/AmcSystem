/**
 *
 * DWSurvey 3.0 中关于问卷设计Javascript
 *
 * @desc: design survey
 * @author: keyuan（@keyuan, keyuan258@gmail.com）
 * @github: https://github.com/wkeyuan/DWSurvey
 *
 * Copyright 2012, 2017 调问问卷(DWSurvey,http://dwsurvey.net)
 *
 */


//判断浏览窗口大小
var browseWidth=$(window).width();
var browseHeight=$(window).height();

var questionBelongId="";
var svTag=2;//表示题目是问卷题还是题库中题

//题目保存后回调时机比较参数
var quCBNum=0;//比较值1
var quCBNum2=0;//比较值2

var curEditObj=null;
var curEditObjOldHtml="";
var dwDialogObj=null;
var ueEditObj=null;//UE编辑器，关联的编辑对象

var isDrag=false;
var appQuObj=null;

var myeditor=null;
var ueDialog=null;

var isSaveProgress=false;
$(document).ready(function(){
	questionBelongId=$("#id").val();
	
	browseWidth=$(window).width();
	resizeWrapSize();
	//窗口大小发生改变时
	$(window).resize(function(){
		browseWidth=$(window).width();
		resizeWrapSize();
		
		//修正当前编辑的浮动编辑区位置 
		if(curEditObj!=null){
			var editOffset=$(curEditObj).offset();
			$("#dwCommonEditRoot").show();
			$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
		}
		if(dwDialogObj!=null){
			setShowDialogOffset(dwDialogObj);
		}
		
	});

	//窗口滚动条发生scroll时
	$(window).scroll( function() {
		var scrollTop=$(window).scrollTop();
		var quDesignDialog=$("#tools_wrap");
		
		var headerHeight=55;
		var quDesignHeight=125;
		quDesignDialog.css({ top:"0px"});

		var dwBodyLeft=$("#dw_body_left");
		var dwBodyRight=$("#dw_body_right");
		if(scrollTop>=headerHeight){
			dwBodyLeft.css({top:"136px"});
			dwBodyRight.css({top:"136px"});
		}else{
			dwBodyLeft.css({ top: (headerHeight+quDesignHeight+10-scrollTop)+"px"});
			dwBodyRight.css({ top: (headerHeight+quDesignHeight+10-scrollTop)+"px"});
		}
		
		if(scrollTop>=headerHeight && scrollTop<=100){
			//console.debug("(135+(30-(100-scrollTop)))+px:"+(135+(30-(100-scrollTop)))+"px,scrollTop"+scrollTop);
			$("#dw_body").css({"margin-top":(135+((100-headerHeight)-(100-scrollTop)))+"px"});
		}else{
			$("#dw_body").css({"margin-top":"135px"});
		}
		
		//修正当前编辑的浮动编辑区位置 
		if(curEditObj!=null){
			var editOffset=$(curEditObj).offset();
			$("#dwCommonEditRoot").show();
			$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
		}
		if(dwDialogObj!=null){
			setShowDialogOffset(dwDialogObj);
		}
		//ueDialog.dialog( "option",{position:["center","top"]} );
	} );
	
	//定时保存逻辑  三分钟检查一次
	function intervalSaveSurvey(){
		var saveTag=$("#dwSurveyQuContentAppUl input[name='saveTag'][value='0']");
		var nmSaveTag=$("#dw_body_content input[name='svyNmSaveTag'][value='0']");
		var noteSaveTag=$("#dw_body_content input[name='svyNoteSaveTag'][value='0']");
		
		//curEditObj!=null dwDialogObj
		if(!isSaveProgress && ( saveTag[0] || nmSaveTag[0] || noteSaveTag[0]) && !isDrag && curEditObj==null && dwDialogObj==null){
			notify("自动保存中...",5000);
			saveSurvey(function(){
				isSaveProgress=false;
				notify("自动保存成功",1000);
			});
		}
	}

	var isSort=false;
	//拖入题目到问卷中
	$( ".dragQuUl li" ).draggable({
			connectToSortable: "#dwSurveyQuContentAppUl",
			zIndex:27000,
			cursor: "move",cursorAt:{left: 40, top: 25},
			scroll: true ,
			scrollSensitivity: 30,
			scrollSpeed: 30,
			appendTo: "#dw_body_content",
			helper: function(event){
				return $(this).find(".dwQuTypeModel").html();
			},
			start: function(event, ui) {
				isDrag=true;
				$("#tools_wrap").css({"zIndex":30});
				resetQuItemHover(null);
				dwCommonDialogHide();
				curEditCallback();
			},
		    drag: function(event, ui) {
		    	isDrag=true;
		    },
		    stop: function(event, ui) {
		    	if(!isSort){
			    	$("#tools_wrap").animate({zIndex: 200}, 200 ,function(){
						resetQuItem();
			    		bindQuHoverItem();
			    	});
		    	}
		    	if(false){
			    	isDrag=false;
			    	//alert(this); 
			    	//判断加入----根据initLine显示状态来判断是否加入进去
			    	if(appQuObj!=null){
				    	//$("#defaultAppQuObj").before($(this).find(".quTypeModel").html());
				    	$(appQuObj).before($(this).find(".dwQuTypeModel").html());
				    	$(appQuObj).prev().hide();
				    	$(appQuObj).prev().removeClass("quDragBody");
				    	$(appQuObj).prev().show("slow");
				    	resetQuItem();
				    	bindQuHoverItem();
			    	}
		    	}
		    }
	}); 
	
	$( "#dwSurveyQuContentAppUl" ).sortable({
		revert: true,
		delay:800,
		placeholder:"showLine",
		tolerance:"pointer",
		opacity :0.7,
		//helper : "clone",
		handle : ".dwQuMove",
		scrollSensitivity: 30,
		scrollSpeed: 30,
		start: function(event,ui){
			//$("#tools_wrap").fadeTo("slow", 0.6);
			$("#tools_wrap").css({"zIndex":30});
			$(".showLine").height(ui.item.height());
			dwCommonDialogHide();
			curEditCallback();
			isSort=true;
		},
		sort: function(event,ui){
			isSort=true;
			$(".ui-sortable-placeholder").css({"background":"red"});
		},
		receive:function(event,ui){
			//当一个已连接的sortable对象接收到另一个sortable对象的元素后触发此事件。 
		},
		out:function(event,ui){
			//当一个元素拖拽移出sortable对象移出并进入另一个sortable对象后触发此事件。 
			isSort=false;
		},
		update: function( event, ui ) {
			if(!isDrag){
				//根据排序ID，计算出是前排序，还是后排序
				//ui.item.find("input[name='saveTag']").val(0);
				//$(this).find("input[name='saveTag']").val(0);
				$("#dwSurveyQuContentAppUl input[name='saveTag']").val(0);
			}
		},
		stop: function(event,ui){
			//console.debug("sort isDrag:"+isDrag+",isSort:"+isSort);
			if(isDrag){
				isDrag=false;
				isSort=false;
				ui.item.html(ui.item.find(".dwQuTypeModel").html());
				ui.item.removeClass("ui-draggable");
				ui.item.find(".quDragBody").removeClass("quDragBody");
				//新加入题-选定题目标题
				ui.item.find(".surveyQuItemBody").addClass("hover");
				ui.item.addClass("li_surveyQuItemBody");
				var quType=ui.item.find(".surveyQuItemBody input[name='quType']").val();
				if(quType!="PAGETAG"){
					editAble(ui.item.find(".surveyQuItemBody .quCoTitleEdit"));	
				}

			}
			
			var curItemBodyOffset=ui.item.offset();
			$("html,body").animate({scrollTop:curItemBodyOffset.top-370}, 500,function(){
				$("#tools_wrap").css({"zIndex":200});
				resetQuItem();
		    	bindQuHoverItem();
			});

		}
	});


	var isDialogClick=false;
	
	$(document).click(function(){
		curEditCallback();
		if(!isDialogClick){
			dwCommonDialogHide();
			resetQuItemHover(null);
		}
		isDialogClick=false;
	});
	

	$("#dwCommonEditRoot").unbind();
	$("#dwCommonEditRoot").click(function(){
		return false;
	});
	
	$("#dwCommonDialog").click(function(){
		isDialogClick=true;
	});
	
	$( "#modelUIDialog" ).click(function(){
		isDialogClick=true;
	});
	
	$( "#modelUIDialog" ).dialog({
		title: "选项设置",
		height: 260,
		width: 550,
		modal: true,
		autoOpen: false
	});
	
	
	$(".tools_tabs_left ul li").click(function(){
		var curId=$(this).attr("id");
		var tabId=curId.replace("_li","");
		$(".tools_tab_div").hide();
		$("#"+tabId).show();
		$(".tools_tabs_left ul li").removeClass("current");
		$(this).addClass("current");
	});
	//绑定变动
	bindQuHoverItem();
	
	//问卷设置,收集规则什么的
	$("#surveyAttrSetToolbar").click(function(){
		showUIDialog($(this));
		return false;
	});
	$("#logicToolbar").click(function(){
		showUIDialog($(this));
		return false;
	});
	
	//绑定设置关联联系人属性设置 
	$("input[name='setAutoContacts']").change(function(){
		var check=$(this).prop("checked");
		if(check){
			$(".contactsFieldLi").show();
		}else{
			$(".contactsFieldLi").hide();
		}
	});
	
	//切换设置题目时，选项排列个数 option_range
	$(".option_range").change(function(){
		var selVal=$(this).val();
		$(this).next().hide();
		if(selVal==3){
			//按列  width=690
			$(this).next().show();
		}
	});
	
	//逻辑设置时添加逻辑项
	$(".dwQuDialogAddLogic").click(function(){
		addQuDialogLogicTr(true,function(){},function(){alert("此题已经设置了任意选项!");});
		return false;
	});
	
	//保存逻辑设置 
	$("#dwDialogSaveLogic").click(function(){
		var quItemBody=$(dwDialogObj).parents(".surveyQuItemBody");
		var quLogicInputCase=quItemBody.find(".quLogicInputCase");
		var quType=quItemBody.find("input[name='quType']").val();
		
		var dwQuLogicTrs=$("#dwQuLogicTable tr");
		var quLogicItemHtml=$("#quLogicItemModel").html();
		$.each(dwQuLogicTrs,function(){
			var cgQuItemId=$(this).find(".logicQuOptionSel").val();
			var skQuId=$(this).find(".logicQuSel").val();
			var logicType=$(this).find(".logicType").val();
			var quLogicItemClass=$(this).attr("class");
		
			//判断已经保存过的，保存过的只做修改
			if(skQuId!="" && cgQuItemId!=""){
				var quLogicItem=quLogicInputCase.find("."+quLogicItemClass);
				if(quLogicItem[0]){
					//已经有值--检查值是否有发生变化 
					var oldSkQuId=quLogicItem.find("input[name='skQuId']").val();
					var oldCgQuItemId=quLogicItem.find("input[name='cgQuItemId']").val();
					var oldLogicType=quLogicItem.find("input[name='logicType']").val();
					
					if(oldSkQuId!=skQuId || cgQuItemId!=oldCgQuItemId || oldLogicType!=logicType){
						quLogicItem.find("input[name='logicSaveTag']").val("0");
						quItemBody.find("input[name='saveTag']").val("0");
						//后来修复的
						quLogicItem.find("input[name='skQuId']").val(skQuId);
						quLogicItem.find("input[name='cgQuItemId']").val(cgQuItemId);
						quLogicItem.find("input[name='logicType']").val(logicType);
					}
					//如果是评分题
					if(quType==="SCORE"){
						//geLe scoreNum
						//logicScoreGtLt logicScoreNum logicEvent
						var logicScoreGtLt=$(this).find(".logicScoreGtLt").val();
						var logicScoreNum=$(this).find(".logicScoreNum").val();
//						var logicEvent=$(this).find(".logicEvent").val();
						quLogicItem.find("input[name='geLe']").val(logicScoreGtLt);
						quLogicItem.find("input[name='scoreNum']").val(logicScoreNum);
						quLogicItem.find("input[name='logicType']").val(logicType);
//						quLogicItem.find("input[name='logicEvent']").val(logicEvent);
						//状态
						quLogicItem.find("input[name='logicSaveTag']").val("0");
						quItemBody.find("input[name='saveTag']").val("0");
						
					}
				}else{
					quLogicInputCase.append(quLogicItemHtml);
					quLogicItem=quLogicInputCase.find(".quLogicItem").last();
					quLogicItem.addClass(quLogicItemClass);
					//修改值
					quLogicItem.find("input[name='quLogicId']").val("");
					quLogicItem.find("input[name='skQuId']").val(skQuId);
					quLogicItem.find("input[name='cgQuItemId']").val(cgQuItemId);
					quLogicItem.find("input[name='visibility']").val("1");
					quLogicItem.find("input[name='logicType']").val(logicType);
					quItemBody.find("input[name='saveTag']").val("0");
					
					//如果是评分题
					if(quType==="SCORE"){
						//geLe scoreNum  //logicScoreGtLt logicScoreNum logicEvent
						var logicScoreGtLt=$(this).find(".logicScoreGtLt").val();
						var logicScoreNum=$(this).find(".logicScoreNum").val();
//						var logicEvent=$(this).find(".logicEvent").val();
						quLogicItem.find("input[name='geLe']").val(logicScoreGtLt);
						quLogicItem.find("input[name='scoreNum']").val(logicScoreNum);
						quLogicItem.find("input[name='logicType']").val(logicType);
//						quLogicItem.find("input[name='logicEvent']").val(logicEvent);
					}
				}
			}
		});
		
		refreshQuLogicInfo(quItemBody);
		dwCommonDialogHide();
		return false;
	});
	
	//批量添加弹出窗口-保存事件
	$("#dwDialogSaveMoreItem").click(function(){
		var quItemBody=$(dwDialogObj).parents(".surveyQuItemBody");
		var quType=quItemBody.find("input[name='quType']").val();
		
		var areaVal=$("#dwQuMoreTextarea").val();
		var areaValSplits=areaVal.split("\n");
		$.each(areaValSplits,function(i,item){
			item=$.trim(item);
			if(item!=""){
				if(quType=="RADIO"){
					//添加单选选项
					addRadioItem(quItemBody,item);
				}else if(quType=="CHECKBOX"){
					//添加多选选项
					addCheckboxItem(quItemBody,item);	
				}else if(quType=="SCORE"){
					addScoreItem(quItemBody,item);
				}else if(quType=="ORDERQU"){
					addOrderquItem(quItemBody, item);
				}else if(quType=="MULTIFILLBLANK"){
					addMultiFillblankItem(quItemBody, item);
				}else if(quType=="CHENRADIO" || quType=="CHENCHECKBOX" || quType=="CHENFBK" || quType=="CHENSCORE"){
					addChenItem(dwDialogObj,quItemBody, item);
				}
			}
		});
		$("#dwQuMoreTextarea").val("");
		bindQuHoverItem();
		dwCommonDialogHide();
	});

	
	//设置窗口保存事件
	$("#dwDialogQuSetSave").click(function(){
		if(dwDialogObj!=null){
			var quItemBody=$(dwDialogObj).parents(".surveyQuItemBody");
			//var quType=quItemBody.find("input[name='quType']").val();
			var setIsRequired=$("#dwCommonDialog input[name='setIsRequired']:checked");
			var setRandOrder=$("#dwCommonDialog input[name='setRandOrder']:checked");
			var setHv=$("#dwCommonDialog select[name='setHv']").val();
			var setCellCount=$("#dwCommonDialog input[name='setCellCount']").val();
			var setAutoContacts=$("#dwCommonDialog input[name='setAutoContacts']:checked");
			var setContactsField=$("#dwCommonDialog select[name='setContactsField']").val();
			
			
			var oldHv=quItemBody.find("input[name='hv']").val();
			var oldCellCount=quItemBody.find("input[name='cellCount']").val();
			//alert(set_isRequired+":"+set_randOrder+":"+set_hv);
			quItemBody.find("input[name='isRequired']").val(setIsRequired[0]?1:0);
			quItemBody.find("input[name='hv']").val(setHv);
			quItemBody.find("input[name='randOrder']").val(setRandOrder[0]?1:0);
			quItemBody.find("input[name='cellCount']").val(setCellCount);
			quItemBody.find("input[name='saveTag']").val(0);
			
			var quType=quItemBody.find("input[name='quType']").val();
			if(quType=="RADIO" || quType=="CHECKBOX" || quType=="FILLBLANK"){
				quItemBody.find("input[name='contactsAttr']").val(setAutoContacts[0]?1:0);
				quItemBody.find("input[name='contactsField']").val(setContactsField);
			}else if(quType=="SCORE"){

				quItemBody.find("input[name='paramInt01']").val(1);
				var paramInt02=$("#dwCommonDialog .scoreMinMax .maxScore");
				if(paramInt02[0]){
					quItemBody.find("input[name='paramInt02']").val(paramInt02.val());
				}
				//根据分数设置评分选项
				var paramInt01Val=1;
				var paramInt02Val=paramInt02.val();
				var scoreNumTableTr=quItemBody.find(".scoreNumTable tr");
				$.each(scoreNumTableTr,function(){
					$(this).empty();
					for(var i=paramInt01Val;i<=paramInt02Val;i++){
						$(this).append("<td>"+i+"</td>");
					}
				});
			}else if(quType==="MULTIFILLBLANK"){
				var paramInt01=$("#dwCommonDialog .minMaxLi .minNum");
				if(paramInt01[0]){
					quItemBody.find("input[name='paramInt01']").val(paramInt01.val());
				}
				quItemBody.find("input[name='paramInt02']").val(10);
			}
			
			var selVal=$(".option_range").val();
			if(selVal==1){
				//横排 transverse
				if(oldHv==3){
					quTableOptoin2Li(quItemBody);
				}
				quItemBody.find(".quCoItem ul").addClass("transverse");	
			}else if(selVal==2){
				if(oldHv==3){
					quTableOptoin2Li(quItemBody);
				}else{
					//竖排
					quItemBody.find(".quCoItem ul").removeClass("transverse");
					quItemBody.find(".quCoItem ul li").width("");
				}
			}else if(selVal==3){

				//转换到tr中去
				if(oldHv==3){
					if(oldCellCount!=setCellCount){//列数发生了变化
						//调查quTableOption2Table(quItemBody);
						quTableOption2Table(quItemBody);
					}
				}else{
					quLiOption2Table(quItemBody);					
				}
			}else if(selVal==4){
				//下拉选项
				
			}
		}
		dwCommonDialogHide();
		return false;
	});
	
	 //保存设置规则属性
	$("#dwDialogSurveyAttrSave").click(function(){
		//调用保存事件 
		$("input[name='svyAttrSaveTag']").val(0);
		notify("保存中...",5000);
		saveSurvey(function(){
			isSaveProgress=false;
			notify("保存成功",1000);
		});
		//关闭窗口
		$("#modelUIDialog").dialog("close");
		dwCommonDialogHide();
		return false;
	});
	
	//选项设置-保存事件
	$("#dwDialogQuOptionSetSave").click(function(){
		
		var quItemBody=$(dwDialogObj).parents(".surveyQuItemBody");
		var quOptionParent=$(dwDialogObj).parent();
		//设置回显值 isNote checkType
		var quOption_isNote=$("#modelUIDialog input[name='quOption_isNote']");
		var quOption_checkType=$("#modelUIDialog select[name='quOption_checkType']");
		var quOption_isRequiredFill=$("#modelUIDialog input[name='quOption_isRequiredFill']");
		
		var isNote=quOptionParent.find("input[name='isNote']");
		var checkType=quOptionParent.find("input[name='checkType']");
		var isRequiredFill=quOptionParent.find("input[name='isRequiredFill']");
		
		if(quOption_isNote.prop("checked")&&(isNote.val()=="0" || isNote.val()=="")){
			quItemBody.find("input[name='saveTag']").val(0);
			quOptionParent.find("input[name='quItemSaveTag']").val(0);
		}
		if(quOption_checkType.val()!=checkType.val()){
			quItemBody.find("input[name='saveTag']").val(0);
			quOptionParent.find("input[name='quItemSaveTag']").val(0);
		}
		if(quOption_isRequiredFill.val()!=isRequiredFill.val()){
			quItemBody.find("input[name='saveTag']").val(0);
			quOptionParent.find("input[name='quItemSaveTag']").val(0);
		}
		//alert(isNote.attr("name"));
		if(quOption_isNote.prop("checked")){
			isNote.val(1);	
		}else{
			isNote.val(0);
		}
		var checkTypeVal=quOption_checkType.val();
		if(checkTypeVal==""){
			checkTypeVal="NO";
		}
		checkType.val(checkTypeVal);
		if(quOption_isRequiredFill.prop("checked")){
			isRequiredFill.val(1);
		}else{
			isRequiredFill.val(0);
		}
		//显示填空框
		//$(dwDialogObj).after("<input type='text' class='optionInpText' />");
		quOptionParent.find(".optionInpText").show();
		
		$("#modelUIDialog").dialog("close");
		//resetQuItemHover(null);
		dwCommonDialogHide();
		return false;
	});
	
	//填空题--填空框设置
	$("#dwDialogQuFillOptionSave").click(function(){
		//alert("..dwDialogObj:"+$(dwDialogObj).attr("class"));
		var quItemBody=$(dwDialogObj).parents(".surveyQuItemBody");
		//设置回显值 isNote checkType
		var quFill_checkType=$("#modelUIDialog select[name='quFill_checkType']");
		var qu_inputWidth=$("#modelUIDialog input[name='qu_inputWidth']");
		var qu_inputRow=$("#modelUIDialog input[name='qu_inputRow']");
		//var quFill_checkType=$("#dwCommonDialog select[name='quFill_checkType']");
		//var quOption_isRequiredFill=$("#dwCommonDialog input[name='quOption_isRequiredFill']");
		
		var checkType=quItemBody.find("input[name='checkType']");
		//输入框 input 大小调整 quFillblankAnswerInput  quFillblankAnswerTextarea
		var answerInputWidth=quItemBody.find("input[name='answerInputWidth']");
		var answerInputRow=quItemBody.find("input[name='answerInputRow']");
		
		//	var saveTag=quItemBody.find("input[name='saveTag']").val();
		if(checkType.val()!=quFill_checkType.val() || answerInputWidth.val()!=qu_inputWidth.val() || answerInputRow.val()!=qu_inputRow.val()){
			quItemBody.find("input[name='saveTag']").val(0);
		}
		
		var checkTypeVal=quFill_checkType.val();
		if(checkTypeVal==""){
			checkTypeVal="NO";
		}
		checkType.val(checkTypeVal);
	
		answerInputWidth.val(qu_inputWidth.val());
		answerInputRow.val(qu_inputRow.val());
		
		//alert(qu_inputRow);
		if(qu_inputRow.val()>1){
			quItemBody.find(".quFillblankAnswerTextarea").show();
			quItemBody.find(".quFillblankAnswerInput").hide();
			quItemBody.find(".quFillblankAnswerTextarea").attr("rows",qu_inputRow.val());
			quItemBody.find(".quFillblankAnswerTextarea").width(qu_inputWidth.val());
		}else{
			quItemBody.find(".quFillblankAnswerTextarea").hide();
			quItemBody.find(".quFillblankAnswerInput").show();
			quItemBody.find(".quFillblankAnswerInput").width(qu_inputWidth.val());
		}
		
		//quItemBody.find(".quCoItemUlLi").removeClass("menuBtnClick");
		quItemBody.find(".quCoItemUlLi").removeClass("hover");
		$("#modelUIDialog").dialog("close");
		resetQuItemHover(null);
		dwCommonDialogHide();
		return false;
	});
	
	
	
	function quTableOptoin2Li(quItemBody){
		var quCoItemTds=quItemBody.find(".quCoItem .tableQuColItem tr td");
		var ulLiHtml="<ul>";
		$.each(quCoItemTds,function(){
			var tdHtml=$(this).html();
			if(tdHtml!=""){
				ulLiHtml+="<li class='quCoItemUlLi'>"+tdHtml+"</li>";
			}
		});
		ulLiHtml+="<ul>";
		quItemBody.find(".quCoItem table.tableQuColItem").remove();
		quItemBody.find(".quCoItem").append(ulLiHtml);
		quItemBody.find(".quCoItem ul li").width("");
		quItemBody.find(".quCoItem ul li label").width("");
		bindQuHoverItem();
	}
	
	function quLiOption2Table(quItemBody){
		var quCoItemlis=quItemBody.find(".quCoItem ul li");
		var quCoItemLiSize=quCoItemlis.size();
		var cellCount=$("#dwCommonDialog input[name='setCellCount']").val();
		var rowCount=parseInt(quCoItemLiSize/cellCount);
		var remainder=quCoItemLiSize%cellCount;
		
		var tdWidth=parseInt(600/cellCount);
		var tdLabelWidth=tdWidth-10;
		if(remainder>0){
			rowCount=rowCount+1;
		}
		var tableHtmlBuild="<table class='tableQuColItem'>";
		for(var i=0;i<rowCount;i++){
			tableHtmlBuild+="<tr>";
			//0*2+(1)=1    0*2+(2)=2     1*2+(1)=3   1*2+(2)=4    2*2+1=5    2*2+2=6
			for(var j=0;j<cellCount;j++){
				var liIndex=(i*cellCount)+j;
				if(liIndex<quCoItemLiSize){
					var liObj=$(quCoItemlis).get(liIndex);
					tableHtmlBuild+="<td>"+$(liObj).html()+"</td>";	
				}else{
					tableHtmlBuild+="<td><div class='emptyTd'></div></td>";
				}
			}
			tableHtmlBuild+="</tr>";
		}
		
		tableHtmlBuild+="</table>";
		quItemBody.find(".quCoItem ul").remove();
		quItemBody.find(".quCoItem").append(tableHtmlBuild);
		//设置亮度
		quItemBody.find(".quCoItem .tableQuColItem tr td").width(tdWidth);
		quItemBody.find(".quCoItem .tableQuColItem tr td label").width(tdLabelWidth);
		
		bindQuHoverItem();
	}
	
	//表格变换了行数之后
	function quTableOption2Table(quItemBody){
		var quCoItemTds=quItemBody.find(".quCoItem .tableQuColItem tr td");
		var quCoItemTdSize=quCoItemTds.size();
		var cellCount=$("#dwCommonDialog input[name='setCellCount']").val();
		var rowCount=parseInt(quCoItemTdSize/cellCount);
		var remainder=quCoItemTdSize%cellCount;
		
		var tdWidth=parseInt(600/cellCount);
		var tdLabelWidth=tdWidth-10;
		if(remainder>0){
			rowCount=rowCount+1;
		}
		var tableHtmlBuild="<table class='tableQuColItem'>";
		for(var i=0;i<rowCount;i++){
			tableHtmlBuild+="<tr>";
			//0*2+(1)=1    0*2+(2)=2     1*2+(1)=3   1*2+(2)=4    2*2+1=5    2*2+2=6
			for(var j=0;j<cellCount;j++){
				var tdIndex=(i*cellCount)+j;
				if(tdIndex<quCoItemTdSize){
					var tdObj=$(quCoItemTds).get(tdIndex);
					tableHtmlBuild+="<td>"+$(tdObj).html()+"</td>";	
				}else{
					tableHtmlBuild+="<td><div class='emptyTd'></div></td>";
				}
			}
			tableHtmlBuild+="</tr>";
		}
		
		tableHtmlBuild+="</table>";
		quItemBody.find(".quCoItem table.tableQuColItem").remove();
		quItemBody.find(".quCoItem").append(tableHtmlBuild);
		//设置亮度
		quItemBody.find(".quCoItem .tableQuColItem tr td").width(tdWidth);
		quItemBody.find(".quCoItem .tableQuColItem tr td label").width(tdLabelWidth);
		
		bindQuHoverItem();
	}
	
	
	//点击加边框编辑

	$("#dwSurveyName").click(function(){
		editAble($(this));
		return false;
	});
	$("#dwSurveyNoteEdit").click(function(){
		editAble($(this));
		return false;
	});
	

	
	$(".dwComEditMenuBtn").click(function(){
		//dwComEditMenuBtn
		var dwMenuUl=$(".dwComEditMenuUl:visible");
		//根据当前编辑的对象
		var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		var quType=quItemBody.find("input[name='quType']").val();
		var curEditClass=$(curEditObj).attr("class");
		if(quType=="RADIO" || quType=="CHECKBOX"){
			if(curEditClass.indexOf("quCoTitleEdit")<0){
				$(".dwComEditMenuUl .option_Set_Li").show();
			}else{
				$(".dwComEditMenuUl .option_Set_Li").hide();
			}
		}else{
			$(".dwComEditMenuUl .option_Set_Li").hide();
		}
		
		if(dwMenuUl[0]){
			$(".dwComEditMenuUl").hide();	
		}else{
			$(".dwComEditMenuUl").show();
		}
		return false;
	});
	
	$("#dwCommonDialogClose").click(function(){
		dwCommonDialogHide();
		resetQuItemHover(null);
	});
	
	$("#dwComEditContent").keyup(function(){
		$(curEditObj).html($("#dwComEditContent").html());
		$(curEditObj).css("display","inline-block");
		
		var dwEditWidth=$(curEditObj).width();
		//var dwEditWidth=$("#dwComEditContent").width();
		var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		
		var thClass=curEditObj.attr("class");
		if(thClass.indexOf("dwSvyNoteEdit")<0 &&  thClass.indexOf("dwSvyName")<0){
			var hv=quItemBody.find("input[name='hv']").val();
			if(hv==3){
				dwEditWidth>600?dwEditWidth=600:dwEditWidth;
			}else{
				dwEditWidth<200?dwEditWidth=200:dwEditWidth>600?dwEditWidth=600:dwEditWidth;
			}
		}else{
			dwEditWidth=680;
		}
		
		//dwEditWidth>600?dwEditWidth=600:dwEditWidth;
		$("#dwCommonEditRoot .dwCommonEdit").css("width",dwEditWidth);
		//设置坐标
		if(curEditObj!=null){
			var editOffset=$(curEditObj).offset();
			$("#dwCommonEditRoot").show();
			$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
		}
	});
	
	
	$("#saveBtn").click(function(){
		curEditCallback();
		dwCommonDialogHide();
		resetQuItemHover(null);
		
		notify("保存中...",5000);
		saveSurvey(function(){
			isSaveProgress=false;
			notify("保存成功",1000);
		});

	});
	
	$("#publishBtn").click(function(){
		// curEditCallback();
		// dwCommonDialogHide();
		// resetQuItemHover(null);
		saveSurvey(function () {
			isSaveProgress=false;
			var r=confirm("You have created a survey successfully");
			if (r==true)
			{
				document.location="mainpage";
			}
			else
			{
				document.location="mainpage";
			}
		});

	});

	function saveSurvey(callback){
		isSaveProgress=true;
		//保存问卷级别信息--之后财保存问卷中的题
		var data="surveyId="+questionBelongId;
    	var dwSurveyName=$("#dwSurveyName").html();
		data+="&svyName="+dwSurveyName;
		var dwSurveyNoteEdit=$("#dwSurveyNoteEdit").html();
		data+="&svyNote="+dwSurveyNoteEdit;


		$.ajax({
			url:"/DA/surveysave/",
			data:data,
			type:"post",
			datatype:"json",
			success:function(msg){
				var wjId=msg.wjid;
				var fristQuItemBody=$("#dwSurveyQuContent .li_surveyQuItemBody").first();
				saveQus(fristQuItemBody,callback,wjId);
			}
		});

	}

	resetQuItem();
});

function resetQuItem(){
	if(isDrag){
		isDrag=false;
	}
	var surveyQuItems=$("#dwSurveyQuContent .surveyQuItemBody");
	var indexNum=1;
	$.each(surveyQuItems,function(i){
		$(this).find(".quInputCase input[name='orderById']").val(i+1);
		var quType=$(this).find("input[name='quType']").val();
		if(quType!="PAGETAG" && quType!="PARAGRAPH"){
			$(this).find(".quCoTitle .quCoNum").text((indexNum++)+"、");
		}
	});
	//更新分标标记
	var pageTags=$("#dwSurveyQuContent .surveyQuItemBody input[name='quType'][value='PAGETAG']");
	var pageTagSize=pageTags.size()+1;
	$.each(pageTags,function(i){
		var quItemBody=$(this).parents(".surveyQuItemBody");
		var pageQuContent=quItemBody.find(".pageQuContent");
		pageQuContent.text("下一页（"+(i+1)+"/"+pageTagSize+"）");
	});
}

function bindQuHoverItem(){

	$(".SeniorEdit").unbind();
	$(".SeniorEdit").click(function(){
		ueDialog.dialog( "open" );

		ueEditObj=curEditObj;
		myeditor.destroy();
		myeditor = null;
		myeditor = UE.getEditor("dialogUeditor",{

		    initialContent: "",//初始化编辑器的内容
		    elementPathEnabled:false,
	        wordCount:false,
	        autosave:false,
	        //下面注释参数不要随便调，在滚动时效果更好
	        //enableAutoSave:false,
	        //autoHeightEnabled:false,
	        //topOffset:60,
	        //imagePopup:true,
		    initialFrameWidth : 678,
		    initialFrameHeight : 300
		});
		//先出加载提示图标
		myeditor.ready(function(){
			setTimeout(function(){
				myeditor.setContent($(curEditObj).html());
				myeditor.focus(true);
	        },800);
		});
		return false;
	});

	$(".option_Set").unbind();
	$(".option_Set").click(function(){
		/*var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		quItemBody.addClass("hover");*/
		//showDialog($(curEditObj));
		showUIDialog($(curEditObj));
		/*resetQuItemHover(quItemBody);
		$(this).parents(".quCoItemUlLi").addClass("menuBtnClick");*/
		return false;
	});

	$("input[name='quOption_isNote']").unbind();
	$("input[name='quOption_isNote']").click(function(){
		var optionCk=$(this).prop("checked");
		if(optionCk){
			$(".quOptionFillContentLi,.quOptionFillRequiredLi").show();
			//$("#modelUIDialog").dialog("open");
			$("#modelUIDialog").dialog("option","height",230);
		}else{
			$(".quOptionFillContentLi,.quOptionFillRequiredLi").hide();
		}
	});

	$("#dwSurveyQuContent .surveyQuItemBody").unbind();
	$("#dwSurveyQuContent .surveyQuItemBody").hover(function(){
		//显示
		if(isDrag){
			//$(this).addClass("showLine");
			appQuObj=$(this);
		}else{
			//显示
			$(this).addClass("hover");
			$(".pageBorderTop").removeClass("nohover");
			//如果是填空
			appQuObj=$(this);
		}
	},function(){
		$(".pageBorderTop").addClass("nohover");
		$(this).removeClass("showLine");
		var hoverTag=$(this).find("input[name='hoverTag']").val();
		if(hoverTag!="hover"){
			$(this).removeClass("hover");
		}
		appQuObj=null;

	});

	$("#dwSurveyQuContent .surveyQuItemBody").click(function(){
		curEditCallback();
		dwCommonDialogHide();
		$(".surveyQuItemBody").removeClass("hover");
		$(".surveyQuItemBody").find("input[name='hoverTag']").val("0");
		$(this).addClass("hover");
		return false;
	});

	$(".quCoItemUlLi").unbind();
	$(".quCoItemUlLi").hover(function(){
		if(!isDrag){
			$(this).addClass("hover");
		}
	},function(){
		var thClass=$(this).attr("class");
		if(thClass.indexOf("menuBtnClick")<=0){
			$(this).removeClass("hover");
		}
	});

	//绑定编辑
	$("#dwSurveyQuContent .editAble").unbind();
	$("#dwSurveyQuContent .editAble").click(function(){
		editAble($(this));
		return false;
	});

	//绑定题目删除事件
	$(".dwQuDelete").unbind();
	$(".dwQuDelete").click(function(){
		var quBody=$(this).parents(".surveyQuItemBody");
		if(confirm("确认要删除此题吗？")){
			var quId=quBody.find("input[name='quId']").val();
			if(quId!=""){
				var data="quId="+quId;
				$.ajax({
					url:"/DA/quremove/",
					data:data,
					type:"post",
					success:function(msg){
						if(msg=="true"){
							//quBody.hide("slow",function(){$(this).remove();resetQuItem();});
							quBody.hide("slow",function(){$(this).parent().remove();resetQuItem();});
						}else{
							alert("删除失败，请重试！");
						}
					}
				});
			}else{
//				quBody.hide("slow",function(){$(this).remove();resetQuItem();});
				quBody.hide("slow",function(){$(this).parent().remove();resetQuItem();});
			}
		}
		return false;
	});

	$(".questionUp").unbind();
	$(".questionUp").click(function(){
		var nextQuBody=$(this).parents(".li_surveyQuItemBody");
		var prevQuBody=$(nextQuBody).prev();
		if(prevQuBody[0]){
			var prevQuBodyHtml=prevQuBody.html();
			$(nextQuBody).after("<li class='li_surveyQuItemBody'>"+prevQuBodyHtml+"</li>");
			var newNextObj=$(nextQuBody).next();
			newNextObj.hide();
			newNextObj.slideDown("slow");
			prevQuBody.slideUp("slow",function(){prevQuBody.remove();resetQuItem();bindQuHoverItem();});

			nextQuBody.find("input[name='saveTag']").val(0);
			newNextObj.find("input[name='saveTag']").val(0);
		}else{
			notify("已经是第一个了！",1000);
			//alert("已经是第一个了！");
		}
	});

	$(".questionDown").unbind();
	$(".questionDown").click(function(){
		var prevQuBody=$(this).parents(".li_surveyQuItemBody");
		var nextQuBody=$(prevQuBody).next();
		if(nextQuBody[0]){
			var nextQuBodyHtml=nextQuBody.html();
			$(prevQuBody).before("<li class='li_surveyQuItemBody' >"+nextQuBodyHtml+"</li>");
			var newPrevObj=$(prevQuBody).prev();
			newPrevObj.hide();
			newPrevObj.slideDown("slow");
			nextQuBody.slideUp("slow",function(){nextQuBody.remove();resetQuItem();bindQuHoverItem();});

			prevQuBody.find("input[name='saveTag']").val(0);
			newPrevObj.find("input[name='saveTag']").val(0);
		}else{
			alert("已经是最后一个了！");
		}
	});

	$(".dwQuSet").unbind();
	$(".dwQuSet").click(function(){
		showDialog($(this));
		var quItemBody=$(this).parents(".surveyQuItemBody");
		resetQuItemHover(quItemBody);
		return false;
	});

	//逻辑设置
	$(".dwQuLogic").unbind();
	$(".dwQuLogic").click(function(){
		showDialog($(this));
		var quItemBody=$(this).parents(".surveyQuItemBody");
		var quType=quItemBody.find("input[name='quType']").val();
		//默认加载图标
		var fristQuItemBody=$("#dwSurveyQuContent .li_surveyQuItemBody").first();
		saveQus(fristQuItemBody,function(){
			$(".dwQuDialogCon").hide();
			$("#dwCommonDialog .dwQuDialogLogic").show();

			resetQuItemHover(quItemBody);
			bindDialogRemoveLogic();

			$("#dwQuLogicTable").empty();
			//逻辑数据回显示
			var quLogicItems=quItemBody.find(".quLogicItem");
			if(quLogicItems[0]){
				$.each(quLogicItems,function(){
					var skQuId=$(this).find("input[name='skQuId']").val();
					var cgQuItemId=$(this).find("input[name='cgQuItemId']").val();
					var logicType=$(this).find("input[name='logicType']").val();
					// 设置分数 geLe scoreNum
					var geLe="";
					var scoreNum="";
					if(quType==="SCORE"){
						geLe=$(this).find("input[name='geLe']").val();
						scoreNum=$(this).find("input[name='scoreNum']").val();
					}

					var thClass=$(this).attr("class");
					thClass=thClass.replace("quLogicItem", "");
					thClass=thClass.replace(" ", "");
					//回显相应的选项
					addQuDialogLogicTr(false,function(){
						//执行成功--设置值

						var lastTr=$("#dwQuLogicTable").find("tr").last();
						lastTr.attr("class",thClass);
						lastTr.find(".logicQuOptionSel").val(cgQuItemId);
						lastTr.find(".logicQuSel").val(skQuId);
						lastTr.find(".logicType").val(logicType);

						lastTr.find(".logicQuOptionSel").change();
						lastTr.find(".logicQuSel").change();

						// 设置分数 geLe scoreNum
						if(quType==="SCORE"){
							lastTr.find(".logicScoreGtLt").val(geLe);
							lastTr.find(".logicScoreNum").val(scoreNum);
						}
					},function(){});
				});
			}else{
				$(".dwQuDialogAddLogic").click();
			}
		});
		return false;
	});

	//添加行选项
	$(".addOption,.addColumnOption,.addRowOption").unbind();
	$(".addOption,.addColumnOption,.addRowOption").click(function(){
		var quItemBody=$(this).parents(".surveyQuItemBody");
		var quType=quItemBody.find("input[name='quType']").val();
		if(quType=="RADIO"){
			//添加单选选项
			editAble(addRadioItem(quItemBody,""));
			//editAble(quItemBody.find(".quCoItem table .editAble").last());
		}else if(quType=="CHECKBOX"){
			editAble(addCheckboxItem(quItemBody, ""));
			//editAble(quItemBody.find(".quCoItem ul li:last .editAble"));
		}else if(quType=="SCORE"){
			editAble(addScoreItem(quItemBody, "新选项"));
		}else if(quType=="ORDERQU"){
			editAble(addOrderquItem(quItemBody, "新选项"));
		}else if(quType=="MULTIFILLBLANK"){
			editAble(addMultiFillblankItem(quItemBody, "新选项"));
		}else if(quType=="CHENRADIO" || quType=="CHENCHECKBOX" || quType=="CHENFBK" || quType=="CHENSCORE"){//矩陈单选题,矩阵多选题
			editAble(addChenItem($(this),quItemBody, "新选项"));
		}
		bindQuHoverItem();
		return false;
	});

	//批量添加事件
	$(".addMoreOption,.addMoreRowOption,.addMoreColumnOption").unbind();
	$(".addMoreOption,.addMoreRowOption,.addMoreColumnOption").click(function(){
		showDialog($(this));
		var quItemBody=$(this).parents(".surveyQuItemBody");
		resetQuItemHover(quItemBody);
		return false;
	});

	//填空题选项设置
	$(".quFillblankItem .dwFbMenuBtn").unbind();
	$(".quFillblankItem .dwFbMenuBtn").click(function(){
		//showDialog($(this));
		showUIDialog($(this));
		return false;
	});

	$(".dwOptionUp").unbind();
	$(".dwOptionUp").click(function(){
		//curEditObj
		//判断类型区别table跟ul中的排序
		var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		var quType=quItemBody.find("input[name='quType']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		if(hv==3){
			var nextTd=$(curEditObj).parents("td");
			var prevTd=nextTd.prev();
			if(prevTd[0]){
				dwOptionUp(prevTd, nextTd);
			}else{
				var nextTr=$(curEditObj).parents("tr");
				var prevTr=nextTr.prev();
				if(prevTr[0]){
					prevTd=prevTr.find("td").last();
					dwOptionUp_1(prevTr, nextTr);
				}else{
					alert("已经是第一个了！");
				}
			}
		}else{
			var nextLi=null;
			var prevLi=null;
			var nextLiAfterHtml="";
			if(quType==="RADIO" || quType==="CHECKBOX" || quType==="ORDERQU"){
				nextLi=$(curEditObj).parents("li.quCoItemUlLi");
				prevLi=nextLi.prev();
				var prevLiHtml=prevLi.html();
				nextLiAfterHtml="<li class='quCoItemUlLi'>"+prevLiHtml+"</li>";
			}else if(quType==="SCORE"){
				nextLi=$(curEditObj).parents("tr.quScoreOptionTr");
				prevLi=nextLi.prev();
				var prevLiHtml=prevLi.html();
				nextLiAfterHtml="<tr class='quScoreOptionTr'>"+prevLiHtml+"</tr>";
			}else if(quType==="MULTIFILLBLANK"){
				nextLi=$(curEditObj).parents("tr.mFillblankTableTr");
				prevLi=nextLi.prev();
				var prevLiHtml=prevLi.html();
				nextLiAfterHtml="<tr class='mFillblankTableTr'>"+prevLiHtml+"</tr>";
			}else if(quType==="CHENRADIO" || quType==="CHENCHECKBOX" || quType==="CHENSCORE" || quType==="CHENFBK"){
				nextLi=$(curEditObj).parents("tr.quChenRowTr");
				if(nextLi[0]){
					prevLi=nextLi.prev();
					var prevLiHtml=prevLi.html();
					nextLiAfterHtml="<tr class='quChenRowTr'>"+prevLiHtml+"</tr>";
				}else{
					nextLi=$(curEditObj).parents("td.quChenColumnTd");
					prevLi=nextLi.prev();
					var prevLiHtml=prevLi.html();
					nextLiAfterHtml="<td class='quChenColumnTd'>"+prevLiHtml+"</td>";
				}
			}
			if(nextLi!=null){
				if(prevLi[0]){
					$(nextLi).after(nextLiAfterHtml);
					prevLi.hide();
					prevLi.remove();
					var editOffset=nextLi.find("label.editAble").offset();
					$("#dwCommonEditRoot").show();
					$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
					bindQuHoverItem();
					$(curEditObj).click();
					$(nextLi).find("input[name='quItemSaveTag']").val(0);
					$(nextLi).next().find("input[name='quItemSaveTag']").val(0);
					var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
					quItemBody.find("input[name='saveTag']").val(0);
				}else{
					alert("已经是第一个了！");
				}
			}
		}
		return false;
	});

	function dwOptionUp(prevTd,nextTd){
		var prevTdHtml=prevTd.html();
		$(nextTd).after("<td>"+prevTdHtml+"</td>");
		prevTd.hide();
		prevTd.remove();
		var editOffset=nextTd.find("label.editAble").offset();
		$("#dwCommonEditRoot").show();
		$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
		bindQuHoverItem();
		$(curEditObj).click();
		$(nextTd).find("input[name='quItemSaveTag']").val(0);
		$(nextTd).next().find("input[name='quItemSaveTag']").val(0);
		var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		quItemBody.find("input[name='saveTag']").val(0);
	}

	function dwOptionUp_1(prevTr,nextTr){
		var prevTd=prevTr.find("td").last();
		var nextTd=nextTr.find("td").first();

		var prevTdHtml=prevTd.html();
		var nextTdHtml=nextTd.html();

		prevTd.before("<td>"+nextTdHtml+"</td>");
		$(nextTd).after("<td>"+prevTdHtml+"</td>");

		prevTd.hide();
		prevTd.remove();

		nextTd.hide();
		nextTd.remove();

		 prevTd=prevTr.find("td").last();
		 nextTd=nextTr.find("td").first();

		curEditObj=prevTd.find("label.editAble");
		var editOffset=prevTd.find("label.editAble").offset();
		$("#dwCommonEditRoot").show();
		$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
		bindQuHoverItem();
		$(curEditObj).click();
		$(prevTd).find("input[name='quItemSaveTag']").val(0);
		$(nextTd).find("input[name='quItemSaveTag']").val(0);
		var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		quItemBody.find("input[name='saveTag']").val(0);
	}

	$(".dwOptionDown").unbind();
	$(".dwOptionDown").click(function(){
		//判断类型区别table跟ul中的排序
		var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		var quType=quItemBody.find("input[name='quType']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		if(hv==3){
			var prevTd=$(curEditObj).parents("td");
			var nextTd=prevTd.next();
			if(nextTd[0]){
				dwOptionDown(prevTd, nextTd);
			}else{
				var nextTr=$(curEditObj).parents("tr");
				var prevTr=nextTr.prev();
				if(prevTr[0]){
					prevTd=prevTr.find("td").last();
					dwOptionUp_1(prevTr, nextTr);
				}else{
					alert("已经是第一个了！");
				}
			}
		}else{
			var prevLi=null;
			var nextLi=null;
			var prevLiBeforeHtml="";
			if(quType==="RADIO" || quType==="CHECKBOX" || quType==="ORDERQU"){
				prevLi=$(curEditObj).parents("li.quCoItemUlLi");
				nextLi=prevLi.next();
				var nextLiHtml=nextLi.html();
				prevLiBeforeHtml="<li class='quCoItemUlLi'>"+nextLiHtml+"</li>";
			}else if(quType==="SCORE"){
				prevLi=$(curEditObj).parents("tr.quScoreOptionTr");
				nextLi=prevLi.next();
				var nextLiHtml=nextLi.html();
				prevLiBeforeHtml="<tr class='quScoreOptionTr'>"+nextLiHtml+"</tr>";
			}else if(quType==="MULTIFILLBLANK"){
				prevLi=$(curEditObj).parents("tr.mFillblankTableTr");
				nextLi=prevLi.next();
				var nextLiHtml=nextLi.html();
				prevLiBeforeHtml="<tr class='mFillblankTableTr'>"+nextLiHtml+"</tr>";
			}else if(quType==="CHENRADIO" || quType==="CHENCHECKBOX" || quType==="CHENSCORE" || quType==="CHENFBK"){
				prevLi=$(curEditObj).parents("tr.quChenRowTr");
				if(prevLi[0]){
					nextLi=prevLi.next();
					var nextLiHtml=nextLi.html();
					prevLiBeforeHtml="<tr class='quChenRowTr'>"+nextLiHtml+"</tr>";
				}else{
					prevLi=$(curEditObj).parents("td.quChenColumnTd");
					nextLi=prevLi.next();
					var nextLiHtml=nextLi.html();
					prevLiBeforeHtml="<td class='quChenColumnTd'>"+nextLiHtml+"</td>";
				}
			}

			if(nextLi[0]){
				$(prevLi).before(prevLiBeforeHtml);
				nextLi.hide();
				nextLi.remove();
				var editOffset=prevLi.find("label.editAble").offset();
				$("#dwCommonEditRoot").show();
				$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
				bindQuHoverItem();
				$(curEditObj).click();
				$(prevLi).find("input[name='quItemSaveTag']").val(0);
				$(prevLi).prev().find("input[name='quItemSaveTag']").val(0);
				var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
				quItemBody.find("input[name='saveTag']").val(0);
			}else{
				alert("已经是最后一个了！");
			}
		}

		return false;
	});

	function dwOptionDown(prevTd,nextTd){
		var nextTdHtml=nextTd.html();
		$(prevTd).before("<td>"+nextTdHtml+"</td>");
		nextTd.hide();
		nextTd.remove();
		var editOffset=prevTd.find("label.editAble").offset();
		$("#dwCommonEditRoot").show();
		$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
		bindQuHoverItem();
		$(curEditObj).click();
		$(prevTd).find("input[name='quItemSaveTag']").val(0);
		$(prevTd).next().find("input[name='quItemSaveTag']").val(0);
		var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		quItemBody.find("input[name='saveTag']").val(0);
	}


	$(".dwOptionDel").unbind();
	$(".dwOptionDel").click(function(){
		deleteDwOption();
		return false;
	});

	//引用自address.js
	bindAddrChange();
}

function deleteDwOption(){
	if(curEditObj!=null){
		var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
		var quType=quItemBody.find("input[name='quType']").val();
		if(quType=="RADIO"){
			//添加单选选项
			deleteRadioOption();
		}else if(quType=="CHECKBOX"){
			deleteCheckboxOption();
		}else if(quType=="SCORE"){
			deleteScoreOption();
		}else if(quType=="ORDERQU"){
			deleteOrderquOption();
		}else if(quType=="MULTIFILLBLANK"){
			deleteMultiFillblankOption();
		}else if(quType=="CHENRADIO" || quType=="CHENCHECKBOX" || quType=="CHENFBK" || quType=="CHENSCORE"){
			deleteChenOption();
		}
	}
}

function curEditCallback(){
	if(curEditObj!=null){
		var dwEditHtml=$("#dwComEditContent").html();
		//var curEditObjHtml=$(curEditObj).html();
		setCurEditContent(dwEditHtml);
	}
	$("#dwSurveyNote").removeClass("click");
}

function setCurEditContent(dwEditHtml){

	var thClass=$(curEditObj).attr("class");
	if(dwEditHtml=="" && thClass.indexOf("dwSvyNoteEdit")<0){
		deleteDwOption();
	}else if(dwEditHtml!=curEditObjOldHtml){
		//更新值
		$(curEditObj).html(dwEditHtml);
		//修改保存状态
		setSaveTag0();
	}
	dwCommonEditHide();
}

function dwCommonEditHide(){
	$("#dwCommonEditRoot").hide();
	$(".dwComEditMenuUl").hide();
	curEditObj=null;
}

function setShowDialogOffset(thDialogObj){
	var thObjClass=thDialogObj.attr("class");
	//var item=thDialogObj.parents(".surveyQuItemBody");
	if(thObjClass.indexOf("dwFbMenuBtn")<0 && thObjClass.indexOf("quCoOptionEdit")<0){
		var thOffset=thDialogObj.offset();
		$("#dwCommonDialog").show(0,function(){
			var thOffsetTop=thOffset.top;
			var thOffsetLeft=thOffset.left+40;
			var dwCommonRefIcon=$("#dwCommonDialog").find(".dwCommonRefIcon");
			dwCommonRefIcon.removeClass("right");
			dwCommonRefIcon.removeClass("left");
			/*if(thObjClass.indexOf("addMoreColumnOption")>=0){
				thOffsetLeft=thOffsetLeft-$("#dwCommonDialog").width()-50;
				dwCommonRefIcon.addClass("right");
			}else{
				dwCommonRefIcon.addClass("left");
			}*/
			//自动根据x坐标来判断，取代之前固定的方式，更加灵活
			browseWidth=$(window).width();
			browseHeight=$(window).height();
			if((thOffsetLeft-100)>browseWidth/2){
				thOffsetLeft=thOffsetLeft-$("#dwCommonDialog").width()-50;
				dwCommonRefIcon.addClass("right");
			}else{
				dwCommonRefIcon.addClass("left");
			}
			/*if(thObjClass.indexOf("option_Set")>=0){
				thOffsetLeft=browseWidth/2-$("#dwCommonDialog").width()/2;
				thOffsetTop=browseHeight/2-$("#dwCommonDialog").height()/2;
			}*/
			$("#dwCommonDialog").offset({ top: thOffsetTop, left: thOffsetLeft });
		});
	}

}
//显示模式窗口
function showUIDialog(thDialogObj){
	var thObjClass=thDialogObj.attr("class");

	$("#modelUIDialog").dialog("open");
	$(".dwQuDialogCon").hide();

	if(thObjClass.indexOf("dwFbMenuBtn")>=0){

		$("#modelUIDialog .dwQuFillDataTypeOption").show();

		$("#modelUIDialog").dialog("open");
		var quItemBody=$(thDialogObj).parents(".surveyQuItemBody");
		var checkType_val=quItemBody.find("input[name='checkType']").val();
		var answerInputWidth_val=quItemBody.find("input[name='answerInputWidth']").val();
		var answerInputRow_val=quItemBody.find("input[name='answerInputRow']").val();
		if(checkType_val==""){
			checkType_val="NO";
		}
		var checkType=$("#modelUIDialog select[name='quFill_checkType']");
		checkType.val(checkType_val);
		var qu_inputWidth=$("#modelUIDialog input[name='qu_inputWidth']");
		var qu_inputRow=$("#modelUIDialog input[name='qu_inputRow']");
		if(answerInputWidth_val==""){
			answerInputWidth_val="300";
		}
		if(answerInputRow_val==""){
			answerInputRow_val="1";
		}
		qu_inputWidth.val(answerInputWidth_val);
		qu_inputRow.val(answerInputRow_val);

//		var quItemBody=$(this).parents(".surveyQuItemBody");
		resetQuItemHover(quItemBody);
		$(thDialogObj).parents(".quCoItemUlLi").addClass("menuBtnClick");

		$("#modelUIDialog").dialog("option","height",220);

	}else if(thObjClass.indexOf("quCoOptionEdit")>=0) {
		$("#modelUIDialog .dwQuRadioCheckboxOption").show();
		//设置回显值 isNote checkType
		var quOption_isNote=$("#modelUIDialog input[name='quOption_isNote']");
		var quOption_checkType=$("#modelUIDialog select[name='quOption_checkType']");
		var quOption_isRequiredFill=$("#modelUIDialog input[name='quOption_isRequiredFill']");

		var quOptionParent=$(thDialogObj).parent();
		var isNote_val=quOptionParent.find("input[name='isNote']").val();
		var checkType_val=quOptionParent.find("input[name='checkType']").val();
		var isRequiredFill_val=quOptionParent.find("input[name='isRequiredFill']").val();

		if(isNote_val=="1"){
			quOption_isNote.prop("checked",true);
			$(".quOptionFillContentLi,.quOptionFillRequiredLi").show();
			$("#modelUIDialog").dialog("option","height",250);
		}else{
			quOption_isNote.prop("checked",false);
			$(".quOptionFillContentLi,.quOptionFillRequiredLi").hide();
			$("#modelUIDialog").dialog("option","height",180);
		}
		if(checkType_val==""){
			checkType_val="NO";
		}
		quOption_checkType.val(checkType_val);
		if(isRequiredFill_val=="1"){
			quOption_isRequiredFill.prop("checked",true);
		}else{
			quOption_isRequiredFill.prop("checked",false);
		}
	}else if(thObjClass.indexOf("surveyAttrSetToolbar_li")>=0){
		$("#modelUIDialog .dwSurveyAttrSetDialog").show();
		$("#modelUIDialog").dialog("option","height",490);
		//$("#modelUIDialog").dialog("option","position",["center","center"]);
	}

	dwDialogObj=thDialogObj;
}

//显示弹出层
function showDialog(thDialogObj){

	var thObjClass=thDialogObj.attr("class");

	curEditCallback();
	setShowDialogOffset(thDialogObj);
	//"dwQuSetCon" dwQuAddMore
	var quItemBody=$(thDialogObj).parents(".surveyQuItemBody");
	$("#dwCommonDialog .dwQuDialogCon").hide();
	if(thObjClass.indexOf("addMoreOption")>=0){
		$("#dwCommonDialog .dwQuAddMore").show();
	}else if(thObjClass.indexOf("dwQuSet")>=0){
		$("#dwCommonDialog .dwQuSetCon").show();
		var quType=quItemBody.find("input[name='quType']").val();
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();
		var paramInt01=quItemBody.find("input[name='paramInt01']");
		var paramInt02=quItemBody.find("input[name='paramInt02']");

		//contactsAttr contactsField
		var contactsAttr=quItemBody.find("input[name='contactsAttr']").val();
		var contactsField=quItemBody.find("input[name='contactsField']").val();

		$("#dwCommonDialog input[name='setIsRequired']").prop("checked",false);
		$("#dwCommonDialog input[name='setRandOrder']").prop("checked",false);
		$("#dwCommonDialog select[name='setHv']").val(2);
		$("#dwCommonDialog input[name='setAutoContacts']").prop("checked",false);
		$("#dwCommonDialog .contactsFieldLi").hide();
		$("#dwCommonDialog .contactsAttrLi").hide();
		$("#dwCommonDialog .optionAutoOrder").hide();
		$("#dwCommonDialog .optionRangeHv").hide();
		$("#dwCommonDialog .scoreMinMax").hide();
		$("#dwCommonDialog .minMaxLi").hide();

		if(isRequired==1){
			//alert($("#dwCommonDialog input[name='setIsRequired']").val());
			$("#dwCommonDialog input[name='setIsRequired']").prop("checked",true);
			//alert("set");
		}
		if(randOrder==1){
			$("#dwCommonDialog input[name='setRandOrder']").prop("checked",true);
		}
		if(hv==3){
			$("#dwCommonDialog .option_range_3").show();
		}else{
			$("#dwCommonDialog .option_range_3").hide();
		}
		$("#dwCommonDialog select[name='setHv']").val(hv);
		$("#dwCommonDialog input[name='setCellCount']").val(cellCount);

		//单选，多选 才启用选项随机排列
		if(quType==="RADIO" || quType==="CHECKBOX"){
			$("#dwCommonDialog .optionAutoOrder").show();
			$("#dwCommonDialog .optionRangeHv").show();
		}else if(quType==="ORDERQU"){
			$("#dwCommonDialog .optionAutoOrder").show();
		}else if(quType==="SCORE"){
			$("#dwCommonDialog .optionAutoOrder").show();
			$("#dwCommonDialog .scoreMinMax").show();
			/*if(paramInt01[0]){
				$("#dwCommonDialog .scoreMinMax .minScore").val(paramInt01.val());
			}*/
			if(paramInt02[0]){
				$("#dwCommonDialog .scoreMinMax .maxScore").val(paramInt02.val());
			}
		}else if(quType==="MULTIFILLBLANK"){
			$("#dwCommonDialog .optionAutoOrder").show();
			$("#dwCommonDialog .minMaxLi").show();
			$("#dwCommonDialog .minMaxLi .minSpan .lgleftLabel").text("最少回答");
			$("#dwCommonDialog .minMaxLi .maxSpan").hide();
			$("#dwCommonDialog .minMaxLi .lgRightLabel").text("项");
			if(paramInt01[0]){
				$("#dwCommonDialog .minMaxLi .minNum").val(paramInt01.val());
			}
		}

		//单选，多选，填空题情况下才启用关联到联系设置项
		if((quType=="RADIO" || quType=="CHECKBOX" || quType=="FILLBLANK")){
			$("#dwCommonDialog .contactsAttrLi").show();
			if( contactsAttr==1){
				$("#dwCommonDialog input[name='setAutoContacts']").prop("checked",true);
				$("#dwCommonDialog .contactsFieldLi").show();
				$("#dwCommonDialog select[name='setContactsField']").val(contactsField);
			}
		}
	}else if(thObjClass.indexOf("dwQuLogic")>=0){
		$("#dwCommonDialog .dwQuDialogLoad").show();
	}else if(thObjClass.indexOf("dwFbMenuBtn")>=0){
		$("#dwCommonDialog .dwQuFillDataTypeOption").show();
		var checkType_val=quItemBody.find("input[name='checkType']").val();
		if(checkType_val==""){
			checkType_val="NO";
		}
		var checkType=$("#dwCommonDialog select[name='quFill_checkType']");
		checkType.val(checkType_val);
	}else if(thObjClass.indexOf("quCoOptionEdit")>=0){
		$("#dwCommonDialog .dwQuRadioCheckboxOption").show();
		//设置回显值 isNote checkType
		var quOption_isNote=$("#dwCommonDialog input[name='quOption_isNote']");
		var quOption_checkType=$("#dwCommonDialog select[name='quOption_checkType']");
		var quOption_isRequiredFill=$("#dwCommonDialog input[name='quOption_isRequiredFill']");

		var quOptionParent=$(thDialogObj).parent();
		var isNote_val=quOptionParent.find("input[name='isNote']").val();
		var checkType_val=quOptionParent.find("input[name='checkType']").val();
		var isRequiredFill_val=quOptionParent.find("input[name='isRequiredFill']").val();

		if(isNote_val=="1"){
			quOption_isNote.prop("checked",true);
			$(".quOptionFillContentLi,.quOptionFillRequiredLi").show();
		}else{
			quOption_isNote.prop("checked",false);
			$(".quOptionFillContentLi,.quOptionFillRequiredLi").hide();
		}
		if(checkType_val==""){
			checkType_val="NO";
		}
		quOption_checkType.val(checkType_val);
		if(isRequiredFill_val=="1"){
			quOption_isRequiredFill.prop("checked",true);
		}else{
			quOption_isRequiredFill.prop("checked",false);
		}

	}else{
		//暂时加的
		$("#dwCommonDialog .dwQuAddMore").show();
	}
	dwDialogObj=thDialogObj;

}

function dwCommonDialogHide(){
	$("#dwCommonDialog").hide();
	$(".menuBtnClick").removeClass("menuBtnClick");
	dwDialogObj=null;
}

function resetQuItemHover(quItemBody){
	$(".surveyQuItemBody").removeClass("hover");
	$(".surveyQuItemBody").find("input[name='hoverTag']").val("0");
	if(quItemBody!=null){
		quItemBody.addClass("hover");
		quItemBody.find("input[name='hoverTag']").val("hover");
	}
}

function setSaveTag0(){
	var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
	quItemBody.find("input[name='saveTag']").val(0);

	var thClass=$(curEditObj).attr("class");
	if(thClass.indexOf("quCoTitleEdit")>0){
		//题目标题
		$(curEditObj).parent().find("input[name='quTitleSaveTag']").val(0);
	}else if(thClass.indexOf("quCoOptionEdit")>0){
		//题目选项
		$(curEditObj).parent().find("input[name='quItemSaveTag']").val(0);
	}else if(thClass.indexOf("dwSvyNoteEdit")>=0){
		//问卷欢迎语
		$("input[name='svyNoteSaveTag']").val(0);
	}else if(thClass.indexOf("dwSvyName")>=0){
		$("input[name='svyNmSaveTag']").val(0);
	}
}

//触发显示编辑框
function editAble(editAbleObj){
	dwCommonDialogHide();
	curEditCallback();

	var quItemBody=$(editAbleObj).parents(".surveyQuItemBody");
	resetQuItemHover(quItemBody);

	var thClass=$(editAbleObj).attr("class");
	var editOffset=$(editAbleObj).offset();
	$("#dwCommonEditRoot").removeClass();
	if(thClass.indexOf("quCoTitleEdit")>0){
		//题目标题
		$("#dwCommonEditRoot").addClass("quEdit");
	}else if(thClass.indexOf("quCoOptionEdit")>0){
		//题目选项
		$("#dwCommonEditRoot").addClass("quOptionEdit");
	}else if(thClass.indexOf("dwSvyNoteEdit")>=0){
		//问卷欢迎语
		$("#dwCommonEditRoot").addClass("svyNoteEdit");
	}else if(thClass.indexOf("dwSvyName")>=0){
		$("#dwCommonEditRoot").addClass("svyName");
	}
	$("#dwCommonEditRoot").show();
	$("#dwCommonEditRoot").offset({top:editOffset.top,left:editOffset.left});
	$("#dwComEditContent").focus();
	$("#dwComEditContent").html($(editAbleObj).html());
	var dwEditWidth=$(editAbleObj).width();

	//dwEditWidth<200?dwEditWidth=200:dwEditWidth;
	if(thClass.indexOf("dwSvyNoteEdit")<0 && thClass.indexOf("dwSvyName")<0){
		var hv=quItemBody.find("input[name='hv']").val();
		if(hv==3){
			var dwEditText=$(editAbleObj).text();
			if(dwEditText==""){
				dwEditWidth=$(editAbleObj).parents("td").width()-52;
			}
			dwEditWidth>600?dwEditWidth=600:dwEditWidth;
		}else{
			dwEditWidth<200?dwEditWidth=200:dwEditWidth>600?dwEditWidth=600:dwEditWidth;
		}
	}else{
		dwEditWidth=680;
	}

	$("#dwCommonEditRoot .dwCommonEdit").css("width",dwEditWidth);
	setSelectText($("#dwComEditContent"));
	curEditObj=$(editAbleObj);
	curEditObjOldHtml=$(editAbleObj).html();
}

function resizeWrapSize(){
	if(browseWidth<950){
		$("#wrap").width(950);
		$("#tools_wrap").width(950);
	}else{
		$("#wrap").width("100%");
		$("#tools_wrap").width("100%");
	}
	//保证居中
	if(browseWidth<780){
		$("#dw_body_content").offset({left:0});
	}else{
		var leftOffset=(browseWidth-780)/2;
		$("#dw_body_content").offset({left:leftOffset});
	}
}
/**
 * 保存标记说明
 * saveTag  标记本题有无变动
 * quTitleSaveTag  标记题标题变动
 * quItemSaveTag 标记题选项变动
 * 0=表示有变动，未保存
 * 1=表示已经保存同步
 */
function saveQus(quItemBody,callback,id){
	if(quItemBody[0]){
		var quType=quItemBody.find("input[name='quType']").val();
		if(quType=="RADIO"){
			//保存单选
			saveRadio(quItemBody,callback,id);
		}else if(quType=="CHECKBOX"){
			saveCheckbox(quItemBody, callback,id);
		}else if(quType=="FILLBLANK"){
			saveFillblank(quItemBody, callback,id);
		}else if(quType=="SCORE"){
			saveScore(quItemBody, callback,id);
		}else if(quType=="SCHOOL"){
			saveSchool(quItemBody, callback,id);
		}else if(quType=="PROVINCE"){
			saveProvince(quItemBody, callback,id);
		}else if(quType=="PAGETAG"){
			savePagetag(quItemBody, callback);
		}else if(quType=="PARAGRAPH"){
			saveParagraph(quItemBody, callback);
		}else{
			callback();
		}
	}else{
		callback();
	}
}

//*****单选题****//
/**
** 新保存单选题
**/
function saveRadio(quItemBody,callback,id){
	var saveTag=quItemBody.find("input[name='saveTag']").val();
	if(saveTag==0){
		var quType=quItemBody.find("input[name='quType']").val();
		var quId=quItemBody.find("input[name='quId']").val();
		var orderById=quItemBody.find("input[name='orderById']").val();
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();
		var contactsAttr=quItemBody.find("input[name='contactsAttr']").val();
		var contactsField=quItemBody.find("input[name='contactsField']").val();
		var wjid=id;

		var data="belongId="+questionBelongId+"&orderById="+orderById+"&tag="+svTag+"&quType="+quType+"&quId="+quId;
		data+="&isRequired="+isRequired+"&hv="+hv+"&randOrder="+randOrder+"&cellCount="+cellCount;
		data+="&contactsAttr="+contactsAttr+"&contactsField="+contactsField;
		data+="&wjid="+wjid;

		var quTitle=quItemBody.find(".quCoTitleEdit").html();
		//quTitle=escape(encodeURIComponent(quTitle));
		data+="&quTitle="+quTitle;


		var quItemOptions=null;
		if(hv==3){
			//还有是table的情况需要处理
			quItemOptions=quItemBody.find(".quCoItem table.tableQuColItem tr td");
		}else{
			quItemOptions=quItemBody.find(".quCoItem li.quCoItemUlLi");
		}

		$.each(quItemOptions,function(i){
			var optionValue=$(this).find("label.quCoOptionEdit").html();
			var optionId=$(this).find(".quItemInputCase input[name='quItemId']").val();
			var quItemSaveTag=$(this).find(".quItemInputCase input[name='quItemSaveTag']").val();
			var isNote=$(this).find(".quItemInputCase input[name='isNote']").val();
			var checkType=$(this).find(".quItemInputCase input[name='checkType']").val();
			var isRequiredFill=$(this).find(".quItemInputCase input[name='isRequiredFill']").val();
			if(quItemSaveTag==0){
				// optionValue=escape(encodeURIComponent(optionValue));
				data+="&optionValue_"+i+"="+optionValue;
				data+="&optionId_"+i+"="+optionId;
				data+="&isNote_"+i+"="+isNote;
				data+="&checkType_"+i+"="+checkType;
				data+="&isRequiredFill_"+i+"="+isRequiredFill;
			}
			//更新 字母 title标记到选项上.
			$(this).addClass("quOption_"+i);
		});

		$.ajax({
			url:"/DA/optisave/",
			data:data,
			datatype:"json",
			type:'post',
			success:function(msg){
				//alert(msg);// resultJson quItemId
				if(msg!="error"){

					//执行保存下一题
					saveQus(quItemBody.next(),callback,id);
					//同步-更新题目排序号
					quCBNum2++;
					exeQuCBNum();
				}
			}
		});
	}else{
		saveQus(quItemBody.next(),callback,id);
	}
}

/** 添加选项 **/
/** 添加单选选项   **/
function addRadioItem(quItemBody,itemText){
	//得判断是否是table类型
	var hv=quItemBody.find("input[name='hv']").val();
	var cellCount=quItemBody.find("input[name='cellCount']").val();
	var newEditObj=null;
	if(hv==3){
		//表格处理
		var quRadioItemHtml=$("#quRadioItem").html();
		//var quCoItemUl=quItemBody.find(".quCoItem table");
		var quTableObj=quItemBody.find(".quCoItem table.tableQuColItem");
		var emptyTdDiv=quTableObj.find("div.emptyTd");
		if(emptyTdDiv[0]){
			//表示有空位
			var emptyTd=emptyTdDiv.first().parents("td");
			emptyTd.empty();
			emptyTd.append(quRadioItemHtml);
		}else{
			//木有空位，根据cellCount生成新的tr,td
			var appendTr="<tr>";
			for(var i=0;i<cellCount;i++){
				appendTr+="<td>";
				if(i==0){
					appendTr+=quRadioItemHtml;
				}else{
					appendTr+="<div class='emptyTd'></div>";
				}
				appendTr+="</td>";
			}
			appendTr+="</tr>";
			quTableObj.append(appendTr);
		}
		var tdWidth=parseInt(600/cellCount);
		var tdLabelWidth=tdWidth-10;
		quItemBody.find(".quCoItem .tableQuColItem tr td").width(tdWidth);
		quItemBody.find(".quCoItem .tableQuColItem tr td label").width(tdLabelWidth);
		newEditObj=quItemBody.find(".quCoItem table").find(".editAble").last();
		//itemText="fsdfsdf";
	}else{
		//ul li处理
		var quRadioItemHtml=$("#quRadioItem").html();
		var quCoItemUl=quItemBody.find(".quCoItem ul");
		quCoItemUl.append("<li class='quCoItemUlLi'>"+quRadioItemHtml+"</li>");
		quItemBody.find("input[name='saveTag']").val(0);
		newEditObj=quCoItemUl.find("li:last .editAble");
	}
	newEditObj.text(itemText);
	if(itemText==""){
		newEditObj.css("display","inline");
	}
	return newEditObj;
}
/** 删除单选题选项 **/
function deleteRadioOption(){
	//判断是否是table类型
	var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
	var hv=quItemBody.find("input[name='hv']").val();
	var optionParent=null;
	if(hv==3){
		optionParent=$(curEditObj).parents("td");
	}else{
		optionParent=$(curEditObj).parents("li.quCoItemUlLi");
	}
	var quOptionId=$(optionParent).find("input[name='quItemId']").val();
	if(quOptionId!="" && quOptionId!="0" ){

		var data="quItemId="+quOptionId;
		$.ajax({
			url:"/DA/deleteRadioOption/",
			data:data,
			type:"post",
			success:function(msg){
				if(msg=="true"){
					delQuOptionCallBack(optionParent);
				}
			}
		});
	}else{
		delQuOptionCallBack(optionParent);
	}
}

//*******多选题*******//
/**
** 新保存多选题
**/
function saveCheckbox(quItemBody,callback,id){
	var saveTag=quItemBody.find("input[name='saveTag']").val();
	if(saveTag==0){

		var quType=quItemBody.find("input[name='quType']").val();
		var quId=quItemBody.find("input[name='quId']").val();
		var orderById=quItemBody.find("input[name='orderById']").val();;
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();
		var contactsAttr=quItemBody.find("input[name='contactsAttr']").val();
		var contactsField=quItemBody.find("input[name='contactsField']").val();
		var wjid=id;

		var data="&orderById="+orderById+"&tag="+svTag+"&quType="+quType+"&quId="+quId;
		data+="&isRequired="+isRequired+"&hv="+hv+"&randOrder="+randOrder+"&cellCount="+cellCount;
		data+="&contactsAttr="+contactsAttr+"&contactsField="+contactsField;
		data+="&wjid="+wjid;
		var quTitleSaveTag=quItemBody.find("input[name='quTitleSaveTag']").val();
		if(quTitleSaveTag==0){
			var quTitle=quItemBody.find(".quCoTitleEdit").html();
			//quTitle=escape(encodeURIComponent(quTitle));
			data+="&quTitle="+quTitle;
		}
		var quItemOptions=null;
		if(hv==3){
			//还有是table的情况需要处理
			quItemOptions=quItemBody.find(".quCoItem table.tableQuColItem tr td");
		}else{
			quItemOptions=quItemBody.find(".quCoItem li.quCoItemUlLi");
		}

		$.each(quItemOptions,function(i){
			var optionValue=$(this).find("label.quCoOptionEdit").html();
			var optionId=$(this).find(".quItemInputCase input[name='quItemId']").val();
			var quItemSaveTag=$(this).find(".quItemInputCase input[name='quItemSaveTag']").val();
			var isNote=$(this).find(".quItemInputCase input[name='isNote']").val();
			var checkType=$(this).find(".quItemInputCase input[name='checkType']").val();
			var isRequiredFill=$(this).find(".quItemInputCase input[name='isRequiredFill']").val();
			if(quItemSaveTag==0){
				// optionValue=escape(encodeURIComponent(optionValue));
				data+="&optionValue_"+i+"="+optionValue;
				data+="&optionId_"+i+"="+optionId;
				data+="&isNote_"+i+"="+isNote;
				data+="&checkType_"+i+"="+checkType;
				data+="&isRequiredFill_"+i+"="+isRequiredFill;
			}
			//更新 字母 title标记到选项上.
			$(this).addClass("quOption_"+i);
		});
		//逻辑选项
		var quLogicItems=quItemBody.find(".quLogicItem");
		$.each(quLogicItems,function(i){
			var thClass=$(this).attr("class");
			thClass=thClass.replace("quLogicItem quLogicItem_","");

			var quLogicId=$(this).find("input[name='quLogicId']").val();
			var cgQuItemId=$(this).find("input[name='cgQuItemId']").val();
			var skQuId=$(this).find("input[name='skQuId']").val();
			var logicSaveTag=$(this).find("input[name='logicSaveTag']").val();
			var visibility=$(this).find("input[name='visibility']").val();
			var logicType=$(this).find("input[name='logicType']").val();
			var itemIndex=thClass;
			if(logicSaveTag==0){
				data+="&quLogicId_"+itemIndex+"="+quLogicId;
				data+="&cgQuItemId_"+itemIndex+"="+cgQuItemId;
				data+="&skQuId_"+itemIndex+"="+skQuId;
				data+="&visibility_"+itemIndex+"="+visibility;
				data+="&logicType_"+itemIndex+"="+logicType;
			}
		});

		$.ajax({
			url:"/DA/optisave/",
			data:data,
			type:'post',
			success:function(msg){
				//alert(msg);// resultJson quItemId
				if(msg!="error"){

					//执行保存下一题
					saveQus(quItemBody.next(),callback,id);
					//同步-更新题目排序号
					quCBNum2++;
					exeQuCBNum();
				}
			}
		});
	}else{
		saveQus(quItemBody.next(),callback,id);
	}
}

/** 添加选项 **/
/** 添加多选选项   **/
function addCheckboxItem(quItemBody,itemText){
	//得判断是否是table类型
	var hv=quItemBody.find("input[name='hv']").val();
	var cellCount=quItemBody.find("input[name='cellCount']").val();
	var newEditObj=null;
	if(hv==3){
		//表格处理
		var quRadioItemHtml=$("#quCheckboxItem").html();
		//var quCoItemUl=quItemBody.find(".quCoItem table");
		var quTableObj=quItemBody.find(".quCoItem table.tableQuColItem");
		var emptyTdDiv=quTableObj.find("div.emptyTd");
		if(emptyTdDiv[0]){
			//表示有空位
			var emptyTd=emptyTdDiv.first().parents("td");
			emptyTd.empty();
			emptyTd.append(quRadioItemHtml);
		}else{
			//木有空位，根据cellCount生成新的tr,td
			var appendTr="<tr>";
			for(var i=0;i<cellCount;i++){
				appendTr+="<td>";
				if(i==0){
					appendTr+=quRadioItemHtml;
				}else{
					appendTr+="<div class='emptyTd'></div>";
				}
				appendTr+="</td>";
			}
			appendTr+="</tr>";
			quTableObj.append(appendTr);
		}
		var tdWidth=parseInt(600/cellCount);
		var tdLabelWidth=tdWidth-10;
		quItemBody.find(".quCoItem .tableQuColItem tr td").width(tdWidth);
		quItemBody.find(".quCoItem .tableQuColItem tr td label").width(tdLabelWidth);
		newEditObj=quItemBody.find(".quCoItem table").find(".editAble").last();
		//itemText="fsdfsdf";
	}else{
		//ul li处理
		var quRadioItemHtml=$("#quCheckboxItem").html();
		var quCoItemUl=quItemBody.find(".quCoItem ul");
		quCoItemUl.append("<li class='quCoItemUlLi'>"+quRadioItemHtml+"</li>");
		quItemBody.find("input[name='saveTag']").val(0);
		newEditObj=quCoItemUl.find("li:last .editAble");
	}
	newEditObj.text(itemText);
	if(itemText==""){
		newEditObj.css("display","inline");
	}
	return newEditObj;
}
/** 删除多选题选项 **/
function deleteCheckboxOption(){
	//判断是否是table类型
	var quItemBody=$(curEditObj).parents(".surveyQuItemBody");
	var hv=quItemBody.find("input[name='hv']").val();
	var optionParent=null;
	if(hv==3){
		optionParent=$(curEditObj).parents("td");
	}else{
		optionParent=$(curEditObj).parents("li.quCoItemUlLi");
	}
	var quOptionId=$(optionParent).find("input[name='quItemId']").val();
	if(quOptionId!="" && quOptionId!="0" ){
		var url=ctx+"/design/qu-checkbox!ajaxDelete.action";
		var data="quItemId="+quOptionId;
		$.ajax({
			url:url,
			data:data,
			type:"post",
			success:function(msg){
				if(msg=="true"){
					delQuOptionCallBack(optionParent);
				}
			}
		});
	}else{
		delQuOptionCallBack(optionParent);
	}
}

function delQuOptionCallBack(optionParent){
	var quItemBody=$(optionParent).parents(".surveyQuItemBody");
	var quType=quItemBody.find("input[name='quType']").val();
	if(quType=="CHECKBOX" || quType=="RADIO"){
		var hv=quItemBody.find("input[name='hv']").val();
		if(hv==3){
			//emptyTd
			var optionTr=$(optionParent).parents("tr");
			var optionNextTr=optionTr.next();
			if(optionNextTr[0]){
				//则后面还有是中间选项，则删除，再依次后面的td往前移动
				$(optionParent).remove();
				moveTabelTd(optionNextTr);
			}else{
				//非中间选项，删除-再添加一个空td
				$(optionParent).remove();
				movePareseLastTr(optionTr);
			}
		}else{
			optionParent.remove();
		}
	}else if(quType=="CHENRADIO"  || quType=="CHENCHECKBOX" || quType=="CHENFBK" || quType=="CHENSCORE"){
		//$(curEditObj).parents("td.quChenColumnTd");
		var quCoChenTable=optionParent.parents("table.quCoChenTable");
		var optionParentClass=optionParent.attr("class");
		if(optionParentClass.indexOf("Column")>=0){
			var removeTrs=quCoChenTable.find("tr:gt(0)");
			$.each(removeTrs,function(){
				$(this).find("td:last").remove();
			});
			optionParent.remove();
		}else{
			optionParent.parent().remove();
		}
	}else{
		optionParent.remove();
	}
	dwCommonEditHide();
	bindQuHoverItem();
}
function moveTabelTd(nextTr){
	if(nextTr[0]){
		var prevTr=nextTr.prev();
		var nextTds=nextTr.find("td");
		$(nextTds.get(0)).appendTo(prevTr);
		//判断当前next是否是最后一个，是则：判断如果没有选项，则删除tr,如果有选项，则填一个空td
		var nextNextTr=nextTr.next();
		if(!nextNextTr[0]){
			movePareseLastTr(nextTr);
		}
		moveTabelTd($(nextTr).next());
	}
}
function movePareseLastTr(nextTr){
	var editAbles=nextTr.find(".editAble");
	if(editAbles[0]){
		//有选项，则补充一个空td
		var editAbleTd=editAbles.parents("td");
		editAbleTd.clone().prependTo(nextTr);
		nextTr.find("td").last().html("<div class='emptyTd'></div>");
	}else{
		nextTr.remove();
	}
}

//*******填空题*******//
/**
** 新保存填空题
**/
function saveFillblank(quItemBody,callback,id){
	var saveTag=quItemBody.find("input[name='saveTag']").val();
	if(saveTag==0){

		var quType=quItemBody.find("input[name='quType']").val();
		var quId=quItemBody.find("input[name='quId']").val();
		var orderById=quItemBody.find("input[name='orderById']").val();
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();
		var wjid=id;
		var answerInputWidth=quItemBody.find("input[name='answerInputWidth']").val();
		var answerInputRow=quItemBody.find("input[name='answerInputRow']").val();

		var contactsAttr=quItemBody.find("input[name='contactsAttr']").val();
		var contactsField=quItemBody.find("input[name='contactsField']").val();

		var checkType=quItemBody.find("input[name='checkType']").val();

		var data="orderById="+orderById+"&tag="+svTag+"&quType="+quType+"&quId="+quId;
		data+="&isRequired="+isRequired+"&hv="+hv+"&randOrder="+randOrder+"&cellCount="+cellCount;
		data+="&answerInputWidth="+answerInputWidth+"&answerInputRow="+answerInputRow;
		data+="&contactsAttr="+contactsAttr+"&contactsField="+contactsField+"&checkType="+checkType;
		data+="&wjid="+wjid;

		var quTitleSaveTag=quItemBody.find("input[name='quTitleSaveTag']").val();
		if(quTitleSaveTag==0){
			var quTitle=quItemBody.find(".quCoTitleEdit").html();
			//quTitle=escape(encodeURIComponent(quTitle));
			data+="&quTitle="+quTitle;
		}
		$.ajax({
			url:"/DA/optisave/",
			data:data,
			datatype:'json',
			type:'post',
			success:function(msg){
				//alert(msg);// resultJson quItemId
				if(msg!="error"){
					//执行保存下一题
					saveQus(quItemBody.next(),callback,id);
					//同步-更新题目排序号
					quCBNum2++;
					exeQuCBNum();
				}
			}
		});
	}else{
		saveQus(quItemBody.next(),callback,id);
	}
}

//*****大学****//
/**
** 新保存所在大学
**/
function saveSchool(quItemBody,callback,id){
	var saveTag=quItemBody.find("input[name='saveTag']").val();
	if(saveTag==0){

		var quType=quItemBody.find("input[name='quType']").val();
		var quId=quItemBody.find("input[name='quId']").val();
		var orderById=quItemBody.find("input[name='orderById']").val();
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();
		var wjid=id;
		var answerInputWidth=quItemBody.find("input[name='answerInputWidth']").val();
		var answerInputRow=quItemBody.find("input[name='answerInputRow']").val();

		var contactsAttr=quItemBody.find("input[name='contactsAttr']").val();
		var contactsField=quItemBody.find("input[name='contactsField']").val();

		var checkType=quItemBody.find("input[name='checkType']").val();

		var data="orderById="+orderById+"&tag="+svTag+"&quType="+quType+"&quId="+quId;
		data+="&isRequired="+isRequired+"&hv="+hv+"&randOrder="+randOrder+"&cellCount="+cellCount;
		data+="&answerInputWidth="+answerInputWidth+"&answerInputRow="+answerInputRow;
		data+="&contactsAttr="+contactsAttr+"&contactsField="+contactsField+"&checkType="+checkType;
		data+="&wjid="+wjid;

		var quTitleSaveTag=quItemBody.find("input[name='quTitleSaveTag']").val();
		if(quTitleSaveTag==0){
			var quTitle=quItemBody.find(".quCoTitleEdit").html();
			//quTitle=escape(encodeURIComponent(quTitle));
			data+="&quTitle="+quTitle;
		}
		$.ajax({
			url:"/DA/optisave/",
			data:data,
			datatype:'json',
			type:'post',
			success:function(msg){
				//alert(msg);// resultJson quItemId
				if(msg!="error"){
					//执行保存下一题
					saveQus(quItemBody.next(),callback,id);
					//同步-更新题目排序号
					quCBNum2++;
					exeQuCBNum();
				}
			}
		});
	}else{
		saveQus(quItemBody.next(),callback,id);
	}
}
//*****省份****//
/**
** 新保存所在省份
**/
function saveProvince(quItemBody,callback,id){
	var saveTag=quItemBody.find("input[name='saveTag']").val();
	if(saveTag==0){

		var quType=quItemBody.find("input[name='quType']").val();
		var quId=quItemBody.find("input[name='quId']").val();
		var orderById=quItemBody.find("input[name='orderById']").val();
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();
		var wjid=id;
		var answerInputWidth=quItemBody.find("input[name='answerInputWidth']").val();
		var answerInputRow=quItemBody.find("input[name='answerInputRow']").val();

		var contactsAttr=quItemBody.find("input[name='contactsAttr']").val();
		var contactsField=quItemBody.find("input[name='contactsField']").val();

		var checkType=quItemBody.find("input[name='checkType']").val();

		var data="orderById="+orderById+"&tag="+svTag+"&quType="+quType+"&quId="+quId;
		data+="&isRequired="+isRequired+"&hv="+hv+"&randOrder="+randOrder+"&cellCount="+cellCount;
		data+="&answerInputWidth="+answerInputWidth+"&answerInputRow="+answerInputRow;
		data+="&contactsAttr="+contactsAttr+"&contactsField="+contactsField+"&checkType="+checkType;
		data+="&wjid="+wjid;

		var quTitleSaveTag=quItemBody.find("input[name='quTitleSaveTag']").val();
		if(quTitleSaveTag==0){
			var quTitle=quItemBody.find(".quCoTitleEdit").html();
			//quTitle=escape(encodeURIComponent(quTitle));
			data+="&quTitle="+quTitle;
		}
		$.ajax({
			url:"/DA/optisave/",
			data:data,
			datatype:'json',
			type:'post',
			success:function(msg){
				//alert(msg);// resultJson quItemId
				if(msg!="error"){
					//执行保存下一题
					saveQus(quItemBody.next(),callback,id);
					//同步-更新题目排序号
					quCBNum2++;
					exeQuCBNum();
				}
			}
		});
	}else{
		saveQus(quItemBody.next(),callback,id);
	}
}


//*****评分题****//
/**
** 新保存评分题
**/
function saveScore(quItemBody,callback,id){
	var saveTag=quItemBody.find("input[name='saveTag']").val();
	if(saveTag==0){

		var quType=quItemBody.find("input[name='quType']").val();
		var quId=quItemBody.find("input[name='quId']").val();
		var orderById=quItemBody.find("input[name='orderById']").val();
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();
		var wjid=id;
		var paramInt01=quItemBody.find("input[name='paramInt01']").val();
		var paramInt02=quItemBody.find("input[name='paramInt02']").val();

		var data="belongId="+questionBelongId+"&orderById="+orderById+"&quType="+quType;
		data+="&paramInt01="+paramInt01+"&paramInt02="+paramInt02;
		data+="&wjid="+wjid;

		var quTitleSaveTag=quItemBody.find("input[name='quTitleSaveTag']").val();
		if(quTitleSaveTag==0){
			var quTitle=quItemBody.find(".quCoTitleEdit").html();
			//quTitle=escape(encodeURIComponent(quTitle));
			data+="&quTitle="+quTitle;
		}
		//评分题选项td
		var quItemOptions=quItemBody.find(".quCoItem table.quCoItemTable tr td.quOptionEditTd");
		$.each(quItemOptions,function(i){
			var optionValue=$(this).find("label.quCoOptionEdit").html();
			var optionId=$(this).find(".quItemInputCase input[name='quItemId']").val();
			var quItemSaveTag=$(this).find(".quItemInputCase input[name='quItemSaveTag']").val();
			if(quItemSaveTag==0){
				// optionValue=escape(encodeURIComponent(optionValue));
				data+="&optionValue_"+i+"="+optionValue;
				data+="&optionId_"+i+"="+optionId;
			}
			//更新 字母 title标记到选项上.
			$(this).addClass("quOption_"+i);
		});


		$.ajax({
			url:"/DA/optisave/",
			data:data,
			datatype:'json',
			type:'post',
			success:function(msg){
				//alert(msg);// resultJson quItemId
				if(msg!="error"){

					//执行保存下一题
					saveQus(quItemBody.next(),callback,id);
					//同步-更新题目排序号
					quCBNum2++;
					exeQuCBNum();
				}
			}
		});
	}else{
		saveQus(quItemBody.next(),callback,id);
	}
}

/** 添加选项 **/
/** 添加评分项   **/
function addScoreItem(quItemBody,itemText){
	//得判断是否是table类型
	var newEditObj=null;
	//ul li处理
	var quScoreItemHtml=$("#quScoreItemModel").html();
	var quCoItemTable=quItemBody.find("table.quCoItemTable");
	quCoItemTable.append("<tr class='quScoreOptionTr'>"+quScoreItemHtml+"</tr>");
	quItemBody.find("input[name='saveTag']").val(0);

	var scoreNumTableTr=quCoItemTable.find("tr.quScoreOptionTr:last  .scoreNumTable tr");
	var paramInt02=quItemBody.find("input[name='paramInt02']").val();
	scoreNumTableTr.empty();
	for(var i=1;i<=paramInt02;i++){
		scoreNumTableTr.append("<td>"+i+"</td>");
	}
	quCoItemTable.find("tr.quScoreOptionTr:last input[name='quItemSaveTag']").val(0);

	newEditObj=quCoItemTable.find("tr.quScoreOptionTr:last .editAble");

	newEditObj.text(itemText);
	if(itemText==""){
		newEditObj.css("display","inline");
	}
	return newEditObj;
}
/** 删除评分Score选项 **/
function deleteScoreOption(){
	var optionParent=null;
	optionParent=$(curEditObj).parents("tr.quScoreOptionTr");

	var quOptionId=$(optionParent).find("input[name='quItemId']").val();
	if(quOptionId!="" && quOptionId!="0" ){

		var data="quItemId="+quOptionId;
		$.ajax({
			url:"/DA/optisave/",
			data:data,
			datatype:"json",
			type:"post",
			success:function(msg){
				if(msg=="true"){
					delQuOptionCallBack(optionParent);
				}
			}
		});
	}else{
		delQuOptionCallBack(optionParent);
	}
}



//*******分页标记*******//
/**
** 新保存分页标记
**/
function savePagetag(quItemBody,callback){
	var saveTag=quItemBody.find("input[name='saveTag']").val();
	if(saveTag==0){
		var url=ctx+"/design/qu-pagetag!ajaxSave.action";
		var quType=quItemBody.find("input[name='quType']").val();
		var quId=quItemBody.find("input[name='quId']").val();
		var orderById=quItemBody.find("input[name='orderById']").val();;
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();

		var data="belongId="+questionBelongId+"&orderById="+orderById+"&tag="+svTag+"&quType="+quType+"&quId="+quId;
		data+="&isRequired="+isRequired+"&hv="+hv+"&randOrder="+randOrder+"&cellCount="+cellCount;

		var quTitleSaveTag=quItemBody.find("input[name='quTitleSaveTag']").val();
		if(quTitleSaveTag==0){
			var quTitle=quItemBody.find(".quCoTitleEdit").html();
			// quTitle=escape(encodeURIComponent(quTitle));
			data+="&quTitle="+quTitle;
		}
		//逻辑选项
		var quLogicItems=quItemBody.find(".quLogicItem");
		$.each(quLogicItems,function(i){
			var thClass=$(this).attr("class");
			thClass=thClass.replace("quLogicItem quLogicItem_","");

			var quLogicId=$(this).find("input[name='quLogicId']").val();
			var cgQuItemId=$(this).find("input[name='cgQuItemId']").val();
			var skQuId=$(this).find("input[name='skQuId']").val();
			var logicSaveTag=$(this).find("input[name='logicSaveTag']").val();
			var visibility=$(this).find("input[name='visibility']").val();
			var logicType=$(this).find("input[name='logicType']").val();
			var itemIndex=thClass;
			if(logicSaveTag==0){
				data+="&quLogicId_"+itemIndex+"="+quLogicId;
				data+="&cgQuItemId_"+itemIndex+"="+cgQuItemId;
				data+="&skQuId_"+itemIndex+"="+skQuId;
				data+="&visibility_"+itemIndex+"="+visibility;
				data+="&logicType_"+itemIndex+"="+logicType;
			}

		});

		$.ajax({
			url:url,
			data:data,
			type:'post',
			success:function(msg){
				//alert(msg);// resultJson quItemId
				if(msg!="error"){
					var jsons=eval("("+msg+")");
					//alert(jsons);
					var quId=jsons.id;
					quItemBody.find("input[name='quId']").val(quId);

					//同步logic Id信息
					var quLogics=jsons.quLogics;
					$.each(quLogics,function(i,item){
						var logicItem=quItemBody.find(".quLogicItem_"+item.title);
						logicItem.find("input[name='quLogicId']").val(item.id);
						logicItem.find("input[name='logicSaveTag']").val(1);
					});

					quItemBody.find("input[name='saveTag']").val(1);
					quItemBody.find(".quCoTitle input[name='quTitleSaveTag']").val(1);
					//执行保存下一题
					saveQus(quItemBody.next(),callback);
					//同步-更新题目排序号
					quCBNum2++;
					exeQuCBNum();
				}
			}
		});
	}else{
		saveQus(quItemBody.next(),callback);
	}
}

//*******段落说明题*******//
/**
** 新保存段落题
**/
function saveParagraph(quItemBody,callback){
	var saveTag=quItemBody.find("input[name='saveTag']").val();
	if(saveTag==0){
		var url=ctx+"/design/qu-paragraph!ajaxSave.action";
		var quType=quItemBody.find("input[name='quType']").val();
		var quId=quItemBody.find("input[name='quId']").val();
		var orderById=quItemBody.find("input[name='orderById']").val();;
		var isRequired=quItemBody.find("input[name='isRequired']").val();
		var hv=quItemBody.find("input[name='hv']").val();
		var randOrder=quItemBody.find("input[name='randOrder']").val();
		var cellCount=quItemBody.find("input[name='cellCount']").val();

		var data="belongId="+questionBelongId+"&orderById="+orderById+"&tag="+svTag+"&quType="+quType+"&quId="+quId;
		data+="&isRequired="+isRequired+"&hv="+hv+"&randOrder="+randOrder+"&cellCount="+cellCount;

		var quTitleSaveTag=quItemBody.find("input[name='quTitleSaveTag']").val();
		if(quTitleSaveTag==0){
			var quTitle=quItemBody.find(".quCoTitleEdit").html();
			// quTitle=escape(encodeURIComponent(quTitle));
			data+="&quTitle="+quTitle;
		}
		//逻辑选项
		var quLogicItems=quItemBody.find(".quLogicItem");
		$.each(quLogicItems,function(i){
			var thClass=$(this).attr("class");
			thClass=thClass.replace("quLogicItem quLogicItem_","");

			var quLogicId=$(this).find("input[name='quLogicId']").val();
			var cgQuItemId=$(this).find("input[name='cgQuItemId']").val();
			var skQuId=$(this).find("input[name='skQuId']").val();
			var logicSaveTag=$(this).find("input[name='logicSaveTag']").val();
			var visibility=$(this).find("input[name='visibility']").val();
			var logicType=$(this).find("input[name='logicType']").val();
			var itemIndex=thClass;
			if(logicSaveTag==0){
				data+="&quLogicId_"+itemIndex+"="+quLogicId;
				data+="&cgQuItemId_"+itemIndex+"="+cgQuItemId;
				data+="&skQuId_"+itemIndex+"="+skQuId;
				data+="&visibility_"+itemIndex+"="+visibility;
				data+="&logicType_"+itemIndex+"="+logicType;
			}

		});

		$.ajax({
			url:url,
			data:data,
			type:'post',
			success:function(msg){
				//alert(msg);// resultJson quItemId
				if(msg!="error"){
					var jsons=eval("("+msg+")");
					//alert(jsons);
					var quId=jsons.id;
					quItemBody.find("input[name='quId']").val(quId);

					//同步logic Id信息
					var quLogics=jsons.quLogics;
					$.each(quLogics,function(i,item){
						var logicItem=quItemBody.find(".quLogicItem_"+item.title);
						logicItem.find("input[name='quLogicId']").val(item.id);
						logicItem.find("input[name='logicSaveTag']").val(1);
					});

					quItemBody.find("input[name='saveTag']").val(1);
					quItemBody.find(".quCoTitle input[name='quTitleSaveTag']").val(1);
					//执行保存下一题
					saveQus(quItemBody.next(),callback);
					//同步-更新题目排序号
					quCBNum2++;
					exeQuCBNum();
				}
			}
		});
	}else{
		saveQus(quItemBody.next(),callback);
	}
}



//刷新每题的逻辑显示数目
function refreshQuLogicInfo(quItemBody){
	var quLogicItems=quItemBody.find(".quLogicItem input[name='visibility'][value='1']");
	var quLogicItemSize=quLogicItems.size();
	quItemBody.find(".quLogicInfo").text(quLogicItemSize);
}

function exeQuCBNum(){
	if(quCBNum==quCBNum2){
		quCBNum=0;
		quCBNum2=0;
		//全部题排序号同步一次
		//对如新增插入题-需要同步调整其它题的排序
		//对如删除题-需要同步调整其它题的排序
	}
}

function setSelectText(el) {
    try {
        window.getSelection().selectAllChildren(el[0]); //全选
        window.getSelection().collapseToEnd(el[0]); //光标置后
       /*var Check = check_title_select(el.text());
        window.getSelection().selectAllChildren(el[0]); //全选
        if (!Check) {
            window.getSelection().collapseToEnd(el[0]); //光标置后
        }*/
    } catch (err) {
        //在此处理错误
    }

}

function notify(msg,delayHid) {
	//var msg = "保存成功";
	//alert(msg);
	$(".notification").remove();
	if(delayHid==null){
		delayHid=5000;
	}
	$( "<div>" )
		.appendTo( document.body )
		.text( msg )
		.addClass( "notification ui-state-default ui-corner-bottom" )
		.position({
			my: "center top",
			at: "center top",
			of: window
		})
		.show({
			effect: "blind"
		})
		.delay( delayHid )
		.hide({
			effect: "blind",
			duration: "slow"
		}, function() {
			$( this ).remove();
		});
}