// Initialize EmailJS
(function() {
    emailjs.init("JUEM-LB1JoeeNbYZZ"); // Replace with your actual Public Key
})();

document.addEventListener('DOMContentLoaded', function() {
    // Cart functionality
    const cart = {
        items: [],
        total: 0,
        discountApplied: false,
        
        addItem: function(id, name, price) {
            const existingItem = this.items.find(item => item.id === id);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.items.push({
                    id: id,
                    name: name,
                    price: price,
                    quantity: 1
                });
            }
            
            this.updateCart();
        },
        
        removeItem: function(id) {
            this.items = this.items.filter(item => item.id !== id);
            this.updateCart();
        },
        
        updateQuantity: function(id, quantity) {
            const item = this.items.find(item => item.id === id);
            
            if (item) {
                if (quantity <= 0) {
                    this.removeItem(id);
                } else {
                    item.quantity = quantity;
                    this.updateCart();
                }
            }
        },
        
        calculateTotal: function() {
            this.total = this.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
            
            if (this.discountApplied) {
                return 0;
            }
            
            return this.total;
        },
        
        applyDiscount: function(code) {
            if (code.toUpperCase() === "SAKSHIBIRTHDAY") {
                this.discountApplied = true;
                this.updateCart();
                return true;
            }
            return false;
        },
        
        updateCart: function() {
            const cartItemsContainer = document.querySelector('.cart-items');
            const cartTotalElement = document.getElementById('cart-total');
            const checkoutButton = document.getElementById('checkout');
            
            cartItemsContainer.innerHTML = '';
            
            if (this.items.length === 0) {
                cartItemsContainer.innerHTML = '<div class="cart-empty">Aapka cart khali hai jaise mere dimaag se ideas!</div>';
                checkoutButton.disabled = true;
            } else {
                this.items.forEach(item => {
                    const cartItemElement = document.createElement('div');
                    cartItemElement.className = 'cart-item';
                    
                    cartItemElement.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">₹${item.price}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                            <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                    
                    cartItemsContainer.appendChild(cartItemElement);
                });
                
                checkoutButton.disabled = false;
                
                document.querySelectorAll('.quantity-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        const item = cart.items.find(item => item.id === id);
                        
                        if (this.classList.contains('decrease')) {
                            cart.updateQuantity(id, item.quantity - 1);
                        } else if (this.classList.contains('increase')) {
                            cart.updateQuantity(id, item.quantity + 1);
                        }
                    });
                });
                
                document.querySelectorAll('.remove-item').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        cart.removeItem(id);
                    });
                });
            }
            
            cartTotalElement.textContent = `₹${this.calculateTotal()}`;
        }
    };
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            
            cart.addItem(id, name, price);
        });
    });
    
    // Discount code functionality
    const discountCodeInput = document.getElementById('discount-code');
    const applyDiscountButton = document.getElementById('apply-discount');
    const discountMessage = document.getElementById('discount-message');
    
    applyDiscountButton.addEventListener('click', function() {
        const code = discountCodeInput.value.trim();
        
        if (cart.applyDiscount(code)) {
            discountMessage.textContent = 'Discount applied! Aapka order ab free hai!';
            discountMessage.className = 'discount-message discount-success';
            discountCodeInput.disabled = true;
            applyDiscountButton.disabled = true;
        } else {
            discountMessage.textContent = 'Invalid discount code. Try "SAKSHIBIRTHDAY"';
            discountMessage.className = 'discount-message discount-error';
        }
    });
    
    // Generate random delivery code
    function generateDeliveryCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }
    
    // Format cart items for email
    function formatCartItemsForEmail(items) {
        let formattedItems = '';
        items.forEach(item => {
            formattedItems += `<p>${item.name} - ₹${item.price} x ${item.quantity}</p>`;
        });
        return formattedItems;
    }
    
    // Checkout functionality
    const checkoutButton = document.getElementById('checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const deliveryForm = document.getElementById('delivery-form');
    const orderConfirmation = document.getElementById('order-confirmation');
    const codeDisplay = document.getElementById('code-display');
    
    checkoutButton.addEventListener('click', function() {
        checkoutForm.style.display = 'block';
        checkoutForm.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Form submission with EmailJS
    deliveryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Generate delivery code
        const deliveryCode = generateDeliveryCode();
        codeDisplay.textContent = deliveryCode;
        
        // Prepare email parameters
        const templateParams = {
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            delivery_hero: document.getElementById('delivery-hero').value,
            
            cart_items: formatCartItemsForEmail(cart.items),
            order_total: cart.calculateTotal(),
            delivery_code: deliveryCode
        };
        
        // Send email using EmailJS
        emailjs.send('service_cohnqkv', 'template_5orzswx', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                
                // Show confirmation message
                checkoutForm.style.display = 'none';
                orderConfirmation.style.display = 'block';
                orderConfirmation.scrollIntoView({ behavior: 'smooth' });
                
                // Reset cart
                cart.items = [];
                cart.discountApplied = false;
                cart.updateCart();
                
                // Reset discount code
                discountCodeInput.value = '';
                discountCodeInput.disabled = false;
                applyDiscountButton.disabled = false;
                discountMessage.textContent = '';
                
                // Reset form
                deliveryForm.reset();
            }, function(error) {
                console.log('FAILED...', error);
                alert('Order failed! Please try again.');
            });
    });

});
