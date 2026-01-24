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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import API_BASE_URL, { fetchWithAuth } from "../apiConfig";

// --- Receipt Component ---
const ComponentRecu = React.forwardRef(({ cartDetails, total }, ref) => {
  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const dateTransaction = new Date().toLocaleDateString('fr-FR');
  const heureTransaction = new Date().toLocaleTimeString('fr-FR');

  return (
    <div ref={ref} className="p-4 bg-white text-black print:w-[80mm] print:text-sm">
      <h2 className="text-center font-bold text-lg mb-2 print:text-base">Reçu de Vente</h2>
      <p className="text-center text-xs mb-4">Date: {dateTransaction} | Heure: {heureTransaction}</p>
      
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
          <span className="w-1/3 text-right">{formatNumber(item.price * item.quantity)}</span>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center backdrop-blur-sm">
      <motion.div
        initial={{ y: "-100vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100vh", opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-md"
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Printer size={20} className="text-emerald-600"/> Impression du Reçu
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-gray-700">
          La transaction est terminée ! Souhaitez-vous imprimer un reçu pour le client ?
        </p>

        <div className="hidden print:block absolute top-0 left-0 w-full h-full">
          <ComponentRecu ref={receiptRef} cartDetails={cartDetails} total={total} />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm hover:bg-gray-50 transition"
          >
            Non, Merci
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2"
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
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [lastSaleReceipt, setLastSaleReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const productsPerPage = 8;

  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // ✅ Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
          throw new Error("Échec de la récupération des produits");
        }
        
        const data = await response.json();
        console.log("✅ Products loaded:", data.length);
        setProducts(data);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [lastSaleReceipt]);

  // Safe filtering
  const filteredProducts = products.filter((p) =>
    p.quantity > 0 && 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // --- Cart Actions ---
  const handleAddToCart = (product) => {
    if (product.quantity <= 0) return;
    
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (newQuantity > product.quantity) return prev; 
        
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setDrawerOpen(true);
    setCheckoutMessage("");
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  // ✅ Fixed Checkout Process
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setCheckoutLoading(true);
    setCheckoutMessage("");

    const totalVente = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const detailsRecu = cart.map(item => ({
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
      
      console.log("🛒 Processing sale:", saleItems);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/products/sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleItems),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec: ${errorText || response.statusText}`);
      }
      
      console.log("✅ Sale completed successfully");
      
      setCheckoutMessage("Vente complétée avec succès !");
      setCart([]);
      setDrawerOpen(false);
      
      setLastSaleReceipt({ cartDetails: detailsRecu, total: totalVente });
      setIsReceiptModalOpen(true);

    } catch (err) {
      console.error("❌ Checkout error:", err);
      setCheckoutMessage(`Erreur: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 bg-gray-50 min-h-screen relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 border-b border-gray-200 pb-2">
        Point De Vente (PDV)
      </h1>
      
      {/* Product Grid */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Articles en Stock ({filteredProducts.length})
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher des produits..."
              className="w-full border border-gray-300 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base transition duration-200"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {loading && (
          <p className="text-center py-10 text-gray-500 text-base">
            Chargement des produits...
          </p>
        )}
        
        {error && (
          <div className="text-center py-10">
            <p className="text-red-600 text-base mb-4">Erreur : {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 grow">
              {paginatedProducts.map((p) => {
                const isSoldOut = p.quantity <= 0;
                const cartItem = cart.find(item => item.id === p.id);
                const isMaxQuantity = cartItem && cartItem.quantity >= p.quantity;
                
                return (
                  <motion.div
                    key={p.id}
                    className={`bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition-all p-4 flex flex-col items-center text-center border-2 ${
                      isMaxQuantity ? 'border-red-400' : 'border-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={`https://placehold.co/100x100/34D399/FFFFFF?text=${p.name.split(' ').map(n => n[0]).join('')}`}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl mb-3 shadow-lg"
                    />
                    <h3 className="font-bold text-gray-900 text-base truncate w-full">
                      {p.name}
                    </h3>
                    <p className="text-emerald-900 text-sm font-bold mt-1">
                      FC {p.price ? formatNumber(p.price) : '0.00'}
                    </p>
                    
                                        <p
                      className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                        isSoldOut 
                          ? 'bg-red-100 text-red-700' 
                          : (p.quantity < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700')
                      }`}
                    >
                      Stock: {isSoldOut ? "Épuisé" : p.quantity}
                    </p>
                    
                    {isMaxQuantity && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">Max Atteint!</p>
                    )}

                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={isSoldOut || isMaxQuantity}
                      className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium w-full px-3 py-2 rounded-xl transition ${
                        isSoldOut || isMaxQuantity
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-70'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <PlusCircle size={16} /> Ajouter
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-100 transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-base font-semibold text-gray-700">
                  Page {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-100 transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full lg:w-96 bg-white rounded-l-3xl shadow-2xl p-6 flex flex-col z-50 border-l-4 border-emerald-500"
          >
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-3">
              <ShoppingCart size={20} /> Panier de Commande
            </h3>

            {checkoutMessage && (
              <div className={`mb-4 p-3 ${checkoutMessage.includes("Erreur") ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} rounded-xl text-sm border border-current font-medium`}>
                {checkoutMessage}
              </div>
            )}

            <div className="grow overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center mt-10 text-base py-10">
                  Aucun article ajouté. Cliquez sur un produit.
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://placehold.co/100x100/34D399/FFFFFF?text=P`}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 text-base">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × FC {item.price ? formatNumber(item.price) : '0.00'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-full transition hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 pt-5 mt-auto">
                <div className="flex justify-between font-extrabold text-gray-900 mb-4 text-lg">
                  <span>Total à Payer:</span>
                  <span>
                    FC {formatNumber(cart.reduce((acc, item) => acc + item.price * item.quantity, 0))}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="w-1/3 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-base hover:bg-gray-100 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-3 text-base disabled:opacity-50 disabled:bg-emerald-500 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
                        Traitement...
                      </>
                    ) : (
                      "Finaliser la Vente"
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl cursor-pointer z-40 hover:scale-105 transition"
          onClick={() => setDrawerOpen(true)}
        >
          <ShoppingCart size={28} />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center shadow-lg">
            {cart.length}
          </span>
        </motion.div>
      )}

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