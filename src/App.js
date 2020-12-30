import React, { useState, useEffect } from "react";
import { commerce } from "./lib/commerce";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Products, Navbar, Cart, Checkout } from "./components";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [order, setOrder] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProducts = async () => {
    const { data } = await commerce.products.list();

    setProducts(data);
  };

  const fetchCart = async () => {
    const cart = await commerce.cart.retrieve();

    setCart(cart);
  };

  const handleAddToCart = async (productId, quantity) => {
    const item = await commerce.cart.add(productId, quantity);

    setCart(item.cart);
  };

  const handleUpdateCartQuantity = async (productId, quantity) => {
    const updatedItem = await commerce.cart.update(productId, { quantity });

    setCart(updatedItem.cart);
  };

  const handleRemoveFromCart = async (productId) => {
    const removedItem = await commerce.cart.remove(productId);

    setCart(removedItem.cart);
  };

  const handleEmptyCart = async () => {
    const emptiedCart = await commerce.cart.empty();

    setCart(emptiedCart.cart);
  };

  const refreshCart = async () => {
    const newCart = await commerce.cart.refresh();

    setCart(newCart);
  };

  const handleCaptureCheckout = async (checkoutTokenId, newOrder) => {
    try {
      const incomingOrder = await commerce.checkout.capture(
        checkoutTokenId,
        newOrder
      );

      setOrder(incomingOrder);
      refreshCart();
    } catch (e) {
      setErrorMessage(e.data.error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  return (
    <Router>
      <div>
        <Navbar totalItems={cart.total_items} />
        <Switch>
          <Route exact path="/">
            <Products products={products} onAddToCart={handleAddToCart} />
          </Route>
          <Route exact path="/cart">
            <Cart
              cart={cart}
              handleUpdateCartQuantity={handleUpdateCartQuantity}
              handleRemoveFromCart={handleRemoveFromCart}
              handleEmptyCart={handleEmptyCart}
            />
          </Route>
          <Route exact path="/checkout">
            <Checkout
              cart={cart}
              handleCaptureCheckout={handleCaptureCheckout}
              order={order}
              errorMessage={errorMessage}
            />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
