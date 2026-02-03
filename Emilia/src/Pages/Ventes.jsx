/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Award,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE_URL, { fetchWithAuth } from "../apiConfig";

// --- Toast Notification ---
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
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1">
        ×
      </button>
    </motion.div>
  );
};

// --- Stat Card Component ---
const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              ↑ {trend}% vs hier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

// --- Top Products Component ---
const TopProducts = ({ sales, products }) => {
  const topProducts = useMemo(() => {
    if (!Array.isArray(sales) || sales.length === 0) return [];

    const productSales = sales.reduce((acc, sale) => {
      const product = products.find((p) => p.id === sale.productId);
      if (!product) return acc;

      if (!acc[sale.productId]) {
        acc[sale.productId] = {
          id: sale.productId,
          name: product.name,
          totalSold: 0,
          revenue: 0,
        };
      }

      acc[sale.productId].totalSold += sale.quantitySold;
      acc[sale.productId].revenue += sale.quantitySold * product.price;

      return acc;
    }, {});

    return Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);
  }, [sales, products]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="text-yellow-500" size={24} />
          Top 5 Produits
        </h2>
      </div>

      {topProducts.length > 0 ? (
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500">
                  {product.totalSold} unités vendues
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  FC {product.revenue.toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Aucune donnée disponible</p>
        </div>
      )}
    </motion.div>
  );
};

// --- Daily Sales Table Component ---
const DailySalesTable = ({ sales, products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const salesWithDetails = useMemo(() => {
    if (!Array.isArray(sales)) return [];

    return sales.map((sale) => {
      const product = products.find((p) => p.id === sale.productId);
      return {
        ...sale,
        productName: product?.name || `Produit #${sale.productId}`,
        price: product?.price || 0,
        revenue: (product?.price || 0) * sale.quantitySold,
      };
    });
  }, [sales, products]);

  const totalPages = Math.ceil(salesWithDetails.length / itemsPerPage);
  const paginatedSales = salesWithDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="text-blue-500" size={24} />
          Ventes du Jour
        </h2>
        <span className="text-sm text-gray-500">
          {salesWithDetails.length} transactions
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                Heure
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                Produit
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">
                Quantité
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">
                Prix Unitaire
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.map((sale, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(sale.saleDate).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {sale.productName}
                </td>
                <td className="py-3 px-4 text-sm text-center text-gray-700">
                  {sale.quantitySold}
                </td>
                <td className="py-3 px-4 text-sm text-right text-gray-700">
                  FC {sale.price.toLocaleString("fr-FR")}
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                  FC {sale.revenue.toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedSales.map((sale, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-gray-900">{sale.productName}</p>
              <span className="text-xs text-gray-500">
                {new Date(sale.saleDate).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{sale.quantitySold} unités</span>
              <span className="font-bold text-green-600">
                FC {sale.revenue.toLocaleString("fr-FR")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

// --- Weekly Sales Summary Component ---
const WeeklySalesSummary = ({ allSales, products, onDownloadPDF }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const weeklySummary = useMemo(() => {
    if (!Array.isArray(allSales)) return [];

    const salesByDate = allSales.reduce((acc, sale) => {
      const date = new Date(sale.saleDate).toLocaleDateString("fr-FR");
      if (!acc[date]) {
        acc[date] = {
          date,
          items: 0,
          revenue: 0,
          transactions: 0,
        };
      }

      const product = products.find((p) => p.id === sale.productId);
      acc[date].items += sale.quantitySold;
      acc[date].revenue += (product?.price || 0) * sale.quantitySold;
      acc[date].transactions += 1;

      return acc;
    }, {});

    return Object.values(salesByDate).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [allSales, products]);

  const weeklyData = weeklySummary.slice(selectedWeek * 7, (selectedWeek + 1) * 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="text-purple-500" size={24} />
          Résumé Hebdomadaire
        </h2>
        <button
          onClick={onDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Download size={16} />
          Télécharger PDF
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
                    <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                Date
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">
                Transactions
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">
                Articles
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">
                Revenu Total
              </th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((day, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {new Date(day.date).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </td>
                <td className="py-3 px-4 text-sm text-center text-gray-700">
                  {day.transactions}
                </td>
                <td className="py-3 px-4 text-sm text-center text-gray-700">
                  {day.items}
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                  FC {day.revenue.toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {weeklyData.map((day, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-gray-900">
                {new Date(day.date).toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {day.transactions} transactions
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{day.items} articles</span>
              <span className="font-bold text-green-600">
                FC {day.revenue.toLocaleString("fr-FR")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Week Navigation */}
      {weeklySummary.length > 7 && (
        <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t">
          <button
            onClick={() => setSelectedWeek((w) => Math.max(0, w - 1))}
            disabled={selectedWeek === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Semaine Précédente
          </button>
          <span className="text-sm text-gray-600">
            Semaine {selectedWeek + 1}
          </span>
          <button
            onClick={() =>
              setSelectedWeek((w) =>
                Math.min(Math.floor(weeklySummary.length / 7), w + 1)
              )
            }
            disabled={selectedWeek >= Math.floor(weeklySummary.length / 7)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Semaine Suivante
          </button>
        </div>
      )}
    </motion.div>
  );
};

// --- Main Dashboard Component ---
function Ventes() {
  const [products, setProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsRes, dailySalesRes, allSalesRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/products`),
        fetchWithAuth(`${API_BASE_URL}/products/sales/daily`),
        fetchWithAuth(`${API_BASE_URL}/products/sales`),
      ]);

      if (!productsRes.ok || !dailySalesRes.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const productsData = await productsRes.json();
      const dailyData = await dailySalesRes.json();
      const allSalesData = allSalesRes.ok ? await allSalesRes.json() : [];

      setProducts(Array.isArray(productsData) ? productsData : []);
      setDailySales(Array.isArray(dailyData?.sales) ? dailyData.sales : []);
      setAllSales(Array.isArray(allSalesData) ? allSalesData : []);
    } catch (err) {
      setError(err.message);
      showToast("Erreur lors du chargement des données", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const dailyRevenue = dailySales.reduce((sum, sale) => {
      const product = products.find((p) => p.id === sale.productId);
      return sum + (product?.price || 0) * sale.quantitySold;
    }, 0);

    const totalItemsSold = dailySales.reduce(
      (sum, sale) => sum + sale.quantitySold,
      0
    );

    const inStockProducts = products.filter((p) => p.quantity > 0).length;

    return {
      dailyRevenue,
      totalItemsSold,
      inStockProducts,
      totalProducts: products.length,
    };
  }, [dailySales, products]);

  // PDF Download Function
  const handleDownloadPDF = () => {
    try {
      // Create PDF content
      const weeklySummary = allSales.reduce((acc, sale) => {
        const date = new Date(sale.saleDate).toLocaleDateString("fr-FR");
        if (!acc[date]) {
          acc[date] = { date, items: 0, revenue: 0, transactions: 0 };
        }
        const product = products.find((p) => p.id === sale.productId);
        acc[date].items += sale.quantitySold;
        acc[date].revenue += (product?.price || 0) * sale.quantitySold;
        acc[date].transactions += 1;
        return acc;
      }, {});

      const sortedDays = Object.values(weeklySummary).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // Generate HTML for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Rapport Hebdomadaire - KinLight</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #3b82f6; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            tr:hover { background-color: #f9fafb; }
            .total { font-weight: bold; background-color: #dbeafe; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .date { color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Rapport Hebdomadaire des Ventes</h1>
            <p class="date">Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transactions</th>
                <th>Articles Vendus</th>
                <th>Revenu Total (FC)</th>
              </tr>
            </thead>
            <tbody>
              ${sortedDays
                .slice(0, 7)
                .map(
                  (day) => `
                <tr>
                  <td>${new Date(day.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}</td>
                  <td>${day.transactions}</td>
                  <td>${day.items}</td>
                  <td>FC ${day.revenue.toLocaleString("fr-FR")}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total">
                <td>TOTAL</td>
                <td>${sortedDays
                  .slice(0, 7)
                  .reduce((sum, d) => sum + d.transactions, 0)}</td>
                <td>${sortedDays
                  .slice(0, 7)
                  .reduce((sum, d) => sum + d.items, 0)}</td>
                <td>FC ${sortedDays
                  .slice(0, 7)
                  .reduce((sum, d) => sum + d.revenue, 0)
                  .toLocaleString("fr-FR")}</td>
              </tr>
            </tbody>
          </table>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
            Ce rapport a été généré automatiquement par le système KinLight Dashboard.
          </p>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rapport_Hebdomadaire_${new Date()
        .toISOString()
        .slice(0, 10)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Rapport téléchargé avec succès!", "success");
    } catch (err) {
      showToast("Erreur lors du téléchargement du rapport", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Chargement du dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 lg:p-8">
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
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
              Dashboard Ventes
            </h1>
            <p className="text-gray-500 mt-1">
              Vue d'ensemble de vos performances commerciales
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition"
          >
            🔄 Actualiser
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl"
        >
          <p className="text-red-700 font-medium">⚠️ {error}</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Revenu du Jour"
          value={`FC ${stats.dailyRevenue.toLocaleString("fr-FR")}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Articles Vendus"
          value={stats.totalItemsSold}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Produits en Stock"
          value={`${stats.inStockProducts}/${stats.totalProducts}`}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Transactions"
          value={dailySales.length}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Products - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <TopProducts sales={dailySales} products={products} />
        </div>

                {/* Quick Stats */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Performance du Jour
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Ventes Totales</span>
                <span className="text-2xl font-bold">
                  {dailySales.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Articles Vendus</span>
                <span className="text-2xl font-bold">
                  {stats.totalItemsSold}
                </span>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-blue-100 text-sm mb-1">Revenu Total</p>
                <p className="text-3xl font-black">
                  FC {stats.dailyRevenue.toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <Download size={18} />
                Télécharger Rapport
              </button>
              <button
                onClick={fetchDashboardData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                <Filter size={18} />
                Actualiser Données
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Daily Sales Table */}
      <div className="mb-8">
        <DailySalesTable sales={dailySales} products={products} />
      </div>

      {/* Weekly Summary */}
      <div>
        <WeeklySalesSummary
          allSales={allSales}
          products={products}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    </div>
  );
}

export default Ventes;
          