# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.
class Customer(models.Model):
    CREDIT_LEVEL = (
        ('A', "Excellent"),
        ('B', "Good"),
        ('C', "Ordinary"),
        ('D', "Bad")
    )
    cid = models.CharField(max_length=10, primary_key=True)
    # 顾客（单位）名称
    cname = models.CharField(max_length=40)
    # 联系地址
    caddr = models.CharField(max_length=40)
    # 收货人
    consignee = models.CharField(max_length=20)
    # 收货地址
    conAddr = models.CharField(max_length=40)
    ctel = models.CharField(max_length=11)
    cemail = models.CharField(max_length=40, null=True)
    credit = models.CharField(max_length=1, choices=CREDIT_LEVEL, default='C')

class Factory(models.Model):
    fid = models.CharField(max_length=10, primary_key=True)
    fname = models.CharField(max_length=40)
    faddr = models.CharField(max_length=40, null = True)
    ftel = models.CharField(max_length=11)
    femail = models.CharField(max_length=40, null=True)

class Department(models.Model):
    dno = models.CharField(max_length=10, primary_key=True)
    dname = models.CharField(max_length=20)
    ddesc = models.CharField(max_length=100, null=True)

class staff(models.Model):
    sid = models.CharField(max_length=10, primary_key=True)
    sname = models.CharField(max_length=20)
    authDesc = models.CharField(max_length=100, null=True)
    dept = models.ForeignKey(Department)

class Product(models.Model):
    pno = models.CharField(max_length=10, primary_key=True)
    pname = models.CharField(max_length=20)
    gauge = models.CharField(max_length=20)
    cost = models.FloatField()
    price = models.FloatField()

class Warehouse(models.Model):
    wno = models.CharField(max_length=10, primary_key=True)
    waddr = models.CharField(max_length=40)

class InventoryMgmt(models.Model):
    mgmtno = models.CharField(max_length=10, primary_key=True)
    mgmtDesc = models.CharField(max_length=100)

class StockLevel(models.Model):
    STOCK_LEVEL = (
        ('0', 'Sufficiency'),
        ('1', 'ROP'),
        ('2', 'Danger'),
        ('3', 'Shortage')
    )
    invtLevel = models.CharField(max_length=1, primary_key=True, choices=STOCK_LEVEL)
    levelRate = models.FloatField()

class Inventory(models.Model):
    pno = models.ForeignKey(Product)
    wno = models.ForeignKey(Warehouse)
    # 可用库存
    quantity = models.IntegerField()
    # 已备货库存（已被占用库存），冗余
    occupiedQuat = models.IntegerField(default=0)
    dailyDemand = models.IntegerField()
    setupCost = models.FloatField()
    holdingCost = models.FloatField()
    leadTime = models.FloatField()
    shortagecost = models.FloatField()
    isp = models.FloatField()
    mgmtno = models.ForeignKey(InventoryMgmt)
    level = models.ForeignKey(StockLevel)
    class Meta:
        unique_together = ("pno", "wno")

class Discount(models.Model):
    dcno = models.CharField(max_length=10, primary_key=True)
    dcDesc = models.CharField(max_length=100)
    # 折扣率
    dcRate = models.FloatField(default=0.0)
    # 绝对减免金额
    dcAbs = models.FloatField(default=0.0)

class CustomerOrder(models.Model):
    ORDER_STATUS = (
        ('0', "Unhandled"),
        ('1', "Handled but insufficient"),
        ('2', "Completely handled")
    )
    ono = models.CharField(max_length=10, primary_key=True)
    odate = models.DateField()
    deliveryDate = models.DateField()
    # 冗余
    amount = models.FloatField()
    # 冗余
    ostatus = models.CharField(max_length=1, choices=ORDER_STATUS, default='0')
    cid = models.ForeignKey(Customer)

class COrderDetail(models.Model):
    ono = models.ForeignKey(CustomerOrder, on_delete=models.CASCADE)
    odno = models.CharField(max_length=10, primary_key=True)
    pno = models.ForeignKey(Product)
    pquat = models.IntegerField()
    # 暂未满足数量，冗余
    remainder = models.IntegerField()
    dcno = models.ForeignKey(Discount)
    # 冗余
    subAmount = models.FloatField()
    # class Meta:
    #     unique_together = ("ono", "odno")

class ProductCatalog(models.Model):
    fid = models.ForeignKey(Factory)
    pno = models.ForeignKey(Product)
    quotation = models.FloatField()
    class Meta:
        unique_together = ("fid", "pno")

class PurchasingOrder(models.Model):
    PURCHASINGORDER_STATUS = (
        ('0', "Undelivered"),
        ('1', "Delivered but insufficient"),
        ('2', "Completely delivered")
    )
    pono = models.CharField(max_length=10, primary_key=True)
    podate = models.DateField()
    deliveryDate = models.DateField()
    fid = models.ForeignKey(Factory)
    # 冗余
    amount = models.FloatField()
    # 冗余
    postatus = models.CharField(max_length=1, choices=PURCHASINGORDER_STATUS)

class PurchasingOrderDetail(models.Model):
    pono = models.ForeignKey(PurchasingOrder, on_delete=models.CASCADE)
    podno = models.CharField(max_length=10, primary_key=True)
    pno = models.ForeignKey(Product)
    pquant = models.IntegerField()
    # 暂未到货数量，冗余
    remainder = models.IntegerField()
    price = models.FloatField()
    dcno = models.ForeignKey(Discount)
    # 冗余
    subAmount = models.FloatField()
    # class Meta:
    #     unique_together = ("pono", "podno")

class StockUp(models.Model):
    STOCKUP_STATUS = (
        ('0', "Undelivered"),
        ('1', "Delivered")
    )
    suno = models.CharField(max_length=10, primary_key=True)
    # 对应顾客号，冗余
    cid = models.ForeignKey(Customer)
    # 对应订单号，冗余
    ono = models.ForeignKey(CustomerOrder)
    sudate = models.DateField()
    # 发货状态，冗余
    suStatus = models.CharField(max_length=1, choices=STOCKUP_STATUS, default='0')

class StockUpDetail(models.Model):
    STOCKUPDETAIL_STATUS = (
        ('0', "Sufficient"),
        ('1', "Insufficient"),
        ('2', "Stock out")
    )
    suno = models.ForeignKey(StockUp, on_delete=models.CASCADE)
    sudno = models.CharField(max_length=10)
    # 对应订单细节
    #####
    odno = models.ForeignKey(COrderDetail)
    pno = models.ForeignKey(Product)
    # 发货仓库
    wno = models.ForeignKey(Warehouse)
    # 备货数量
    quat = models.IntegerField()
    # 备货细节状态，冗余
    sudStatus = models.CharField(max_length=1, choices=STOCKUPDETAIL_STATUS)
    class Meta:
        unique_together = ("suno", "sudno")

class DispatchBill(models.Model):
    dbno = models.CharField(max_length=10, primary_key=True)
    # 对应顾客号，冗余
    cid = models.ForeignKey(Customer)
    suno = models.ForeignKey(StockUp)
    dbdate = models.DateField()

class Replenishment(models.Model):
    REPLENISHMENT_STATUS = (
        ('0', "Not replenished"),
        ('1', "Replenished")
    )
    rno = models.CharField(max_length=10, primary_key=True)
    # 冗余
    pono = models.ForeignKey(PurchasingOrder)
    rdate = models.DateField()
    # 入库状态
    rstatus = models.CharField(max_length=1, choices=REPLENISHMENT_STATUS, default='0')

class ReplenishmentDetail(models.Model):
    CHECKOUT_STATUS = (
        ('0', "Unchecked"),
        ('1', "Qualified"),
        ('2', "Unqualified")
    )
    rno = models.ForeignKey(Replenishment, on_delete=models.CASCADE)
    rdno = models.CharField(max_length=10)
    # 对应采购订单细节
    #####
    podno = models.ForeignKey(PurchasingOrderDetail)
    pno = models.ForeignKey(Product)
    # 到货仓库
    wno = models.ForeignKey(Warehouse)
    # 到货数量
    quat = models.IntegerField()
    # 校验状态
    rdStatus = models.CharField(max_length=1, choices=CHECKOUT_STATUS, default='0')
    class Meta:
        unique_together = ("rno", "rdno")

class CustomerPrompt(models.Model):
    cpromptno = models.CharField(max_length=10, primary_key=True)
    # 对应发货单号
    dbno = models.ForeignKey(DispatchBill)
    # 对应顾客号，冗余
    cid = models.ForeignKey(Customer)
    freight = models.FloatField()
    cpdate = models.DateField()

class CustomerReceipt(models.Model):
    creceiptno = models.CharField(max_length=10, primary_key=True)
    # 对应顾客催款单号
    cpromptno = models.ForeignKey(CustomerPrompt)
    crdate = models.DateField()

class SupplierPrompt(models.Model):
    spromptno = models.CharField(max_length=10, primary_key=True)
    # 对应进货单号
    rno = models.ForeignKey(Replenishment)
    freight = models.FloatField()
    spdate = models.DateField()

class SupplierReceipt(models.Model):
    sreceiptno = models.CharField(max_length=10, primary_key=True)
    # 对应供应商催款单号
    spromptno = models.ForeignKey(SupplierPrompt)
    srdate = models.DateField()

class User(models.Model):
    name = models.CharField(max_length=20)
    password = models.CharField(max_length=20)
    usid = models.ForeignKey(staff, on_delete=models.CASCADE,null = True)

class SalesReturn(models.Model):
    SALESRETURN_STATUS = (
        ('0', 'Incompleted'),
        ('1', 'Completed')
    )

    srno = models.CharField(max_length=10, primary_key=True)
    rno = models.ForeignKey(Replenishment)
    srdate = models.DateField()
    srstatus = models.CharField(max_length=1, choices=SALESRETURN_STATUS, default='0')

class SalesReturnDetail(models.Model):
    srno = models.ForeignKey(SalesReturn)
    srdno = models.CharField(max_length=10, primary_key=True)
    rdno = models.ForeignKey(ReplenishmentDetail)

class InventoryAccount(models.Model):
    INVENTORYACCOUNT_TYPE = (
        ('-1', 'Out'),
        ('1', 'In')
    )

    wno = models.ForeignKey(Warehouse)
    pno = models.ForeignKey(Product)
    iatype = models.CharField(max_length=2, choices=INVENTORYACCOUNT_TYPE)
    quantity = models.IntegerField()
    iadate = models.DateField()
    billReference = models.CharField(max_length=10)

class CustomerAccount(models.Model):
    CUSTOMERACCOUNT_TYPE = (
        ('0', 'Unreceived'),
        ('1', 'Received')
    )

    cid = models.ForeignKey(Customer)
    catype = models.CharField(max_length=1, choices=CUSTOMERACCOUNT_TYPE)
    amount = models.FloatField()
    cadate = models.DateField()
    billReference = models.CharField(max_length=10)

class SupplierAccount(models.Model):
    SUPPLIERACCOUNT_TYPE = (
        ('0', 'Unpaid'),
        ('1', 'Paid')
    )

    fid = models.ForeignKey(Factory)
    satype = models.CharField(max_length=1, choices=SUPPLIERACCOUNT_TYPE)
    amount = models.FloatField()
    sadate = models.DateField()
    billReference = models.CharField(max_length=10)