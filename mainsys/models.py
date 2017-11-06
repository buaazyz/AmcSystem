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

class Inventory(models.Model):
    pno = models.ForeignKey(Product)
    wno = models.ForeignKey(Warehouse)
    # 可用库存
    quantity = models.IntegerField()
    dailyDemand = models.IntegerField()
    setupCost = models.FloatField()
    holdingCost = models.FloatField()
    leadTime = models.FloatField()
    shortagecost = models.FloatField()
    mgmtno = models.ForeignKey(InventoryMgmt)
    class Meta:
        unique_together = ("pno", "wno")

class Discount(models.Model):
    dcno = models.CharField(max_length=10, primary_key=True)
    dcDesc = models.CharField(max_length=100)
    # 折扣率
    dcRate = models.FloatField(default=0.0)
    # 减免金额
    dcAbs = models.FloatField(default=0.0)

class CustomerOrder(models.Model):
    ORDER_STATUS = (
        '0', "Unhandled"
        '1', "Handled but insufficient"
        '2', "Completely handled"
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
    odno = models.CharField(max_length=10)
    pno = models.ForeignKey(Product)
    pquat = models.IntegerField()
    dcno = models.ForeignKey(Discount)
    # 冗余
    subAmount = models.FloatField()
    class Meta:
        unique_together = ("ono", "odno")

class ProductCatalog(models.Model):
    fid = models.ForeignKey(Factory)
    pno = models.ForeignKey(Product)
    quotation = models.FloatField()
    class Meta:
        unique_together = ("fid", "pno")

class PurchasingOrder(models.Model):
    pono = models.CharField(max_length=10, primary_key=True)
    podate = models.DateField()
    deliveryDate = models.DateField()
    fid = models.ForeignKey(Factory)
    # 冗余
    amount = models.FloatField()

class PurchasingOrderDetail(models.Model):
    pono = models.ForeignKey(PurchasingOrder, on_delete=models.CASCADE)
    podno = models.CharField(max_length=10)
    pno = models.ForeignKey(Product)
    pquant = models.IntegerField()
    price = models.FloatField()
    dcDesc = models.CharField(max_length=100, null=True)
    # 冗余
    subAmount = models.FloatField()
    class Meta:
        unique_together = ("pono", "podno")