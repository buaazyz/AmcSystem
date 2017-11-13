# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render,render_to_response
from django.template.context import RequestContext
from django.http import HttpResponse
from django.shortcuts import render

from mainsys.models import *

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

