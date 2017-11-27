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

            if(attri == 'level')
                td.innerHTML = stockLevel(obj[i][attri]);
            else if(attri == 'ostatus')
                td.innerHTML = orderStatus(obj[i][attri]);
            else
                td.innerHTML = obj[i][attri];

            tr.appendChild(td);
        }

        div.appendChild(tr);
    }
    var tbody = document.getElementById(tbodyid);
    tbody.innerHTML = div.innerHTML;
}

function displayEditableJson(tbodyid, jsonstr, buttonText, buttonClass, link)
{
    var obj = eval('('+jsonstr+')');

    var div = document.createElement('div');

    for(i=0; i<obj.length; i++)
    {
        var tr = document.createElement('tr');

        for(var attri in obj[i])
        {
            var td = document.createElement('td');

            if(attri == 'level')
                td.innerHTML = stockLevel(obj[i][attri]);
            else if(attri == 'ostatus')
                td.innerHTML = orderStatus(obj[i][attri]);
            else
                td.innerHTML = obj[i][attri];

            tr.appendChild(td);
        }
        var bnttd = document.createElement('td');
        var bnt = document.createElement('button');
        bnt.setAttribute("class", buttonClass);
        bnt.setAttribute("onclick", "sendPost('"+link+"', '"+JSON.stringify(obj[i])+"')");
        bnt.innerHTML = buttonText;
        bnttd.appendChild(bnt);
        tr.appendChild(bnttd);

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

function sendPost(link, data)
{
    $.post(link, {info: data});
}