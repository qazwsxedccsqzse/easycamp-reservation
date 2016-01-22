<?php if(!empty($store_header)){?>
<?=$store_header?>
<?php } ?>
<div class="container" ng-app="app">
  <div class="row" ng-controller="MainController">
    <div class="col-md-9 col-sm-9">

      <div class="freeinfo margin-bottom-15">
        <div class="row">
          <div class="col-md-3 col-sm-12 col-xs-12 margin-top-10 margin-bottom-10">
            <h4 class="margin-top-10">訂位日期: {{campDate}}</h4>
          </div>
          <div class="col-md-3  col-sm-4 col-xs-12 margin-top-10 margin-bottom-10">
            <h4 class="margin-top-10">露營天數: {{campDays.opt}}</h4>
          </div>
          <div class="col-md-3 col-sm-4 col-xs-12 margin-top-10 margin-bottom-10">
            <button type="button"
              id="resetCampDays"
              class="btn btn-primary"
              data-toggle="modal"
              data-target="#myModal2"
              ><h4 class="margin-bottom-0"><i class="fa fa-history  class="margin-right-10""></i> 點我重選天數</h4></button>
          </div>
          <div class="col-md-3 col-sm-4 col-xs-12 margin-top-10 margin-bottom-10">
            <a
              class="btn btn-info"
              ng-href="{{calendarUrl}}"
              ng-click="reChooseDate()"><h4 class="margin-bottom-0"><i class="fa fa-calendar margin-right-10"></i>點我重選日期</h4></a>
          </div>
        </div>
      </div>

      <div class="orderselect" ng-hide="campArea.length === 0">
        <h2>營位介紹</h2>
        <div>
          <table class="table">
            <thead>
              <tr class="warning">
                <th style="width:15%">圖片</th>
                <th style="width:20%">營位分區</th>
                <th style="width:30%">日期 / 價格</th>
                <th style="width:10%">數量</th>
                <th style="width:10%">價格</th>
                <th style="width:10%">小計</th>
              </tr>
            </thead>
            <tbody>
            <tr ng-repeat="item in campArea track by $index"
                ng-hide="item.stock <= 0"
                ng-if="item.attr.length === campDays.id">
              <td ng-click="showModal(item)" data-toggle="modal" data-target="#myModal" style="cursor: pointer;">
                <img ng-src="{{item.img_src}}" alt="" width="80"/>
              </td>
              <td ng-click="showModal(item)" data-toggle="modal" data-target="#myModal" style="cursor: pointer;">
                <div>
                  {{item.Item_Name}}
                </div>
                <div>
                  尚有 <span class="text-danger"><b class="font-size-20">{{item.stock}}</b></span> 個營位
                </div>
              </td>
              <td>
                <span ng-repeat="attr in item.attr">
                 <div class="">
                    {{attr.attribute_sku}} (<span class="price">${{attr.sale_price}}</span>)
                 </div>
                </span>
               </td>
              <td>
                <select class="form-control font-size-20"
                  ng-model="item.qty"
                  ng-options="n for n in range(item,campDays.id)"
                  ng-change="inputCampCheck(item)"
                  >
                </select>
              </td>
              <td class="price">${{item.attr_total_price}}</td>
              <td class="price">${{item.qty * item.attr_total_price}}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="orderselect" ng-hide="campHead.length === 0">
        <h2>加購人頭</h2>
        <div>
          <table class="table">
            <thead>
              <tr class="warning">
                <th style="width:15%">圖片</th>
                <th style="width:45%">收費說明</th>
                <th style="width:10%">數量</th>
                <th style="width:10%">價格</th>
                <th style="width:10%">小計</th>
              </tr>
            </thead>
            <tbody>
            <tr ng-repeat="item in campHead track by $index">
              <td><img ng-src="{{item.img_src}}" alt="" width="80" /></td>
              <td><span ng-bind-html="item.Description_L"></span></td>
              <td>
                <select class="form-control font-size-20"
                  ng-model="item.listQty"
                  ng-options="n for n in range(item,campDays.id)"
                  ng-change="inputHeadCheck(item)"
                  ng-hide="item.stock <= 0"
                  >
                </select>
              </td>
              <td class="price">${{item.attr_total_price}} x {{campDays.id}}</td>
              <td class="price">${{item.listQty * item.attr_total_price * campDays.id}}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="orderselect" ng-hide="campProducts.length === 0">
        <h2>加購商品</h2>
        <div>
          <table class="table">
            <thead>
              <tr class="warning">
                <th style="width:15%">圖片</th>
                <th style="width:50%">商品名稱</th>
                <th style="width:10%">數量</th>
                <th style="width:10%">價格</th>
                <th style="width:10%">小計</th>
              </tr>
            </thead>
            <tbody>
            <tr
              ng-repeat="item in campProducts track by $index"
              ng-hide="item.stock <= 0"
              >
              <td ng-click="showModal(item)" data-toggle="modal" data-target="#myModal" style="cursor: pointer;">
                <img ng-src="{{item.img_src}}" alt="" width="80" />
              </td>
              <td ng-click="showModal(item)" data-toggle="modal" data-target="#myModal" style="cursor: pointer;">{{item.Item_Name}}</td>
              <td>
                <select class="form-control font-size-20"
                  ng-model="item.qty"
                  ng-options="n for n in range(item,campDays.id)"
                  ng-change="inputAddCheck(item)"
                  >
                </select>
              </td>
              <td class="price">${{item.attr_total_price}}</td>
              <td class="price">${{item.qty * item.attr_total_price}}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="orderselect" ng-hide="campService.length === 0">
        <h2>加購服務</h2>
        <div>
          <table class="table">
            <thead>
              <tr class="warning">
                <th style="width:15%">圖片</th>
                <th style="width:45%">活動類型</th>
                <th style="width:10%">數量</th>
                <th style="width:10%">價格</th>
                <th style="width:10%">小計</th>
              </tr>
            </thead>
            <tbody>
              <tr
                ng-repeat="item in campService track by $index"
                ng-hide="item.stock <= 0">
                <td ng-click="showModal(item)" data-toggle="modal" data-target="#myModal" style="cursor: pointer;">
                  <img ng-src="{{item.img_src}}" alt="" width="80" /></td>
                <td ng-click="showModal(item)" data-toggle="modal" data-target="#myModal" style="cursor: pointer;">
                  {{item.Item_Name}}
                </td>
                <!--td ng-bind-html="item.Description_L" class="disabled-3">
                </td -->
                <td>
                  <select class="form-control font-size-20"
                    ng-model="item.qty"
                    ng-options="n for n in range(item,campDays.id)"
                    ng-change="inputServiceCheck(item)"
                    >
                  </select>
                </td>
                <td class="price">${{item.attr_total_price}}</td>
                <td class="price">${{item.qty * item.attr_total_price}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-sm-3">
      <div class="freeinfo margin-bottom-30">
        <h2>購買清單</h2>
        <table class="table orderselect margin-bottom-15">
          <thead>
          <tr>
            <td style="width:5%"></td>
            <td style="width:45%">名稱</td>
            <td style="width:25%">數量</td>
            <td style="width:25%" class="price">小計</td>
          </tr>
          </thead>
          <tr ng-repeat="item in carts">
            <td style="width:5%"><i class="fa fa-times" style="cursor:pointer;" ng-click="deleteCartItem(item)"></i></td>
            <td style="width:45%">{{item.Item_Name}}</td>
            <td style="width:25%;text-align:center;">{{item.qty}}</td>
            <td style="width:25%" class="price">${{item.qty * item.attr_total_price}}</td>
          </tr>
          <tr>
            <td style="width:20%" colspan="2">總計</td>
            <td style="width:80%" colspan="2" class="price text-right"><h3><b>${{cartTotal()}}</b></h3></td>
          </tr>
        </table>
        <div class="btn red" ng-click="submit()" style="cursor: pointer;"><a>立即結帳</a></div>
      </div>
    </div>
    <!-- modal1 starts -->
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content" style="float:left;">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title" id="myModalLabel">{{modal.modalTitle}}</h4>
          </div>
          <div class="modal-body">
            <!-- show more imgs -->
            <div class="col-md-12 col-sm-12 col-xs-12">
              <div class="allimg margin-bottom-20" ng-repeat="src in modal.srcs">
                <img ng-src="{{src}}" />
              </div>
            </div>
            <!-- show description -->
            <div class="col-md-12 col-sm-12 col-xs-12 margin-bottom-10">
              <div class="" ng-bind-html="modal.modalBody">
              </div>
            </div>
          </div>
　　　   </div>
　    </div>
   </div>
   <!-- Modal1 end -->

   <!-- modal2 starts -->
   <div class="modal fade" id="myModal2" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
     <div class="modal-dialog" role="document">
       <div class="modal-content">
         <div class="modal-header">
           <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
           <h4 class="modal-title" id="myModalLabel">請先選擇露營天數</h4>
         </div>
         <div class="modal-body">
           <select class="form-control font-size-20" style="height: 100%;"
             ng-model="campDays"
             ng-options="d.opt for d in campDaysOptions"
             ng-change="getCampOnlines(campDays,resetCarts)"
             >
           </select>
         </div>
         <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">確認</button>
        </div>
　　　   </div>
　    </div>
  </div>
  <!-- Modal2 end -->
  </div>
</div>
