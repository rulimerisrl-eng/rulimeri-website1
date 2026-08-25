
/* ===== RULIMERI: CÁLCULO AUTOMÁTICO DE ENVÍO =====
   1 unidad = $1.200
   Cada unidad adicional reduce $200.
   Mínimo de envío = $200.
*/
function calcularCantidadCarritoRulimeri(carrito) {
    if (!Array.isArray(carrito)) return 0;
    return carrito.reduce(function(total, item) {
        var cantidad = Number(
            item.quantity !== undefined ? item.quantity :
            item.qty !== undefined ? item.qty : 1
        );
        return total + (Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 0);
    }, 0);
}

function calcularEnvioRulimeri(carrito) {
    var cantidad = calcularCantidadCarritoRulimeri(carrito);
    if (cantidad <= 0) return 0;
    return Math.max(200, 1200 - ((cantidad - 1) * 200));
}

function formatearPrecioRulimeri(valor) {
    return "$" + Math.round(valor).toLocaleString("es-AR");
}

const products=[
{id:1,name:'Naranja',category:'capsule',price:3800,image:'naranja.jpg'},
{id:2,name:'Limón',category:'capsule',price:3800,image:'limon.jpg'},
{id:3,name:'Frutilla',category:'capsule',price:3800,image:'frutilla.jpg'},
{id:4,name:'Uva',category:'capsule',price:3800,image:'uva.jpg'},
{id:5,name:'Sandía',category:'capsule',price:3800,image:'sandia.jpg'},
{id:6,name:'Arándano',category:'capsule',price:3800,image:'arandano.jpg'},
{id:7,name:'Manzana',category:'capsule',price:3800,image:'manzana.jpg'},
{id:8,name:'Botella Rulimeri negra 500 ml',category:'bottle',price:10000,image:'botella-500ml.jpg'}];
let cart=JSON.parse(localStorage.getItem('rulimeri_cart')||'[]');let favorites=JSON.parse(localStorage.getItem('rulimeri_favorites')||'[]');
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),money=n=>'$'+Number(n).toLocaleString('es-AR');
function save(){localStorage.setItem('rulimeri_cart',JSON.stringify(cart));localStorage.setItem('rulimeri_favorites',JSON.stringify(favorites))}function toast(t){const n=$('#notification');n.textContent=t;n.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>n.classList.remove('show'),2200)}
function renderProducts(){let q=($('#searchInput').value||'').toLowerCase(),a=products.filter(p=>p.name.toLowerCase().includes(q));let s=$('#sortSelect').value;if(s==='price-low')a.sort((x,y)=>x.price-y.price);if(s==='price-high')a.sort((x,y)=>y.price-x.price);if(s==='name')a.sort((x,y)=>x.name.localeCompare(y.name));$('#productsGrid').innerHTML=a.map(p=>`<article class="product-card"><button class="favorite ${favorites.includes(p.id)?'active':''}" data-fav="${p.id}">♥</button><div class="product-image"><img src="${p.image}" width="60" alt="${p.name}"></div><div class="product-info"><span class="badge">${p.category==='bottle'?'500 ml':'Cápsula'}</span><h3>${p.name}</h3><p>${p.category==='bottle'?'Botella negra Rulimeri de 500 ml.':'Cápsula olfativa Rulimeri.'}</p><div class="product-bottom"><strong class="price">${money(p.price)}</strong><button class="add-cart" data-add="${p.id}">+</button></div></div></article>`).join('');$$('[data-add]').forEach(b=>b.onclick=()=>openProduct(+b.dataset.add));$$('[data-fav]').forEach(b=>b.onclick=()=>fav(+b.dataset.fav))}
function fav(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save();renderProducts();toast('Favoritos actualizados ❤️')}
function openProduct(id){let p=products.find(x=>x.id===id),m=$('#productModal');if(p.category==='bottle'){let caps=products.filter(x=>x.category==='capsule');$('#modalBody').innerHTML=`<div class="product-modal"><img src="${p.image}" width="60" alt="${p.name}"><div><span class="badge">COMBO</span><h2>Botella negra 500 ml + cápsula</h2><p>Botella $10.000 + cápsula $3.800.</p><div class="input-group"><label>Elegí cápsula</label><select id="capSelect">${caps.map(c=>`<option value="${c.id}">${c.name} — ${money(c.price)}</option>`).join('')}</select></div><div class="combo-price">Total: <strong id="comboTotal">$13.800</strong></div><div class="input-group"><label>Cantidad</label><input id="comboQty" type="number" min="1" value="1"></div><button class="btn btn-primary full" id="addCombo">Agregar combo</button></div></div>`;$('#capSelect').onchange=comboTotal;$('#comboQty').oninput=comboTotal;$('#addCombo').onclick=addCombo}else{$('#modalBody').innerHTML=`<div class="product-modal"><img src="${p.image}" width="60" alt="${p.name}"><div><span class="badge">CÁPSULA</span><h2>${p.name}</h2><div class="combo-price">$3.800</div><div class="input-group"><label>Cantidad</label><input id="qty" type="number" min="1" value="1"></div><button class="btn btn-primary full" id="addOne">Agregar al carrito</button></div></div>`;$('#addOne').onclick=()=>{addToCart(p.id,Math.max(1,+$('#qty').value||1));closeModal()}}m.classList.add('open')}
function comboTotal(){let q=Math.max(1,+$('#comboQty').value||1);$('#comboTotal').textContent=money(13800*q)}function addCombo(){let cap=products.find(x=>x.id===+$(`#capSelect`).value),key=`combo-8-${cap.id}`,e=cart.find(x=>x.key===key),q=Math.max(1,+$('#comboQty').value||1);if(e)e.quantity+=q;else cart.push({id:8,key,name:`Botella negra 500 ml + ${cap.name}`,image:'botella-500ml.jpg',price:13800,quantity:q});save();renderCart();closeModal();toast('Combo agregado 🧴')}
function addToCart(id,q=1){let p=products.find(x=>x.id===id),key=`product-${id}`,e=cart.find(x=>x.key===key);if(e)e.quantity+=q;else cart.push({id,key,name:p.name,image:p.image,price:3800,quantity:q});save();renderCart();toast('Producto agregado 🛒')}
function renderCart(){let b=$('#cartItems');$('#cartCount').textContent=cart.reduce((s,x)=>s+x.quantity,0);b.innerHTML=cart.length?cart.map(x=>`<div class="cart-item"><img src="${x.image}" width="60" height="60" alt="${x.name}"><div class="cart-item-info"><strong>${x.name}</strong><small>${money(x.price)} c/u</small><div class="quantity-controls"><button data-a="dec" data-k="${x.key}">−</button><span>${x.quantity}</span><button data-a="inc" data-k="${x.key}">+</button><button class="remove-item" data-a="del" data-k="${x.key}">🗑</button></div></div><strong>${money(x.price*x.quantity)}</strong></div>`).join(''):'<div class="empty-cart">🛒<p>Tu carrito está vacío.</p></div>';$('#cartTotal').textContent=money(cart.reduce((s,x)=>s+x.price*x.quantity,0));$$('[data-a]').forEach(b=>b.onclick=()=>{let k=b.dataset.k;if(b.dataset.a==='inc')changeQuantity(k,1);if(b.dataset.a==='dec')changeQuantity(k,-1);if(b.dataset.a==='del')removeItem(k)})}
function changeQuantity(key,amount){let item=cart.find(x=>x.key===key);if(!item)return;item.quantity+=amount;if(item.quantity<=0)cart=cart.filter(x=>x.key!==key);save();renderCart()}function removeItem(key){cart=cart.filter(x=>x.key!==key);save();renderCart();toast('Producto eliminado')}function closeModal(){$('#productModal').classList.remove('open')}
$('#cartBtn').onclick=()=>$('#cartDrawer').classList.add('open');$('#closeCart').onclick=()=>$('#cartDrawer').classList.remove('open');$('#clearCartBtn').onclick=()=>{cart=[];save();renderCart()};$$('[data-close-modal]').forEach(x=>x.onclick=closeModal);$('#searchInput').oninput=renderProducts;$('#sortSelect').onchange=renderProducts;$('#menuToggle').onclick=()=>$('#mainNav').classList.toggle('open');$$('.nav a').forEach(x=>x.onclick=()=>$('#mainNav').classList.remove('open'));
$('#checkoutBtn').onclick=()=>{if(!cart.length)return toast('Agregá productos primero');let t=cart.map(x=>`${x.name} x${x.quantity} = ${money(x.price*x.quantity)}`).join('\n'),tot=cart.reduce((s,x)=>s+x.price*x.quantity,0);open(`https://wa.me/?text=${encodeURIComponent('Hola Rulimeri! Quiero hacer este pedido:\n\n'+t+'\n\nTotal: '+money(tot))}`,'_blank')};$('#contactForm').onsubmit=e=>{e.preventDefault();open(`https://wa.me/?text=${encodeURIComponent('Hola Rulimeri! Soy '+$('#contactName').value+'. '+$('#contactMessage').value)}`,'_blank')};$('#backTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});onscroll=()=>$('#backTop').classList.toggle('show',scrollY>500);onload=()=>{setTimeout(()=>$('#loader').classList.add('hidden'),500);renderProducts();renderCart()};


// ===== RULIMERI: PEDIDO POR GMAIL =====
const RULIMERI_EMAIL = "rulimeri.srl@gmail.com";

function enviarPedidoPorGmail() {
  const items = (typeof cart !== "undefined" && Array.isArray(cart)) ? cart : [];
  if (!items.length) {
    if (typeof showNotification === "function") showNotification("Agregá productos al carrito antes de enviar el pedido.");
    else alert("Agregá productos al carrito antes de enviar el pedido.");
    return;
  }

  let total = 0;
  const lineas = items.map(item => {
    const cantidad = Number(item.quantity || 1);
    const subtotal = Number(item.price || 0) * cantidad;
    total += subtotal;
    return `- ${item.name} x ${cantidad} = $${subtotal.toLocaleString("es-AR")}`;
  });

  const asunto = "Pedido / Consulta - Rulimeri";
  const cuerpo = `Hola Rulimeri, quiero realizar un pedido.

Productos:
${lineas.join("\n")}

Total: $${total.toLocaleString("es-AR")}

Nombre:
Teléfono:
Dirección:
Mensaje adicional:`;

  const url = "https://mail.google.com/mail/?view=cm&fs=1"
    + "&to=" + encodeURIComponent(RULIMERI_EMAIL)
    + "&su=" + encodeURIComponent(asunto)
    + "&body=" + encodeURIComponent(cuerpo);

  window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("emailOrderBtn");
  if (btn) btn.addEventListener("click", enviarPedidoPorGmail);
});


function actualizarEnvioRulimeri() {
    var carritoActual = (typeof cart !== "undefined" && Array.isArray(cart)) ? cart : [];
    var cantidad = calcularCantidadCarritoRulimeri(carritoActual);
    var envio = calcularEnvioRulimeri(carritoActual);

    var posibles = [
        document.getElementById("shipping"),
        document.getElementById("cart-shipping"),
        document.getElementById("envio"),
        document.querySelector("[data-shipping]")
    ];

    posibles.forEach(function(el) {
        if (el) el.textContent = cantidad > 0 ? formatearPrecioRulimeri(envio) : "$0";
    });

    return envio;
}



/* Actualización inicial del envío */
document.addEventListener('DOMContentLoaded', function(){ actualizarEnvioRulimeri(); });
