function checkStockUp()
{
    var num = document.getElementsByName("odno").length;
    var oDict = new Array();

    var isEmpty = 1;

    for(i=0; i<num; i++)
    {
        odno = $("#odno"+i).attr("value");
        pno = $("#pno"+i).text();
        remainder = parseInt($("#remainder"+i).text());
        wno = $("#warehouse"+i).find("option:selected").val();
        inputQuat = $("#inputQuat"+i).val();

        odDict = {};

        if(inputQuat == '')
        {
            $("#inputQuat"+i).val(0);
            $("#inputQuat"+i).attr("style", "color:#FF0000");
            return;
        }
        else if(inputQuat.search('[^0-9]')!=-1  || (inputQuat.search(0)==0 && inputQuat.search('[^0]')>0))
        {
            $("#inputQuat" + i).attr("style", "color:#FF0000");
            return;
        }
        else if(inputQuat<0 || inputQuat>remainder)
        {
            $("#inputQuat" + i).attr("style", "color:#FF0000");
            return;
        }
        else
        {
            $("#inputQuat" + i).attr("style", "color:#000000");
            if(inputQuat > 0)
            {
                isEmpty = 0;
                odDict['odno'] = odno;
                odDict['pno'] = pno;
                odDict['wno'] = wno;
                odDict['inputQuat'] = inputQuat;
                oDict.push(JSON.stringify(odDict));
            }
        }
    }

    if(isEmpty == 0)
    {
        $.post('stockup', {msg: '[' + oDict.toString() + ']'}, function (newInfo) {
            if(newInfo == -1)
            {
                swal({
                    title: "数据传输错误",
                    text: "请重新加载页面",
                    type: "warning"
                });
            }
            else if(newInfo == 0)
            {
                swal({
                    title: "库存不足",
                    text: "请核对库存",
                    type: "warning"
                });
            }
            else
            {
                swal({
                    title: "备货成功",
                    type: "success"
                });

                newJson = eval('('+newInfo+')');

                displayJsonInTable('corder', newJson['corderInfo']);
                displayJsonInTable('customer', newJson['customerInfo']);
                displayJsonForUpdate('corderDetail', newJson['corderDetailInfo'], 'selectWarehouse');
            }
        });
    }
}

function deleteStockup()
{
    swal({
        title: "您确定要删除备货单吗？",
        text: "删除后将无法恢复，请谨慎操作！",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "删除",
        closeOnConfirm: false
        }, function () {
            var num = document.getElementsByName("sudno").length;
            var sudDict = new Array();

            for (i = 0; i < num; i++)
            {
                sudno = $('#sudno' + i).attr('value');
                sudDict.push(sudno);
            }

            sendPost('deleteStockup', sudDict.toString());

            swal({
                title: "删除成功",
                type: "success",
                closeOnConfirm: true
            });
    });

    // var num = document.getElementsByName("sudno").length;
    // var sudDict = new Array();
    //
    // for (i = 0; i < num; i++)
    // {
    //     sudno = $('#sudno' + i).attr('value');
    //     sudDict.push(sudno);
    // }
    //
    // sendPost('deleteStockup', sudDict.toString());
}

function checkReceipt()
{
    var num = document.getElementsByName("podno").length;
    var poDict = new Array();

    var isEmpty = 1;

    for(i=0; i<num; i++)
    {
        podno = $("#podno"+i).attr("value");
        pno = $("#pno"+i).text();
        remainder = parseInt($("#remainder"+i).text());
        wno = $("#warehouse"+i).find("option:selected").val();
        inputQuat = $("#inputQuat"+i).val();

        podDict = {};

        if(inputQuat == '')
        {
            $("#inputQuat"+i).val(0);
            $("#inputQuat"+i).attr("style", "color:#FF0000");
            return;
        }
        else if(inputQuat.search('[^0-9]')!=-1  || (inputQuat.search(0)==0 && inputQuat.search('[^0]')>0))
        {
            $("#inputQuat" + i).attr("style", "color:#FF0000");
            return;
        }
        else if(inputQuat<0 || inputQuat>remainder)
        {
            $("#inputQuat" + i).attr("style", "color:#FF0000");
            return;
        }
        else
        {
            if(inputQuat > 0)
            {
                isEmpty = 0;
                podDict['podno'] = podno;
                podDict['pno'] = pno;
                podDict['wno'] = wno;
                podDict['inputQuat'] = inputQuat;
                poDict.push(JSON.stringify(podDict));
            }
        }
    }

    if(isEmpty == 0)
    {
        $.post('receiveMaterial', {msg: '[' + poDict.toString() + ']'}, function (newInfo) {
            if(newInfo == -1)
            {
                swal({
                    title: "数据传输错误",
                    text: "请重新加载页面",
                    type: "warning"
                });
            }
            else
            {
                swal({
                    title: "已接收物料",
                    type: "success"
                });

                newJson = eval('('+newInfo+')');

                displayJsonInTable('porder', newJson['porder']);
                displayJsonInTable('supplier', newJson['factory']);
                displayJsonForUpdate('porderDetail', newJson['porderDetail'], 'selectAllWarehouse');
            }
        });
    }
}

function checkReplenishment()
{
    swal({
            title: "您确定提交校验信息吗？",
            text: "提交校验信息后无法撤销，请谨慎操作！",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "提交",
            cancelButtonText: "重新核对信息",
            closeOnConfirm: false,
            closeOnCancel: false
        },
        function (isConfirm) {
            if (isConfirm) {
                var num = document.getElementsByName("rdno").length;
                var rDict = new Array();

                for(i=0; i<num; i++)
                {
                    rdno = $("#rdno"+i).attr("value");
                    rdstatus = $("#rdstatus"+i).find("option:selected").val();

                    rdDict = {}
                    rdDict['rdno'] = rdno;
                    rdDict['rdstatus'] = rdstatus;
                    rDict.push(JSON.stringify(rdDict));
                }

                $.post('replenishMaterial', {msg: '['+rDict.toString()+']'}, function (newInfo) {
                    newJson = eval('('+newInfo+')');

                    displayJsonInTable('replenishment', newJson['replenishment']);
                    displayJsonInTable('supplier', newJson['factory']);
                    displayJsonInTable('replenishmentDetail', newJson['rdwithStatus']);

                    $("#replenishbnt").attr("disabled", "disabled");
                });

                swal("已提交校验信息", "", "success");
            }
            else {
                swal("已取消", "", "error");
            }
    });

    // var num = document.getElementsByName("rdno").length;
    // var rDict = new Array();
    //
    // for(i=0; i<num; i++)
    // {
    //     rdno = $("#rdno"+i).attr("value");
    //     rdstatus = $("#rdstatus"+i).find("option:selected").val();
    //
    //     rdDict = {}
    //     rdDict['rdno'] = rdno;
    //     rdDict['rdstatus'] = rdstatus;
    //     rDict.push(JSON.stringify(rdDict));
    // }
    //
    // $.post('replenishMaterial', {msg: '['+rDict.toString()+']'}, function (newInfo) {
    //     newJson = eval('('+newInfo+')');
    //
    //     displayJsonInTable('replenishment', newJson['replenishment']);
    //     displayJsonInTable('supplier', newJson['factory']);
    //     displayJsonInTable('replenishmentDetail', newJson['rdwithStatus']);
    //
    //     $("#replenishbnt").attr("disabled", "disabled");
    // });
}

function deleteReplenishment()
{
    swal({
        title: "您确定要删除补货单吗？",
        text: "删除后将无法恢复，请谨慎操作！",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "删除",
        closeOnConfirm: false
        },
        function () {
            var num = document.getElementsByName("rdno").length;
            var rdDict = new Array();

            for (i = 0; i < num; i++)
            {
                rdno = $('#rdno' + i).attr('value');
                rdDict.push(rdno);
            }

            sendPost('deleteReplenishment', rdDict.toString());

            swal({
                title: "删除成功",
                type: "success",
                closeOnConfirm: true
            });
    });

    // var num = document.getElementsByName("rdno").length;
    // var rdDict = new Array();
    //
    // for (i = 0; i < num; i++)
    // {
    //     rdno = $('#rdno' + i).attr('value');
    //     rdDict.push(rdno);
    // }
    //
    // sendPost('deleteReplenishment', rdDict.toString());
}

function returnSales()
{
    srno = $('#srno0').text();

    $.post('sendReturnSales', {msg: srno}, function (newInfo) {
        swal({
            title: "已退货",
            type: "success"
        });

        newJson = eval('('+newInfo+')');

        displayJsonInTable('salesReturn', newJson['SalesReturn']);
        displayJsonInTable('supplier', newJson['factory']);
        displayJsonInTable('srDetail', newJson['srdetail']);

        $("#returnSalesBnt").attr("disabled", "disabled");
    });
}

function deliver()
{
    freight = $('#freight').val();

    if(freight == '')
    {
        $("#freight").val(0);
        $("#freight").attr("style", "color:#FF0000");
        return;
    }
    else if(isNaN(freight) || freight < 0)
    {
        $("#freight").attr("style", "color:#FF0000");
        return;
    }
    else
    {
        $("#freight").attr("style", "color:#000000");
    }

    suno = $('#suno0').text();

    msgDict = {};
    msgDict['freight'] = freight;
    msgDict['suno'] = suno;

    $.post('deliver', {msg: JSON.stringify(msgDict)}, function (newInfo) {
        swal({
            title: "订单已发货",
            type: "success"
        });

        newJson = eval('('+newInfo+')');

        displayJsonInTable('stockup', newJson['stkupInfo']);
        displayJsonInTable('customer', newJson['customerInfo']);
        displayJsonInTable('stockupDetail', newJson['stkupDetailInfo']);

        $("#deliverBnt").attr("disabled", "disabled");
    });
}

function receive()
{
    cpromptno = $('#cpromptno0').text()

    $.post('receiptCP', {msg: cpromptno}, function (newInfo) {
        swal({
            title: "已收款",
            type: "success"
        });

        newJson = eval('('+newInfo+')');

        displayJsonInTable('customerPrompt', newJson['customerPrompt']);
        displayJsonInTable('customer', newJson['customer']);
        displayJsonInTable('cpDetail', newJson['cpdetail']);

        $("#receiveBnt").attr("disabled", "disabled");
    });
}