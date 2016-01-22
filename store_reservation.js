var app = angular.module('app',['ngSanitize']);
app.controller('MainController',['$scope','$http','$sce',MainController]);


function MainController($scope, $http,$sce) {
  var urlArray = document.URL.replace('#','').split('/');
  // initialize
  // modal的內容
  $scope.modal = { modalTitle : '', modalBody : '' , srcs : [] };
  // 購物車
  $scope.carts = [];
  // 露營日期
  $scope.campDate = urlArray[urlArray.indexOf("store_reservation")+2];
  // 露營天數的選項
  $scope.campDaysOptions = [{id:1,opt:'2天1夜'},{id:2,opt:'3天2夜'},{id:3,opt:'4天3夜'},{id:4,opt:'5天4夜'},{id:5,opt:'6天5夜'}];
  // 使用者選定的露營天數
  $scope.campDays = $scope.campDaysOptions[0];
  // 控制營區型商品減少數量那顆按鈕是否disabled
  $scope.campDisable = true;
  // 控制營區內的一般商品減少數量那顆按鈕是否disabled
  $scope.campProductDisable = true;
  // 控制加購人頭商品減少數量那顆按鈕是否disabled
  $scope.campHeadDisable = true;
  // 控制加購服務商品減少數量那顆按鈕是否disabled
  $scope.campServiceDisable = true;
  // 建立初始的store_id預設
  $scope.store_id = urlArray[urlArray.indexOf("store_reservation")+1];
  // 營位商品
  $scope.campArea = [];
  // 營區本身的商品
  $scope.campProducts = [];
  // 營區的加購人頭商品
  $scope.campHead = [];
  // 營區的加購服務
  $scope.campService = [];
  $scope.vip = 0;
  $scope.redirectUrl = '';
  $scope.headCount = 0;
  $scope.calendarUrl = '/store/camp_stock/' + $scope.store_id;

  // 呼叫時清除購物車
  $scope.clearCart = function(){
    $http.post('/ajax_cart/clear_shopping_cart')
    .success(function(res){
    }).error(function(res){
      console.log(res);
    });
  };

  $scope.reChooseDate = function(){
    var answer = confirm('如果離開此頁面將會清除訂位清單中的商品,您確定要離開嗎?');
    if (!answer) {
      event.preventDefault();
    }else{
      // 清除綁定的事件
      delete window.onbeforeunload;
      $scope.clearCart();
    }
  };

  $scope.getVip = function(){
    $http.post('/ajax_store/get_login_status',{currentUrl:document.URL})
    .success(function(res){
      if(res.status){
        $scope.vip = parseInt(res.value,10);
        $scope.redirectUrl = res.url;
      }else{
        alert(res.msg);
        return;
      }
    }).error(function(res){
      console.log(res);
    });
  };
  /**
   *
   */
   $scope.getCarts = function(callback){
     // 取得購物車內容
     $http.post('/ajax_cart/get_carts')
     .success(function(res){
       if(res.status){
         if($scope.campDate !== res.min_date && res.data.length > 0){
           // 處理一般購物車
           if(!/^(\d{4})-(\d{2})-(\d{2})$/.test(res.min_date)){
             if(confirm('您在購物車有一般商品，如要直接使用訂位系統購物車將會被清除。')){
               $scope.clearCart();
               location.reload();
               return;
             }else{
               window.location.href = '/cart/cart_show';
               return;
             }
           }
           // 處理訂位的部分
           if(confirm('您在'+res.min_date+'有訂購營位，確定要更換日期？如要更換日期您先前的訂位資訊將被清除。')){
             $scope.clearCart();
             location.reload();
           }else{
             window.location.href = '/store/store_reservation/'+$scope.store_id+'/'+res.min_date;
           }
         }
         // 取attr array的length最大者來設定露營天數
         var maxAttrCount = 1;
         angular.forEach(res.data,function(item){
           if(item.attr.length > maxAttrCount){
             maxAttrCount = item.attr.length;
           }
         });
         $scope.campDays = $scope.campDaysOptions[maxAttrCount-1];

         // 確保在取得camp_onlines後才去執行改變數量的程式
         $scope.getCampOnlines($scope.campDays,function(){
           angular.forEach(res.data,function(item){
             // 先更新有加入的營位
             if($scope.campArea.length > 0){
               for(var x in $scope.campArea){
                 if($scope.campArea[x].Item_Id == item.Item_Id){
                   $scope.campArea[x].qty = parseInt(item.qty,10);
                   // 加到購物車
                   $scope.carts.push($scope.campArea[x]);
                 }
               }
             }

             // 更新加購商品
             if($scope.campProducts.length > 0){
               for(var y in $scope.campProducts){
                 if($scope.campProducts[y].Item_Id == item.Item_Id){
                   $scope.campProducts[y].qty = parseInt(item.qty,10);
                   // 加到購物車
                   $scope.carts.push($scope.campProducts[y]);
                 }
               }
             }

             // 更新加購人頭
             if($scope.campHead.length > 0){
               for(var z in $scope.campHead){
                 if($scope.campHead[z].Item_Id == item.Item_Id){
                   $scope.campHead[z].qty = parseInt(item.qty,10);
                   $scope.campHead[z].listQty = parseInt($scope.campHead[z].qty/$scope.campDays.id);
                   // 加到購物車
                   $scope.carts.push($scope.campHead[z]);
                 }
               }
             }

             // 更新加購服務
             if($scope.campService.length > 0){
               for(var w in $scope.campService){
                 if($scope.campService[w].Item_Id == item.Item_Id){
                   $scope.campService[w].qty = parseInt(item.qty,10);
                   // 加到購物車
                   $scope.carts.push($scope.campService[w]);
                 }
               }
             }
           });
           // 必須在callback內再去執行,不然購物車的數量會因為async無法正確比對
           if(typeof(callback) === 'function'){
             callback();
           }
         });
       }else{
         // 這段也不能省,因為有可能使用者還沒登入,所以無法取得資料庫內購物車的內容
         if(typeof(callback) === 'function'){
           callback();
         }
       }

     })
     .error(function(xhr){
       console.log(xhr);
     });
   };

  /**
   * 取得營位商品的上架資料
   * @param object daysOpt 選擇要露營天數的物件
   */
   $scope.getCampOnlines = function(daysOpt,callback){
     var tempEndDate,endDate,startDate = new Date($scope.campDate);
     tempEndDate = new Date($scope.campDate);
     tempEndDate.setDate(tempEndDate.getDate() + (daysOpt.id-1));
     endDate = tempEndDate.getFullYear() + "-" + make_date_two_digit(tempEndDate.getMonth() + 1) + "-" + make_date_two_digit(tempEndDate.getDate());
     // 撈出營位的商品
     $http.post('/ajax_store/items_online',{start_date:$scope.campDate,end_date:endDate,store_id:$scope.store_id})
     .success(function(res){
       if(res.length === 0){
         alert('目前未開放');
         //window.location.href='/store/camp_stock/'+$scope.store_id;
         return;
       }

       $scope.campArea = res;

       if(typeof(callback) === 'function') {
         callback();
       }
       //console.log(res);
     })
     .error(function(xhr){
       console.log(xhr);
     });
   };
  /**
   * 初始化的function
   */
  $scope.init = function(){

    // 撈出營位的商品
    $scope.getCampOnlines($scope.campDays,"");

    // 撈出營區的商品
    $http.post('/ajax_store/query_camp_physical_products',{store_id:$scope.store_id})
    .success(function(res){
      $scope.campProducts = res;
      //console.log(res);
    })
    .error(function(xhr){
      console.log(xhr);
    });

    // 撈出人頭商品
    $http.post('/ajax_store/query_camp_head_products',{store_id:$scope.store_id})
    .success(function(res){
      $scope.campHead = res;
    })
    .error(function(res){
      console.log(res);
    });

    // 撈出服務商品
    $http.post('/ajax_store/query_camp_service_products',{store_id:$scope.store_id})
    .success(function(res){
      $scope.campService = res;
    })
    .error(function(res){
      console.log(res);
    });
  };

  /**
   * 修改table與購物車數量
   * @param object item 購物車內的項目
   * @param number num 要增加/減少的數量
   */
  $scope.qtyChange = function(item,num){
    var idx = $scope.campArea.indexOf(item);
    var cartIdx = $scope.carts.indexOf(item);

    // 先判斷有無登入
    if($scope.vip <= 0){
      alert('請先登入');
      window.location.href = '/member/login/'+$scope.redirectUrl;
      return;
    }

    if(typeof(item.qty) === 'undefined'){
      item.qty = 1;
    }

    num = parseInt(num,10);

    // 不允許刪除到別人的東西
    if(item.qty === 0 && num === -1){
      $scope.campDisable = true;
      return;
    }

    item.qty = parseInt(item.qty,10) + num;

    if(item.qty < item.min_order && item.qty > 0){
      alert('此商品最小可購買'+item.min_order+'位');
      item.qty = parseInt(item.min_order,10);
      return;
    }
    if(item.qty > item.max_order){
      alert('此商品最大可購買'+item.max_order+'位');
      item.qty = parseInt(item.max_order,10);
      return;
    }
    if(item.qty > item.stock){
      alert('此商品庫存僅剩'+item.stock+'個');
      item.qty = parseInt(item.stock,10);
    }
    if(item.qty <= 0){
      item.qty = 0;
        $scope.campDisable = true;
    }

    // 加入購物車
    if(cartIdx === -1 && item.qty > 0){
      $scope.carts.push(item);
    }else{
      if(item.qty !== 0){
        $scope.carts[cartIdx].qty = item.qty;
      }else{
        $scope.carts.splice(cartIdx,1);
      }

    }

    if(item.qty > 0){
      $scope.campDisable = false;
      $scope.campArea[idx].qty = item.qty;
    }
  };

  /**
   * 修改table與購物車數量
   * @param object item 購物車內的項目
   * @param number num 要增加/減少的數量
   */
  $scope.qtyProductChange = function(item,num){
    var idx = $scope.campProducts.indexOf(item);
    var cartIdx = $scope.carts.indexOf(item);

    if($scope.vip <= 0){
      alert('請先登入');
      window.location.href = '/member/login/'+$scope.redirectUrl;
      return;
    }

    if(typeof(item.qty) === 'undefined'){
      item.qty = 1;
    }
    num = parseInt(num,10);

    // 不允許刪除到別人的東西
    if(item.qty === 0 && num === -1){
      $scope.campProductDisable = true;
      return;
    }

    item.qty = parseInt(item.qty,10) + num;

    if(item.qty < item.min_order && item.qty > 0){
      alert('此商品最小可購買'+item.min_order+'位');
      item.qty = parseInt(item.min_order,10);
      return;
    }
    if(item.qty > item.max_order){
      alert('此商品最大可購買'+item.max_order+'位');
      item.qty = parseInt(item.max_order,10);
      return;
    }
    if(item.qty > item.stock){
      alert('此商品庫存僅剩'+item.stock+'個');
      item.qty = parseInt(item.stock,10);
    }
    if(item.qty <= 0){
      item.qty = 0;
      $scope.campProductDisable = true;
    }

    // 加入購物車
    if(cartIdx === -1 && item.qty > 0){
      $scope.carts.push(item);
    }else{
      if(item.qty !== 0){
        $scope.carts[cartIdx].qty = item.qty;
      }else{
        $scope.carts.splice(cartIdx,1);
      }

    }

    if(item.qty > 0){
      $scope.campProductDisable = false;
      $scope.campProducts[idx].qty = item.qty;
    }
  };

  // 人頭數量變更時呼叫
  $scope.qtyHeadChange = function(item,num){
    var idx = $scope.campHead.indexOf(item);
    var cartIdx = $scope.carts.indexOf(item);

    if($scope.vip <= 0){
      alert('請先登入');
      window.location.href = '/member/login/'+$scope.redirectUrl;
      return;
    }

    if(typeof(item.qty) === 'undefined'){
      item.qty = 1;
    }

    num = parseInt(num,10) * $scope.campDays.id;

    // 不允許刪除到別人的東西
    if(item.qty === 0 && num === (-1 * $scope.campDays.id)){
      $scope.campHeadDisable = true;
      return;
    }

    item.qty = parseInt(item.qty,10) + num;

    if(item.qty < item.min_order && item.qty > 0){
      alert('此商品最小可購買'+item.min_order+'位');
      item.qty = parseInt(item.min_order,10);
      return;
    }
    if(item.qty > item.max_order){
      alert('此商品最大可購買'+item.max_order+'位');
      item.qty = parseInt(item.max_order,10);
      return;
    }
    if(item.qty > item.stock){
      alert('此商品庫存僅剩'+item.stock+'個');
      item.qty = parseInt(item.stock,10);
    }
    if(item.qty <= 0){
      item.qty = 0;
      $scope.campHeadDisable = true;
    }
    $scope.headCount = parseInt( (item.qty / $scope.campDays.id) ,10);
    // 加入購物車
    if(cartIdx === -1 && item.qty > 0){
      $scope.carts.push(item);
    }else{
      if(item.qty !== 0){
        $scope.carts[cartIdx].qty = item.qty;
      }else{
        $scope.carts.splice(cartIdx,1);
      }

    }

    if(item.qty > 0){
      $scope.campHeadDisable = false;
      $scope.campHead[idx].qty = item.qty;
    }
  };


  // 服務型商品變更時呼叫此functions
  $scope.qtyServiceChange = function(item,num){
    var idx = $scope.campService.indexOf(item);
    var cartIdx = $scope.carts.indexOf(item);

    if($scope.vip <= 0){
      alert('請先登入');
      window.location.href = '/member/login/'+$scope.redirectUrl;
      return;
    }

    if(typeof(item.qty) === 'undefined'){
      item.qty = 1;
    }
    num = parseInt(num,10);

    // 不允許刪除到別人的東西
    if(item.qty === 0 && num === -1){
      $scope.campServiceDisable = true;
      return;
    }

    item.qty = parseInt(item.qty,10) + num;

    if(item.qty > item.stock){
      alert('此商品庫存僅剩'+item.stock+'個');
      item.qty = parseInt(item.stock,10);
    }
    if(item.qty <= 0){
      item.qty = 0;
      $scope.campServiceDisable = true;
    }

    // 加入購物車
    if(cartIdx === -1 && item.qty > 0){
      $scope.carts.push(item);
    }else{
      if(item.qty !== 0){
        $scope.carts[cartIdx].qty = item.qty;
      }else{
        $scope.carts.splice(cartIdx,1);
      }

    }

    if(item.qty > 0){
      $scope.campServiceDisable = false;
      $scope.campService[idx].qty = item.qty;
    }
  };

  // 檢查營區輸入欄位
  $scope.inputCampCheck = function(item){
    var qty = parseInt(item.qty,10);
    var cartIdx = $scope.carts.indexOf(item);
    var campIdx = $scope.campArea.indexOf(item);

    if($scope.vip <= 0){
      alert('請先登入');
      window.location.href = '/member/login/'+$scope.redirectUrl;
      return;
    }

    if(isNaN(qty)){
      alert('數量必須為數字');
      $scope.campArea[campIdx].qty = 0;
      if(cartIdx !== -1){
        $scope.carts.splice(cartIdx,1);
      }
      return;
    }

    if(qty <= 0){
      // 原本有再購物車的話就刪除
      if(cartIdx !== -1){
        $scope.campDisable = true;
        $scope.carts.splice(cartIdx,1);
      }
      $scope.campArea[campIdx].qty = 0;
    }else{
      $scope.campDisable = false;
      if(cartIdx !== -1 && qty > 0){
        if(qty >item.max_order){
          alert('此商品最大購買量為'+item.max_order);
          qty = parseInt(item.max_order,10);
        }
        if(qty < item.min_order && qty > 0){
          alert('此商品最小購買量為'+item.min_order);
          qty = parseInt(item.min_order,10);
        }
        if(qty > item.stock){
          alert('此商品庫存僅剩'+item.stock+'個');
          qty = parseInt(item.stock,10);
        }
        $scope.carts[cartIdx].qty = qty;
      }else{
        $scope.carts.push(item);
      }
    }
  };

  // 檢查加購商品的輸入欄位
  $scope.inputAddCheck = function(item){
    var qty = parseInt(item.qty,10);
    var cartIdx = $scope.carts.indexOf(item);
    var addProductIdx = $scope.campProducts.indexOf(item);

    if($scope.vip <= 0){
      alert('請先登入');
      window.location.href = '/member/login/'+$scope.redirectUrl;
      return;
    }

    if(isNaN(qty)){
      alert('數量必須為數字');
      $scope.campProducts[addProductIdx].qty = 0;
      if(cartIdx !== -1){
        $scope.carts.splice(cartIdx,1);
      }
      return;
    }

    if(qty <= 0){
      // 原本有再購物車的話就刪除
      if(cartIdx !== -1){
        $scope.campProductDisable = true;
        $scope.carts.splice(cartIdx,1);
      }
      $scope.campProducts[addProductIdx].qty = 0;
    }else{
        $scope.campProductDisable = false;
      if(cartIdx !== -1 && qty > 0){
        if(qty >item.max_order){
          alert('此商品最大購買量為'+item.max_order);
          qty = parseInt(item.max_order,10);
        }
        if(qty < item.min_order && qty > 0){
          alert('此商品最小購買量為'+item.min_order);
          qty = parseInt(item.min_order,10);
        }
        if(qty > item.stock){
          alert('此商品庫存僅剩'+item.stock+'個');
          qty = parseInt(item.stock,10);
        }
        $scope.carts[cartIdx].qty = qty;
      }else{
        $scope.carts.push(item);
      }
    }
  };

  // 檢查加購人頭的輸入欄位
  $scope.inputHeadCheck = function(item){
    var qty = parseInt(item.listQty,10);
    var cartIdx = $scope.carts.indexOf(item);
    var addHeadIdx = $scope.campHead.indexOf(item);

    if($scope.vip <= 0){
      alert('請先登入');
      window.location.href = '/member/login/'+$scope.redirectUrl;
      return;
    }


    if(isNaN(item.listQty)){
      alert('數量必須為數字');
      $scope.campHead[addHeadIdx].qty = 0;
      $scope.campHead[addHeadIdx].listQty = 0;
      if(cartIdx !== -1){
        $scope.carts.splice(cartIdx,1);
      }
      return;
    }

    $scope.campHead[addHeadIdx].qty = (qty * $scope.campDays.id);

    if(qty <= 0){
      // 原本有再購物車的話就刪除
      if(cartIdx !== -1){
        $scope.campHeadDisable = true;
        $scope.carts.splice(cartIdx,1);
      }
      $scope.campHead[addHeadIdx].qty = 0;
      $scope.campHead[addHeadIdx].listQty = 0;
    }else{
      $scope.campHeadDisable = false;

      if(cartIdx !== -1 && item.qty > 0){
        $scope.carts[cartIdx].qty = (qty * $scope.campDays.id);
        if($scope.carts[cartIdx].qty > item.max_order){
          alert('此商品最大購買量為'+item.max_order);
          $scope.carts[cartIdx].qty = item.max_order;
          $scope.campHead[addHeadIdx].qty = item.max_order;
          $scope.campHead[addHeadIdx].listQty = parseInt(item.max_order/$scope.campDays.id,10);
          qty = parseInt(item.max_order,10);
        }
        if(qty < item.min_order && item.qty > 0){
          alert('此商品最小購買量為'+item.min_order);
          $scope.carts[cartIdx].qty = item.min_order;
          $scope.campHead[addHeadIdx].qty = item.min_order;
          $scope.campHead[addHeadIdx].listQty = parseInt(item.min_order/$scope.campDays.id,10);
          qty = parseInt(item.min_order,10);
        }
        if(qty > item.stock){
          alert('此商品庫存僅剩'+item.stock+'個');
          $scope.carts[cartIdx].qty = item.stock;
          $scope.campHead[addHeadIdx].qty = item.stock;
          $scope.campHead[addHeadIdx].listQty = parseInt(item.stock/$scope.campDays.id,10);
          qty = parseInt(item.stock,10);
        }

      }else{
        $scope.carts.push(item);
      }
    }
  };

  // 檢查加購人頭的輸入欄位
  $scope.inputServiceCheck = function(item){
    var qty = parseInt(item.qty,10);
    var cartIdx = $scope.carts.indexOf(item);
    var addServiceIdx = $scope.campService.indexOf(item);

    if($scope.vip <= 0){
      alert('請先登入');
      window.location.href = '/member/login/'+$scope.redirectUrl;
      return;
    }

    if(isNaN(qty)){
      alert('數量必須為數字');
      $scope.campService[addServiceIdx].qty = 0;
      if(cartIdx !== -1){
        $scope.carts.splice(cartIdx,1);
      }
      return;
    }

    if(qty <= 0){
      // 原本有再購物車的話就刪除
      if(cartIdx !== -1){
        $scope.campServiceDisable = true;
        $scope.carts.splice(cartIdx,1);
      }
      $scope.campService[addServiceIdx].qty = 0;
    }else{
      $scope.campServiceDisable = false;
      if(cartIdx !== -1 && qty > 0){
        if(qty >item.max_order){
          alert('此商品最大購買量為'+item.max_order);
          qty = parseInt(item.max_order,10);
        }
        if(qty < item.min_order && qty > 0){
          alert('此商品最小購買量為'+item.min_order);
          qty = parseInt(item.min_order,10);
        }
        if(qty > item.stock){
          alert('此商品庫存僅剩'+item.stock+'個');
          qty = parseInt(item.stock,10);
        }
        $scope.carts[cartIdx].qty = qty;
      }else{
        $scope.carts.push(item);
      }
    }
  };


  // 送出購物車
  $scope.submit = function(){
    $http.post('/ajax_cart/add_camp_product',{carts:$scope.carts,'currentUrl':document.URL})
    .success(function(res){
      if(res.status){
          window.location.href = '/orders/camp_order_fill';
      }else{
        alert(res.msg);
        if(typeof(res.redirect_url) !== 'undefined'){
          window.location.href = res.redirect_url;
        }
      }
    })
    .error(function(xhr){
      console.log(xhr);
    });
  };

  // 存入購物車
  $scope.addToCart = function(){
    $http.post('/ajax_cart/add_camp_product',{carts:$scope.carts,'currentUrl':document.URL})
    .success(function(res){
    })
    .error(function(xhr){
      console.log(xhr);
    });
  };

  // 計算購物車總金額
  $scope.cartTotal = function(){
    var total = 0;
    angular.forEach($scope.carts,function(item){
      total = total + (item.qty * item.attr_total_price);
    });
    return total;
  };

  // 計算購物車內訂金
  $scope.cartTotalDownPayment = function(){
    var total = 0;
    angular.forEach($scope.carts,function(item){
      total = total + (parseInt(item.qty,10) * parseInt(item.down_payment,10));
    });
    return total;
  };

  // 計算出購物車內營位商品的金額
  $scope.cartTotalCampAmount = function(){
    var total = 0;
    angular.forEach($scope.carts,function(item){
      if(item.custom_product_type === 'c'){
        total = total + (parseInt(item.qty,10) * parseInt(item.attr_total_price,10));
      }
    });
    return total;
  };

  $scope.showModal = function(item){
    $scope.modal.modalTitle = item.Item_Name;
    $scope.modal.modalBody = item.Description_L;
    $scope.modal.srcs = item.more_imgs;
  };

  $scope.initCallModal = function () {
    //console.log('called');
    if($scope.carts.length === 0){
      $scope.carts = [];
      angular.element('#resetCampDays').trigger('click');
    }
  };

  $scope.resetCarts = function(){
    $scope.carts = [];
    // 數量清空
    angular.forEach($scope.campArea,function(item){
      var idx = $scope.campArea.indexOf(item);
      $scope.campArea[idx].qty = 0;
    });
    angular.forEach($scope.campHead,function(item){
      var idx = $scope.campHead.indexOf(item);
      $scope.campHead[idx].qty = 0;
    });
    angular.forEach($scope.campProducts,function(item){
      var idx = $scope.campProducts.indexOf(item);
      $scope.campProducts[idx].qty = 0;
    });
    angular.forEach($scope.campService,function(item){
      var idx = $scope.campService.indexOf(item);
      $scope.campService[idx].qty = 0;
    });
  };

  // 刪除購物車的項目
  $scope.deleteCartItem = function(item){
    var cartIdx = $scope.carts.indexOf(item);
    var campIdx = $scope.campArea.indexOf(item);
    var campHeadIdx = $scope.campHead.indexOf(item);
    var campProductIdx = $scope.campProducts.indexOf(item);
    var campServiceIdx = $scope.campService.indexOf(item);

    $scope.carts.splice(cartIdx,1);
    if(campIdx >= 0){
      $scope.campArea[campIdx].qty = 0;
    }else if(campHeadIdx >= 0){
      $scope.campHead[campHeadIdx].qty = 0;
    }else if(campProductIdx >= 0){
        $scope.campProducts[campProductIdx].qty = 0;
    }else if(campServiceIdx >= 0){
      $scope.campService[campServiceIdx].qty = 0;
    }
  };

  // 給訂位區間產生下拉式選單
  $scope.range = function(item,daysCount){
    var min = parseInt(item.min_order,10);
    var max = parseInt(item.max_order,10);
    var stock = parseInt(item.stock,10);
    var result = [];

    if(stock < max){
      max = stock;
    }

    result.push(0);


    if(stock === 0){
      min = 0;
      max = 0;
      return result;
    }

    if(item.custom_product_type !== 'c'){
      max = Math.floor(max / daysCount);
    }

    if(max > 30){
      max = 30;
    }

    for(var i = min; i <= max ; i++){
      result.push(i);
    }
    return result;
  };

  // 呼叫初始化程式
  $scope.init();
  // 取得會員等級
  $scope.getVip();
  // 取得已加入過的購物車內容
  // 第一次進這個頁面時呼叫
  $scope.getCarts($scope.initCallModal);
}
function make_date_two_digit(num){
	if(typeof(num) !== "string"){
		num = num + '';
	}
	if(num.length === 2){
		return num;
	}else if(num.length < 2 && num.length > 0){
		num = '0'+num;
	}else if(num.length > 2){
		return "num length > 2";
	}
	return num;
}
