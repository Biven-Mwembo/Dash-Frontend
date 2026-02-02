/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Package, ClipboardList, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL, { fetchWithAuth } from "../apiConfig";

// --- Summary Card Component ---
const CarteResume = ({ titre, valeur, icone: Icone }) => {
  const formaterValeur = (val) => {
    if (typeof val === 'string') return val;
    if (titre.includes("Revenus") || titre.includes("Ventes")) {
      return `FC ${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(val)}`;
    }
    return new Intl.NumberFormat('fr-FR').format(val);
  };

  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-md p-5 flex items-center justify-between min-w-0 transition duration-300 hover:shadow-lg">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-500 truncate uppercase tracking-wider">{titre}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-2">{formaterValeur(valeur)}</p>
      </div>
      <div className="p-3 rounded-full bg-blue-50 text-blue-600 ml-4">
        <Icone size={24} />
      </div>
    </div>
  );
};

// --- Best Selling Product Component ---
const ProduitMieuxVendu = ({ ventes, produits }) => {
  // Logic to find the real best seller based on the sales array
  const ventesProduits = ventes.reduce((acc, vente) => {
    if (vente.productId === 0) return acc; // Skip dummy data
    const cle = vente.productId;
    if (!acc[cle]) {
      const produit = produits.find(p => p.id === cle);
      acc[cle] = { 
        nom: produit?.name || `Produit #${cle}`, 
        totalVendu: 0, 
        totalRevenu: 0,
        id: cle
      };
    }
    const prix = produits.find(p => p.id === cle)?.price || 0;
    acc[cle].totalVendu += vente.quantitySold;
    acc[cle].totalRevenu += (vente.quantitySold * prix);
    return acc;
  }, {});

  const produitLePlusVendu = Object.values(ventesProduits).sort((a, b) => b.totalVendu - a.totalVendu)[0];

  let pourcentageVendu = 0;
  let stockActuel = 0;
  let totalDisponible = 0;

  if (produitLePlusVendu) {
    const produitOriginal = produits.find(p => p.id === produitLePlusVendu.id);
    if (produitOriginal) {
      stockActuel = produitOriginal.quantity || 0; 
      totalDisponible = produitLePlusVendu.totalVendu + stockActuel;
      pourcentageVendu = totalDisponible > 0 ? (produitLePlusVendu.totalVendu / totalDisponible) * 100 : 0;
    }
  }

  return (
    <motion.div 
      className="bg-white rounded-xl border border-gray-100 shadow-md p-6 w-full"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex justify-between items-center mb-5 border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-emerald-500" /> Produit Phare
        </h2>
      </div>

      {produitLePlusVendu ? (
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img 
            src={`https://placehold.co/80x80/059669/FFFFFF?text=${produitLePlusVendu.nom.substring(0,2)}`} 
            alt="Product" 
            className="w-20 h-20 rounded-xl object-cover shadow-md"
          />
          <div className="flex-1 w-full">
            <p className="font-extrabold text-xl text-emerald-700">{produitLePlusVendu.nom}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold">Total Vendu</p>
                <p className="text-lg font-bold text-gray-800">{produitLePlusVendu.totalVendu} unités</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold">Revenu</p>
                <p className="text-lg font-bold text-emerald-600">FC {produitLePlusVendu.totalRevenu.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">En attente de données de vente réelles...</p>
      )}
    </motion.div>
  );
};

// --- Main Dashboard Component ---
function Ventes() {
  const [produits, setProduits] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Parallel fetching for speed
        const [prodRes, dailyRes] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/products`),
          fetchWithAuth(`${API_BASE_URL}/products/sales/daily`)
        ]);

        if (!prodRes.ok || !dailyRes.ok) throw new Error("Erreur lors de la récupération des données");

        const prods = await prodRes.json();
        const daily = await dailyRes.json();

        setProduits(prods);
        setDailySales(daily);

        // Note: In a real app, you would fetch an /api/products/sales endpoint 
        // to get individual transactions. For now, we simulate from daily data.
        const simulatedVentes = daily.map(d => ({
          productId: prods[0]?.id || 1, // Fallback to first product for visualization
          quantitySold: d.count,
          saleDate: d.date,
          id: Math.random()
        }));
        setVentes(simulatedVentes);

      } catch (err) {
        setErreur(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalRevenue = dailySales.reduce((sum, day) => sum + (day.totalAmount || 0), 0);
  const stockDispo = produits.filter(p => p.quantity > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Aperçu analytique de votre pharmacie</p>
        </div>
        <button 
           onClick={() => window.location.reload()}
           className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition"
        >
          Actualiser
        </button>
      </header>

      {erreur && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 font-medium">
          ⚠️ Erreur: {erreur}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProduitMieuxVendu ventes={ventes} produits={produits} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CarteResume titre="Revenu Total" valeur={totalRevenue} icone={Package} />
            <CarteResume titre="Articles en Stock" valeur={`${stockDispo} / ${produits.length}`} icone={ClipboardList} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6">
          <h2 className="font-bold text-gray-800 mb-4 border-b pb-2 text-lg">Performance 7 Jours</h2>
          <div className="space-y-4">
            {dailySales.slice(0, 7).map((day, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div 
                    className="bg-blue-500 h-full" 
                    style={{ width: `${(day.count / Math.max(...dailySales.map(d => d.count))) * 100}%` }}
                   />
                </div>
                <span className="text-sm font-bold text-gray-700">{day.count} vnt.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ventes;