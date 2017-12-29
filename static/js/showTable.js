function displayJsonInTable(tbodyid, jsonstr)
{
    var obj = eval('('+jsonstr+')');

    var div = document.createElement('div');

    for(i=0; i<obj.length; i++)
    {
        var tr = document.createElement('tr');

        for(var attri in obj[i])
        {
            var td = document.createElement('td');
            td.setAttribute("id", attri+i);
            td.setAttribute("name", attri);

            if(attri == 'level')
                td.innerHTML = stockLevel(obj[i][attri]);
            else if(attri == 'ostatus')
                td.innerHTML = orderStatus(obj[i][attri]);
            else if(attri == 'credit')
                td.innerHTML = creditStatus(obj[i][attri]);
            else if(attri == 'suStatus')
                td.innerHTML = suStatus(obj[i][attri]);
            else if(attri == 'sudno')
            {
                td.setAttribute("value", obj[i][attri]);
                td.innerHTML = i + 1;
            }
            else if(attri == 'sudStatus')
                td.innerHTML = sudStatus(obj[i][attri]);
            else if(attri == 'postatus')
                td.innerHTML = poStatus(obj[i][attri]);
            else if(attri == 'rstatus')
                td.innerHTML = rnStatus(obj[i][attri]);
            else if(attri == 'rdStatus')
                td.innerHTML = rndstatus(obj[i][attri]);
            else if(attri == 'rdno')
            {
                td.setAttribute("value", obj[i][attri]);
                td.innerHTML = i + 1;
            }
            else if(attri == 'srdno')
            {
                td.setAttribute("value", obj[i][attri]);
                td.innerHTML = i + 1;
            }
            else if(attri == 'srstatus')
                td.innerHTML = srstatus(obj[i][attri]);
            else
                td.innerHTML = obj[i][attri];

            tr.appendChild(td);
        }

        div.appendChild(tr);
    }
    var tbody = document.getElementById(tbodyid);
    tbody.innerHTML = div.innerHTML;
}

function displayEditableJson(tbodyid, jsonstr, buttonText, buttonClass, link, iconclass)
{
    var obj = eval('('+jsonstr+')');

    var div = document.createElement('div');

    for(i=0; i<obj.length; i++)
    {
        var tr = document.createElement('tr');

        for(var attri in obj[i])
        {
            var td = document.createElement('td');
            td.setAttribute("id", attri+i);
            td.setAttribute("name", attri);

            if(attri == 'ostatus')
                td.innerHTML = orderStatus(obj[i][attri]);
            else if(attri == 'suStatus')
                td.innerHTML = suStatus(obj[i][attri]);
            else if(attri == 'postatus')
                td.innerHTML = poStatus(obj[i][attri]);
            else if(attri == 'rstatus')
                td.innerHTML = rnStatus(obj[i][attri]);
            else if(attri == 'srstatus')
                td.innerHTML = srstatus(obj[i][attri]);
            else
                td.innerHTML = obj[i][attri];

            tr.appendChild(td);
        }
        var bnttd = document.createElement('td');
        var bnt = document.createElement('button');
        bnt.setAttribute("class", buttonClass);
        bnt.setAttribute("onclick", "sendPost('"+link+"', '"+JSON.stringify(obj[i])+"')");
        bnt.innerHTML = '<i class="'+iconclass+'"></i>&nbsp;'+buttonText;
        bnttd.appendChild(bnt);
        tr.appendChild(bnttd);

        div.appendChild(tr);
    }
    var tbody = document.getElementById(tbodyid);
    tbody.innerHTML = div.innerHTML;
}

function displayJsonForUpdate(tbodyid, jsonstr, link)
{
    var obj = eval('('+jsonstr+')');

    var div = document.createElement('div');

    var i = 0;
    for(; i<obj.length; i++)
    {
        var tr = document.createElement('tr');

        for(var attri in obj[i])
        {
            var td = document.createElement('td');

            td.setAttribute("id", attri+i);
            td.setAttribute("name", attri);

            if(attri == 'odno')
            {
                td.setAttribute("value", obj[i][attri]);
                td.innerHTML = i + 1;
            }
            else if(attri == 'podno')
            {
                td.setAttribute("value", obj[i][attri]);
                td.innerHTML = i + 1;
            }
            else
                td.innerHTML = obj[i][attri];

            tr.appendChild(td);
        }

        var selecttd = document.createElement('td');
        var select = document.createElement('select');
        select.setAttribute("id", "warehouse"+i);
        select.setAttribute("name", "warehouse");
        select.setAttribute("style", "font-size:14px");
        selecttd.appendChild(select);
        tr.appendChild(selecttd);

        var inputtd = document.createElement('td');
        var input = document.createElement('input');
        input.setAttribute("id", "inputQuat"+i);
        input.setAttribute("name", "inputQuat");
        input.setAttribute("class", "form-control");
        inputtd.appendChild(input);
        tr.appendChild(inputtd);

        div.appendChild(tr);
    }
    var tbody = document.getElementById(tbodyid);
    tbody.innerHTML = div.innerHTML;

    for(j=0; j<i; j++)
    {
        addOption(j, link);
    }
}

function displayJsonForCheck(tbodyid, jsonstr)
{
    var obj = eval('('+jsonstr+')');

    var div = document.createElement('div');

    for(i=0; i<obj.length; i++)
    {
        var tr = document.createElement('tr');

        for(var attri in obj[i])
        {
            var td = document.createElement('td');
            td.setAttribute("id", attri+i);
            td.setAttribute("name", attri);

            if(attri == 'rdno')
            {
                td.setAttribute("value", obj[i][attri]);
                td.innerHTML = i + 1;
            }
            else
                td.innerHTML = obj[i][attri];

            tr.appendChild(td);
        }
        var selecttd = document.createElement('td')
        var select = document.createElement('select')
        select.setAttribute("id", "rdstatus"+i);
        select.setAttribute("name", "rdstatus");
        select.setAttribute("style", "font-size:14px");

        var qualifiedOp = document.createElement('option');
        qualifiedOp.setAttribute("value", "1");
        qualifiedOp.setAttribute("style", "font-size:14px");
        qualifiedOp.innerHTML = "合格";
        select.appendChild(qualifiedOp);
        var unqualifiedOp = document.createElement('option');
        unqualifiedOp.setAttribute("value", "2");
        unqualifiedOp.setAttribute("style", "font-size:14px");
        unqualifiedOp.innerHTML = "不合格";
        select.appendChild(unqualifiedOp);

        selecttd.appendChild(select);
        tr.appendChild(selecttd);

        div.appendChild(tr);
    }
    var tbody = document.getElementById(tbodyid);
    tbody.innerHTML = div.innerHTML;
}

function stockLevel(status)
{
    var level;

    if(status == 0)
        level =  '库存充足';
    else if(status == 1)
        level =  '再订货点';
    else if(status == 2)
        level =  '危险水平';
    else
        level = '缺货水平';
    return level;
}

function orderStatus(status)
{
    var result;

    if(status == 0)
        result = '未处理';
    else if(status == 1)
        result = '处理中';
    else
        result = '已完成';

    return result;
}

function creditStatus(credit)
{
    var result;

    if(credit == 'A')
        result = '极好';
    else if(credit == 'B')
        result = '良好';
    else if(credit == 'C')
        result = '一般';
    else
        result = '差';

    return result;
}

function suStatus(status)
{
    var result;

    if(status == '0')
        result = '未发货';
    else
        result = '已发货';

    return result;
}

function sudStatus(status)
{
    var result;

    if(status == '0')
        result = '完全备货';
    else if(status == '1')
        result = '部分备货';
    else
        result = '完全备货';

    return result;
}

function poStatus(status)
{
    var result;

    if(status == '0')
        result = '未接收物料';
    else if(status == '1')
        result = '部分接收物料';
    else
        result = '完全接收物料';

    return result;
}

function rnStatus(status)
{
    var result;

    if(status == '0')
        result = '未校验';
    else
        result = '已校验';

    return result;
}

function rndstatus(status)
{
    var result;

    if(status == '0')
        result = '未校验';
    else if(status == '1')
        result = '合格';
    else
        result = '不合格';

    return result;
}

function srstatus(status)
{
    var result;

    if(status == '0')
        result = '未退货';
    else
        result = '已退货';

    return result;
}

function sendPost(link, data)
{
    var tempForm = document.createElement('form');
    tempForm.setAttribute('action', link);
    tempForm.setAttribute('method', "post");
    tempForm.setAttribute('style', 'display:none');

    var tempInfo = document.createElement('textarea');
    tempInfo.setAttribute('name', "info");
    tempInfo.value = data;
    tempForm.appendChild(tempInfo);

    $(document.body).append(tempForm);

    tempForm.submit();
}

function addOption(num, link)
{
    var select = document.getElementById('warehouse'+num);
    var productid = document.getElementById('pno'+num).innerHTML;

    $.post(link, {pno: productid}, function (info) {
        var obj = eval('('+info+')');

        for(i=0; i<obj.length; i++)
        {
            var option = document.createElement('option');
            option.setAttribute("value", obj[i]["wno"]);
            option.setAttribute("style", "font-size:14px");
            option.innerHTML = obj[i]['wno'];
            select.appendChild(option);
        }
    });
}