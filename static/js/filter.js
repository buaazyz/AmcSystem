function srFilter()
{
    var sign = $('#incompleteSR').attr("value");
    if (sign == "0")
    {
        $('#incompleteSR').attr("value", "1");
        sign = "1";
    }
    else
    {
        $('#incompleteSR').attr("value", "0");
        sign = "0";
    }

    if(sign == "0")
    {
        $.get("refreshSR", function(newInfo){
            displayEditableJson('SalesReturn', newInfo, '查看细节', 'btn btn-info ', 'returnSales', 'fa fa-search')
        });
    }
    else
    {
        $.get("refreshIncompletedSR", function(newInfo){
            displayEditableJson('SalesReturn', newInfo, '查看细节', 'btn btn-info ', 'returnSales', 'fa fa-search')
        });
    }
}

function iaccountDateFilter()
{
    var startDate = $('#start').val();
    var endDate = $('#end').val();

    data = {};
    data['startDate'] = startDate;
    data['endDate'] = endDate;

    $.post('iaccountDateFilter', {msg:JSON.stringify(data)}, function (newInfo) {
        displayJsonInTable('inventoryAccountTable', newInfo);
    });
}

function cpFilter()
{
    var sign = $('#unreceivedCP').attr("value");
    if (sign == "0")
    {
        $('#unreceivedCP').attr("value", "1");
        sign = "1";
    }
    else
    {
        $('#unreceivedCP').attr("value", "0");
        sign = "0";
    }

    if(sign == "0")
    {
        $.get("refreshCustomerPrompt", function(newInfo){
            displayEditableJson('customerPrompt', newInfo, '查看细节', 'btn btn-info ', 'cpdetail-receipt', 'fa fa-search')
        });
    }
    else
    {
        $.get("refreshUnreceivedCP", function(newInfo){
            displayEditableJson('customerPrompt', newInfo, '查看细节', 'btn btn-info ', 'cpdetail-receipt', 'fa fa-search')
        });
    }
}

function salesAccountFilter()
{
    data = {};

    data['cid'] = $('#cid').val();
    data['startDate'] = $('#start').val();
    data['endDate'] = $('#end').val();

    $.post('saFilter', {msg:JSON.stringify(data)}, function (newInfo) {
        var newJson = eval('('+newInfo+')');
        displayJsonInTable('salesAccountTable', newJson['salesAccount']);
        $('#unpaid').text(newJson['unpaid']);
        $('#paid').text(newJson['paid']);
    });
}