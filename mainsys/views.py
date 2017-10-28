# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render,render_to_response
from django.template.context import RequestContext
from django.http import HttpResponse

from django.shortcuts import render

# Create your views here.

def login(req):
    # return HttpResponse("Hello, world. You're at the polls index.")
    return render_to_response('login.html', {}, RequestContext(req))