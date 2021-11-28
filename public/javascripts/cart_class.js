class Cart {
    constructor() {
        this.products = [];
        this.initialTotal = 0;
        this.total = 0;
    }

    addProducts(...products) {
        this.products.push(...products);
    }

    removeProduct(index) {
        this.products.splice(index, 1);
    }

    removeProduct(product) {
        this.products.splice(this.products.indexOf(product), 1);
    }

    removeAllProducts() {
        this.products = [];
    }

    setTotal(total) {
        this.total = total;
    }
    getInitialTotal() {
        return this.initialTotal;
    }

    getProduct(index) {
        return this.products[index];
    }

    getProducts() {
        return this.products;
    }

    changeQuantity(index, quantity) {
        this.products[index].quantity = quantity;
    }

    getCartItemAmount() {
        const cartItemAmount = this.products.reduce((sum, current) => {
            return sum + parseInt(current.quantity);
        }, 0);
        return cartItemAmount;
    }

    getTotal() {
        let total = 0;
        for (let i = 0; i < this.products.length; i++) {
            total += this.products[i].price * this.products[i].quantity;
        }
        this.total = total + this.initialTotal;
        return this.total;
    }
}