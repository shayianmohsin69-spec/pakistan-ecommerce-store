const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, "data.json");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
function readData() {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({ products: seedProducts(), orders: [] }, null, 2));
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}
function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}
function seedProducts() {
  return [
    { id: 1, name: "Wireless Headphones", category: "Audio", price: 5499, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700", description: "Comfortable everyday headphones with clear sound." },
    { id: 2, name: "Everyday Backpack", category: "Accessories", price: 3299, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700", description: "A practical bag for study, work and travel." },
    { id: 3, name: "Smart Watch", category: "Wearables", price: 7999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700", description: "A clean everyday watch design." },
    { id: 4, name: "Desk Lamp", category: "Home", price: 2199, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700", description: "Simple lighting for a study desk." },
    { id: 5, name: "Running Shoes", category: "Footwear", price: 6899, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700", description: "Lightweight shoes for everyday movement." },
    { id: 6, name: "Coffee Mug", category: "Home", price: 799, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=700", description: "A simple ceramic mug for your desk." }
  ];
}
app.get("/api/products", (req, res) => res.json(readData().products));
app.post("/api/orders", (req, res) => {
  const { customer, phone, address, items } = req.body;
  if (!customer || !phone || !address || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Complete the checkout form and add at least one item." });
  const data = readData();
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const product = data.products.find(p => p.id === Number(item.id));
    const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
    if (product) {
      total += product.price * quantity;
      orderItems.push({ id: product.id, name: product.name, price: product.price, quantity });
    }
  }
  if (!orderItems.length) return res.status(400).json({ error: "No valid products were found." });
  const order = { id: Date.now(), customer: String(customer).slice(0, 100), phone: String(phone).slice(0, 40), address: String(address).slice(0, 400), items: orderItems, total, status: "Received", createdAt: new Date().toISOString() };
  data.orders.push(order);
  writeData(data);
  res.status(201).json({ message: "Demo order received. No payment was collected.", orderId: order.id, total });
});
app.get("/api/admin/orders", (req, res) => {
  if (req.get("x-admin-key") !== (process.env.ADMIN_KEY || "change-this-admin-key")) return res.status(401).json({ error: "Invalid admin key." });
  res.json(readData().orders);
});
app.post("/api/admin/products", (req, res) => {
  if (req.get("x-admin-key") !== (process.env.ADMIN_KEY || "change-this-admin-key")) return res.status(401).json({ error: "Invalid admin key." });
  const { name, category, price, image, description } = req.body;
  if (!name || !category || !Number.isFinite(Number(price)) || Number(price) <= 0) return res.status(400).json({ error: "Enter a name, category and positive price." });
  const data = readData();
  const product = { id: Date.now(), name: String(name).slice(0, 100), category: String(category).slice(0, 60), price: Number(price), image: image || "", description: description || "" };
  data.products.push(product);
  writeData(data);
  res.status(201).json(product);
});
app.delete("/api/admin/products/:id", (req, res) => {
  if (req.get("x-admin-key") !== (process.env.ADMIN_KEY || "change-this-admin-key")) return res.status(401).json({ error: "Invalid admin key." });
  const data = readData();
  data.products = data.products.filter(p => p.id !== Number(req.params.id));
  writeData(data);
  res.json({ success: true });
});
app.listen(port, () => console.log("Store running on http://localhost:" + port));