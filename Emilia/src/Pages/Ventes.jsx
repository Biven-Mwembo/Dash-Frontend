/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Package, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL, { fetchWithAuth } from "../apiConfig";

// --- Summary Card Component ---
const CarteResume = ({ titre, valeur, icone: Icone }) => {
  const formaterValeur = (val) => {
    if (typeof val === 'string') return val;
    if (titre.includes("Revenus") || titre.includes("Ventes")) {
      return `FC ${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`;
    }
    return new Intl.NumberFormat().format(val);
  };

  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-md p-5 flex items-center justify-between min-w-0 transition duration-300 hover:shadow-lg">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-500 truncate uppercase tracking-wider">{titre}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-2">
          {formaterValeur(valeur)}
        </p>
      </div>
      <div className="p-3 rounded-full bg-blue-50 text-blue-600 ml-4">
        <Icone size={24} />
      </div>
    </div>
  );
};

// --- Best Selling Product Component ---
const ProduitMieuxVendu = ({ ventes, produits }) => {
  const ventesProduits = ventes.reduce((acc, vente) => {
    const cle = vente.productId;
    if (!acc[cle]) {
      const produit = produits.find(p => p.id === vente.productId);
      acc[cle] = { 
        nom: produit?.name || `Produit #${vente.productId}`, 
        totalVendu: 0, 
        totalRevenu: 0 
      };
    }
    acc[cle].totalVendu += vente.quantitySold;
    acc[cle].totalRevenu += (vente.quantitySold * (produits.find(p => p.id === vente.productId)?.price || 0));
    return acc;
  }, {});

  const produitLePlusVendu = Object.values(ventesProduits).sort((a, b) => b.totalVendu - a.totalVendu)[0];

  let pourcentageVendu = 0;
  let stockActuel = 0;
  let totalDisponible = 0;

  if (produitLePlusVendu) {
    const produitOriginal = produits.find(p => p.name === produitLePlusVendu.nom);
    
    if (produitOriginal) {
      stockActuel = produitOriginal.quantity || 0; 
      totalDisponible = produitLePlusVendu.totalVendu + stockActuel;
      
      if (totalDisponible > 0) {
        pourcentageVendu = (produitLePlusVendu.totalVendu / totalDisponible) * 100;
      }
    }
  }

  return (
    <motion.div 
      className="bg-white rounded-xl border border-gray-100 shadow-md p-6 flex flex-col w-full transition duration-300 hover:shadow-lg"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-5 border-b pb-3">
        <h2 className="text-xl font-bold text-gray-800">Produit Le Plus Vendu</h2>
      </div>

      {produitLePlusVendu ? (
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img 
            src={`https://placehold.co/80x80/059669/FFFFFF?text=${produitLePlusVendu.nom.split(' ').map(n => n[0]).join('')}`} 
            alt={produitLePlusVendu.nom} 
            className="w-20 h-20 rounded-xl object-cover shadow-lg shrink-0" 
            onError={(e) => e.currentTarget.src = 'https://placehold.co/80x80/059669/FFFFFF?text=P'}
          />
          
          <div className="flex-1 w-full">
            <p className="font-extrabold text-xl text-emerald-700 mb-2">{produitLePlusVendu.nom}</p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-600 mb-4">
              <p className="text-sm">
                <span className="font-semibold text-gray-900">Vendu:</span> {produitLePlusVendu.totalVendu} Unités
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-900">Revenu Généré:</span> FC {produitLePlusVendu.totalRevenu.toFixed(2)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>Stock Écoulé</span>
                <span>{pourcentageVendu.toFixed(1)}% ({produitLePlusVendu.totalVendu} / {totalDisponible})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${pourcentageVendu}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-semibold">Stock Restant:</span> {stockActuel} Unités
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 py-6 text-center text-base">
          Aucune donnée de vente disponible pour déterminer le produit le mieux vendu.
        </p>
      )}
    </motion.div>
  );
};

// --- Sales History Table ---
const TableauHistoriqueVentes = ({ ventes, produits, chargement, erreur }) => {
  const formaterNombre = (num) => {
    return num ? num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : '0.00';
  };

  const totalVentes = ventes.reduce((somme, vente) => {
    const produit = produits.find(p => p.id === vente.productId);
    const montant = produit ? (vente.quantitySold * produit.price) : 0;
    return somme + montant;
  }, 0);

  return (
    <motion.div 
      className="bg-white rounded-xl border border-gray-100 shadow-md p-6 flex flex-col w-full overflow-x-auto transition duration-300 hover:shadow-lg"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-3 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Historique des Ventes Récentes</h2>
        <div className="bg-blue-50 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium mt-3 sm:mt-0">
          Total des Transactions: FC {formaterNombre(totalVentes)}
        </div>
      </div>
      
      {chargement && <p className="text-center py-8 text-gray-500 text-base">Chargement des ventes...</p>}
      {erreur && <p className="text-center py-8 text-red-500 text-base">Erreur : {erreur}</p>}
      
      {!chargement && !erreur && (
        <>
          {ventes.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-base">Aucune vente enregistrée</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Article Acheté</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qté</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix Unitaire</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Heure</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {ventes.slice(0, 10).map((vente, index) => {
                  const produit = produits.find(p => p.id === vente.productId);
                  const nomProduit = produit?.name || `Produit #${vente.productId}`;
                  const prixUnitaire = produit?.price || 0;
                  const montantTotal = vente.quantitySold * prixUnitaire;
                  
                  const dateVente = new Date(vente.saleDate);
                  const date = dateVente.toLocaleDateString('fr-FR');
                  const heure = dateVente.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={`https://placehold.co/30x30/3B82F6/ffffff?text=P`} 
                            alt={nomProduit} 
                            className="h-6 w-6 rounded-full mr-3 object-cover shadow-sm" 
                          />
                          <span className="text-sm text-gray-800 font-medium">{nomProduit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vente.quantitySold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">FC {formaterNombre(prixUnitaire)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">FC {formaterNombre(montantTotal)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{heure}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </motion.div>
  );
};

// --- Daily Sales Summary Table ---
const TableauVentesQuotidiennes = ({ ventes, produits, chargement, erreur }) => {
  const formaterNombre = (num) => {
    return num ? num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : '0.00';
  };

  const ventesParJour = ventes.reduce((acc, vente) => {
    const produit = produits.find(p => p.id === vente.productId);
    const montant = produit ? (vente.quantitySold * produit.price) : 0;
    
    const dateVente = new Date(vente.saleDate);
    const dateKey = dateVente.toISOString().split('T')[0];
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        day: dateVente.toLocaleDateString('fr-FR', { weekday: 'long' }),
        numberOfSales: 0,
        totalAmount: 0
      };
    }
    
    acc[dateKey].numberOfSales += 1;
    acc[dateKey].totalAmount += montant;
    
    return acc;
  }, {});

  const ventesQuotidiennes = Object.values(ventesParJour)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.div 
      className="bg-white rounded-xl border border-gray-100 shadow-md p-6 flex flex-col w-full overflow-x-auto transition duration-300 hover:shadow-lg"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
        Récapitulatif des Ventes Quotidiennes
      </h2>
      
      {chargement && <p className="text-center py-8 text-gray-500 text-base">Chargement des ventes quotidiennes...</p>}
      {erreur && <p className="text-center py-8 text-red-500 text-base">Erreur : {erreur}</p>}
      
           {!chargement && !erreur && (
        <>
          {ventesQuotidiennes.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-base">Aucune vente quotidienne enregistrée</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jour et Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre de Ventes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant Total Quotidien</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {ventesQuotidiennes.slice(0, 7).map((jour, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 transition duration-150 hover:bg-gray-100'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {jour.day} - {new Date(jour.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{jour.numberOfSales}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">FC {formaterNombre(jour.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </motion.div>
  );
};

// ✅✅✅ MAIN VENTES COMPONENT - THIS WAS MISSING! ✅✅✅
function Ventes() {
  const [produits, setProduits] = useState([]);
  const [ventes, setVentes] = useState([]);
  
  const [chargementProduits, setChargementProduits] = useState(true);
  const [chargementVentes, setChargementVentes] = useState(true);
  
  const [erreurProduits, setErreurProduits] = useState(null);
  const [erreurVentes, setErreurVentes] = useState(null);

  // Fetch Products
  useEffect(() => {
    const recupererProduits = async () => {
      setChargementProduits(true);
      setErreurProduits(null);
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error(`Échec de la récupération des produits : ${response.statusText}`);
        const data = await response.json();
        console.log("✅ Products loaded:", data.length);
        setProduits(data); 
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setErreurProduits(err.message);
      } finally {
        setChargementProduits(false);
      }
    };
    recupererProduits();
  }, []);

  // Fetch Sales
  useEffect(() => {
    const recupererVentes = async () => {
      setChargementVentes(true);
      setErreurVentes(null);
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/products/sales/daily`);
        
        if (!response.ok) throw new Error(`Échec de la récupération des ventes : ${response.statusText}`);
        
        const data = await response.json();
        console.log("✅ Sales data loaded:", data);
        
        // Transform daily sales data into individual sales format
        const ventesTransformees = data.flatMap(day => 
          Array(day.count || 1).fill({
            productId: 0,
            quantitySold: Math.floor((day.count || 1) / 1),
            saleDate: day.date,
            id: Math.random()
          })
        );
        
        setVentes(ventesTransformees);
      } catch (err) {
        console.error("❌ Error fetching sales:", err);
        setErreurVentes(err.message);
      } finally {
        setChargementVentes(false);
      }
    };
    recupererVentes();
  }, []);

  // Calculate metrics
  const produitsDisponibles = produits.filter(p => p.quantity > 0).length;
  const produitsEpuises = produits.filter(p => p.quantity <= 0).length;
  const statutProduit = `${produitsDisponibles} Disponibles, ${produitsEpuises} Épuisés`;
  
  const revenuTotal = ventes.reduce((somme, vente) => {
    const produit = produits.find(p => p.id === vente.productId);
    const montant = produit ? (vente.quantitySold * produit.price) : 0;
    return somme + montant;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-4">
        Tableau de Bord des Ventes
      </h1>

      {/* Error Messages */}
      {(erreurProduits || erreurVentes) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-semibold mb-2">Erreurs détectées:</p>
          {erreurProduits && <p className="text-red-600 text-sm">• Produits: {erreurProduits}</p>}
          {erreurVentes && <p className="text-red-600 text-sm">• Ventes: {erreurVentes}</p>}
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 1. Best Selling Product */}
      <ProduitMieuxVendu ventes={ventes} produits={produits} />

      {/* 2. Revenue & Product Status */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <CarteResume 
          titre="Revenu Total des Ventes (FC)" 
          valeur={revenuTotal} 
          icone={Package} 
        />
        <CarteResume 
          titre="Statut du Stock Actuel" 
          valeur={statutProduit} 
          icone={ClipboardList} 
        />
      </motion.div>

      {/* 3. Sales History Table */}
      <TableauHistoriqueVentes 
        ventes={ventes} 
        produits={produits}
        chargement={chargementVentes} 
        erreur={erreurVentes} 
      />
      
      {/* 4. Daily Sales Summary Table */}
      <TableauVentesQuotidiennes 
        ventes={ventes} 
        produits={produits}
        chargement={chargementVentes} 
        erreur={erreurVentes} 
      />
    </div>
  );
}

// ✅✅✅ CRITICAL: Default export - THIS FIXES THE ERROR! ✅✅✅
export default Ventes;