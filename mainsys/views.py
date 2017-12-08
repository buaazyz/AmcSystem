# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render,render_to_response
from django.template.context import RequestContext
from django.http import HttpResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponseRedirect

from mainsys.models import *

import json
import datetime
from django.core import serializers

# Create your views here.


## 登录模块 ##
###################

def login(req):
    # return HttpResponse("Hello, world. You're at the polls index.")
    data={}
    if req.method == 'GET':
        return render_to_response('login.html', {}, RequestContext(req))
    else:
        username = req.POST.get('name')
        password = req.POST.get('password')
        if User.objects.filter(name=username, password=password).count() > 0:
            user_id = User.objects.filter(name=username)[0].id
            req.session['user_id'] = user_id
            data['username'] = username
            return render_to_response('mainpage.html', data, RequestContext(req))
        else:
            return render_to_response('login.html', {}, RequestContext(req))

###################


## 库存查询模块 ##
###################

def selectStock():
    stock = Inventory.objects.values('wno', 'pno', 'pno__pname', 'pno__gauge', 'quantity', 'occupiedQuat', 'level')
    return json.dumps(list(stock))

def displayStock(req):
    data = {}
    data['stock'] = selectStock()

    return render_to_response('inventory.html', data, RequestContext(req))

def refreshStock(req):
    return HttpResponse(selectStock(), content_type='')

###################


## 查询未完成顾客订单模块 ##
###################

def selectTncompleteCOrder():
    incompleteCOrder = CustomerOrder.objects.exclude(ostatus='2').values('ono', 'cid', 'cid__cname', 'amount', 'odate', 'deliveryDate', 'ostatus')
    return json.dumps(list(incompleteCOrder), cls=DjangoJSONEncoder)

def displayIncompleteCOrder(req):
    data = {}
    data['customerOrder'] = selectTncompleteCOrder()

    return render_to_response('incompleteCOrder.html', data, RequestContext(req))

def refreshCOrder(req):
    return HttpResponse(selectTncompleteCOrder(), content_type='')

###################


## 查询未完成顾客订单细节模块 ##
###################

def handleCOrder(req):
    reqInfo = json.loads(req.POST.get('info'))
    corderid = reqInfo['ono']
    customerid = reqInfo['cid']

    return render_to_response('corderDetail.html', selectCOrderDetail(corderid, customerid), RequestContext(req))

def selectCOrderDetail(corderid, customerid):
    data = {}

    data['corderInfo'] = selectCOrderById(corderid)
    data['customerInfo'] = selectCustomerById(customerid)
    data['corderDetailInfo'] = selectCOrderDetailById(corderid)

    return data

def selectCOrderDetailById(orderid):
    corderDetail = COrderDetail.objects.filter(ono=orderid).values('odno', 'pno', 'pno__pname', 'pno__gauge', 'pquat', 'remainder')
    return json.dumps(list(corderDetail))

def selectCustomerById(customerid):
    customer = Customer.objects.filter(cid=customerid).values('cid', 'cname', 'caddr', 'consignee', 'conAddr', 'credit')
    return json.dumps(list(customer))

def selectCOrderById(corderid):
    incompleteCOrder = CustomerOrder.objects.filter(ono=corderid).values('ono', 'odate', 'deliveryDate', 'ostatus')
    return json.dumps(list(incompleteCOrder), cls=DjangoJSONEncoder)

def selectWarehouse(req):
    productid = req.POST.get('pno')
    warehouse = Inventory.objects.filter(pno=productid).values('wno')

    return HttpResponse(json.dumps(list(warehouse)), content_type='')

###################


## 备货模块 ##
###################

def stockup(req):
    msg = req.POST.get('msg')
    odobjArray = json.loads(msg)

    for odobj in odobjArray:
        odid = odobj['odno']
        productid = odobj['pno']
        wid = odobj['wno']
        inputQuat = int(odobj['inputQuat'])

        available = Inventory.objects.get(pno=productid, wno=wid).quantity
        remainQuat = COrderDetail.objects.get(odno=odid).remainder

        # 判断备货量是否合理
        if inputQuat > available:
            return HttpResponse(0, content_type='')
        if inputQuat > remainQuat:
            return HttpResponse(-1, content_type='')

    # 生成备货单
    sunum = 1
    sucount = StockUp.objects.count()
    if sucount > 0:
        lastSp = StockUp.objects.all()[sucount-1].suno
        sunum = int(lastSp[2:]) + 1
    suno = 'SP'+str(sunum)
    ono = COrderDetail.objects.get(odno=odobjArray[0]["odno"]).ono
    cid = ono.cid
    sudate = datetime.datetime.now().strftime('%Y-%m-%d')
    suobj = StockUp(suno=suno, cid=cid, ono=ono, sudate=sudate, suStatus='0')
    suobj.save()

    corderSign = 0

    # 生成备货单细节
    for od in odobjArray:
        sudnum = 1
        sudcount = StockUpDetail.objects.count()
        if sudcount > 0:
            sudnum = StockUpDetail.objects.all()[sudcount-1].id + 1
        sudno = 'SPD'+str(sudnum)
        odno = od['odno']
        pno = od['pno']
        wno = od['wno']
        quat = int(od['inputQuat'])
        remainQ = COrderDetail.objects.get(odno=odno).remainder
        if quat == remainQ:
            sudstatus = '0'
        elif quat>0 and quat<remainQ:
            sudstatus = '1'
        else:
            sudstatus = '2'

        # 修改库存
        stockobj = Inventory.objects.get(wno=wno, pno=pno)
        stockobj.quantity = stockobj.quantity - quat
        stockobj.occupiedQuat = stockobj.occupiedQuat + quat
        stockobj.save()
        updateInventoryLevel(wno, pno)

        # 修改订单细节
        odobj = COrderDetail.objects.get(odno=odno)
        odobj.remainder = odobj.remainder - quat
        odobj.save()

        if odobj.remainder > 0:
            corderSign = 1

        # 生成细节
        sudobj = StockUpDetail(suno=StockUp.objects.get(suno=suno), sudno=sudno, odno=COrderDetail.objects.get(odno=odno), pno=Product.objects.get(pno=pno), wno=Warehouse.objects.get(wno=wno), quat=quat, sudStatus=sudstatus)
        sudobj.save()

    # 修改订单
    if corderSign == 0:
        ono.ostatus = '2'
    else:
        ono.ostatus = '1'
    ono.save()

    # 返回刷新
    data = selectCOrderDetail(ono.ono, cid.cid)

    return HttpResponse(json.dumps(data), content_type='')

def updateInventoryLevel(wno, pno):
    stockLevelSet = StockLevel.objects.all()
    sufrate = stockLevelSet.get(invtLevel='0').levelRate
    roprate = stockLevelSet.get(invtLevel='1').levelRate
    dangerrate = stockLevelSet.get(invtLevel='2').levelRate

    stockobj = Inventory.objects.get(wno=wno, pno=pno)
    rop = stockobj.leadTime * stockobj.dailyDemand

    if rop == 0:
        stockobj.level = StockLevel.objects.get(invtLevel='0')
    else:
        rate = stockobj.quantity / rop
        if rate > sufrate:
            stockobj.level = StockLevel.objects.get(invtLevel='0')
        elif rate == roprate:
            stockobj.level = StockLevel.objects.get(invtLevel='1')
        elif rate > dangerrate:
            stockobj.level = StockLevel.objects.get(invtLevel='2')
        else:
            stockobj.level = '3'

    stockobj.save()

###################


## 查询备货单模块 ##
###################

def selectStockupOrder():
    stockupOrder = StockUp.objects.all().values('suno', 'ono', 'cid', 'cid__cname', 'sudate', 'ono__deliveryDate', 'suStatus')

    return json.dumps(list(stockupOrder), cls=DjangoJSONEncoder)

def displayStockupOrder(req):
    data = {}
    data['stkup'] = selectStockupOrder()

    return render_to_response('stockupOrder.html', data, RequestContext(req))

def refreshStockupOrder(req):
    return HttpResponse(selectStockupOrder(), content_type='')

###################


## 查询备货单细节模块 ##
###################

def displayStkupOrderDetail(req):
    data = {}

    reqInfo = json.loads(req.POST.get('info'))
    stockupid = reqInfo['suno']
    customerid = reqInfo['cid']

    data['stkupInfo'] = selectStkupById(stockupid)
    data['customerInfo'] = selectCustomerById(customerid)
    data['stkupDetailInfo'] = selectStkupDetailById(stockupid)

    return render_to_response('stockupDetail.html', data, RequestContext(req))

def selectStkupById(stockupid):
    stockup = StockUp.objects.filter(suno=stockupid).values('suno', 'ono', 'sudate', 'ono__deliveryDate', 'suStatus')

    return json.dumps(list(stockup), cls=DjangoJSONEncoder)

def selectStkupDetailById(stockupid):
    stockupDetail = StockUpDetail.objects.filter(suno=stockupid).values('sudno', 'pno', 'pno__pname', 'pno__gauge', 'wno', 'quat', 'sudStatus')

    return json.dumps(list(stockupDetail))

###################


## 撤销备货单模块 ##
###################

def deleteStockup(req):
    msg = req.POST.get('info')
    sudnoArray = msg.split(',')

    corderSign = '2'
    stockupobj = StockUpDetail.objects.get(sudno=sudnoArray[0]).suno
    corderobj = stockupobj.ono

    # 删除备货单细节
    for sudno in sudnoArray:
        sudobj = StockUpDetail.objects.get(sudno=sudno)

        # 修改库存
        wno = sudobj.wno.wno
        pno = sudobj.pno.pno
        inputQuat = sudobj.quat
        stockobj = Inventory.objects.get(wno=wno, pno=pno)
        stockobj.quantity = stockobj.quantity + inputQuat
        stockobj.occupiedQuat = stockobj.occupiedQuat - inputQuat
        stockobj.save()
        updateInventoryLevel(wno, pno)

        # 修改订单细节状态
        odobj = sudobj.odno
        odobj.remainder = odobj.remainder + inputQuat
        odobj.save()

        if(odobj.remainder > 0):
            corderSign = '1'

        # 删除备货单细节
        sudobj.delete()

    # 修改订单状态
    corderobj.ostatus = corderSign
    corderobj.save()

    # 删除备货单
    stockupobj.delete()

    return displayStockupOrder(req)

###################


## 未到货采购订单查询模块 ##
###################

def displayUndeliveredPOrder(req):
    data = {}
    data['undeliveredPO'] = selectUndeliveredPOrder()

    return render_to_response('undeliveredPOrder.html', data, RequestContext(req))

def refreshUndeliveredPOrder(req):
    return HttpResponse(selectUndeliveredPOrder(), content_type='')

def selectUndeliveredPOrder():
    undeliveredPO = PurchasingOrder.objects.exclude(postatus='2').values('pono', 'fid', 'fid__fname', 'amount', 'podate', 'deliveryDate', 'postatus')

    return json.dumps(list(undeliveredPO), cls=DjangoJSONEncoder)

###################


## 未到货采购订单细节查询模块 ##
###################

def handlePOrder(req):
    reqInfo = json.loads(req.POST.get('info'))
    porderid = reqInfo['pono']
    factoryid = reqInfo['fid']

    return render_to_response('porderDetail.html', selectPOrderDetail(porderid, factoryid), RequestContext(req))

def selectPOrderDetail(pono, fid):
    data = {}

    data['porder'] = selectPOrderById(pono)
    data['factory'] = selectFactoryById(fid)
    data['porderDetail'] = selectPOrderDetailById(pono)

    return data

def selectPOrderById(pono):
    poobj = PurchasingOrder.objects.filter(pono=pono).values('pono', 'podate', 'deliveryDate', 'postatus')
    return json.dumps(list(poobj), cls=DjangoJSONEncoder)

def selectFactoryById(fid):
    factoryobj = Factory.objects.filter(fid=fid).values('fid', 'fname', 'faddr', 'ftel')
    return json.dumps(list(factoryobj))

def selectPOrderDetailById(pono):
    podobj = PurchasingOrderDetail.objects.filter(pono=pono).values('podno', 'pno', 'pno__pname', 'pno__gauge', 'pquant', 'remainder')
    return json.dumps(list(podobj))

def selectAllWarehouse(req):
    warehouse = Warehouse.objects.all().values("wno")

    return HttpResponse(json.dumps(list(warehouse)), content_type='')

###################


## 接收物料模块 ##
###################

def receiveMaterial(req):
    msg = req.POST.get('msg')
    podobjArray = json.loads(msg)

    # 判断接收量是否合理
    for podobj in podobjArray:
        podno = podobj['podno']
        inputQuat = int(podobj['inputQuat'])
        remainQuat = PurchasingOrderDetail.objects.get(podno=podno).remainder

        if inputQuat > remainQuat:
            return HttpResponse(-1, content_type='')


    # 生成补货单
    rnnum = 1
    rncount = Replenishment.objects.count()
    if rncount > 0:
        lastRn = Replenishment.objects.all()[rncount - 1].rno
        rnnum = int(lastRn[2:]) + 1
    rnno = 'RN' + str(rnnum)
    poobj = PurchasingOrderDetail.objects.get(podno=podobjArray[0]["podno"]).pono
    rndate = datetime.datetime.now().strftime('%Y-%m-%d')
    rnobj = Replenishment(rno=rnno, pono=poobj, rdate=rndate, rstatus='0')
    rnobj.save()

    porderSign = 0

    # 生成补货单细节
    for pod in podobjArray:
        rndnum = 1
        rndcount = ReplenishmentDetail.objects.count()
        if rndcount > 0:
            rndnum = ReplenishmentDetail.objects.all()[rndcount - 1].id + 1
        rndno = 'RND' + str(rndnum)
        podobj = PurchasingOrderDetail.objects.get(podno=pod['podno'])
        productobj = Product.objects.get(pno=pod['pno'])
        warehouseobj = Warehouse.objects.get(wno=pod['wno'])
        quat = int(pod['inputQuat'])
        rndobj = ReplenishmentDetail(rno=rnobj, rdno=rndno, podno=podobj, pno=productobj, wno=warehouseobj, quat=quat, rdStatus='0')
        rndobj.save()

        # 修改采购订单细节
        podobj.remainder = podobj.remainder - quat
        podobj.save()

        if podobj.remainder > 0:
            porderSign = 1

    # 修改采购订单
    if porderSign == 0:
        poobj.postatus = '2'
    else:
        poobj.postatus = '1'

    poobj.save()

    # 返回刷新
    data = selectPOrderDetail(poobj.pono, poobj.fid.fid)

    return HttpResponse(json.dumps(data), content_type='')

###################


## 查询未校验补货单模块 ##
###################

def displayUncheckedRn(req):
    data = {}
    data['uncheckedRn'] = selectUncheckedRn()

    return render_to_response('uncheckedRn.html', data, RequestContext(req))

def refreshUncheckedRn(req):
    return HttpResponse(selectUncheckedRn(), content_type='')

def selectUncheckedRn():
    uncheckedRn = Replenishment.objects.filter(rstatus='0').values('rno', 'pono', 'pono__fid', 'pono__fid__fname', 'rdate', 'rstatus')

    return json.dumps(list(uncheckedRn), cls=DjangoJSONEncoder)

###################


## 查询未校验补货单细节模块 ##
###################

def checkMaterial(req):
    reqInfo = json.loads(req.POST.get('info'))
    rno = reqInfo['rno']
    factoryid = reqInfo['pono__fid']

    return render_to_response('replenishmentDetail.html', selectRDetail(rno, factoryid), RequestContext(req))

def selectRDetail(rno, fid):
    data = {}

    data['replenishment'] = selectReplenishmentById(rno)
    data['factory'] = selectFactoryById(fid)
    data['rdetail'] = selectRDetailById(rno)

    return data

def selectReplenishmentById(rno):
    robj = Replenishment.objects.filter(rno=rno).values('rno', 'pono', 'rdate', 'rstatus')
    return json.dumps(list(robj), cls=DjangoJSONEncoder)

def selectRDetailById(rno):
    rdobj = ReplenishmentDetail.objects.filter(rno=rno).values('rdno', 'pno', 'pno__pname', 'pno__gauge', 'wno', 'quat')
    return json.dumps(list(rdobj))

###################


## 入库模块 ##
###################

def replenish(req):
    msg = req.POST.get('msg')
    rdobjArray = json.loads(msg)

    # 修改补货单细节
    for rd in rdobjArray:
        rdno = rd['rdno']
        rdstatus = rd['rdstatus']

        rdobj = ReplenishmentDetail.objects.get(rdno=rdno)
        rdobj.rdStatus = rdstatus
        rdobj.save()

        # 若产品合格则修改库存
        if rdobj.rdStatus == '1':
            replenishQuat = rdobj.quat
            inventoryobjects = Inventory.objects.filter(wno=rdobj.wno, pno=rdobj.pno)
            if inventoryobjects.count() > 0:
                inventoryobj = Inventory.objects.get(wno=rdobj.wno, pno=rdobj.pno)
                inventoryobj.quantity = inventoryobj.quantity + replenishQuat
            else:
                inventoryobj = Inventory(wno=rdobj.wno, pno=rdobj.pno, quantity=replenishQuat, occupiedQuat=0, dailyDemand=0, setupCost=0, holdingCost=0, leadTime=0, shortagecost=0, isp=0.95, mgmtno=InventoryMgmt.objects.get(mgmtno='000'), level=StockLevel.objects.get(invtLevel='0'))
            inventoryobj.save()
            updateInventoryLevel(inventoryobj.wno.wno, inventoryobj.pno.pno)

    # 修改补货单
    robj = ReplenishmentDetail.objects.get(rdno=rdobjArray[0]['rdno']).rno
    robj.rstatus = '1'
    robj.save()
    # 返回刷新
    data = selectRDS(robj.rno, robj.pono.fid.fid)

    return HttpResponse(json.dumps(data), content_type='')

def selectRDS(rno, fid):
    data = {}

    data['replenishment'] = selectReplenishmentById(rno)
    data['factory'] = selectFactoryById(fid)
    data['rdwithStatus'] = selectRDSById(rno)

    return data

def selectRDSById(rno):
    rdobj = ReplenishmentDetail.objects.filter(rno=rno).values('rdno', 'pno', 'pno__pname', 'pno__gauge', 'wno', 'quat', 'rdStatus')
    return json.dumps(list(rdobj))

###################


## 查询补货单模块 ##
###################

def displayReplenishment(req):
    data = {}
    data['rn'] = selectRn()

    return render_to_response('allRn.html', data, RequestContext(req))

def refreshReplenishment(req):
    return HttpResponse(selectRn(), content_type='')

def selectRn():
    robj = Replenishment.objects.all().values('rno', 'pono', 'pono__fid', 'pono__fid__fname', 'rdate', 'rstatus')
    return json.dumps(list(robj), cls=DjangoJSONEncoder)

def selectAllRD(req):
    reqInfo = json.loads(req.POST.get('info'))
    rno = reqInfo['rno']
    factoryid = reqInfo['pono__fid']

    return render_to_response('rdwithStatus.html', selectRDS(rno, factoryid), RequestContext(req))

###################


## 撤销补货单模块 ##
###################

def deleteReplenishment(req):
    msg = req.POST.get('info')
    rdnoArray = msg.split(',')

    postatus = '2'
    robj = ReplenishmentDetail.objects.get(rdno=rdnoArray[0]).rno
    poobj = robj.pono

    # 删除补货单细节
    for rdno in rdnoArray:
        rdobj = ReplenishmentDetail.objects.get(rdno=rdno)

        # 修改采购订单细节
        podobj = rdobj.podno
        replenishQuat = rdobj.quat
        podobj.remainder = podobj.remainder + replenishQuat
        podobj.save()

        if podobj.remainder > 0:
            postatus = '1'

        rdobj.delete()

    # 修改采购订单状态
    poobj.postatus = postatus
    poobj.save()

    # 删除补货单
    robj.delete()

    return displayReplenishment(req)