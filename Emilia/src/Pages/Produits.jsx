 
"use client";
import { useState, useEffect } from "react";
import { Download, Plus, Edit, Trash, X } from "lucide-react";

// Note: Replace with your actual deployed API URL in production
const API_BASE_URL = "https://localhost:7052"; 

export default function Produits() {
  const [showForm, setShowForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // Renamed for clarity
  const [showEditModal, setShowEditModal] = useState(false); // New state for Edit modal
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for creating a new product
  const [newProduct, setNewProduct] = useState({
    productCode: "",
    name: "",
    quantity: "",
    prixAchat: "", 
    price: "",
    supplierId: "",
  });

  // New state for the product being edited
  const [editingProduct, setEditingProduct] = useState(null); 

  // Use a custom modal component instead of window.confirm for better UI
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE_URL}/api/products`, { headers });

      if (response.status === 401) {
        setError("Accès non autorisé : Veuillez vous reconnecter.");
        return;
      }

      if (!response.ok) throw new Error("Échec de la récupération des produits");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.log("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => setShowForm(!showForm);

  // Handler for New Product form changes
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Handler for Edit Product form changes
  const handleEditChange = (e) => {
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
  };
  
  // Handlers for Create Product
  const handleSubmitCreate = (e) => {
    e.preventDefault();
    if (!newProduct.productCode || !newProduct.name || !newProduct.price || !newProduct.prixAchat) return; 
    setShowCreateModal(true);
  };
  
  const confirmSaveCreate = async () => {
    setShowCreateModal(false);
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      const productToSave = {
        productCode: newProduct.productCode, 
        name: newProduct.name,
        quantity: parseInt(newProduct.quantity || 0),
        PrixAchat: parseFloat(newProduct.prixAchat), // PascalCase for C# DTO
        price: parseFloat(newProduct.price),
        supplierId: newProduct.supplierId || null, 
      };

      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers,
        body: JSON.stringify(productToSave),
      });

      const responseText = await response.text();

      if (response.status === 403) {
        setError(`Accès refusé : Le produit n'a pas pu être sauvegardé. (Problème RLS)`);
        return;
      }
      
      if (response.status === 400) {
        setError(`Requête incorrecte : ${responseText}`);
        return;
      }

      if (!response.ok) throw new Error("Échec de la sauvegarde du produit : " + responseText);

      await fetchProducts();
      setNewProduct({ productCode: "", name: "", quantity: "", prixAchat: "", price: "", supplierId: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Edit Product
  const startEdit = (product) => {
    // Map the product details to the editing state
    setEditingProduct({
        id: product.id,
        productCode: product.productCode || '',
        name: product.name,
        quantity: product.quantity,
        prixAchat: product.prixAchat || '',
        price: product.price,
        supplierId: product.supplierId || '',
        // Include CreatedAt for complete data fidelity, though not usually editable
        createdAt: product.createdAt
    });
    setShowEditModal(true);
  };

  const confirmSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowEditModal(false);

    try {
      const token = localStorage.getItem("token");
      const id = editingProduct.id;

      // Map the local state back to the DTO structure for the API call
      const productToUpdate = {
        productCode: editingProduct.productCode,
        name: editingProduct.name,
        quantity: parseInt(editingProduct.quantity || 0),
        PrixAchat: parseFloat(editingProduct.prixAchat), // PascalCase
        price: parseFloat(editingProduct.price),
        supplierId: editingProduct.supplierId || null,
      };

      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(productToUpdate),
      });
      
      const responseText = await response.text();

      if (!response.ok) throw new Error("Échec de la mise à jour du produit: " + responseText);

      await fetchProducts(); // Refresh data
      setEditingProduct(null);

    } catch (err) {
        setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // Handlers for Delete Product (Logic already mostly there)
  const startDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete.id;
    setShowDeleteConfirm(false);
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers,
      });

      const responseText = await response.text();

      if (response.status === 401) {
        setError("Accès non autorisé : Veuillez vous reconnecter.");
        return;
      }

      if (!response.ok) throw new Error("Échec de la suppression du produit : " + responseText);
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadPDF = () => {
    setError("La fonction de téléchargement PDF sera bientôt disponible !");
    setTimeout(() => setError(null), 3000);
  };

  // --- MODAL COMPONENTS (Translated) ---

  const DeleteConfirmationModal = ({ show, onConfirm, onCancel, productName }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white text-black p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 relative">
          <h3 className="text-lg font-semibold mb-4">Confirmer la Suppression</h3>
          <p className="mb-4">Êtes-vous sûr de vouloir supprimer le produit : <strong>{productName}</strong> ? Cette action est irréversible.</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditProductModal = ({ show, product, onSave, onCancel, onChange }) => {
    if (!show || !product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-gray-800 p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-4 relative border-t-4 border-blue-500">
                <button 
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                >
                    <X size={20} className="text-gray-500" />
                </button>
                <h3 className="text-xl font-bold mb-6">Modifier le Produit : {product.name}</h3>

                <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                        <input
                            type="text"
                            name="productCode"
                            value={product.productCode}
                            onChange={onChange}
                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={onChange}
                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                        <input
                            type="number"
                            name="quantity"
                            value={product.quantity}
                            onChange={onChange}
                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix Achat (FC/USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="prixAchat"
                            value={product.prixAchat}
                            onChange={onChange}
                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix Vente (FC/USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            value={product.price}
                            onChange={onChange}
                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Fournisseur</label>
                        <input
                            type="text"
                            name="supplierId"
                            value={product.supplierId}
                            onChange={onChange}
                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Facultatif"
                        />
                    </div>
                    
                    <div className="col-span-full flex justify-end gap-3 pt-4 border-t mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Mise à jour..." : "Enregistrer les Modifications"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
  };


  return (
    <div className="p-2 font-sans bg-gray-100 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Articles</h1>
        </div>
        <button
          onClick={toggleForm}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md mt-4 sm:mt-0"
        >
          <Plus size={18} />
          {showForm ? "Masquer le Formulaire" : "Ajouter un Nouvel Article"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Détails</h2>
          <form onSubmit={handleSubmitCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                name="productCode"
                value={newProduct.productCode}
                onChange={handleChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition duration-150"
                placeholder="Ex: PR001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition duration-150"
                placeholder="Nom du produit"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
              <input
                type="number"
                name="quantity"
                value={newProduct.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition duration-150"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix Achat (FC/USD)</label>
              <input
                type="number"
                step="0.01"
                name="prixAchat" 
                value={newProduct.prixAchat}
                onChange={handleChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition duration-150"
                placeholder="Ex: 100.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix Vente (FC/USD)</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={newProduct.price}
                onChange={handleChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition duration-150"
                placeholder="Ex: 150.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Fournisseur</label>
              <input
                type="text"
                name="supplierId"
                value={newProduct.supplierId}
                onChange={handleChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition duration-150"
                placeholder="Facultatif"
              />
            </div>
            <div className="col-span-full flex justify-end mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition shadow-md disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Sauvegarde..." : "Sauvegarder l'Article"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 relative border-t-4 border-blue-500">
            <h3 className="text-xl font-bold mb-4">Confirmer la Sauvegarde</h3>
            <p className="mb-2"><strong>Code:</strong> {newProduct.productCode}</p>
            <p className="mb-2"><strong>Nom:</strong> {newProduct.name}</p>
            <p className="mb-2"><strong>Quantité:</strong> {newProduct.quantity || 0}</p>
            <p className="mb-2"><strong>Prix Achat:</strong> R {parseFloat(newProduct.prixAchat).toFixed(2)}</p>
            <p className="mb-2"><strong>Prix Vente:</strong> R {parseFloat(newProduct.price).toFixed(2)}</p>
            <p className="mb-4"><strong>ID Fournisseur:</strong> {newProduct.supplierId || "Aucun"}</p>
            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmSaveCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Product Table Section */}
      <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-700">Liste des Articles ({filteredProducts.length})</h2>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition shadow-md"
          >
            <Download size={18} />
            Télécharger PDF
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher des articles par nom..."
            className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition duration-150"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Chargement des articles...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Qté</th>
                  <th className="text-left py-3 px-4">Prix Achat</th> 
                  <th className="text-left py-3 px-4">Prix Vente</th>
                  <th className="text-left py-3 px-4">ID Fournisseur</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50 transition duration-100"
                  >
                    <td className="py-3 px-4 text-gray-700 font-mono text-sm">{p.productCode || "N/A"}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{p.name}</td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-semibold">FC {p.prixAchat ? p.prixAchat.toFixed(2) : '0.00'}</td>
                    <td className="py-3 px-4 text-gray-700 font-semibold">FC {p.price ? p.price.toFixed(2) : '0.00'}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{p.supplierId || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => startEdit(p)} // ⭐️ Added Edit Action
                          className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-100"
                          title="Modifier le Produit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => startDelete(p)} // ⭐️ Added Delete Action
                          className="text-red-600 hover:text-red-800 transition p-1 rounded-full hover:bg-red-100"
                          title="Supprimer le Produit"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center text-gray-500 py-8"
                    >
                      Aucun article trouvé correspondant à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <DeleteConfirmationModal 
        show={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        productName={productToDelete?.name}
      />

      <EditProductModal
        show={showEditModal}
        product={editingProduct}
        onSave={confirmSaveEdit}
        onChange={handleEditChange}
        onCancel={() => {
            setShowEditModal(false);
            setEditingProduct(null);
        }}
      />
    </div>
  );
}