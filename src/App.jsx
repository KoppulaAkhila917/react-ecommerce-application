import React, { useEffect, useState } from "react";
import "./App.css";

const API = "https://fakestoreapi.com/products";

function App() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    description: "",
    category: "electronics",
    image: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showDetails = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API}/${id}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      setSelectedProduct(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      const data = await response.json();

      const addedProduct = {
        ...data,
        rating: { rate: 0, count: 0 },
      };

      setProducts((prev) => [addedProduct, ...prev]);

      setNewProduct({
        title: "",
        price: "",
        description: "",
        category: "electronics",
        image: "",
      });

      setShowForm(false);
      setMessage("Product added successfully!");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      await response.json();

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );

      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }

      setMessage("Product deleted successfully!");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <h2>ShopEase</h2>
        <span>Discover Products</span>
      </header>

      <main className="container">
        {message && (
          <div className="success-message">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {selectedProduct ? (
          <div className="details-page">
            <button
              className="back-btn"
              onClick={() => setSelectedProduct(null)}
            >
              ← Back to Products
            </button>

            <div className="details-card">
              <div className="details-image">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                />
              </div>

              <div className="details-info">
                <span className="category">
                  {selectedProduct.category}
                </span>

                <h1>{selectedProduct.title}</h1>

                <div className="rating">
                  ⭐ {selectedProduct.rating?.rate ?? "N/A"}
                  <span>
                    ({selectedProduct.rating?.count ?? 0} reviews)
                  </span>
                </div>

                <h2 className="price">
                  ${selectedProduct.price}
                </h2>

                <h3>Product Description</h3>
                <p>{selectedProduct.description}</p>

                <button
                  className="delete-btn"
                  onClick={() => deleteProduct(selectedProduct.id)}
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="heading">
              <div>
                <h1>Our Products</h1>
                <p>Explore our latest collection</p>
              </div>

              <button
                className="add-btn"
                onClick={() => setShowForm(!showForm)}
              >
                + Add Product
              </button>
            </div>

            {showForm && (
              <form className="product-form" onSubmit={addProduct}>
                <h2>Add New Product</h2>

                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      title: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Price"
                  min="0.01"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="text"
                  placeholder="Image URL"
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      image: e.target.value,
                    })
                  }
                  required
                />

                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="electronics">Electronics</option>
                  <option value="jewelery">Jewelery</option>
                  <option value="men's clothing">Men's Clothing</option>
                  <option value="women's clothing">Women's Clothing</option>
                </select>

                <textarea
                  placeholder="Product Description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  required
                />

                <div className="form-actions">
                  <button type="submit" className="add-btn">
                    Save Product
                  </button>

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="message">Loading products...</div>
            ) : error && products.length === 0 ? (
              <div className="message">{error}</div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <div className="product-card" key={product.id}>
                    <div
                      className="product-image"
                      onClick={() => showDetails(product.id)}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                      />
                    </div>

                    <div className="product-info">
                      <span className="category">
                        {product.category}
                      </span>

                      <h3>{product.title}</h3>

                      <div className="product-bottom">
                        <h2>${product.price}</h2>
                        <span>
                          ⭐ {product.rating?.rate ?? "New"}
                        </span>
                      </div>

                      <button
                        className="view-btn"
                        onClick={() => showDetails(product.id)}
                      >
                        View Details →
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer>
        © 2026 ShopEase | Powered by Fake Store API
      </footer>
    </div>
  );
}

export default App;