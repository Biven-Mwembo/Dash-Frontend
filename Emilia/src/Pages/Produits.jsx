
/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  PlusCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Printer,
  Edit,
  Package,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import API_BASE_URL, { fetchWithAuth } from "../apiConfig";

// --- Toast Notification Component ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -50, x: "-50%" }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md ${
        type === "success"
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={24} className="flex-shrink-0" />
      ) : (
        <AlertCircle size={24} className="flex-shrink-0" />
      )}
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition"
      >
        <X size={18} />
      </button>
    </motion.div>
  );
};

// --- Product Form Modal ---
const ProductFormModal = ({ isOpen, onClose, product, onSave, showToast }) => {
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    quantity: "",
    price: "",
    prixAchat: "",
    supplierId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        productCode: product.productCode || "",
        name: product.name || "",
        quantity: product.quantity?.toString() || "",
        price: product.price?.toString() || "",
        prixAchat: product.prixAchat?.toString() || "",
        supplierId: product.supplierId || "",
      });
    } else {
      setFormData({
        productCode: "",
        name: "",
        quantity: "",
        price: "",
        prixAchat: "",
        supplierId: "",
      });
    }
    setError("");
  }, [product, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        productCode: formData.productCode || null,
        name: formData.name,
        quantity: parseInt(formData.quantity) || 0,
        price: parseFloat(formData.price) || 0,
        prixAchat: parseFloat(formData.prixAchat) || 0,
        supplierId: formData.supplierId || null,
      };

      const url = product
        ? `${API_BASE_URL}/products/${product.id}`
        : `${API_BASE_URL}/products`;

      const method = product ? "PUT" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Erreur lors de l'enregistrement";

        if (response.status === 403) {
          errorMessage =
            "Accès refusé. Vous devez être administrateur pour effectuer cette action.";
        } else if (response.status === 401) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.detail || errorMessage;
          } catch {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }

        throw new Error(errorMessage);
      }

      const savedProduct = await response.json();
      onSave(savedProduct);
      showToast(
        product
          ? "Produit modifié avec succès!"
          : "Produit ajouté avec succès!",
        "success"
      );
      onClose();
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            <span className="truncate">
              {product ? "Modifier le Produit" : "Ajouter un Produit"}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition flex-shrink-0"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code Produit (optionnel)
            </label>
            <input
              type="text"
              value={formData.productCode}
              onChange={(e) =>
                setFormData({ ...formData, productCode: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
              placeholder="Ex: MED001"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du Produit *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
              placeholder="Ex: Paracétamol 500mg"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                placeholder="0"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de Vente (FC) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                placeholder="0.00"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix d'Achat (FC) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.prixAchat}
              onChange={(e) =>
                setFormData({ ...formData, prixAchat: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
              placeholder="0.00"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Fournisseur (optionnel)
            </label>
            <input
              type="text"
              value={formData.supplierId || ""}
              onChange={(e) =>
                setFormData({ ...formData, supplierId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
              placeholder="Ex: SUPP001"
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition order-2 sm:order-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  {product ? "Mettre à Jour" : "Ajouter"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            Confirmer la Suppression
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-700 mb-6 text-sm sm:text-base">
          Êtes-vous sûr de vouloir supprimer <strong>{productName}</strong> ?
          Cette action est irréversible.
        </p>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition order-2 sm:order-1"
          >
            Annuler
          </button>
    
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Receipt Component ---
const ComponentRecu = React.forwardRef(({ cartDetails, total }, ref) => {
  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const dateTransaction = new Date().toLocaleDateString("fr-FR");
  const heureTransaction = new Date().toLocaleTimeString("fr-FR");

  return (
    <div
      ref={ref}
      className="p-4 bg-white text-black print:w-[80mm] print:text-sm"
    >
      <h2 className="text-center font-bold text-lg mb-2 print:text-base">
        Reçu de Vente
      </h2>
      <p className="text-center text-xs mb-4">
        Date: {dateTransaction} | Heure: {heureTransaction}
      </p>

      <div className="border-t border-b border-dashed border-gray-400 py-2 mb-2">
        <div className="flex font-semibold text-xs print:text-xs">
          <span className="w-1/2">Article</span>
          <span className="w-1/6 text-center">Qté</span>
          <span className="w-1/3 text-right">Montant (FC)</span>
        </div>
      </div>

      {cartDetails.map((item, index) => (
        <div key={index} className="flex text-xs mb-1 print:text-xs">
          <span className="w-1/2">{item.name}</span>
          <span className="w-1/6 text-center">{item.quantity}</span>
          <span className="w-1/3 text-right">
            {formatNumber(item.price * item.quantity)}
          </span>
        </div>
      ))}

      <div className="border-t border-dashed border-gray-400 pt-3 mt-3">
        <div className="flex justify-between font-bold text-sm print:text-sm">
          <span>TOTAL PAYÉ:</span>
          <span>FC {formatNumber(total)}</span>
        </div>
      </div>
      <p className="text-center text-xs mt-4">Merci de votre achat!</p>
    </div>
  );
});

// --- Receipt Modal ---
const RecuModal = ({ isOpen, onClose, cartDetails, total }) => {
  const receiptRef = useRef();

  const handlePrint = () => {
    window.print();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: "-100vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100vh", opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Printer size={20} className="text-emerald-600" />
            <span className="truncate">Impression du Reçu</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-gray-700 text-sm sm:text-base">
          La transaction est terminée ! Souhaitez-vous imprimer un reçu pour le
          client ?
        </p>

        <div className="hidden print:block absolute top-0 left-0 w-full h-full">
          <ComponentRecu
            ref={receiptRef}
            cartDetails={cartDetails}
            total={total}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50 transition order-2 sm:order-1"
          >
            Non, Merci
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <Printer size={16} /> Imprimer Reçu
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Component ---
export default function Produits() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastSaleReceipt, setLastSaleReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("pos");

  // Toast state
  const [toast, setToast] = useState(null);

  const productsPerPage = 8;

  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/products`);

      if (!response.ok) {
        throw new Error("Échec de la récupération des produits");
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      showToast("Erreur lors du chargement des produits", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSave = (savedProduct) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
    } else {
      setProducts((prev) => [...prev, savedProduct]);
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/products/${deletingProduct.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Échec de la suppression");
      }

      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      showToast("Produit supprimé avec succès!", "success");
    } catch (err) {
      showToast("Erreur lors de la suppression: " + err.message, "error");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const hasStock = viewMode === "pos" ? p.quantity > 0 : true;
    return matchesSearch && hasStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (newQuantity > product.quantity) {
          showToast("Quantité maximale atteinte!", "error");
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setDrawerOpen(true);
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    showToast("Panier vidé", "success");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setCheckoutLoading(true);

    const totalVente = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const detailsRecu = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      const saleItems = cart.map((item) => ({
        productId: item.id,
        quantitySold: item.quantity,
      }));

      const response = await fetchWithAuth(`${API_BASE_URL}/products/sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleItems),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec: ${errorText || response.statusText}`);
      }

      showToast("Vente complétée avec succès!", "success");
      setCart([]);
      setDrawerOpen(false);

      fetchProducts();

      setLastSaleReceipt({ cartDetails: detailsRecu, total: totalVente });
      setIsReceiptModalOpen(true);
    } catch (err) {
      showToast(`Erreur: ${err.message}`, "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-2 sm:p-4 bg-gray-50 min-h-screen relative">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            {viewMode === "pos" ? "Point De Vente (PDV)" : "Gestion des Produits"}
          </h1>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode(viewMode === "pos" ? "manage" : "pos")}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm transition"
          >
            {viewMode === "pos" ? "📦 Gérer" : "🛒 Vente"}
          </button>

          {viewMode === "manage" && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Nouveau</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5 gap-3 sm:gap-4 border-b border-gray-100 pb-3 sm:pb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            {viewMode === "pos"
              ? `En Stock (${filteredProducts.length})`
              : `Produits (${filteredProducts.length})`}
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base transition duration-200"
            />
          </div>
        </div>

               {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-sm sm:text-base">
              Chargement des produits...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-600 text-sm sm:text-base mb-4">
              Erreur : {error}
            </p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 grow">
              {paginatedProducts.map((p) => {
                const isSoldOut = p.quantity <= 0;
                const cartItem = cart.find((item) => item.id === p.id);
                const isMaxQuantity =
                  cartItem && cartItem.quantity >= p.quantity;

                return (
                  <motion.div
                    key={p.id}
                    className={`bg-gray-50 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all p-3 sm:p-4 flex flex-col items-center text-center border-2 ${
                      isMaxQuantity ? "border-red-400" : "border-gray-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={`https://placehold.co/100x100/34D399/FFFFFF?text=${p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}`}
                      alt={p.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl mb-2 sm:mb-3 shadow-lg"
                    />
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base truncate w-full">
                      {p.name}
                    </h3>
                    <p className="text-emerald-900 text-xs sm:text-sm font-bold mt-1">
                      FC {p.price ? formatNumber(p.price) : "0.00"}
                    </p>

                    <p
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                        isSoldOut
                          ? "bg-red-100 text-red-700"
                          : p.quantity < 5
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isSoldOut ? "Épuisé" : `Stock: ${p.quantity}`}
                    </p>

                    {isMaxQuantity && viewMode === "pos" && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">
                        Max!
                      </p>
                    )}

                    {viewMode === "pos" ? (
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={isSoldOut || isMaxQuantity}
                        className={`mt-3 sm:mt-4 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium w-full px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl transition ${
                          isSoldOut || isMaxQuantity
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-70"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <PlusCircle size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Ajouter</span>
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-3 sm:mt-4 w-full">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductFormOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-medium px-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                        >
                          <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">Modifier</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeletingProduct(p);
                            setIsDeleteModalOpen(true);
                          }}
                          className="flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                        >
                          <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-10">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  Aucun produit trouvé
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 sm:mt-8 gap-2 sm:gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg sm:rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-100 transition"
                >
                  <ChevronLeft size={16} className="sm:w-4 sm:h-4" />
                </button>
                <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg sm:rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-100 transition"
                >
                  <ChevronRight size={16} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shopping Cart Drawer - Only in POS mode */}
      {viewMode === "pos" && (
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl p-4 sm:p-6 flex flex-col z-50 border-l-4 border-emerald-500"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2 border-b pb-3 pr-10">
                <ShoppingCart size={20} />
                <span className="truncate">Panier</span>
              </h3>

              <div className="grow overflow-y-auto space-y-3 sm:space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center mt-10 py-10">
                    <ShoppingCart
                      size={48}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <p className="text-gray-500 text-sm sm:text-base">
                      Panier vide
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={`https://placehold.co/100x100/34D399/FFFFFF?text=P`}
                          alt={item.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                            {item.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {item.quantity} × FC{" "}
                            {item.price ? formatNumber(item.price) : "0.00"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-full transition hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 size={16} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 pt-4 sm:pt-5 mt-auto">
                  <div className="flex justify-between font-extrabold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">
                    <span>Total:</span>
                    <span>
                      FC{" "}
                      {formatNumber(
                        cart.reduce(
                          (acc, item) => acc + item.price * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={clearCart}
                      className="w-full sm:w-1/3 px-4 py-2.5 sm:py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm sm:text-base hover:bg-gray-100 transition order-2 sm:order-1"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base disabled:opacity-50 disabled:bg-emerald-500 flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                      {checkoutLoading ? (
                        <>
                          <span className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white rounded-full"></span>
                          <span className="hidden sm:inline">Traitement...</span>
                        </>
                      ) : (
                        "Finaliser"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Floating Cart Button - Only in POS mode */}
      {viewMode === "pos" && cart.length > 0 && !drawerOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-emerald-600 text-white p-3 sm:p-4 rounded-full shadow-2xl cursor-pointer z-40 hover:scale-105 transition"
          onClick={() => setDrawerOpen(true)}
        >
          <ShoppingCart size={24} className="sm:w-7 sm:h-7" />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] sm:min-w-[24px] text-center shadow-lg">
            {cart.length}
          </span>
        </motion.div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleProductSave}
        showToast={showToast}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        productName={deletingProduct?.name || ""}
      />

      {/* Receipt Modal */}
      {isReceiptModalOpen && lastSaleReceipt && (
        <RecuModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          cartDetails={lastSaleReceipt.cartDetails}
          total={lastSaleReceipt.total}
        />
      )}
    </div>
  );
}