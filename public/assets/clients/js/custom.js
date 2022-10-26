$(function () {
    /* Function
    ------------------------- */

    // *Popup Notification
    function notify(type, icon, position, msg) {
        Lobibox.notify(type, {
            pauseDelayOnHover: true,
            size: 'mini',
            rounded: true,
            icon: icon,
            continueDelayOnInactiveTab: false,
            position: position,
            msg: msg
        });
    }
    //* check Logged
    function checkLoged() {
        return document.querySelectorAll('#logged').length == 0;
    }
    //* choose num page paginator page
    function choosePage(id) {
        let short_by = $("option:selected", '.nice-select').val();
        if (short_by != 'default') {
            let total = parseInt($('.shop-top-show').text().trim().replace(/[^0-9\.]+/g, ''));
            $.ajax({
                type: 'post',
                url: '/shop/page/1',
                data: {
                    page: id,
                    short_by: short_by,
                    total: total
                },
                success: function (data) {
                    $('#product-content').html(data);
                    AOS.init();
                }
            });
            // window.location.href = '/shop/shortby/';
        } else {
            let category = '';
            window.location.href = `/shop/page/${id}`;
        }
    }

    //* Check product exist or not in cart by id
    function checkProductExistCart(id) {
        let check = $(".cart-product-wrapper .cart-product-inner");
        for (let i = 0; i < check.length; i++) {
            if (check[i].id == "product_id" + id) return true;
        }
        return false;
    }

    /*-------------------------
        Ajax Load Data Nagivation
    ---------------------------*/

    $(document).on('click', '.category-filter', function () {
        let category_filter = $(this).attr('id');
        let active = $(this).parent();
        active.addClass('active').siblings().removeClass('active');
        $.ajax({
            type: "post",
            url: "./content/filter-shop.php",
            data: {
                category_filter: category_filter,
            },
            success: function (data) {
                $("#shop-content").html(data);
                AOS.init();
            },
        });
    });

    // SHOP
    $(document).on("keypress", "#searchFilterProduct", function (e) {
        if (e.which == 13) {
            let search_filter = $(this).val();
            window.location.href=`/shop/search/${search_filter}`;
        }
    });

    $(document).on("click", ".search-box button", function () {
        let search_filter = $(this).siblings('input').val();
        window.location.href=`/shop/search/${search_filter}`;
    });

    $(document).on("change", ".nice-select", function () {
        let short_by = $("option:selected", this).val();
        let total = parseInt($('.shop-top-show').text().trim().replace(/[^0-9\.]+/g, ''));
        let category = $('.sidebar-list li.active a').attr('id');
        $.ajax({
            type: "post",
            url: "./content/short-by-shop.php",
            data: {
                short_by: short_by,
                total: total,
                category: category
            },
            success: function (data) {
                $("#product-content").html(data);
                AOS.init();
            }
        });
    });
    //* search Product by name, listener via Enter
    $(document).on("keypress", "#searchProduct", function (e) {
        if (e.which == 13) {
            let search = $("#searchProduct input").val();
            $.ajax({
                type: "post",
                url: "./shop.php",
                data: {
                    search: search,
                },
                success: function (data) {
                    $("#content").html(data);
                    AOS.init();
                },
            });
        }
    });

    function getQtyProductCart(id) {
        let amount = parseInt(
            $("#quantity" + id)
            .text()
            .replace(/\D/g, "")
        );
        return amount;
    };

    function addProduct(id, qty) {
        if (checkProductExistCart(id)) {
            // có hàng trong giỏ chỉ cần tăng số lượng
            let add_qty = getQtyProductCart(id);
            let money = parseFloat(
                $("#product_id" + id + " .price .new")
                .text()
                .replace("$", "")
            );
            let total_qty = add_qty + qty;
            let total = parseFloat($("#totalmoney").text().replace("$", ""));
            let totalMoney = parseFloat(total + money * qty).toFixed(2);
            $("#quantity" + id + " > strong").text(total_qty);
            $("#totalmoney").text(totalMoney + "$");
        } else {
            // không có hàng trong giỏ thì thêm mới
            let amount = $("#count-cart").text();
            $("#count-cart").text(parseInt(amount) + 1);

            let image = $("#img-product" + id).attr("src");
            let name = $("#product" + id + " .product-title").text();
            if (name == '') name = $(".product-title").text();
            let newprice = $("#product" + id + " .price .new").text();
            if (newprice == '') newprice = $(".regular-price").text();
            let oldprice = $("#product" + id + " .price .old").text();
            if (oldprice == '') oldprice = $(".old-price").text();
            let total = parseFloat($("#totalmoney").text().replace("$", ""));
            let totalMoney = parseFloat(newprice.replace("$", "")) * qty + total;

            let html = `<div class="cart-product-inner p-b-20 m-b-20 border-bottom" id="product_id${id}">
                    <div class="single-cart-product">
                  <div class="cart-product-thumb">
                      <a href="./frontend/detail_product.php"><img src="${image}" alt="Cart Product" class="rounded"></a>
                  </div>
                  <div class="cart-product-content">
                      <h3 class="title"><a href="./frontend/detail_product.php">${name}</a></h3>
                      <div class="product-quty-price">
                          <span class="cart-quantity" id="quantity${id}">Số lượng: <strong> ${qty} </strong></span>
                          <span class="price">
                            `;

            if (oldprice != "") {
                html += `
              <span class="new">${newprice}</span>
              <span class="old" style="text-decoration: line-through;color: #DC3545;opacity: 0.5;">${oldprice}</span>
              </span>
            `;
            } else {
                html += `<span class='new'>${newprice}</span>
            </span>`;
            }
            html += `
                      </div>
                  </div>
              </div>
              <div class="cart-product-remove">
                  <a class="remove-cart" id="product${id}">
                    <i class="fa-duotone fa-trash-can"></i>
                  </a>
              </div>
          </div>`;

            $(".cart-product-wrapper").prepend(html);
            $("#product_id" + id).hide().fadeIn();
            $("#totalmoney").text(parseFloat(totalMoney).toFixed(2) + "$");
        }

        $.ajax({
            type: "post",
            url: "/cart/add/" + id + "/" + qty,
        });
    }

    /*-------------------------
        Ajax Shop Page
    ---------------------------*/
    $(document).on("click", ".add-to_cart", function () {
        if (!checkLoged()) {
            notify('warning', 'fa-duotone fa-cart-circle-xmark', 'right', 'Vui lòng đăng nhập để mua hàng');
            return;
        }
        let id = parseInt($(this).attr("id").replace("product", ""));
        let qty = parseInt($(".cart-plus-minus-box").val());
        if(isNaN(qty)) qty = 1;
        // console.log(id, qty);
        addProduct(id, qty);
    });

    $(document).on('click', 'a#plus_product', function () {
        if (!checkLoged()) {
            notify('warning', 'fa-duotone fa-cart-circle-xmark', 'right', 'Vui lòng đăng nhập để mua hàng');
            return;
        }
        let id = parseInt($(this).parent().attr('id').replace('wrapper', ''));
        let qty = 1;
        addProduct(id, qty);
    });

    $(document).keydown('.shop_wrapper grid_4', function (e) {
        let next = $('.page-item a[aria-label="Next"]');
        let prev = $('.page-item a[aria-label="Prev"]');
        switch (e.which) {
            case 37: //left arrow key
                if (prev.length > 0) {
                    let id = parseInt($(prev).attr('name').split('page=')[1]);
                    choosePage(id - 1);
                }
                break;
            case 39: //right arrow key
                if (next.length > 0) {
                    let id = parseInt($(next).attr('name').split('page=')[1]);
                    choosePage(id + 1);
                }
                break;
        }
    })

    $(document).on('click', '.page-item a[aria-label="Next"]', function () {
        let id = parseInt($(this).attr('name').split('page=')[1]);
        choosePage(id + 1);
    });
    $(document).on('click', '.page-item a[aria-label="Prev"]', function () {
        let id = parseInt($(this).attr('name').split('page=')[1]);
        choosePage(id - 1);
    });
    $(document).on('click', '#page-choose', function () {
        let id = parseInt($(this).attr('name').split('page=')[1]);
        choosePage(id);
    });


    /*-------------------------
        Ajax Cart View
    ---------------------------*/
    $(document).on('click', '.pro-remove a', function () {
        let id = parseInt($(this).parent().attr('id').replace('product', ''));
        let money = parseFloat($('#product_id' + id + ' .price .new').text().replace('$', ''));
        let total = parseFloat($('#totalmoney').text().replace('$', ''));
        let amount = parseInt($('#count-cart').text());
        let qty = parseInt($('#quantity' + id).text().replace(/\D/g, ''));
        console.log(money, total, amount, qty);
        $('#view_cart_product' + id).fadeOut('normal', function () {
            $(this).remove();
        });
        let totalMoney = (total - money * qty).toFixed(2);
        console.log(totalMoney);
        $('#totalmoney').text(totalMoney + '$');
        $('#count-cart').text(amount - 1);
        $('#product_id' + id).hide('normal', function () {
            $(this).remove();
        });

        $.ajax({
            type: "post",
            url: "/cart/delete/" + id,
        });
    });

    $(document).on('click', '#clear-cart', function () {
        $('#table-cart').hide('normal', function () {
            $(this).remove();
        });
        $('.cart-product-wrapper').children().hide('normal', function () {
            $(this).remove();
        });
        $('#count-cart').text('0');
        $('#totalmoney').text('0.00$');
        $('#total-money').text('0.00$');
        $('#total-bill').text('0.00$');
        $.ajax({
            type: 'post',
            url: '/cart/clear',
        });
    })


    /*-------------------------
        Ajax Remove Product Cart 
    ---------------------------*/
    $(document).on('click', '.remove-cart', function () {
        let id = $(this).attr('id').replace('product', '');
        $('#product_id' + id).fadeOut('normal', function () {
            let amount = parseInt($('#count-cart').text());
            $('#count-cart').text(amount - 1);
            let money = parseFloat($('#product_id' + id + " .price .new").text().replace('$', ''));
            let total = parseFloat($('#totalmoney').text().replace('$', ''));
            let qty = parseInt($('#quantity' + id).text().replace(/\D/g, ''));
            let totalMoney = (total - money * qty).toFixed(2);
            $('#totalmoney').text(totalMoney + '$');
            $(this).remove();
        });
        $.ajax({
            type: 'post',
            url: '/cart/delete/' + id,
            data: {
                delete_id: id
            },
        });
    });
    
});