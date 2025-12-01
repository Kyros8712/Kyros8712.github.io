document.addEventListener('DOMContentLoaded', () => {
    // State
    let cart = {}; // { itemId: quantity }
    let userInfo = {};

    // Mock Data
    const products = [
        { id: 1, name: '經典漢堡', price: 150, img: 'https://placehold.co/150?text=Burger' },
        { id: 2, name: '炸雞套餐', price: 200, img: 'https://placehold.co/150?text=Chicken' },
        { id: 3, name: '薯條', price: 60, img: 'https://placehold.co/150?text=Fries' },
        { id: 4, name: '可樂', price: 40, img: 'https://placehold.co/150?text=Coke' },
        { id: 5, name: '沙拉', price: 120, img: 'https://placehold.co/150?text=Salad' },
        { id: 6, name: '冰淇淋', price: 80, img: 'https://placehold.co/150?text=IceCream' },
        { id: 7, name: '洋蔥圈', price: 70, img: 'https://placehold.co/150?text=OnionRings' },
        { id: 8, name: '雞塊', price: 90, img: 'https://placehold.co/150?text=Nuggets' },
        { id: 9, name: '檸檬紅茶', price: 45, img: 'https://placehold.co/150?text=LemonTea' },
        { id: 10, name: '咖啡', price: 65, img: 'https://placehold.co/150?text=Coffee' },
        { id: 11, name: '三明治', price: 85, img: 'https://placehold.co/150?text=Sandwich' },
        { id: 12, name: '披薩', price: 250, img: 'https://placehold.co/150?text=Pizza' }
    ];

    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');
    const heroMenuBtn = document.getElementById('hero-menu-btn');

    // Navigation Logic
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }

    function navigateTo(pageId) {
        pages.forEach(page => page.classList.remove('active', 'hidden'));
        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
            } else {
                page.classList.add('hidden');
            }
        });
        sidebar.classList.remove('open'); // Close sidebar on navigate

        // Special logic for specific pages
        if (pageId === 'menu') renderMenu();
        if (pageId === 'shopping') renderShoppingList();
    }

    openSidebarBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', toggleSidebar);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-target');
            navigateTo(target);
        });
    });

    heroMenuBtn.addEventListener('click', () => {
        toggleSidebar(); // Requirement: "按了會將左側功能頁面展開"
    });

    // Menu Page Logic
    function renderMenu() {
        const grid = document.getElementById('menu-grid');
        grid.innerHTML = products.map(p => `
            <div class="menu-item">
                <img src="${p.img}" alt="${p.name}">
                <h3>${p.name}</h3>
            </div>
        `).join('');
    }

    // Order Info Logic
    const orderForm = document.getElementById('order-form');
    const deliveryRadios = document.getElementsByName('delivery');
    const addressField = document.getElementById('address-field');
    const storeFields = document.getElementById('store-fields');

    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;
            addressField.classList.add('hidden');
            storeFields.classList.add('hidden');

            if (val === 'delivery') addressField.classList.remove('hidden');
            if (val === 'store') storeFields.classList.remove('hidden');
        });
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Collect Data
        const formData = new FormData(orderForm);
        userInfo = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            delivery: formData.get('delivery'),
            address: document.getElementById('address').value,
            storeId: document.getElementById('store-id').value,
            storeName: document.getElementById('store-name').value
        };

        // Show Confirmation Modal
        showModal();
    });

    // Modal Logic
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');

    function showModal() {
        let deliveryText = '';
        if (userInfo.delivery === 'pickup') deliveryText = '自取';
        if (userInfo.delivery === 'delivery') deliveryText = `宅配 (${userInfo.address})`;
        if (userInfo.delivery === 'store') deliveryText = `店到店 (${userInfo.storeId} ${userInfo.storeName})`;

        modalBody.innerHTML = `
            <p><strong>姓名:</strong> ${userInfo.name}</p>
            <p><strong>電話:</strong> ${userInfo.phone}</p>
            <p><strong>取貨方式:</strong> ${deliveryText}</p>
        `;
        modal.classList.remove('hidden');
    }

    modalCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modalConfirm.addEventListener('click', () => {
        modal.classList.add('hidden');
        navigateTo('shopping');
        document.getElementById('cart-fab').classList.remove('hidden');
    });

    // Shopping Logic
    function renderShoppingList() {
        const list = document.getElementById('product-list');
        list.innerHTML = products.map(p => `
            <div class="product-item">
                <div class="product-info">
                    <img src="${p.img}" alt="${p.name}">
                    <div>
                        <h4>${p.name}</h4>
                        <p>$${p.price}</p>
                    </div>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateCart(${p.id}, -1)">-</button>
                    <span id="qty-${p.id}">${cart[p.id] || 0}</span>
                    <button onclick="updateCart(${p.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    // Expose to global scope for onclick
    window.updateCart = function (id, change) {
        if (!cart[id]) cart[id] = 0;
        cart[id] += change;
        if (cart[id] < 0) cart[id] = 0;

        // Update UI
        const qtySpan = document.getElementById(`qty-${id}`);
        if (qtySpan) qtySpan.innerText = cart[id];

        updateCartBadge();
    };

    function updateCartBadge() {
        const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
        document.getElementById('cart-count').innerText = totalItems;

        // Show/Hide FAB
        const fab = document.getElementById('cart-fab');
        if (totalItems > 0) {
            fab.classList.remove('hidden');
        } else {
            // Keep it visible if we are in shopping flow? User requirement says "加入品項後以小圖...顯示"
            // But usually we want to access cart to checkout.
        }
    }

    document.getElementById('cart-fab').addEventListener('click', () => {
        renderCheckout();
        navigateTo('checkout');
    });

    // Checkout Logic
    function renderCheckout() {
        const container = document.getElementById('checkout-summary');
        let subtotal = 0;
        let html = '<h3>商品清單</h3><ul>';

        products.forEach(p => {
            if (cart[p.id] > 0) {
                const itemTotal = p.price * cart[p.id];
                subtotal += itemTotal;
                html += `<li>${p.name} x ${cart[p.id]} = $${itemTotal}</li>`;
            }
        });
        html += '</ul>';

        let shipping = 0;
        if (userInfo.delivery === 'delivery') shipping = 350;
        if (userInfo.delivery === 'store') shipping = 100;

        const total = subtotal + shipping;

        html += `
            <hr>
            <p>小計: $${subtotal}</p>
            <p>運費: $${shipping}</p>
            <h3>總金額: $${total}</h3>
        `;

        container.innerHTML = html;
    }

    document.getElementById('confirm-order-btn').addEventListener('click', () => {
        renderReceipt();
        navigateTo('receipt');
        document.getElementById('cart-fab').classList.add('hidden'); // Hide cart on receipt
    });

    // Receipt Logic
    function renderReceipt() {
        const container = document.getElementById('receipt-content');
        // Re-use checkout logic or similar
        // Just copying the checkout summary for now + User Info

        let deliveryText = '';
        if (userInfo.delivery === 'pickup') deliveryText = '自取';
        if (userInfo.delivery === 'delivery') deliveryText = `宅配 (${userInfo.address})`;
        if (userInfo.delivery === 'store') deliveryText = `店到店 (${userInfo.storeId} ${userInfo.storeName})`;

        let itemsHtml = '<ul>';
        let subtotal = 0;
        products.forEach(p => {
            if (cart[p.id] > 0) {
                const itemTotal = p.price * cart[p.id];
                subtotal += itemTotal;
                itemsHtml += `<li>${p.name} x ${cart[p.id]} = $${itemTotal}</li>`;
            }
        });
        itemsHtml += '</ul>';

        let shipping = 0;
        if (userInfo.delivery === 'delivery') shipping = 350;
        if (userInfo.delivery === 'store') shipping = 100;
        const total = subtotal + shipping;

        container.innerHTML = `
            <h3>訂購人資訊</h3>
            <p>姓名: ${userInfo.name}</p>
            <p>電話: ${userInfo.phone}</p>
            <p>取貨: ${deliveryText}</p>
            <hr>
            <h3>商品明細</h3>
            ${itemsHtml}
            <p>運費: $${shipping}</p>
            <h2 style="color: red;">總金額: $${total}</h2>
        `;
    }

    // Screenshot & Copy
    document.getElementById('screenshot-btn').addEventListener('click', () => {
        const element = document.getElementById('receipt-content');
        html2canvas(element).then(canvas => {
            const link = document.createElement('a');
            link.download = 'order_receipt.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    document.getElementById('copy-btn').addEventListener('click', () => {
        const text = document.getElementById('receipt-content').innerText;
        navigator.clipboard.writeText(text).then(() => {
            alert('訂單內容已複製！');
        });
    });
});
