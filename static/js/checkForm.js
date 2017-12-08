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
            newJson = eval('('+newInfo+')');

            displayJsonInTable('corder', newJson['corderInfo']);
            displayJsonInTable('customer', newJson['customerInfo']);
            displayJsonForUpdate('corderDetail', newJson['corderDetailInfo'], 'selectWarehouse');
        });
    }
}

function deleteStockup()
{
    var num = document.getElementsByName("sudno").length;
    var sudDict = new Array();

    for (i = 0; i < num; i++)
    {
        sudno = $('#sudno' + i).attr('value');
        sudDict.push(sudno);
    }

    sendPost('deleteStockup', sudDict.toString());
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
            newJson = eval('('+newInfo+')');

            displayJsonInTable('porder', newJson['porder']);
            displayJsonInTable('supplier', newJson['factory']);
            displayJsonForUpdate('porderDetail', newJson['porderDetail'], 'selectAllWarehouse');
        });
    }
}

function checkReplenishment()
{
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
}

function deleteReplenishment()
{
    var num = document.getElementsByName("rdno").length;
    var rdDict = new Array();

    for (i = 0; i < num; i++)
    {
        rdno = $('#rdno' + i).attr('value');
        rdDict.push(rdno);
    }

    sendPost('deleteReplenishment', rdDict.toString());
}