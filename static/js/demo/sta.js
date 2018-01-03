function inventoryAccountSta(dateArray, quatArray)
{
    var lineChart = echarts.init(document.getElementById("inventory-sta"));
    var lineoption = {
        title : {
            text: '出入库统计'
        },
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            data:['出入库量']
        },
        grid:{
            x:40,
            x2:40,
            y2:24
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : dateArray
            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLabel : {
                    formatter: '{value}'
                }
            }
        ],
        series : [
            {
                name:'出入库量',
                type:'line',
                data: quatArray,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    lineChart.setOption(lineoption);
    $(window).resize(lineChart.resize);
}

function iaSta()
{
    var wno = $('#wno').val();
    var pno = $('#pno').val();
    var startDate = $('#start').val();
    var endDate = $('#end').val();

    if(pno == '')
    {
        swal({
            title: "产品编号不能为空",
            text: "",
            type: "warning"
        });
    }

    data = {};
    data['wno'] = wno;
    data['pno'] = pno;
    data['startDate'] = startDate;
    data['endDate'] = endDate;

    $.post('displayIASta', {msg:JSON.stringify(data)}, function (newInfo) {
        if(newInfo == -1)
        {
            swal({
                    title: "数据传输错误",
                    text: "请刷新页面",
                    type: "warning"
                });
        }
        else
        {
            dateArray = new Array();
            quatArray = new Array();

            newJson = eval('('+newInfo+')')
            for(i=0; i<newJson.length; i++)
            {
                dateArray.push(newJson[i]['iadate']);
                quatArray.push(newJson[i]['quantity__sum']);
            }
            $('#iaTable').bootstrapTable('load', newJson);
            inventoryAccountSta(dateArray, quatArray)
        }
    });
}

function salesAccountSta(dateArray, amountArray)
{
    var lineChart = echarts.init(document.getElementById("sales-sta"));
    var lineoption = {
        title : {
            text: '销售统计'
        },
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            data:['销售金额']
        },
        grid:{
            x:40,
            x2:40,
            y2:24
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : dateArray
            }
        ],
        yAxis : [
            {
                type : 'value',
                axisLabel : {
                    formatter: '{value}'
                }
            }
        ],
        series : [
            {
                name:'销售金额',
                type:'line',
                data: amountArray,
                markPoint : {
                    data : [
                        {type : 'max', name: '最大值'},
                        {type : 'min', name: '最小值'}
                    ]
                },
                markLine : {
                    data : [
                        {type : 'average', name: '平均值'}
                    ]
                }
            }
        ]
    };
    lineChart.setOption(lineoption);
    $(window).resize(lineChart.resize);
}

function saSta()
{
    var cid = $('#cid').val();
    var startDate = $('#start').val();
    var endDate = $('#end').val();

    data = {};
    data['cid'] = cid;
    data['startDate'] = startDate;
    data['endDate'] = endDate;

    $.post('displaySASta', {msg:JSON.stringify(data)}, function (newInfo) {
        dateArray = new Array();
        amountArray = new Array();

        newJson = eval('('+newInfo+')')
        for(i=0; i<newJson.length; i++)
        {
            dateArray.push(newJson[i]['cadate']);
            amountArray.push(newJson[i]['amount__sum']);
        }
        $('#salesTable').bootstrapTable('load', newJson);
        salesAccountSta(dateArray, amountArray)
    });
}