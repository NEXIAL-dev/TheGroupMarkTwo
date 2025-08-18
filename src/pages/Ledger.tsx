// src/pages/Ledger.tsx
import { useState } from 'react';
import { useAgencies } from '@/stores/useAgencies';
import { Calculator, Plus, TrendingUp, TrendingDown } from 'lucide-react';

export default function Ledger() {
  const { agencies } = useAgencies();
  const [scope, setScope] = useState<'GROUP' | 'AGENCY'>('GROUP');
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    account: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Mock transactions
  const mockTransactions = [
    {
      id: 't1',
      ledgerScope: 'GROUP' as const,
      date: new Date().toISOString(),
      description: 'Monthly subscription fees collected',
      amount: 15000,
      account: { id: 'acc1', name: 'Revenue' },
      createdBy: 'u1',
      createdByName: 'Darshan Patel',
    },
    {
      id: 't2',
      ledgerScope: 'AGENCY' as const,
      agencyId: 'a1',
      date: new Date(Date.now() - 86400000).toISOString(),
      description: 'Marketing campaign expenses',
      amount: -3500,
      account: { id: 'acc2', name: 'Marketing' },
      createdBy: 'u4',
      createdByName: 'Agency Manager',
    },
    {
      id: 't3',
      ledgerScope: 'GROUP' as const,
      date: new Date(Date.now() - 172800000).toISOString(),
      description: 'Office rent payment',
      amount: -2800,
      account: { id: 'acc3', name: 'Operating Expenses' },
      createdBy: 'u1',
      createdByName: 'Darshan Patel',
    },
  ];

  const filteredTransactions = mockTransactions.filter(tx => 
    scope === 'GROUP' 
      ? tx.ledgerScope === 'GROUP' 
      : tx.ledgerScope === 'AGENCY' && tx.agencyId === selectedAgencyId
  );

  const totalBalance = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) return;
    
    // In real app, would call API to create transaction
    console.log('Creating transaction:', { 
      ...formData, 
      amount: parseFloat(formData.amount),
      ledgerScope: scope,
      agencyId: selectedAgencyId 
    });
    setFormData({
      description: '',
      amount: '',
      account: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ledger</h1>
          <p className="text-gray-600">Financial tracking and accounting</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={20} />
          New Transaction
        </button>
      </div>

      {/* Scope Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setScope('GROUP')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            scope === 'GROUP'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Group Ledger
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScope('AGENCY')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              scope === 'AGENCY'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Agency Ledger
          </button>
          {scope === 'AGENCY' && (
            <select
              value={selectedAgencyId || ''}
              onChange={(e) => setSelectedAgencyId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select Agency</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Balance Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(totalBalance).toLocaleString()}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            totalBalance >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {totalBalance >= 0 ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span className="text-sm font-medium">
              {totalBalance >= 0 ? 'Credit' : 'Debit'}
            </span>
          </div>
        </div>
      </div>

      {/* Create Transaction Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Transaction</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount * (+ for credit, - for debit)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter transaction description"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account *
              </label>
              <input
                type="text"
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter account name"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Transaction
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {transaction.account.name}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {transaction.createdByName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calculator size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}