/* ==========================================================
   RULIMERI - JAVASCRIPT PRINCIPAL + CHECKOUT
   ========================================================== */

const RULIMERI_WHATSAPP = ""; // Colocá aquí el número de WhatsApp de Rulimeri, con código de país. Ej.: 549387XXXXXXX
const RULIMERI_EMAIL = "rulimeri.srl@gmail.com";
const RULIMERI_MAPS = "https://www.google.com/maps/search/?api=1&query=Dean%20Funes%20326%2C%20Salta%2C%20Argentina";

const products = [
  {id:1,name:'Naranja',category:'capsule',price:3800,image:'naranja.jpg'},
  {id:2,name:'Limón',category:'capsule',price:3800,image:'limon.jpg'},
  {id:3,name:'Frutilla',category:'capsule',price:3800,image:'frutilla.jpg'},
  {id:4,name:'Uva',category:'capsule',price:3800,image:'uva.jpg'},
  {id:5,name:'Sandía',category:'capsule',price:3800,image:'sandia.jpg'},
  {id:6,name:'Arándano',category:'capsule',price:3800,image:'arandano.jpg'},
  {id:7,name:'Manzana',category:'capsule',price:3800,image:'manzana.jpg'},
  {id:8,name:'Botella Rulimeri negra 500 ml',category:'bottle',price:10000,image:'botella-500ml.jpg'}
];

let cart = JSON.parse(localStorage.getItem('rulimeri_cart') || '[]');
let favorites = JSON.parse(localStorage.getItem('rulimeri_favorites') || '[]');
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const money = n => '$' + Number(n || 0).toLocaleString('es-AR');

function save(){
  localStorage.setItem('rulimeri_cart', JSON.stringify(cart));
  localStorage.setItem('rulimeri_favorites', JSON.stringify(favorites));
}
function toast(t){
  const n=$('#notification');
  if(!n)return;
  n.textContent=t;n.classList.add('show');clearTimeout(window.tt);
  window.tt=setTimeout(()=>n.classList.remove('show'),2200);
}
function cartQuantity(){return cart.reduce((s,x)=>s+Math.max(0,Number(x.quantity)||0),0)}
function getSubtotal(){return cart.reduce((s,x)=>s+(Number(x.price)||0)*(Number(x.quantity)||0),0)}
function getShipping(){
  const q=cartQuantity();
  if(!q)return 0;
  return Math.max(200,1200-(q-1)*200);
}

function renderProducts(){
  const q=($('#searchInput')?.value||'').toLowerCase().trim();
  let a=products.filter(p=>p.name.toLowerCase().includes(q));
  const s=$('#sortSelect')?.value||'default';
  if(s==='price-low')a.sort((x,y)=>x.price-y.price);
  if(s==='price-high')a.sort((x,y)=>y.price-x.price);
  if(s==='name')a.sort((x,y)=>x.name.localeCompare(y.name));
  $('#productsGrid').innerHTML=a.map(p=>`<article class="product-card"><button class="favorite ${favorites.includes(p.id)?'active':''}" data-fav="${p.id}" aria-label="Favorito">♥</button><div class="product-image"><img src="${p.image}" width="60" alt="${p.name}" onerror="this.src='logo-rulimeri.png'"></div><div class="product-info"><span class="badge">${p.category==='bottle'?'500 ml':'Cápsula'}</span><h3>${p.name}</h3><p>${p.category==='bottle'?'Botella negra Rulimeri de 500 ml.':'Cápsula olfativa Rulimeri.'}</p><div class="product-bottom"><strong class="price">${money(p.price)}</strong><button class="add-cart" data-add="${p.id}">+</button></div></div></article>`).join('');
  $$('[data-add]').forEach(b=>b.onclick=()=>openProduct(Number(b.dataset.add)));
  $$('[data-fav]').forEach(b=>b.onclick=()=>fav(Number(b.dataset.fav)));
}
function fav(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save();renderProducts();toast('Favoritos actualizados ❤️')}

function openProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  if(p.category==='bottle'){
    const caps=products.filter(x=>x.category==='capsule');
    $('#modalBody').innerHTML=`<div class="product-modal"><img src="${p.image}" width="60" alt="${p.name}" onerror="this.src='logo-rulimeri.png'"><div><span class="badge">COMBO</span><h2>Botella negra 500 ml + cápsula</h2><p>Botella $10.000 + cápsula $3.800.</p><div class="input-group"><label>Elegí cápsula</label><select id="capSelect">${caps.map(c=>`<option value="${c.id}">${c.name} — ${money(c.price)}</option>`).join('')}</select></div><div class="combo-price">Total: <strong id="comboTotal">$13.800</strong></div><div class="input-group"><label>Cantidad</label><input id="comboQty" type="number" min="1" value="1"></div><button class="btn btn-primary full" id="addCombo">Agregar combo</button></div></div>`;
    $('#capSelect').onchange=comboTotal;$('#comboQty').oninput=comboTotal;$('#addCombo').onclick=addCombo;
  }else{
    $('#modalBody').innerHTML=`<div class="product-modal"><img src="${p.image}" width="60" alt="${p.name}" onerror="this.src='logo-rulimeri.png'"><div><span class="badge">CÁPSULA</span><h2>${p.name}</h2><div class="combo-price">${money(p.price)}</div><div class="input-group"><label>Cantidad</label><input id="qty" type="number" min="1" value="1"></div><button class="btn btn-primary full" id="addOne">Agregar al carrito</button></div></div>`;
    $('#addOne').onclick=()=>{addToCart(p.id,Math.max(1,Number($('#qty').value)||1));closeModal()};
  }
  $('#productModal').classList.add('open');
}
function comboTotal(){const q=Math.max(1,Number($('#comboQty').value)||1);$('#comboTotal').textContent=money(13800*q)}
function addCombo(){
  const cap=products.find(x=>x.id===Number($('#capSelect').value));if(!cap)return;
  const key=`combo-8-${cap.id}`,e=cart.find(x=>x.key===key),q=Math.max(1,Number($('#comboQty').value)||1);
  if(e)e.quantity+=q;else cart.push({id:8,key,name:`Botella negra 500 ml + ${cap.name}`,image:'botella-500ml.jpg',price:13800,quantity:q});
  save();renderCart();closeModal();toast('Combo agregado 🧴');
}
function addToCart(id,q=1){
  const p=products.find(x=>x.id===id);if(!p)return;
  const key=`product-${id}`,e=cart.find(x=>x.key===key);
  if(e)e.quantity+=q;else cart.push({id,key,name:p.name,image:p.image,price:p.price,quantity:q});
  save();renderCart();toast('Producto agregado 🛒');
}
function changeQuantity(key,amount){const item=cart.find(x=>x.key===key);if(!item)return;item.quantity=Math.max(0,Number(item.quantity)+amount);if(item.quantity===0)cart=cart.filter(x=>x.key!==key);save();renderCart()}
function removeItem(key){cart=cart.filter(x=>x.key!==key);save();renderCart();toast('Producto eliminado')}

function renderCart(){
  const b=$('#cartItems');
  $('#cartCount').textContent=cartQuantity();
  b.innerHTML=cart.length?cart.map(x=>`<div class="cart-item"><img src="${x.image}" width="60" height="60" alt="${x.name}" onerror="this.src='logo-rulimeri.png'"><div class="cart-item-info"><strong>${x.name}</strong><small>${money(x.price)} c/u</small><div class="quantity-controls"><button type="button" data-a="dec" data-k="${x.key}">−</button><span>${x.quantity}</span><button type="button" data-a="inc" data-k="${x.key}">+</button><button type="button" class="remove-item" data-a="del" data-k="${x.key}">🗑</button></div></div><strong>${money(x.price*x.quantity)}</strong></div>`).join(''):'<div class="empty-cart">🛒<p>Tu carrito está vacío.</p></div>';
  const subtotal=getSubtotal(),shipping=getShipping();
  $('#cartSubtotal').textContent=money(subtotal);$('#shipping').textContent=shipping?money(shipping):'$0';$('#cartTotal').textContent=money(subtotal+shipping);
  $$('[data-a]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(b.dataset.a==='inc')changeQuantity(k,1);if(b.dataset.a==='dec')changeQuantity(k,-1);if(b.dataset.a==='del')removeItem(k)});
}

function closeModal(){$('#productModal').classList.remove('open')}
function openCheckout(){
  if(!cart.length){toast('Agregá productos primero');return;}
  renderCheckout();
  $('#checkoutModal').classList.add('open');
  $('#checkoutModal').setAttribute('aria-hidden','false');
  $('#cartDrawer').classList.remove('open');
  document.body.style.overflow='hidden';
}
function closeCheckout(){
  $('#checkoutModal').classList.remove('open');
  $('#checkoutModal').setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
function deliveryMethod(){return document.querySelector('input[name="deliveryMethod"]:checked')?.value||'shipping'}
function updateDeliveryUI(){
  const pickup=deliveryMethod()==='pickup';
  $('#addressFields').hidden=pickup;
  $('#pickupInfo').hidden=!pickup;
  ['customerAddress','customerCity','customerZip'].forEach(id=>{const el=$('#'+id);if(el)el.required=!pickup});
  renderCheckout();
}
function renderCheckout(){
  const subtotal=getSubtotal(),shipping=deliveryMethod()==='pickup'?0:getShipping(),total=subtotal+shipping;
  $('#checkoutItems').innerHTML=cart.map(x=>`<div class="checkout-item-line"><span>${x.name} ×${x.quantity}</span><strong>${money(x.price*x.quantity)}</strong></div>`).join('');
  $('#checkoutSubtotal').textContent=money(subtotal);$('#checkoutShipping').textContent=shipping?money(shipping):'$0';$('#checkoutTotal').textContent=money(total);
  $('#checkoutShippingLabel').textContent=deliveryMethod()==='pickup'?'Retiro en local':'Envío';
}
function buildOrder(){
  const method=deliveryMethod(),subtotal=getSubtotal(),shipping=method==='pickup'?0:getShipping();
  return {
    id:'RUL-'+Date.now(),
    customer:{name:$('#customerName').value.trim(),phone:$('#customerPhone').value.trim(),email:$('#customerEmail').value.trim(),address:method==='shipping'?$('#customerAddress').value.trim():'',city:method==='shipping'?$('#customerCity').value.trim():'',zip:method==='shipping'?$('#customerZip').value.trim():''},
    delivery:method,
    payment:$('#paymentMethod').value,
    notes:$('#orderNotes').value.trim(),items:[...cart],subtotal,shipping,total:subtotal+shipping
  };
}
function buildWhatsAppMessage(order){
  const lines=order.items.map(x=>`• ${x.name} ×${x.quantity} — ${money(x.price*x.quantity)}`).join('\n');
  const delivery=order.delivery==='pickup'?'📍 Retiro en local\n📍 Ubicación: '+RULIMERI_MAPS:`🚚 Envío a domicilio\n📍 Dirección: ${order.customer.address}, ${order.customer.city} (${order.customer.zip})`;
  return `🧴 PEDIDO RULIMERI\n\n👤 Cliente: ${order.customer.name}\n📱 Teléfono: ${order.customer.phone}\n📧 Email: ${order.customer.email}\n\n🛒 PRODUCTOS\n${lines}\n\n📦 Modalidad: ${order.delivery==='pickup'?'Retiro en local':'Envío a domicilio'}\n${delivery.split('\n').slice(1).join('\n')}\n🚚 Envío: ${order.shipping?money(order.shipping):'$0'}\n\n💳 Pago: ${order.payment}\n\n${order.notes?`📝 OBSERVACIONES\n${order.notes}\n\n`:''}💰 TOTAL: ${money(order.total)}`;
}
function openWhatsApp(message){
  const url=RULIMERI_WHATSAPP?`https://wa.me/${RULIMERI_WHATSAPP}?text=${encodeURIComponent(message)}`:`https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url,'_blank','noopener,noreferrer');
}
function submitOrder(e){
  e.preventDefault();
  if(!cart.length){toast('El carrito está vacío');return}
  const order=buildOrder();
  const orders=JSON.parse(localStorage.getItem('rulimeri_orders')||'[]');orders.push(order);localStorage.setItem('rulimeri_orders',JSON.stringify(orders));
  const message=buildWhatsAppMessage(order);
  cart=[];save();renderCart();closeCheckout();e.target.reset();updateDeliveryUI();toast(`¡Pedido ${order.id} preparado! 🎉`);setTimeout(()=>openWhatsApp(message),250);
}
function enviarPedidoPorGmail(){
  if(!cart.length){toast('Agregá productos al carrito antes de enviar el pedido.');return}
  const name=$('#customerName').value.trim(),phone=$('#customerPhone').value.trim(),email=$('#customerEmail').value.trim();
  const order=buildOrder();
  const body=buildWhatsAppMessage(order);
  const url=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(RULIMERI_EMAIL)}&su=${encodeURIComponent('Pedido Rulimeri '+order.id)}&body=${encodeURIComponent(body)}`;
  window.open(url,'_blank','noopener,noreferrer');
}

$('#cartBtn').onclick=()=>$('#cartDrawer').classList.add('open');
$('#closeCart').onclick=()=>$('#cartDrawer').classList.remove('open');
$('#clearCartBtn').onclick=()=>{if(cart.length&&confirm('¿Vaciar carrito?')){cart=[];save();renderCart()}};
$('[data-close-checkout]').onclick=closeCheckout;
$$('[data-close-modal]').forEach(x=>x.onclick=closeModal);
$('#checkoutBtn').onclick=openCheckout;
$('#checkoutForm').addEventListener('submit',submitOrder);
$('#emailCheckoutBtn').onclick=enviarPedidoPorGmail;
$$('input[name="deliveryMethod"]').forEach(r=>r.addEventListener('change',updateDeliveryUI));
$('#searchInput').oninput=renderProducts;$('#sortSelect').onchange=renderProducts;
$('#menuToggle').onclick=()=>$('#mainNav').classList.toggle('open');$$('.nav a').forEach(x=>x.onclick=()=>$('#mainNav').classList.remove('open'));
$('#contactForm').onsubmit=e=>{e.preventDefault();openWhatsApp(`Hola Rulimeri! Soy ${$('#contactName').value}. ${$('#contactMessage').value}`)};
$('#backTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});onscroll=()=>$('#backTop').classList.toggle('show',scrollY>500);

window.addEventListener('load',()=>{setTimeout(()=>$('#loader').classList.add('hidden'),500);renderProducts();renderCart();updateDeliveryUI()});
