// Global product and cart data
let products = [];
let cart = [];

// Fetch products data and initialize page
fetch('products.json')
  .then(response => response.json())
  .then(data => {
    products = data;
    displayProducts(products);
    populateCategories(products);
  })
  .catch(error => {
    console.error('Could not load products:', error);
  });

// Display products in the grid
function displayProducts(items) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!items || items.length === 0) {
    grid.innerHTML = '<p>No products found.</p>';
    return;
  }
  items.forEach(product => {
    // Create product card element
    const card = document.createElement('div');
    card.className = 'product-card';
    // Product image (if available)
    if (product.image) {
      const img = document.createElement('img');
      img.src = product.image;
      img.alt = product.name;
      img.className = 'product-image';
      card.appendChild(img);
    }
    // Product name
    const nameEl = document.createElement('h3');
    nameEl.className = 'product-name';
    nameEl.textContent = product.name;
    card.appendChild(nameEl);
    // Product price
    if (product.price !== undefined) {
      const priceEl = document.createElement('p');
      priceEl.className = 'product-price';
      priceEl.textContent = '$' + product.price;
      card.appendChild(priceEl);
    }
    // Add to Cart button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-to-cart-btn';
    addBtn.textContent = 'Add to Cart';
    addBtn.setAttribute('data-id', product.id);
    addBtn.addEventListener('click', () => {
      addToCart(product);
    });
    card.appendChild(addBtn);
    // Append card to grid
    grid.appendChild(card);
  });
}

// Populate Categories dropdown from products
function populateCategories(items) {
  const menu = document.getElementById('categoriesDropdown');
  if (!menu) return;
  menu.innerHTML = '';
  // Unique category list
  const categories = [...new Set(items.map(p => p.category))];
  // "All Products" option to reset filter
  const allItem = document.createElement('a');
  allItem.href = '#';
  allItem.textContent = 'All Products';
  allItem.addEventListener('click', (e) => {
    e.preventDefault();
    displayProducts(products);            // show all products
    document.getElementById('categoriesDropdown').classList.remove('show');
  });
  menu.appendChild(allItem);
  // Category-specific options
  categories.forEach(cat => {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = cat;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const filtered = products.filter(prod => prod.category === cat);
      displayProducts(filtered);
      document.getElementById('categoriesDropdown').classList.remove('show');
    });
    menu.appendChild(link);
  });
}

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', () => {
    performSearch();
  });
  // Allow Enter key to trigger search
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}
function performSearch() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    // Show all if query is empty
    displayProducts(products);
  } else {
    const results = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
    displayProducts(results);
  }
}

// Cart functionality
function addToCart(product) {
  // Check if already in cart
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    // Add new item to cart
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }
  updateCartUI();
}
function removeFromCart(productId) {
  cart = cart.filter(item => item.id != productId);
  updateCartUI();
}
function updateCartUI() {
  // Update cart item count badge
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalCount;
  }
  // Update cart dropdown contents
  const cartItemsDiv = document.querySelector('.cart-items');
  const cartTotalDiv = document.querySelector('.cart-total');
  if (!cartItemsDiv || !cartTotalDiv) return;
  cartItemsDiv.innerHTML = '';
  if (cart.length === 0) {
    // Cart empty message
    cartItemsDiv.innerHTML = '<p class="empty-cart-text">Your cart is empty.</p>';
    cartTotalDiv.textContent = '';
  } else {
    let totalPrice = 0;
    cart.forEach(item => {
      totalPrice += item.price * item.quantity;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-qty">x${item.quantity}</span>
        <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        <button class="remove-item-btn" data-id="${item.id}">Remove</button>
      `;
      cartItemsDiv.appendChild(itemDiv);
    });
    cartTotalDiv.textContent = 'Total: $' + totalPrice.toFixed(2);
    // Attach remove handlers
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        removeFromCart(id);
      });
    });
  }
}

// Dropdown toggle function
function toggleDropdown(id) {
  // Close other open dropdowns
  document.querySelectorAll('.dropdown-content').forEach(menu => {
    if (menu.id !== id) {
      menu.classList.remove('show');
    }
  });
  const menu = document.getElementById(id);
  if (menu) {
    menu.classList.toggle('show');
  }
}

// Close dropdowns when clicking outside of them
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn') && !event.target.closest('.dropdown-content')) {
    document.querySelectorAll('.dropdown-content').forEach(menu => {
      menu.classList.remove('show');
    });
  }
};