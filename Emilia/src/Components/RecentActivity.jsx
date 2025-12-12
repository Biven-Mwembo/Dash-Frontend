import React from 'react';
import { FaHistory } from 'react-icons/fa';

export default function RecentActivity({ history = [] }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaHistory className="mr-2 text-purple-600" /> Recent Checkouts
                </h2>
                <button className="text-gray-100 text-sm font-medium hover:underline">View Full History</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-2 sm:px-4">TX ID</th>
                            <th className="py-3 px-2 sm:px-4">Time</th>
                            <th className="py-3 px-2 sm:px-4">Items</th>
                            <th className="py-3 px-2 sm:px-4">Amount</th>
                            <th className="py-3 px-2 sm:px-4">Method</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {history.length > 0 ? (
                            // Only show the top 5 transactions
                            history.slice(0, 5).map(tx => (
                                <tr key={tx.id} className="text-sm text-gray-700 hover:bg-gray-50 transition">
                                    <td className="py-4 px-2 sm:px-4 font-mono text-xs">{tx.id}</td>
                                    <td className="py-4 px-2 sm:px-4">{tx.time}</td>
                                    <td className="py-4 px-2 sm:px-4">{tx.items}</td>
                                    <td className="py-4 px-2 sm:px-4 font-bold text-green-600">${tx.amount.toFixed(2)}</td>
                                    <td className="py-4 px-2 sm:px-4">{tx.method}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">No transactions recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
