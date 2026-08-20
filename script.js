/* ==========================================================
   RULIMERI - JAVASCRIPT PRINCIPAL
   ========================================================== */

const products = [
  {
    id: 1,
    name: "Naranja",
    flavor: "Cítrico",
    category: "citrus",
    price: 3800,
    image: "naranja.jpg",
    description: "Aroma fresco y cítrico de naranja para una experiencia vibrante."
  },
  {
    id: 2,
    name: "Limón",
    flavor: "Cítrico",
    category: "citrus",
    price: 3800,
    image: "limon.jpg",
    description: "Aroma de limón, fresco y refrescante para acompañar tu hidratación."
  },
  {
    id: 3,
    name: "Frutilla",
    flavor: "Frutal",
    category: "berries",
    price: 3800,
    image: "frutilla.jpg",
    description: "Aroma dulce y frutal de frutilla."
  },
  {
    id: 4,
    name: "Uva",
    flavor: "Frutal",
    category: "frutal",
    price: 3800,
    image: "uva.jpg",
    description: "Aroma frutal de uva con una sensación dulce y agradable."
  },
  {
    id: 5,
    name: "Sandía",
    flavor: "Frutal",
    category: "frutal",
    price: 3800,
    image: "sandia.jpg",
    description: "Aroma fresco de sandía, ideal para una experiencia de verano."
  },
  {
    id: 6,
    name: "Arándano",
    flavor: "Frutos rojos",
    category: "berries",
    price: 3800,
    image: "arandano.jpg",
    description: "Aroma intenso de arándano con un perfil frutal."
  },
  {
    id: 7,
    name: "Manzana",
    flavor: "Frutal",
    category: "frutal",
    price: 3800,
    image: "manzana.jpg",
    description: "Aroma fresco y frutal de manzana para una experiencia suave y refrescante."
  },
  {
    id: 8,
    name: "Botella Rulimeri 500 ml + cápsula",
    flavor: "Combo",
    category: "bottle",
    price: 10000,
    image: "botella-500ml.jpg",
    description: "Botella reutilizable de 500 ml con una cápsula Rulimeri a elección. El precio se calcula según el aroma elegido."
  }
];

/* ---------------- ESTADO ---------------- */

let cart = JSON.parse(localStorage.getItem("rulimeri_cart")) || [];
let favorites = JSON.parse(localStorage.getItem("rulimeri_favorites")) || [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const formatPrice = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(value);

function saveState() {
  localStorage.setItem("rulimeri_cart", JSON.stringify(cart));
  localStorage.setItem("rulimeri_favorites", JSON.stringify(favorites));
}

/* ---------------- PRODUCTOS ---------------- */

function renderProducts(list = products) {
  const grid = $("#productsGrid");
  const empty = $("#productsEmpty");

  if (!list.length) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  grid.innerHTML = list.map(product => {
    const isFavorite = favorites.includes(product.id);

    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img src="${product.image}" width="60" alt="Cápsula Rulimeri ${product.name}"
               onerror="this.src='logo-rulimeri.png'">
          <button class="favorite-btn ${isFavorite ? "active" : ""}"
                  data-action="favorite" data-id="${product.id}"
                  aria-label="${isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}">
            ${isFavorite ? "♥" : "♡"}
          </button>
          <span class="product-badge">${product.flavor}</span>
        </div>

        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>

          <div class="product-bottom">
            <strong>${formatPrice(product.price)}</strong>
            <div class="product-actions">
              <button class="small-btn" data-action="view" data-id="${product.id}" title="Ver producto">👁</button>
              <button class="btn btn-primary small" data-action="add" data-id="${product.id}">
                ${product.id === 8 ? "Elegir combo" : "+ Agregar"}
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function filterProducts() {
  const search = ($("#searchInput").value || "").toLowerCase().trim();
  const category = $("#categoryFilter").value;
  const sort = $("#sortProducts").value;

  let list = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.flavor.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search);

    const matchesCategory = category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (sort === "price-low") list.sort((a, b) => a.price - b.price);
  if (sort === "price-high") list.sort((a, b) => b.price - a.price);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

  renderProducts(list);
}

/* ---------------- CARRITO ---------------- */

function addToCart(id, quantity = 1, selectedCapsuleId = null) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (id === 8 && !selectedCapsuleId) {
    openProductModal(id);
    return;
  }

  const cartKey = id === 8 ? `${id}-${selectedCapsuleId}` : `${id}`;
  const existing = cart.find(item => item.key === cartKey);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id, quantity, key: cartKey, capsuleId: selectedCapsuleId });
  }

  saveState();
  renderCart();
  showToast(`${product.name} agregado al carrito 🛒`);
}

function changeQuantity(id, amount, key = null) {
  const item = cart.find(item => key ? item.key === key : item.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(item => key ? item.key !== key : item.id !== id);
  }

  saveState();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveState();
  renderCart();
  showToast("Producto eliminado del carrito");
}

function clearCart() {
  if (!cart.length) return;

  cart = [];
  saveState();
  renderCart();
  showToast("Carrito vacío");
}

function getCartDetailed() {
  return cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return null;

    if (product.id === 8) {
      const capsule = products.find(p => p.id === item.capsuleId);
      const finalPrice = product.price + (capsule ? capsule.price : 0);
      return {
        ...product,
        name: `${product.name} (${capsule ? capsule.name : "Aroma a elegir"})`,
        price: finalPrice,
        capsuleId: item.capsuleId,
        quantity: item.quantity,
        description: `${product.description} Base botella: ${formatPrice(product.price)} + cápsula: ${formatPrice(capsule ? capsule.price : 0)}.`
      };
    }

    return { ...product, quantity: item.quantity };
  }).filter(Boolean);
}

function getSubtotal() {
  return getCartDetailed().reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

function getShipping() {
  const subtotal = getSubtotal();
  if (!subtotal) return 0;
  return subtotal >= 15000 ? 0 : 1200;
}

function renderCart() {
  const items = getCartDetailed();
  const cartItems = $("#cartItems");

  $("#cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  $("#favoritesCount").textContent = favorites.length;

  if (!items.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div>🛒</div>
        <h3>Tu carrito está vacío</h3>
        <p>Agregá una cápsula Rulimeri para comenzar.</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = items.map(item => `
      <div class="cart-item">
        <img src="${item.image}" width="60" alt="${item.name}" onerror="this.src='logo-rulimeri.png'">
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <strong>${formatPrice(item.price)}</strong>

          <div class="quantity-controls">
            <button data-cart-action="decrease" data-id="${item.id}" data-key="${item.key}">−</button>
            <span>${item.quantity}</span>
            <button data-cart-action="increase" data-id="${item.id}" data-key="${item.key}">+</button>
            <button class="remove-item" data-cart-action="remove" data-id="${item.id}" data-key="${item.key}" title="Eliminar">🗑</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = subtotal + shipping;

  $("#cartSubtotal").textContent = formatPrice(subtotal);
  $("#cartShipping").textContent = shipping === 0 && subtotal > 0 ? "Gratis" : formatPrice(shipping);
  $("#cartTotal").textContent = formatPrice(total);
  $("#checkoutTotal").textContent = formatPrice(total);

  $("#checkoutBtn").disabled = !items.length;
}

function openCart() {
  closeAllPanels();
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
}

function openFavorites() {
  closeAllPanels();
  renderFavorites();
  $("#favoritesDrawer").classList.add("open");
  $("#favoritesDrawer").setAttribute("aria-hidden", "false");
}

function renderFavorites() {
  const favoriteProducts = products.filter(product => favorites.includes(product.id));
  const container = $("#favoritesItems");

  if (!favoriteProducts.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <div>♡</div>
        <h3>No tenés favoritos</h3>
        <p>Tocá el corazón de un producto para guardarlo.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = favoriteProducts.map(product => `
    <div class="favorite-item">
      <img src="${product.image}" width="60" alt="${product.name}" onerror="this.src='logo-rulimeri.png'">
      <div>
        <h3>${product.name}</h3>
        <strong>${formatPrice(product.price)}</strong>
        <div>
          <button class="btn btn-primary small" data-action="add" data-id="${product.id}">Agregar</button>
          <button class="small-btn" data-action="favorite" data-id="${product.id}">♥</button>
        </div>
      </div>
    </div>
  `).join("");
}

/* ---------------- FAVORITOS ---------------- */

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(favId => favId !== id);
    showToast("Eliminado de favoritos");
  } else {
    favorites.push(id);
    showToast("Agregado a favoritos ❤️");
  }

  saveState();
  renderProducts();
  renderFavorites();
  $("#favoritesCount").textContent = favorites.length;
}

/* ---------------- MODAL PRODUCTO ---------------- */

function openProductModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (id === 8) {
    const capsuleOptions = products.filter(p => p.id !== 8);
    $("#productModalBody").innerHTML = `
      <div class="product-modal">
        <img src="${product.image}" width="60" alt="${product.name}" onerror="this.src='logo-rulimeri.png'">
        <div>
          <span class="eyebrow">Combo 500 ml</span>
          <h2>Botella Rulimeri 500 ml + cápsula</h2>
          <p>${product.description}</p>
          <p><strong>Botella 500 ml:</strong> ${formatPrice(product.price)}</p>
          <label>
            Elegí tu cápsula
            <select id="bottleCapsuleSelect">
              ${capsuleOptions.map(c => `<option value="${c.id}">${c.name} — ${formatPrice(c.price)}</option>`).join("")}
            </select>
          </label>
          <div class="modal-price" id="bottleComboPrice">${formatPrice(product.price + capsuleOptions[0].price)}</div>
          <small>Precio = botella ${formatPrice(product.price)} + cápsula seleccionada.</small>
          <div class="modal-actions">
            <label>
              Cantidad
              <input id="modalQuantity" type="number" min="1" value="1">
            </label>
            <button class="btn btn-primary" id="modalAddBtn">Agregar combo</button>
          </div>
        </div>
      </div>
    `;

    const select = $("#bottleCapsuleSelect");
    select.addEventListener("change", () => {
      const capsule = products.find(p => p.id === Number(select.value));
      $("#bottleComboPrice").textContent = formatPrice(product.price + capsule.price);
    });

    $("#modalAddBtn").addEventListener("click", () => {
      const quantity = Math.max(1, Number($("#modalQuantity").value) || 1);
      addToCart(id, quantity, Number(select.value));
      closePanel("productModal");
    });
  } else {
    $("#productModalBody").innerHTML = `
      <div class="product-modal">
        <img src="${product.image}" width="60" alt="${product.name}" onerror="this.src='logo-rulimeri.png'">
        <div>
          <span class="eyebrow">${product.flavor}</span>
          <h2>Cápsula de ${product.name}</h2>
          <p>${product.description}</p>
          <div class="modal-price">${formatPrice(product.price)}</div>
          <div class="modal-actions">
            <label>
              Cantidad
              <input id="modalQuantity" type="number" min="1" value="1">
            </label>
            <button class="btn btn-primary" id="modalAddBtn">Agregar al carrito</button>
          </div>
        </div>
      </div>
    `;

    $("#modalAddBtn").addEventListener("click", () => {
      const quantity = Math.max(1, Number($("#modalQuantity").value) || 1);
      addToCart(id, quantity);
      closePanel("productModal");
    });
  }

  openPanel("productModal");
}

/* ---------------- CHECKOUT ---------------- */

function openCheckout() {
  if (!cart.length) {
    showToast("Agregá productos antes de finalizar la compra");
    return;
  }

  closePanel("cartDrawer");
  $("#checkoutTotal").textContent = formatPrice(getSubtotal() + getShipping());
  openPanel("checkoutModal");
}

function submitOrder(event) {
  event.preventDefault();

  if (!cart.length) {
    showToast("El carrito está vacío");
    return;
  }

  const order = {
    id: "RUL-" + Date.now(),
    date: new Date().toLocaleString("es-AR"),
    customer: {
      name: $("#customerName").value.trim(),
      phone: $("#customerPhone").value.trim(),
      email: $("#customerEmail").value.trim(),
      address: $("#customerAddress").value.trim(),
      city: $("#customerCity").value.trim(),
      zip: $("#customerZip").value.trim()
    },
    payment: $("#paymentMethod").value,
    notes: $("#orderNotes").value.trim(),
    items: getCartDetailed(),
    subtotal: getSubtotal(),
    shipping: getShipping(),
    total: getSubtotal() + getShipping()
  };

  const orders = JSON.parse(localStorage.getItem("rulimeri_orders")) || [];
  orders.push(order);
  localStorage.setItem("rulimeri_orders", JSON.stringify(orders));

  // Preparar mensaje para WhatsApp. Cambiá el número por el de Rulimeri.
  const whatsappNumber = "5493870000000";
  const message = buildWhatsAppMessage(order);

  cart = [];
  saveState();
  renderCart();
  $("#checkoutForm").reset();
  closePanel("checkoutModal");

  showToast(`¡Pedido ${order.id} creado! 🎉`);

  // Si querés activar WhatsApp, reemplazá el número de arriba por el real.
  // Se abre en una nueva pestaña.
  setTimeout(() => {
    const shouldOpen = confirm("¿Querés enviar el pedido por WhatsApp?");
    if (shouldOpen) {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
    }
  }, 300);
}

function buildWhatsAppMessage(order) {
  const lines = order.items.map(
    item => `• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
  );

  return `¡Hola Rulimeri! Quiero realizar el pedido ${order.id}.

${lines.join("\n")}

Subtotal: ${formatPrice(order.subtotal)}
Envío: ${order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}
Total: ${formatPrice(order.total)}

Cliente: ${order.customer.name}
Teléfono: ${order.customer.phone}
Dirección: ${order.customer.address}, ${order.customer.city}
Medio de pago: ${order.payment}
${order.notes ? `Notas: ${order.notes}` : ""}`;
}

/* ---------------- UI ---------------- */

function openPanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");

  if (!document.querySelector(".modal.open, .drawer.open")) {
    document.body.classList.remove("no-scroll");
  }
}

function closeAllPanels() {
  $$(".modal.open, .drawer.open").forEach(panel => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  });
  document.body.classList.remove("no-scroll");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ---------------- EVENTOS ---------------- */

document.addEventListener("click", event => {
  const actionElement = event.target.closest("[data-action]");

  if (actionElement) {
    const id = Number(actionElement.dataset.id);
    const action = actionElement.dataset.action;

    if (action === "add") addToCart(id);
    if (action === "favorite") toggleFavorite(id);
    if (action === "view") openProductModal(id);
  }

  const cartActionElement = event.target.closest("[data-cart-action]");

  if (cartActionElement) {
    const id = Number(cartActionElement.dataset.id);
    const action = cartActionElement.dataset.cartAction;

    const key = cartActionElement.dataset.key || null;
    if (action === "increase") changeQuantity(id, 1, key);
    if (action === "decrease") changeQuantity(id, -1, key);
    if (action === "remove") {
      if (key) { cart = cart.filter(item => item.key !== key); saveState(); renderCart(); showToast("Producto eliminado del carrito"); }
      else removeFromCart(id);
    }
  }

  const closeElement = event.target.closest("[data-close]");
  if (closeElement) {
    closePanel(closeElement.dataset.close);
  }
});

$("#cartBtn").addEventListener("click", openCart);
$("#favoritesBtn").addEventListener("click", openFavorites);

$("#clearCartBtn").addEventListener("click", () => {
  if (confirm("¿Seguro que querés vaciar el carrito?")) clearCart();
});

$("#checkoutBtn").addEventListener("click", openCheckout);

$("#searchInput").addEventListener("input", filterProducts);
$("#categoryFilter").addEventListener("change", filterProducts);
$("#sortProducts").addEventListener("change", filterProducts);

$("#checkoutForm").addEventListener("submit", submitOrder);

$("#contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#contactName").value.trim();
  showToast(`¡Gracias ${name}! Recibimos tu consulta 💙`);
  event.target.reset();
});

$("#menuToggle").addEventListener("click", () => {
  $("#mainNav").classList.toggle("open");
});

$$(".nav a").forEach(link => {
  link.addEventListener("click", () => $("#mainNav").classList.remove("open"));
});

$("#backToTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  $("#backToTop").classList.toggle("show", window.scrollY > 450);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeAllPanels();
});

/* ---------------- INICIO ---------------- */

$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
renderFavorites();
