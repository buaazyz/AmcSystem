# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render,render_to_response
from django.template.context import RequestContext
from django.http import HttpResponse
from django.core.serializers.json import DjangoJSONEncoder

from mainsys.models import *

import json
from django.core import serializers

# Create your views here.

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

def selectStock():
    stock = Inventory.objects.values('wno', 'pno', 'pno__pname', 'pno__gauge', 'quantity', 'occupiedQuat', 'level')
    return json.dumps(list(stock))

def displayStock(req):
    data = {}
    data['stock'] = selectStock()

    return render_to_response('inventory.html', data, RequestContext(req))

def refreshStock(req):
    return HttpResponse(selectStock(), content_type='')

def selectTncompleteCOrder():
    incompleteCOrder = CustomerOrder.objects.exclude(ostatus='2').values('ono', 'cid', 'cid__cname', 'amount', 'odate', 'deliveryDate', 'ostatus')
    return json.dumps(list(incompleteCOrder), cls=DjangoJSONEncoder)

def displayIncompleteCOrder(req):
    data = {}
    data['customerOrder'] = selectTncompleteCOrder()

    return render_to_response('incompleteCOrder.html', data, RequestContext(req))

def refreshCOrder(req):
    return HttpResponse(selectTncompleteCOrder(), content_type='')

def handleCOrder(req):
    print(req.POST.get('info'))
    return HttpResponse('', content_type='')