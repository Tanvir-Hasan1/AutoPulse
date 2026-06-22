"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Bicycle, 
  ShoppingBag, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2, 
  UserCheck,
  LayoutDashboard,
  Shield,
  Layers,
  Settings,
  ShieldAlert,
  PlusCircle,
  Eye,
  ExternalLink
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [adminUser, setAdminUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [shakeBrands, setShakeBrands] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const router = useRouter();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleDownloadSecure = async (endpoint, filename) => {
    try {
      const res = await fetch(`${apiBase}${endpoint}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("File not found or unauthorized");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "document";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "document";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleViewDocument = async (endpoint, filename) => {
    try {
      const res = await fetch(`${apiBase}${endpoint}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("File not found or unauthorized");
      const blob = await res.blob();
      const mimeType = blob.type || "";
      const url = window.URL.createObjectURL(blob);
      
      let type = "other";
      if (mimeType.startsWith("image/")) {
        type = "image";
      } else if (mimeType === "application/pdf") {
        type = "pdf";
      }
      
      setPreviewDoc({
        url,
        type,
        name: filename || "Document",
        blob,
        endpoint
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // Form states
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandModels, setNewBrandModels] = useState("");
  const [newModelInputs, setNewModelInputs] = useState({}); // { brandId: "newModelName" }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const getHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = getHeaders();
      
      // Fetch users
      const usersRes = await fetch(`${apiBase}/auth/users`, { headers });
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      // Fetch products
      const productsRes = await fetch(`${apiBase}/marketplace/admin/all`, { headers });
      if (!productsRes.ok) throw new Error("Failed to fetch products");
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);

      // Fetch brands
      const brandsRes = await fetch(`${apiBase}/bikes/brands`, { headers });
      if (!brandsRes.ok) throw new Error("Failed to fetch bike brands");
      const brandsData = await brandsRes.json();
      setBrands(brandsData.brands || []);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const userStr = localStorage.getItem("adminUser");
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
    setAdminUser(JSON.parse(userStr));
    fetchAllData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/login");
  };

  // Approval actions
  const handleApproveProduct = async (productId) => {
    try {
      const res = await fetch(`${apiBase}/marketplace/approve/${productId}`, {
        method: "PUT",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to approve product");
      
      // Update local state
      setProducts(prev => 
        prev.map(p => p._id === productId ? { ...p, isApproved: true } : p)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectProduct = async (productId) => {
    if (!confirm("Are you sure you want to reject and delete this listing?")) return;
    try {
      const res = await fetch(`${apiBase}/marketplace/delete-product/${productId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to reject product");
      
      // Update local state
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Bike brand actions
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const modelsArray = newBrandModels
      .split(",")
      .map(m => m.trim())
      .filter(m => m.length > 0);

    try {
      const res = await fetch(`${apiBase}/bikes/brands`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name: newBrandName.trim(), models: modelsArray }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create brand");

      setBrands(prev => [...prev, data.brand].sort((a, b) => a.name.localeCompare(b.name)));
      setNewBrandName("");
      setNewBrandModels("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!confirm("Are you sure you want to delete this bike brand?")) return;
    try {
      const res = await fetch(`${apiBase}/bikes/brands/${brandId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete brand");

      setBrands(prev => prev.filter(b => b._id !== brandId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddModel = async (brandId) => {
    const modelName = newModelInputs[brandId];
    if (!modelName || !modelName.trim()) {
      setShakeBrands(prev => ({ ...prev, [brandId]: true }));
      setTimeout(() => {
        setShakeBrands(prev => ({ ...prev, [brandId]: false }));
      }, 300);
      showToast("Model name is required to append it.", "error");
      return;
    }

    const brand = brands.find(b => b._id === brandId);
    if (!brand) return;

    const updatedModels = [...brand.models, modelName.trim()];

    try {
      const res = await fetch(`${apiBase}/bikes/brands/${brandId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ models: updatedModels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add model");

      setBrands(prev => prev.map(b => b._id === brandId ? data.brand : b));
      setNewModelInputs(prev => ({ ...prev, [brandId]: "" }));
      showToast("Model added successfully!", "success");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteModel = async (brandId, modelIndex) => {
    const brand = brands.find(b => b._id === brandId);
    if (!brand) return;

    const updatedModels = brand.models.filter((_, idx) => idx !== modelIndex);

    try {
      const res = await fetch(`${apiBase}/bikes/brands/${brandId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ models: updatedModels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete model");

      setBrands(prev => prev.map(b => b._id === brandId ? data.brand : b));
    } catch (err) {
      alert(err.message);
    }
  };

  // User actions
  const handleToggleUserRole = async (userId, currentRole) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;

    try {
      const res = await fetch(`${apiBase}/auth/users/${userId}/role`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");

      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: nextRole } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#090D16", color: "#F3F4F6" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600" }}>Loading AutoPulse Management Console...</h2>
      </div>
    );
  }

  // Calculate quick stats
  const totalUsers = users.length;
  const pendingApprovals = products.filter(p => !p.isApproved).length;
  const activeListings = products.filter(p => p.isApproved).length;
  const totalBrands = brands.length;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: "0 12px 28px 12px", borderBottom: "1px solid var(--card-border)", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#F3F4F6", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#6366F1" }}>🏍️</span> AutoPulse
          </h2>
          <span style={{ fontSize: "11px", color: "var(--primary-color)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Admin Panel</span>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <button 
            className={`nav-link w-full text-left ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </button>

          <button 
            className={`nav-link w-full text-left ${activeTab === "approvals" ? "active" : ""}`}
            onClick={() => setActiveTab("approvals")}
          >
            <ShoppingBag size={20} />
            <span style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
              <span>Product Approvals</span>
              {pendingApprovals > 0 && (
                <span style={{ backgroundColor: "var(--danger)", color: "white", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                  {pendingApprovals}
                </span>
              )}
            </span>
          </button>

          <button 
            className={`nav-link w-full text-left ${activeTab === "bikes" ? "active" : ""}`}
            onClick={() => setActiveTab("bikes")}
          >
            <Layers size={20} />
            <span>Bike Database</span>
          </button>

          <button 
            className={`nav-link w-full text-left ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={20} />
            <span>User Directory</span>
          </button>
        </nav>

        {adminUser && (
          <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color)", fontWeight: "700", fontSize: "14px" }}>
                {adminUser.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "#F3F4F6", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{adminUser.name}</p>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{adminUser.email}</p>
              </div>
            </div>
            <button className="btn btn-secondary w-full" onClick={handleLogout} style={{ gap: "10px", height: "42px" }}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#F3F4F6" }}>
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "approvals" && "Marketplace Product Approvals"}
              {activeTab === "bikes" && "Bike Brand & Model Database"}
              {activeTab === "users" && "User Directory Management"}
            </h1>
          </div>
          <button className="btn btn-secondary btn-small" onClick={fetchAllData} disabled={loading}>
            {loading ? "Syncing..." : "Sync Database"}
          </button>
        </header>

        <div className="content-body">
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#EF4444", padding: "16px", borderRadius: "10px", marginBottom: "28px" }}>
              <ShieldAlert size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="icon-wrapper" style={{ backgroundColor: "rgba(99, 102, 241, 0.15)", color: "var(--primary-color)" }}>
                    <Users size={22} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>Total Active Users</p>
                    <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#F3F4F6", marginTop: "4px" }}>{totalUsers}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="icon-wrapper" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "var(--warning)" }}>
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>Pending Approvals</p>
                    <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#F3F4F6", marginTop: "4px" }}>{pendingApprovals}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="icon-wrapper" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>Active Listings</p>
                    <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#F3F4F6", marginTop: "4px" }}>{activeListings}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="icon-wrapper" style={{ backgroundColor: "rgba(236, 72, 153, 0.15)", color: "#EC4899" }}>
                    <Layers size={22} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>Bike Brands</p>
                    <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#F3F4F6", marginTop: "4px" }}>{totalBrands}</h3>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "14px", padding: "28px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#F3F4F6", marginBottom: "20px" }}>System Management Rules</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                  <div style={{ border: "1px solid rgba(255,255,255,0.03)", padding: "20px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.01)" }}>
                    <h4 style={{ fontWeight: "600", fontSize: "15px", color: "#F3F4F6", marginBottom: "8px" }}>Marketplace Approvals</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                      Any products posted by regular users in the mobile app are flagged as unapproved by default. They will not appear in the active marketplace feed until an admin approves them from the **Product Approvals** tab.
                    </p>
                  </div>
                  <div style={{ border: "1px solid rgba(255,255,255,0.03)", padding: "20px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.01)" }}>
                    <h4 style={{ fontWeight: "600", fontSize: "15px", color: "#F3F4F6", marginBottom: "8px" }}>Bike Onboarding Data</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                      Bike brand and model lists for the mobile registration flow are loaded dynamically from MongoDB. You can add new brands, expand their model lists, or delete entries in the **Bike Database** tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT APPROVALS */}
          {activeTab === "approvals" && (
            <div>
              {products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
                  <ShoppingBag size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
                  <p>No products exist in the database.</p>
                </div>
              ) : (
                <div className="approval-grid">
                  {products.map(product => {
                    const productImgUrl = `${apiBase}/marketplace/product-image/${product._id}`;
                    return (
                      <div className="approval-card" key={product._id}>
                        <img 
                          src={productImgUrl} 
                          alt={product.productName} 
                          className="approval-card-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop";
                          }}
                        />
                        <div className="approval-card-body">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#F3F4F6" }} className="truncate">
                              {product.productName}
                            </h3>
                            <span className={`badge ${product.isApproved ? "success" : "warning"}`} style={{ flexShrink: 0 }}>
                              {product.isApproved ? "Approved" : "Pending"}
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary-color)" }}>
                              TK {product.price}
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                              Category: {product.category} | Condition: {product.condition}
                            </span>
                          </div>

                          <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "12px", marginTop: "4px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Seller Info</p>
                            <p style={{ fontSize: "13px", fontWeight: "600", color: "#F3F4F6", marginTop: "4px" }}>{product.user?.name || "Unknown Seller"}</p>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{product.user?.email || "No Email"}</p>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Phone: {product.phoneNumber}</p>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }} className="truncate">Loc: {product.address}</p>
                          </div>

                          {product.details && (
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "4px" }} className="line-clamp-2">
                              "{product.details}"
                            </p>
                          )}

                          <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "12px" }}>
                            {!product.isApproved ? (
                              <button 
                                className="btn btn-primary btn-small" 
                                style={{ flex: 1, backgroundColor: "var(--success)", hover: { backgroundColor: "#059669" } }}
                                onClick={() => handleApproveProduct(product._id)}
                              >
                                <CheckCircle size={14} />
                                <span>Approve</span>
                              </button>
                            ) : (
                              <span style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", color: "var(--success)", fontSize: "13px", fontWeight: "600", paddingLeft: "8px" }}>
                                <CheckCircle size={16} /> Approved
                              </span>
                            )}
                            <button 
                              className="btn btn-danger btn-small"
                              onClick={() => handleRejectProduct(product._id)}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BIKE DATABASE */}
          {activeTab === "bikes" && (
            <div>
              {/* Add Brand Form */}
              <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "14px", padding: "28px", marginBottom: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#F3F4F6", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <PlusCircle size={18} style={{ color: "var(--primary-color)" }} /> Add New Bike Brand
                </h3>
                <form onSubmit={handleAddBrand} style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 240px" }}>
                    <label className="form-label">Brand Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Kawasaki, Aprilia"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: "2 1 360px" }}>
                    <label className="form-label">Default Models (Comma Separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ninja 400, Z900, ZX-10R"
                      value={newBrandModels}
                      onChange={(e) => setNewBrandModels(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ height: "46px", flexShrink: 0 }}>
                    <Plus size={16} />
                    <span>Create Brand</span>
                  </button>
                </form>
              </div>

              {/* Brands List */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {brands.map(brand => (
                  <div key={brand._id} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "14px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#F3F4F6" }}>{brand.name}</h3>
                      <button 
                        onClick={() => handleDeleteBrand(brand._id)}
                        style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title="Delete Brand"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Models List */}
                    <div style={{ flexGrow: 1 }}>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "10px" }}>Registered Models</p>
                      {brand.models.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic" }}>No models listed.</p>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {brand.models.map((model, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--card-border)", padding: "4px 8px 4px 10px", borderRadius: "6px", fontSize: "13px" }}>
                              <span>{model}</span>
                              <button 
                                onClick={() => handleDeleteModel(brand._id, idx)}
                                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                              >
                                <XCircle size={12} className="hover:text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Model Form */}
                    <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "14px", display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        className={`form-input ${shakeBrands[brand._id] ? "shake-input" : ""}`}
                        placeholder="Add model..."
                        style={{ height: "36px", padding: "0 12px", fontSize: "13px" }}
                        value={newModelInputs[brand._id] || ""}
                        onChange={(e) => setNewModelInputs({ ...newModelInputs, [brand._id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddModel(brand._id);
                        }}
                      />
                      <button 
                        className="btn btn-secondary" 
                        style={{ width: "36px", height: "36px", padding: 0 }}
                        onClick={() => handleAddModel(brand._id)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: USER DIRECTORY */}
          {activeTab === "users" && (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Bikes</th>
                    <th>License</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <React.Fragment key={user._id}>
                      <tr 
                        onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                        style={{ cursor: "pointer", backgroundColor: expandedUser === user._id ? "rgba(255, 255, 255, 0.02)" : "transparent" }}
                      >
                        <td style={{ fontWeight: "600" }}>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === "admin" ? "danger" : "success"}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            {user.role === "admin" ? (
                              <>
                                <Shield size={12} /> Admin
                              </>
                            ) : "User"}
                          </span>
                        </td>
                        <td>
                          {user.bikes?.length || 0} bikes
                        </td>
                        <td>
                          <span className={`badge ${user.drivingLicense?.isVerified ? "success" : "warning"}`}>
                            {user.drivingLicense?.isVerified ? "License Verified" : "Unverified"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button 
                            className="btn btn-secondary btn-small"
                            style={{ gap: "6px" }}
                            onClick={(e) => {
                              e.stopPropagation(); // prevent expanding row when clicking button
                              handleToggleUserRole(user._id, user.role);
                            }}
                          >
                            <UserCheck size={14} />
                            <span>
                              {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                            </span>
                          </button>
                        </td>
                      </tr>
                      {expandedUser === user._id && (
                        <tr style={{ backgroundColor: "rgba(255, 255, 255, 0.01)" }}>
                          <td colSpan={6} style={{ padding: "24px", borderBottom: "1px solid var(--card-border)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
                              {/* Column 1: Driving License */}
                              <div style={{ borderRight: "1px solid var(--card-border)", paddingRight: "32px" }}>
                                <h4 style={{ fontWeight: "700", fontSize: "14px", color: "var(--primary-color)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                                  Driving License Document
                                </h4>
                                {user.drivingLicense?.filename ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                      File: <strong style={{ color: "#F3F4F6" }}>{user.drivingLicense.originalName || user.drivingLicense.filename}</strong>
                                    </p>
                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                      Uploaded: {new Date(user.drivingLicense.uploadDate).toLocaleDateString()}
                                    </p>
                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                      File Size: {(user.drivingLicense.fileSize / 1024).toFixed(1)} KB
                                    </p>
                                    <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                                      <button 
                                        className="btn btn-primary btn-small"
                                        style={{ display: "flex", alignItems: "center", gap: "4px" }}
                                        onClick={() => handleViewDocument(`/license/download/${user._id}`, user.drivingLicense.originalName || user.drivingLicense.filename)}
                                      >
                                        <Eye size={12} />
                                        <span>View</span>
                                      </button>
                                      <button 
                                        className="btn btn-secondary btn-small"
                                        onClick={() => handleDownloadSecure(`/license/download/${user._id}`, user.drivingLicense.originalName || user.drivingLicense.filename)}
                                      >
                                        Download File
                                      </button>
                                      {!user.drivingLicense.isVerified ? (
                                        <button 
                                          className="btn btn-primary btn-small"
                                          style={{ backgroundColor: "var(--success)" }}
                                          onClick={async () => {
                                            try {
                                              const res = await fetch(`${apiBase}/license/verify/${user._id}`, {
                                                headers: getHeaders(),
                                              });
                                              if (!res.ok) throw new Error("Verification failed");
                                              alert("License marked as verified!");
                                              fetchAllData();
                                            } catch (err) {
                                              alert(err.message);
                                            }
                                          }}
                                        >
                                          Verify License
                                        </button>
                                      ) : (
                                        <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--success)", fontSize: "13px", fontWeight: "600" }}>
                                          <CheckCircle size={16} /> Verified
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                                    No driving license document uploaded.
                                  </p>
                                )}
                              </div>

                              {/* Column 2: User's Registered Bikes & Documents */}
                              <div>
                                <h4 style={{ fontWeight: "700", fontSize: "14px", color: "var(--primary-color)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                                  Registered Bikes & Documents
                                </h4>
                                {!user.bikes || user.bikes.length === 0 ? (
                                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                                    No bikes registered to this user.
                                  </p>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {user.bikes.map((bike, idx) => (
                                      <div key={bike._id || idx} style={{ border: "1px solid var(--card-border)", padding: "16px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.15)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                          <p style={{ fontSize: "14px", fontWeight: "700", color: "#F3F4F6" }}>
                                            {bike.brand} {bike.model} ({bike.year})
                                          </p>
                                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>
                                            Reg: {bike.registrationNumber}
                                          </span>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px" }}>
                                          {/* Registration Document */}
                                          <div>
                                            <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
                                              Registration Doc
                                            </p>
                                            {bike.registrationDoc?.filename ? (
                                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                <span style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={bike.registrationDoc.originalName}>
                                                  {bike.registrationDoc.originalName}
                                                </span>
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                  <button 
                                                    className="btn btn-primary btn-small"
                                                    style={{ display: "flex", alignItems: "center", gap: "4px", height: "30px", fontSize: "11px", backgroundColor: "var(--primary-color)" }}
                                                    onClick={() => handleViewDocument(`/registration/download/${bike._id}`, bike.registrationDoc.originalName || bike.registrationDoc.filename)}
                                                  >
                                                    <Eye size={10} />
                                                    <span>View</span>
                                                  </button>
                                                  <button 
                                                    className="btn btn-secondary btn-small"
                                                    style={{ height: "30px", fontSize: "11px" }}
                                                    onClick={() => handleDownloadSecure(`/registration/download/${bike._id}`, bike.registrationDoc.originalName || bike.registrationDoc.filename)}
                                                  >
                                                    Download
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                                                Not uploaded
                                              </span>
                                            )}
                                          </div>

                                          {/* Tax Token Document */}
                                          <div>
                                            <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
                                              Tax Token
                                            </p>
                                            {bike.taxToken?.filename ? (
                                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                <span style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={bike.taxToken.originalName}>
                                                  {bike.taxToken.originalName}
                                                </span>
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                  <button 
                                                    className="btn btn-primary btn-small"
                                                    style={{ display: "flex", alignItems: "center", gap: "4px", height: "30px", fontSize: "11px", backgroundColor: "var(--primary-color)" }}
                                                    onClick={() => handleViewDocument(`/tax-token/download/${bike._id}`, bike.taxToken.originalName || bike.taxToken.filename)}
                                                  >
                                                    <Eye size={10} />
                                                    <span>View</span>
                                                  </button>
                                                  <button 
                                                    className="btn btn-secondary btn-small"
                                                    style={{ height: "30px", fontSize: "11px" }}
                                                    onClick={() => handleDownloadSecure(`/tax-token/download/${bike._id}`, bike.taxToken.originalName || bike.taxToken.filename)}
                                                  >
                                                    Download
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                                                Not uploaded
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {previewDoc && (
        <div className="preview-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h3 className="preview-modal-title" title={previewDoc.name}>
                Preview: {previewDoc.name}
              </h3>
              <button className="preview-modal-close" onClick={() => setPreviewDoc(null)}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="preview-modal-body">
              {previewDoc.type === "image" ? (
                <img 
                  src={previewDoc.url} 
                  alt={previewDoc.name} 
                  className="preview-image" 
                />
              ) : previewDoc.type === "pdf" ? (
                <iframe 
                  src={previewDoc.url} 
                  className="preview-iframe" 
                  title="PDF Viewer"
                />
              ) : (
                <div className="preview-fallback">
                  <span style={{ fontSize: "48px" }}>📄</span>
                  <p style={{ fontWeight: "600", fontSize: "15px", color: "var(--text-primary)" }}>
                    No preview available for this document type
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    Please click download to view it on your device.
                  </p>
                </div>
              )}
            </div>
            
            <div className="preview-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => window.open(previewDoc.url, "_blank")}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <ExternalLink size={16} />
                <span>Open in New Tab</span>
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleDownloadBlob(previewDoc.blob, previewDoc.name)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                Download File
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="toast-container" style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "#1E293B",
          borderLeft: `4px solid ${toast.type === "error" ? "var(--danger)" : "var(--success)"}`,
          color: "white",
          padding: "16px 20px",
          borderRadius: "10px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
          zIndex: 9999,
          fontSize: "14px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: "280px"
        }}>
          <span style={{ color: toast.type === "error" ? "var(--danger)" : "var(--success)" }}>
            {toast.type === "error" ? <ShieldAlert size={20} /> : <CheckCircle size={20} />}
          </span>
          <div style={{ flexGrow: 1 }}>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "14px" }}>
              {toast.type === "error" ? "Action Required" : "Success"}
            </p>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "12px", fontWeight: "500", marginTop: "2px" }}>
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", marginLeft: "8px", display: "flex", alignItems: "center" }}
          >
            <XCircle size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
