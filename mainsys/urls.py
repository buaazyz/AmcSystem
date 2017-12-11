"""AMCsys URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from mainsys.views import *


urlpatterns = [
    url(r'^$', login),
    url(r'^login$', login),
    url(r'^displayStock$', displayStock),
    url(r'^refreshStock$', refreshStock),
    url(r'^displayFactory$', displayFactory),
    url(r'^refreshFactory$', refreshFactory),
    url(r'^displayCatalog$', displayCatalog),
    url(r'^refreshCatalog$', refreshCatalog),
    url(r'^displayIncompleteCOrder$', displayIncompleteCOrder),
    url(r'^refreshCOrder$', refreshCOrder),
    url(r'^handleCOrder$', handleCOrder),
    url(r'^selectWarehouse$', selectWarehouse),
    url(r'^stockup$', stockup),
    url(r'^displayStkupOrder$', displayStockupOrder),
    url(r'^refreshStkupOrder$', refreshStockupOrder),
    url(r'^stkupOrderDetail$', displayStkupOrderDetail),
    url(r'^deleteStockup$', deleteStockup),
    url(r'^displayUndeliveredPOrder$', displayUndeliveredPOrder),
    url(r'^refreshPOrder$', refreshUndeliveredPOrder),
    url(r'^handlePOrder$', handlePOrder),
    url(r'^selectAllWarehouse$', selectAllWarehouse),
    url(r'^receiveMaterial$', receiveMaterial),
    url(r'^displayUncheckedRn$', displayUncheckedRn),
    url(r'^refreshRn$', refreshUncheckedRn),
    url(r'^checkMaterial$', checkMaterial),
    url(r'^replenishMaterial$', replenish),
    url(r'^displayReplenishment$', displayReplenishment),
    url(r'^refreshAllRn$', refreshReplenishment),
    url(r'^selectAllRD$', selectAllRD),
    url(r'^deleteReplenishment$', deleteReplenishment)
]
