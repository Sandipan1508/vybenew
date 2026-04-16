const products = [
    { id: 1, name: "Oversize Black Tee", price: 649, originalPrice: 1299, image: "men-black.png", category: "men", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 2, name: "Oversize White Tee", price: 649, originalPrice: 1299, image: "men-white.png", category: "men", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 3, name: "Oversize Black Dress", price: 649, originalPrice: 1299, image: "women-black.png", category: "women", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 4, name: "Oversize White Top", price: 649, originalPrice: 1299, image: "women-white.png", category: "women", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 5, name: "Oversize Black Jacket", price: 649, originalPrice: 1299, image: "men-black.png", category: "men", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 6, name: "Oversize Black Gown", price: 649, originalPrice: 1299, image: "women-black.png", category: "women", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 7, name: "Oversize White Shirt", price: 649, originalPrice: 1299, image: "men-white.png", category: "men", sizes: ["S", "M", "L", "XL", "XXL"] },
    { id: 8, name: "Oversize White Dress", price: 649, originalPrice: 1299, image: "women-white.png", category: "women", sizes: ["S", "M", "L", "XL", "XXL"] }
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderMenProducts() {
    const container = document.getElementById('men-products');
    if (!container) return;
    const menProducts = products.filter(p => p.category === 'men').slice(0, 4);
    container.innerHTML = menProducts.map(product => createProductCard(product)).join('');
}

function renderWomenProducts() {
    const container = document.getElementById('women-products');
    if (!container) return;
    const womenProducts = products.filter(p => p.category === 'women').slice(0, 4);
    container.innerHTML = womenProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <span class="price">₹${product.price}</span>
                <span class="original-price">₹${product.originalPrice}</span>
            </div>
        </div>
    `;
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, selectedSize: 'M' });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    
    const btn = event.target;
    btn.textContent = 'Added!';
    setTimeout(() => btn.textContent = 'Add to Cart', 1000);
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    if (cartItems) {
        cartItems.innerHTML = cart.length === 0 
            ? '<p class="empty-cart">Your cart is empty</p>' 
            : cart.map(item => createCartItem(item)).join('');
    }
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `₹${total}`;
    }
}

function createCartItem(item) {
    return `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="size">Size: ${item.selectedSize}</span>
                <span class="price">₹${item.price}</span>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `;
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = 'VYB-' + Date.now().toString().slice(-8);
    const orderDate = new Date().toLocaleDateString('en-IN');
    
    const user = localStorage.getItem('currentUser');
    let userData = null;
    if (user) {
        userData = JSON.parse(user);
    }
    
    const order = {
        orderId: orderId,
        date: orderDate,
        userId: userData ? userData.id : null,
        userName: userData ? userData.name : 'Guest',
        userEmail: userData ? userData.email : '',
        userPhone: userData ? userData.phone : '',
        userAddress: userData ? userData.address : '',
        items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity, size: item.selectedSize })),
        total: total,
        status: 'Pending'
    };
    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    let itemList = '';
    cart.forEach(item => {
        itemList += `%0A• ${item.name} x${item.quantity} (Size: ${item.selectedSize}) - ₹${item.price * item.quantity}`;
    });
    
    let customerInfo = '';
    if (userData) {
        customerInfo = `%0A%0A*Customer Details:*%0AName: ${userData.name}%0APhone: ${userData.phone || 'N/A'}%0AAddress: ${userData.address || 'N/A'}`;
    }
    
    const whatsAppMsg = `*New Order - VybeCulture*%0A%0A*Order ID:* ${orderId}%0A*Date:* ${orderDate}%0A*Items:*${itemList}%0A%0A*Total:* ₹${total}${customerInfo}`;
    const adminPhone = '917982504396';
    
    alert(`Order Placed! ✅\n\nOrder ID: ${orderId}\nTotal: ₹${total}\n\nYou will receive updates on WhatsApp.`);
    
    window.open(`https://wa.me/${adminPhone}?text=${whatsAppMsg}`, '_blank');
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) cartCount.textContent = '0';
    
    localStorage.removeItem('cart');
    cart = [];
    updateCartUI();
}

function getProductsByCategory(category) {
    if (!category) return products;
    return products.filter(p => p.category === category);
}

function renderProducts(category = null) {
    const container = document.getElementById('products-grid');
    if (!container) return;
    const filteredProducts = getProductsByCategory(category);
    container.innerHTML = filteredProducts.length === 0 
        ? '<p style="text-align:center;padding:2rem;">No products found</p>'
        : filteredProducts.map(product => createProductCard(product)).join('');
}

function filterProducts(category) {
    window.location.href = category === 'all' ? 'products.html' : `products.html?category=${category}`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderMenProducts();
    renderWomenProducts();
    updateCartUI();
    updateUserIcon();
    
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        header.style.boxShadow = window.scrollY > 50 ? '0 2px 20px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)';
    }
});

// User Authentication
function handleUserClick() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        window.location.href = 'profile.html';
    } else {
        window.location.href = 'login.html';
    }
}

function updateUserIcon() {
    const userBtn = document.getElementById('userBtn');
    if (!userBtn) return;
    
    const user = localStorage.getItem('currentUser');
    if (user) {
        const userData = JSON.parse(user);
        userBtn.innerHTML = '<i class="fas fa-user"></i><span class="user-name">' + userData.name.substring(0,1).toUpperCase() + '</span>';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function toggleSearch() {
    const modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
            document.getElementById('searchInput').focus();
        }
    }
}

function searchProducts(e) {
    const query = e.target.value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) return;
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align:center;padding:1rem;color:#666;">No products found</p>';
        return;
    }
    
    resultsContainer.innerHTML = filtered.map(p => `
        <div class="search-result-item" onclick="addToCart(${p.id}); toggleSearch();">
            <img src="${p.image}" alt="${p.name}">
            <div>
                <h4>${p.name}</h4>
                <span class="price">₹${p.price}</span>
            </div>
        </div>
    `).join('');
}