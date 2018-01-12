import math
import scipy.stats

def lowestcost_model():
    # iobj = Inventory.objects.get(pno=pno, wno=wno)
    dailyDemand = 20
    lt = 1
    demandStd = 2 * math.sqrt(lt)
    setupCost = 20
    holdingCost = 0.25
    shortageCost = 5
    cost = 5

    if holdingCost==0 or cost==0 or dailyDemand==0 or shortageCost==0:
        return 0

    quat = eoq_model(dailyDemand, setupCost,holdingCost, cost)
    isp = 1 - quat*holdingCost*cost/(365*dailyDemand*shortageCost)
    # print(ez_function(isp))
    newquat = math.sqrt(2*365*dailyDemand*(setupCost+shortageCost*demandStd*ez_function(isp))/(holdingCost*cost))

    while abs(newquat-quat) >= 0.01:
        quat = newquat
        isp = 1 - quat * holdingCost * cost / (365 * dailyDemand * shortageCost)
        newquat = math.sqrt(2 * 365 * dailyDemand * (setupCost + shortageCost * demandStd * ez_function(isp)) / (holdingCost * cost))

    return newquat

def eoq_model(dailyDemand, setupCost,holdingCost, cost):
    # iobj = Inventory.objects.get(pno=pno, wno=wno)
    # dailyDemand = iobj.dailyDemand
    # setupCost = iobj.setupCost
    # holdingCost = iobj.holdingCost
    # cost = iobj.pno.cost

    if holdingCost == 0 or cost == 0:
        return 0
    else:
        eoq = math.sqrt(2*365*dailyDemand*setupCost/(holdingCost*cost))

    return eoq

def ez_function(isp):
    z = scipy.stats.norm.ppf(isp, 0, 1)
    return scipy.stats.norm.pdf(z, 0, 1) - z * (1-scipy.stats.norm.cdf(z, 0, 1))

if __name__ == '__main__':
    print(lowestcost_model())