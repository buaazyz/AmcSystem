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