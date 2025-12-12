/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Download,
  ClipboardList,
  Package,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

/* Imports de graphique (commentés)
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend // Removed ResponsiveContainer
} from 'recharts';
*/

// NOTE: Les appels d'API (par exemple, à /api/dashboard) sont actuellement en échec avec une erreur 500.
// Cela indique un problème avec le serveur backend fonctionnant sur localhost:7052.
// Le code frontend gère l'erreur avec élégance, mais les données ne se chargeront pas tant que le serveur ne sera pas réparé.
const API_BASE_URL = "https://dash-backend-1-60mf.onrender.com"; 

// --- COMPOSANTS UTILITAIRES ---

// Carte simple pour afficher le total des produits et la valeur totale (remplace la structure KPICard)
const CarteResume = ({ titre, valeur, icone: Icone }) => {
  // Fonction de formatage traduite
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
        <h3 className="text-sm font-medium text-gray-500 truncate uppercase tracking-wider">{titre}</h3> {/* Espacement et style ajustés */}
        <p className="text-2xl font-bold text-gray-800 mt-2">
          {formaterValeur(valeur)}
        </p>
      </div>
      <div className="p-3 rounded-full bg-blue-50 text-blue-600 ml-4"> {/* Couleur ajustée pour un look plus doux */}
        <Icone size={24} />
        </div>
    </div>
  );
};

// Composant pour afficher le produit le plus vendu (Le Mieux Vendu)
const ProduitMieuxVendu = ({ ventes, produits }) => {
  // 1. Calculer le produit le plus vendu
  const ventesProduits = ventes.reduce((acc, vente) => {
    const cle = vente.productName;
    if (!acc[cle]) acc[cle] = { nom: vente.productName, totalVendu: 0, totalRevenu: 0 };
    acc[cle].totalVendu += vente.quantitySold;
    acc[cle].totalRevenu += vente.totalAmount;
    return acc;
  }, {});

  // Trier par totalVendu décroissant et prendre le premier élément
  const produitLePlusVendu = Object.values(ventesProduits).sort((a, b) => b.totalVendu - a.totalVendu)[0];

  let pourcentageVendu = 0;
  let stockActuel = 0;
  let totalDisponible = 0;

  if (produitLePlusVendu) {
    // 2. Trouver les données du produit original pour obtenir le stock actuel
    const produitOriginal = produits.find(p => p.name === produitLePlusVendu.nom);
    
    if (produitOriginal) {
      // Utiliser le champ 'quantity' pour le stock actuel
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
            // L'image est maintenant plus grande
            src={`https://placehold.co/80x80/059669/FFFFFF?text=${produitLePlusVendu.nom.split(' ').map(n => n[0]).join('')}`} 
            alt={produitLePlusVendu.nom} 
            className="w-20 h-20 rounded-xl object-cover shadow-lg shrink-0" 
            onError={(e) => e.currentTarget.src = 'https://placehold.co/80x80/059669/FFFFFF?text=P'}
          />
          
          <div className="flex-1 w-full">
            <p className="font-extrabold text-xl text-emerald-700 mb-2">{produitLePlusVendu.nom}</p>
            
            {/* Métriques de Ventes & Revenus */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-600 mb-4">
              <p className="text-sm">
                <span className="font-semibold text-gray-900">Vendu:</span> {produitLePlusVendu.totalVendu} Unités
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-900">Revenu Généré:</span> FC {produitLePlusVendu.totalRevenu.toFixed(2)}
              </p>
            </div>

            {/* Barre de Progression */}
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
        <p className="text-gray-500 py-6 text-center text-base">Aucune donnée de vente disponible pour déterminer le produit le mieux vendu.</p>
      )}
    </motion.div>
  );
};

// Composant pour le Tableau d'Historique des Ventes (Sales History Table)
const TableauHistoriqueVentes = ({ ventes, chargement, erreur }) => {
  const formaterNombre = (num) => {
    return num ? num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : '0.00';
  };
  const totalVentes = ventes.reduce((somme, vente) => somme + (vente.totalAmount || 0), 0);

  return (
    <motion.div 
      className="bg-white rounded-xl border border-gray-100 shadow-md p-6 flex flex-col w-full overflow-x-auto transition duration-300 hover:shadow-lg"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.9 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-3 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Historique des Ventes Récentes</h2>
        <div className="bg-blue-50 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium mt-3 sm:mt-0"> {/* Style ajusté */}
          Total des Transactions: FC {formaterNombre(totalVentes)}
        </div>
      </div>
      {chargement && <p className="text-center py-8 text-gray-500 text-base">Chargement des ventes...</p>}
      {erreur && <p className="text-center py-8 text-red-500 text-base">Erreur : {erreur}</p>}
      {!chargement && !erreur && (
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
          <tbody className="bg-white divide-y divide-gray-100"> {/* Diviseur plus léger */}
            {ventes.slice(0, 10).map((vente, index) => { // Limité à 10 lignes
              const dateVente = new Date(vente.saleDate);
              const date = dateVente.toLocaleDateString('fr-FR'); // Formatage en français
              const heure = dateVente.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
              return (
                <tr key={index} className="hover:bg-gray-50 transition duration-150"> {/* Effet de survol léger */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={`https://placehold.co/30x30/3B82F6/ffffff?text=P`} alt={vente.productName} className="h-6 w-6 rounded-full mr-3 object-cover shadow-sm" />
                      <span className="text-sm text-gray-800 font-medium">{vente.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{vente.quantitySold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">FC {formaterNombre(vente.pricePerItem)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">FC {formaterNombre(vente.totalAmount)}</td> {/* Accent de couleur pour le montant total */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{heure}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      
    </motion.div>
  );
};

// Composant pour le Tableau Récapitulatif des Ventes Quotidiennes (Daily Sales Summary Table)
const TableauVentesQuotidiennes = ({ ventes, chargement, erreur }) => {
  const formaterNombre = (num) => {
    return num ? num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : '0.00';
  };

  return (
    <motion.div 
      className="bg-white rounded-xl border border-gray-100 shadow-md p-6 flex flex-col w-full overflow-x-auto transition duration-300 hover:shadow-lg"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.0 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">Récapitulatif des Ventes Quotidiennes</h2>
      {chargement && <p className="text-center py-8 text-gray-500 text-base">Chargement des ventes quotidiennes...</p>}
      {erreur && <p className="text-center py-8 text-red-500 text-base">Erreur : {erreur}</p>}
      {!chargement && !erreur && (
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jour et Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre de Ventes</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant Total Quotidien</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {ventes.slice(0, 7).map((jour, index) => ( // Limité à 7 lignes
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 transition duration-150 hover:bg-gray-100'}> {/* Lignes zébrées plus légères */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {jour.day} - {new Date(jour.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{jour.numberOfSales}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">FC {formaterNombre(jour.totalAmount)}</td> {/* Accent de couleur pour le montant total */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  );
};

// Composant principal
export default function Ventes() {
  // Variables d'état traduites
  const [produits, setProduits] = useState([]);
  const [donneesTableauDeBord, setDonneesTableauDeBord] = useState({ produitLePlusVendu: null, produitsFaibleStock: [] });
  const [ventes, setVentes] = useState([]);  // Ventes détaillées pour TableauHistoriqueVentes
  const [ventesQuotidiennes, setVentesQuotidiennes] = useState([]);  // Agrégats quotidiens pour TableauVentesQuotidiennes
  
  // États de chargement et d'erreur traduits
  const [chargementProduits, setChargementProduits] = useState(true);
  const [chargementTableauDeBord, setChargementTableauDeBord] = useState(true);
  const [chargementVentes, setChargementVentes] = useState(true);
  const [chargementVentesQuotidiennes, setChargementVentesQuotidiennes] = useState(true); 
  const [erreurProduits, setErreurProduits] = useState(null);
  const [erreurTableauDeBord, setErreurTableauDeBord] = useState(null);
  const [erreurVentes, setErreurVentes] = useState(null);
  const [erreurVentesQuotidiennes, setErreurVentesQuotidiennes] = useState(null); 

  // -------------------- LOGIQUE DE RÉCUPÉRATION DES DONNÉES --------------------

  // Récupérer les produits
  useEffect(() => {
    const recupererProduits = async () => {
      setChargementProduits(true);
      setErreurProduits(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/api/products`, { headers });
        if (!response.ok) throw new Error(`Échec de la récupération des produits : ${response.statusText}`);
        const data = await response.json();
        setProduits(data); 
      } catch (err) {
        console.error("Erreur lors de la récupération des produits :", err);
        setErreurProduits(err.message);
      } finally {
        setChargementProduits(false);
      }
    };
    recupererProduits();
  }, []);

  // Récupérer les données du tableau de bord
  useEffect(() => {
    const recupererTableauDeBord = async () => {
      setChargementTableauDeBord(true);
      setErreurTableauDeBord(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, { headers });
        if (!response.ok) throw new Error(`Échec de la récupération des données du tableau de bord : ${response.statusText}`);
        const data = await response.json();
        setDonneesTableauDeBord(data);
      } catch (err) {
        console.error("Erreur lors de la récupération du tableau de bord :", err);
        setErreurTableauDeBord(err.message);
      } finally {
        setChargementTableauDeBord(false);
      }
    };
    recupererTableauDeBord();
  }, []);

  // Récupérer et trier les données de ventes détaillées (Plus Récent au Plus Ancien)
  useEffect(() => {
    const recupererVentes = async () => {
      setChargementVentes(true);
      setErreurVentes(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/api/products/sales`, { headers });
        if (!response.ok) throw new Error(`Échec de la récupération des ventes : ${response.statusText}`);
        const data = await response.json();
        
        // TRI : Plus Récent au Plus Ancien
        const ventesTriees = data.sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
        
        setVentes(ventesTriees);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes :", err);
        setErreurVentes(err.message);
      } finally {
        setChargementVentes(false);
      }
    };
    recupererVentes();
  }, []);

  // Récupérer et trier les données de ventes quotidiennes (Plus Récent au Plus Ancien)
  useEffect(() => {
    const recupererVentesQuotidiennes = async () => {
      setChargementVentesQuotidiennes(true);
      setErreurVentesQuotidiennes(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_BASE_URL}/api/products/sales/daily`, { headers });
        if (!response.ok) throw new Error(`Échec de la récupération des ventes quotidiennes : ${response.statusText}`);
        const data = await response.json();
        
        // TRI : Plus Récent au Plus Ancien
        const ventesQuotidiennesTriees = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setVentesQuotidiennes(ventesQuotidiennesTriees);
      } catch (err) {
        console.error("Erreur lors de la récupération des ventes quotidiennes :", err);
        setErreurVentesQuotidiennes(err.message);
      } finally {
        setChargementVentesQuotidiennes(false);
      }
    };
    recupererVentesQuotidiennes();
  }, []);

  // -------------------- CALCULS --------------------

  // Calculer le statut des produits
  const produitsDisponibles = produits.filter(p => p.quantity > 0).length;
  const produitsEpuises = produits.filter(p => p.quantity <= 0).length;
  const statutProduit = `${produitsDisponibles} Disponibles, ${produitsEpuises} Épuisés`;
  
  // Calculer le revenu total (somme des totaux quotidiens)
  const revenuTotal = ventesQuotidiennes.reduce((somme, jour) => somme + (jour.totalAmount || 0), 0);


  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8 space-y-8"> {/* Espacement général accru */}
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-4">Tableau de Bord des Ventes</h1>

      {/* 1. Produit Le Plus Vendu */}
      <ProduitMieuxVendu ventes={ventes} produits={produits} />

      {/* 2. Revenu Total & Statut des Produits (Layout horizontal) */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6" // Utilisation de la grille pour un meilleur contrôle
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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

      {/* 3. Section des Tableaux (Vertical) */}
      <div className="space-y-8 mt-8"> {/* Plus d'espace entre les tableaux */}
        {/* Tableau de l'Historique des Ventes */}
        <TableauHistoriqueVentes ventes={ventes} chargement={chargementVentes} erreur={erreurVentes} />
        
        {/* Tableau Récapitulatif des Ventes Quotidiennes */}
        <TableauVentesQuotidiennes ventes={ventesQuotidiennes} chargement={chargementVentesQuotidiennes} erreur={erreurVentesQuotidiennes} />
      </div>

    </div>
  );
}