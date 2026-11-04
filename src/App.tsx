import { useState, useEffect, useRef } from 'react';
import {
  Home, Users, Droplets, ShoppingCart, Receipt, FileText,
  BarChart3, Settings, Plus, Trash2, Edit2, X, Check,
  TrendingUp, TrendingDown, Download, Upload, ChevronRight,
  Calendar, AlertCircle, CheckCircle, Clock, ArrowLeft
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { AppData, Goat, MilkRecord, Sale, Expense, Invoice, InvoiceItem, PageType } from './types';
import { loadData, saveData, exportData, importData, generateId, formatCurrency, formatDate, getToday } from './store';

// ==================== MODAL COMPONENT ====================
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-5 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ==================== INPUT COMPONENT ====================
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input {...props} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors" />
    </div>
  );
}

function Select({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <select {...props} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors">
        {children}
      </select>
    </div>
  );
}

function TextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <textarea {...props} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors min-h-[80px]" />
    </div>
  );
}

// ==================== DASHBOARD ====================
function Dashboard({ data }: { data: AppData }) {
  const activeGoats = data.goats.filter(g => g.status === 'active');
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  const monthSales = data.sales.filter(s => s.date.startsWith(thisMonth));
  const monthExpenses = data.expenses.filter(e => e.date.startsWith(thisMonth));
  const monthMilk = data.milkRecords.filter(m => m.date.startsWith(thisMonth));
  
  const totalIncome = monthSales.reduce((s, x) => s + x.total, 0);
  const totalExpense = monthExpenses.reduce((s, x) => s + x.amount, 0);
  const totalMilk = monthMilk.reduce((s, x) => s + x.total, 0);
  const profit = totalIncome - totalExpense;

  const stats = [
    { label: 'Поголовье', value: activeGoats.length.toString(), icon: '🐐', color: 'from-blue-500 to-cyan-500' },
    { label: `Удой (${data.settings.milkUnit})`, value: totalMilk.toFixed(1), icon: '🥛', color: 'from-green-500 to-emerald-500' },
    { label: 'Доход', value: formatCurrency(totalIncome, data.settings.currency), icon: '💰', color: 'from-yellow-500 to-orange-500' },
    { label: 'Расход', value: formatCurrency(totalExpense, data.settings.currency), icon: '💸', color: 'from-red-500 to-pink-500' },
  ];

  // Last 7 days milk chart
  const last7days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const milkChartData = last7days.map(date => {
    const dayRecords = data.milkRecords.filter(m => m.date === date);
    const total = dayRecords.reduce((s, x) => s + x.total, 0);
    return { date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), milk: total };
  });

  return (
    <div className="pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{data.settings.farmName}</h1>
        <p className="text-gray-400 text-sm">Обзор за текущий месяц</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Profit card */}
      <div className={`rounded-2xl p-5 mb-6 ${profit >= 0 ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20' : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Финансовый результат</p>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}{formatCurrency(profit, data.settings.currency)}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {profit >= 0 ? <TrendingUp size={24} className="text-green-400" /> : <TrendingDown size={24} className="text-red-400" />}
          </div>
        </div>
      </div>

      {/* Milk chart */}
      {data.milkRecords.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-4">Удой за 7 дней ({data.settings.milkUnit})</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={milkChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                <Bar dataKey="milk" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Последние записи</h3>
        <div className="space-y-2">
          {data.sales.slice(-3).reverse().map(s => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">💰</div>
                <div>
                  <p className="text-sm text-white">{s.product} — {s.buyer}</p>
                  <p className="text-xs text-gray-500">{formatDate(s.date)}</p>
                </div>
              </div>
              <span className="text-green-400 text-sm font-medium">+{formatCurrency(s.total, data.settings.currency)}</span>
            </div>
          ))}
          {data.expenses.slice(-3).reverse().map(e => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">💸</div>
                <div>
                  <p className="text-sm text-white">{e.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(e.date)}</p>
                </div>
              </div>
              <span className="text-red-400 text-sm font-medium">-{formatCurrency(e.amount, data.settings.currency)}</span>
            </div>
          ))}
          {data.sales.length === 0 && data.expenses.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">Нет записей. Начните добавлять данные!</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== GOATS PAGE ====================
function GoatsPage({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editGoat, setEditGoat] = useState<Goat | null>(null);
  const [form, setForm] = useState<Partial<Goat>>({ status: 'active' });

  const openAdd = () => { setForm({ status: 'active', purchasePrice: 0 }); setEditGoat(null); setShowModal(true); };
  const openEdit = (g: Goat) => { setForm(g); setEditGoat(g); setShowModal(true); };

  const handleSave = () => {
    if (!form.name) return;
    if (editGoat) {
      const updated = data.goats.map(g => g.id === editGoat.id ? { ...g, ...form } as Goat : g);
      onUpdate({ ...data, goats: updated });
    } else {
      const newGoat: Goat = {
        id: generateId(),
        name: form.name || '',
        breed: form.breed || '',
        birthDate: form.birthDate || '',
        purchaseDate: form.purchaseDate || getToday(),
        purchasePrice: form.purchasePrice || 0,
        notes: form.notes || '',
        status: form.status || 'active',
        tag: form.tag || '',
      };
      onUpdate({ ...data, goats: [...data.goats, newGoat] });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить козу?')) {
      onUpdate({ ...data, goats: data.goats.filter(g => g.id !== id) });
    }
  };

  const activeGoats = data.goats.filter(g => g.status === 'active');
  const otherGoats = data.goats.filter(g => g.status !== 'active');

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Поголовье</h1>
          <p className="text-gray-400 text-sm">{activeGoats.length} активных из {data.goats.length}</p>
        </div>
        <button onClick={openAdd} className="p-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {activeGoats.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🐐</div>
          <p className="text-gray-400">Нет активных коз</p>
          <button onClick={openAdd} className="mt-4 text-blue-400 text-sm">+ Добавить козу</button>
        </div>
      )}

      <div className="space-y-3">
        {activeGoats.map(goat => (
          <div key={goat.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{goat.name}</h3>
                  {goat.tag && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">#{goat.tag}</span>}
                </div>
                <p className="text-sm text-gray-400">{goat.breed || 'Порода не указана'}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                  {goat.birthDate && <span>🎂 {formatDate(goat.birthDate)}</span>}
                  {goat.purchaseDate && <span>📅 {formatDate(goat.purchaseDate)}</span>}
                  {goat.purchasePrice > 0 && <span>💰 {formatCurrency(goat.purchasePrice, data.settings.currency)}</span>}
                </div>
                {goat.notes && <p className="text-xs text-gray-500 mt-2 italic">{goat.notes}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(goat)} className="p-2 hover:bg-gray-800 rounded-lg"><Edit2 size={16} className="text-gray-400" /></button>
                <button onClick={() => handleDelete(goat.id)} className="p-2 hover:bg-gray-800 rounded-lg"><Trash2 size={16} className="text-red-400" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {otherGoats.length > 0 && (
        <div className="mt-6">
          <h3 className="text-gray-400 text-sm font-medium mb-3">Неактивные ({otherGoats.length})</h3>
          <div className="space-y-2">
            {otherGoats.map(goat => (
              <div key={goat.id} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-3 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm">{goat.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {goat.status === 'sold' ? '🏷️ Продана' : goat.status === 'dead' ? '✝️ Пала' : ''}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(goat.id)} className="p-1 hover:bg-gray-800 rounded"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editGoat ? 'Редактировать козу' : 'Новая коза'}>
        <Input label="Кличка *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Зорька" />
        <Input label="Номер/бирка" value={form.tag || ''} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="001" />
        <Input label="Порода" value={form.breed || ''} onChange={e => setForm({ ...form, breed: e.target.value })} placeholder="Зааненская" />
        <Input label="Дата рождения" type="date" value={form.birthDate || ''} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
        <Input label="Дата покупки" type="date" value={form.purchaseDate || ''} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
        <Input label="Цена покупки" type="number" value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })} placeholder="5000" />
        <Select label="Статус" value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value as Goat['status'] })}>
          <option value="active">Активна</option>
          <option value="sold">Продана</option>
          <option value="dead">Пала</option>
        </Select>
        <TextArea label="Заметки" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Характер, особенности..." />
        <button onClick={handleSave} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors">
          {editGoat ? 'Сохранить' : 'Добавить'}
        </button>
      </Modal>
    </div>
  );
}

// ==================== PRODUCTION PAGE ====================
function ProductionPage({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<MilkRecord>>({ date: getToday(), morning: 0, evening: 0 });
  const [filterDate, setFilterDate] = useState(getToday());

  const activeGoats = data.goats.filter(g => g.status === 'active');
  const dayRecords = data.milkRecords.filter(m => m.date === filterDate);

  const handleSave = () => {
    if (!form.goatId) return;
    const morning = Number(form.morning) || 0;
    const evening = Number(form.evening) || 0;
    const record: MilkRecord = {
      id: generateId(),
      goatId: form.goatId!,
      date: form.date || getToday(),
      morning,
      evening,
      total: morning + evening,
    };
    onUpdate({ ...data, milkRecords: [...data.milkRecords, record] });
    setShowModal(false);
    setForm({ date: getToday(), morning: 0, evening: 0 });
  };

  const handleDelete = (id: string) => {
    onUpdate({ ...data, milkRecords: data.milkRecords.filter(m => m.id !== id) });
  };

  const getGoatName = (id: string) => data.goats.find(g => g.id === id)?.name || 'Неизвестно';

  const dayTotal = dayRecords.reduce((s, x) => s + x.total, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Удои</h1>
          <p className="text-gray-400 text-sm">Учёт молочной продукции</p>
        </div>
        <button onClick={() => setShowModal(true)} className="p-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-3 mb-4">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm flex-1" />
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
          <span className="text-blue-400 font-bold">{dayTotal.toFixed(1)}</span>
          <span className="text-gray-400 text-sm ml-1">{data.settings.milkUnit}</span>
        </div>
      </div>

      {dayRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🥛</div>
          <p className="text-gray-400">Нет записей за {formatDate(filterDate)}</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-blue-400 text-sm">+ Добавить удой</button>
        </div>
      ) : (
        <div className="space-y-3">
          {dayRecords.map(record => (
            <div key={record.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{getGoatName(record.goatId)}</h3>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span className="text-yellow-400">🌅 {record.morning} {data.settings.milkUnit}</span>
                    <span className="text-blue-400">🌙 {record.evening} {data.settings.milkUnit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-green-400">{record.total} {data.settings.milkUnit}</span>
                  <button onClick={() => handleDelete(record.id)} className="p-2 hover:bg-gray-800 rounded-lg">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Записать удой">
        <Select label="Коза *" value={form.goatId || ''} onChange={e => setForm({ ...form, goatId: e.target.value })}>
          <option value="">Выберите козу</option>
          {activeGoats.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Select>
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Input label={`Утро (${data.settings.milkUnit})`} type="number" step="0.1" value={form.morning || ''} onChange={e => setForm({ ...form, morning: Number(e.target.value) })} placeholder="1.5" />
        <Input label={`Вечер (${data.settings.milkUnit})`} type="number" step="0.1" value={form.evening || ''} onChange={e => setForm({ ...form, evening: Number(e.target.value) })} placeholder="1.2" />
        <button onClick={handleSave} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors">
          Записать
        </button>
      </Modal>
    </div>
  );
}

// ==================== SALES PAGE ====================
function SalesPage({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Sale>>({ date: getToday(), product: 'Молоко', unit: data.settings.milkUnit, quantity: 0, pricePerUnit: 0 });

  const handleSave = () => {
    if (!form.buyer || !form.quantity) return;
    const sale: Sale = {
      id: generateId(),
      date: form.date || getToday(),
      product: form.product || 'Молоко',
      quantity: Number(form.quantity) || 0,
      unit: form.unit || data.settings.milkUnit,
      pricePerUnit: Number(form.pricePerUnit) || 0,
      total: (Number(form.quantity) || 0) * (Number(form.pricePerUnit) || 0),
      buyer: form.buyer || '',
    };
    onUpdate({ ...data, sales: [...data.sales, sale] });
    setShowModal(false);
    setForm({ date: getToday(), product: 'Молоко', unit: data.settings.milkUnit, quantity: 0, pricePerUnit: 0 });
  };

  const handleDelete = (id: string) => {
    onUpdate({ ...data, sales: data.sales.filter(s => s.id !== id) });
  };

  const totalSales = data.sales.reduce((s, x) => s + x.total, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Продажи</h1>
          <p className="text-gray-400 text-sm">Реализация продукции</p>
        </div>
        <button onClick={() => setShowModal(true)} className="p-3 bg-green-500 rounded-xl hover:bg-green-600 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 mb-4">
        <p className="text-sm text-gray-400">Общий объём продаж</p>
        <p className="text-2xl font-bold text-green-400">{formatCurrency(totalSales, data.settings.currency)}</p>
      </div>

      {data.sales.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-400">Нет продаж</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-green-400 text-sm">+ Добавить продажу</button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...data.sales].reverse().map(sale => (
            <div key={sale.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{sale.product} — {sale.buyer}</h3>
                  <p className="text-sm text-gray-400">{sale.quantity} {sale.unit} × {formatCurrency(sale.pricePerUnit, data.settings.currency)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(sale.date)}</p>
                </div>
                <div className="text-right">
                  <span className="text-green-400 font-bold">+{formatCurrency(sale.total, data.settings.currency)}</span>
                  <button onClick={() => handleDelete(sale.id)} className="block ml-auto mt-1 p-1 hover:bg-gray-800 rounded">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новая продажа">
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Select label="Продукт" value={form.product || ''} onChange={e => setForm({ ...form, product: e.target.value })}>
          <option value="Молоко">Молоко</option>
          <option value="Творог">Творог</option>
          <option value="Сыр">Сыр</option>
          <option value="Кефир">Кефир</option>
          <option value="Сметана">Сметана</option>
          <option value="Козлёнок">Козлёнок</option>
          <option value="Другое">Другое</option>
        </Select>
        <Input label="Покупатель *" value={form.buyer || ''} onChange={e => setForm({ ...form, buyer: e.target.value })} placeholder="Иванов И.И." />
        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Количество *" type="number" step="0.1" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="5" />
          </div>
          <div className="flex-1">
            <Select label="Ед. изм." value={form.unit || ''} onChange={e => setForm({ ...form, unit: e.target.value })}>
              <option value={data.settings.milkUnit}>{data.settings.milkUnit}</option>
              <option value="кг">кг</option>
              <option value="шт">шт</option>
            </Select>
          </div>
        </div>
        <Input label={`Цена за единицу (${data.settings.currency})`} type="number" value={form.pricePerUnit || ''} onChange={e => setForm({ ...form, pricePerUnit: Number(e.target.value) })} placeholder="100" />
        {form.quantity && form.pricePerUnit && (
          <div className="bg-gray-800 rounded-xl p-3 mb-3 text-center">
            <span className="text-gray-400 text-sm">Итого: </span>
            <span className="text-green-400 font-bold">{formatCurrency((Number(form.quantity) || 0) * (Number(form.pricePerUnit) || 0), data.settings.currency)}</span>
          </div>
        )}
        <button onClick={handleSave} className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">
          Добавить продажу
        </button>
      </Modal>
    </div>
  );
}

// ==================== EXPENSES PAGE ====================
function ExpensesPage({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Expense>>({ date: getToday(), category: 'feed', amount: 0 });

  const handleSave = () => {
    if (!form.description || !form.amount) return;
    const expense: Expense = {
      id: generateId(),
      date: form.date || getToday(),
      category: form.category || 'other',
      description: form.description || '',
      amount: Number(form.amount) || 0,
    };
    onUpdate({ ...data, expenses: [...data.expenses, expense] });
    setShowModal(false);
    setForm({ date: getToday(), category: 'feed', amount: 0 });
  };

  const handleDelete = (id: string) => {
    onUpdate({ ...data, expenses: data.expenses.filter(e => e.id !== id) });
  };

  const totalExpenses = data.expenses.reduce((s, x) => s + x.amount, 0);
  const categoryLabels: Record<string, string> = { feed: '🌾 Корм', vet: '💊 Ветеринар', purchase: '🐐 Покупка', equipment: '🔧 Оборудование', other: '📦 Другое' };

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Расходы</h1>
          <p className="text-gray-400 text-sm">Корм, ветеринар, покупки</p>
        </div>
        <button onClick={() => setShowModal(true)} className="p-3 bg-red-500 rounded-xl hover:bg-red-600 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
        <p className="text-sm text-gray-400">Общие расходы</p>
        <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses, data.settings.currency)}</p>
      </div>

      {data.expenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">💸</div>
          <p className="text-gray-400">Нет расходов</p>
          <button onClick={() => setShowModal(true)} className="mt-4 text-red-400 text-sm">+ Добавить расход</button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...data.expenses].reverse().map(exp => (
            <div key={exp.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{categoryLabels[exp.category]}</span>
                  </div>
                  <h3 className="text-white font-semibold mt-1">{exp.description}</h3>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(exp.date)}</p>
                </div>
                <div className="text-right">
                  <span className="text-red-400 font-bold">-{formatCurrency(exp.amount, data.settings.currency)}</span>
                  <button onClick={() => handleDelete(exp.id)} className="block ml-auto mt-1 p-1 hover:bg-gray-800 rounded">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новый расход">
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Select label="Категория" value={form.category || 'feed'} onChange={e => setForm({ ...form, category: e.target.value as Expense['category'] })}>
          <option value="feed">🌾 Корм</option>
          <option value="vet">💊 Ветеринар</option>
          <option value="purchase">🐐 Покупка поголовья</option>
          <option value="equipment">🔧 Оборудование</option>
          <option value="other">📦 Другое</option>
        </Select>
        <Input label="Описание *" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Сено, комбикорм..." />
        <Input label={`Сумма (${data.settings.currency}) *`} type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="1000" />
        <button onClick={handleSave} className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors">
          Добавить расход
        </button>
      </Modal>
    </div>
  );
}

// ==================== INVOICES PAGE ====================
function InvoicesPage({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>({ date: getToday(), items: [], status: 'pending' });

  const addItem = () => {
    const items = [...(form.items || []), { product: '', quantity: 1, unit: data.settings.milkUnit, price: 0, total: 0 }];
    setForm({ ...form, items });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const items = [...(form.items || [])];
    (items[index] as any)[field] = value;
    items[index].total = items[index].quantity * items[index].price;
    setForm({ ...form, items });
  };

  const removeItem = (index: number) => {
    const items = (form.items || []).filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const invoiceTotal = (form.items || []).reduce((s, x) => s + x.total, 0);

  const handleSave = () => {
    if (!form.buyer || !form.items?.length) return;
    const invoice: Invoice = {
      id: generateId(),
      number: form.number || `СЧ-${String(data.invoices.length + 1).padStart(4, '0')}`,
      date: form.date || getToday(),
      dueDate: form.dueDate || '',
      buyer: form.buyer || '',
      buyerPhone: form.buyerPhone || '',
      items: form.items || [],
      total: invoiceTotal,
      status: (form.status as Invoice['status']) || 'pending',
      notes: form.notes || '',
    };
    onUpdate({ ...data, invoices: [...data.invoices, invoice] });
    setShowModal(false);
    setForm({ date: getToday(), items: [], status: 'pending' });
  };

  const toggleStatus = (id: string) => {
    const updated = data.invoices.map(inv => {
      if (inv.id === id) {
        const newStatus: Invoice['status'] = inv.status === 'pending' ? 'paid' : inv.status === 'paid' ? 'overdue' : 'pending';
        return { ...inv, status: newStatus };
      }
      return inv;
    });
    onUpdate({ ...data, invoices: updated });
  };

  const handleDelete = (id: string) => {
    onUpdate({ ...data, invoices: data.invoices.filter(i => i.id !== id) });
  };

  const statusColors = { pending: 'text-yellow-400 bg-yellow-500/10', paid: 'text-green-400 bg-green-500/10', overdue: 'text-red-400 bg-red-500/10' };
  const statusLabels = { pending: 'Ожидает', paid: 'Оплачен', overdue: 'Просрочен' };

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Счета</h1>
          <p className="text-gray-400 text-sm">Выставление и отслеживание</p>
        </div>
        <button onClick={() => { setForm({ date: getToday(), items: [{ product: 'Молоко', quantity: 1, unit: data.settings.milkUnit, price: 0, total: 0 }], status: 'pending', number: `СЧ-${String(data.invoices.length + 1).padStart(4, '0')}` }); setShowModal(true); }} className="p-3 bg-purple-500 rounded-xl hover:bg-purple-600 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {data.invoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📄</div>
          <p className="text-gray-400">Нет счетов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...data.invoices].reverse().map(inv => (
            <div key={inv.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{inv.number}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>{statusLabels[inv.status]}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{inv.buyer}</p>
                  <p className="text-xs text-gray-500">{formatDate(inv.date)}</p>
                </div>
                <span className="text-lg font-bold text-white">{formatCurrency(inv.total, data.settings.currency)}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleStatus(inv.id)} className="flex-1 text-xs py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                  {inv.status === 'pending' ? '✓ Оплачен' : inv.status === 'paid' ? '⏰ Просрочен' : '↩ Ожидает'}
                </button>
                <button onClick={() => setShowView(inv)} className="flex-1 text-xs py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                  👁 Просмотр
                </button>
                <button onClick={() => handleDelete(inv.id)} className="px-3 py-2 bg-gray-800 rounded-lg text-red-400 hover:bg-gray-700 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Invoice Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новый счёт">
        <Input label="Номер счёта" value={form.number || ''} onChange={e => setForm({ ...form, number: e.target.value })} />
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Input label="Дата оплаты" type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
        <Input label="Покупатель *" value={form.buyer || ''} onChange={e => setForm({ ...form, buyer: e.target.value })} placeholder="ООО «Ромашка»" />
        <Input label="Телефон" value={form.buyerPhone || ''} onChange={e => setForm({ ...form, buyerPhone: e.target.value })} placeholder="+7 900 123-45-67" />
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Позиции</label>
            <button onClick={addItem} className="text-xs text-blue-400">+ Добавить</button>
          </div>
          {(form.items || []).map((item, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3 mb-2">
              <div className="flex gap-2 mb-2">
                <input value={item.product} onChange={e => updateItem(i, 'product', e.target.value)} placeholder="Продукт" className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                <button onClick={() => removeItem(i)} className="p-2 text-red-400"><X size={16} /></button>
              </div>
              <div className="flex gap-2">
                <input type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} placeholder="Кол-во" className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                <input type="number" value={item.price || ''} onChange={e => updateItem(i, 'price', Number(e.target.value))} placeholder="Цена" className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                <span className="text-sm text-gray-400 self-center">{formatCurrency(item.total, data.settings.currency)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 rounded-xl p-3 mb-3 text-center">
          <span className="text-gray-400 text-sm">Итого: </span>
          <span className="text-white font-bold text-lg">{formatCurrency(invoiceTotal, data.settings.currency)}</span>
        </div>

        <TextArea label="Примечания" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Условия оплаты..." />
        <button onClick={handleSave} className="w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition-colors">
          Создать счёт
        </button>
      </Modal>

      {/* View Invoice Modal */}
      <Modal isOpen={!!showView} onClose={() => setShowView(null)} title={`Счёт ${showView?.number}`}>
        {showView && (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-white font-bold text-lg">{data.settings.farmName}</p>
                <p className="text-gray-400 text-sm">Счёт №{showView.number}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[showView.status]}`}>{statusLabels[showView.status]}</span>
            </div>
            <div className="space-y-1 text-sm mb-4">
              <p className="text-gray-400">Покупатель: <span className="text-white">{showView.buyer}</span></p>
              {showView.buyerPhone && <p className="text-gray-400">Тел: <span className="text-white">{showView.buyerPhone}</span></p>}
              <p className="text-gray-400">Дата: <span className="text-white">{formatDate(showView.date)}</span></p>
              {showView.dueDate && <p className="text-gray-400">Оплатить до: <span className="text-white">{formatDate(showView.dueDate)}</span></p>}
            </div>
            <div className="border border-gray-700 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-400">Продукт</th>
                    <th className="text-center px-3 py-2 text-gray-400">Кол-во</th>
                    <th className="text-right px-3 py-2 text-gray-400">Цена</th>
                    <th className="text-right px-3 py-2 text-gray-400">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {showView.items.map((item, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="px-3 py-2 text-white">{item.product}</td>
                      <td className="px-3 py-2 text-center text-gray-300">{item.quantity} {item.unit}</td>
                      <td className="px-3 py-2 text-right text-gray-300">{formatCurrency(item.price, data.settings.currency)}</td>
                      <td className="px-3 py-2 text-right text-white font-medium">{formatCurrency(item.total, data.settings.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right">
              <span className="text-gray-400">Итого: </span>
              <span className="text-xl font-bold text-white">{formatCurrency(showView.total, data.settings.currency)}</span>
            </div>
            {showView.notes && <p className="text-gray-400 text-sm mt-4 italic">{showView.notes}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ==================== STATISTICS PAGE ====================
function StatisticsPage({ data }: { data: AppData }) {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  const getDateFilter = () => {
    const now = new Date();
    if (period === 'week') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      return d.toISOString().split('T')[0];
    }
    if (period === 'month') {
      const d = new Date(); d.setMonth(d.getMonth() - 1);
      return d.toISOString().split('T')[0];
    }
    return '2000-01-01';
  };

  const filterDate = getDateFilter();
  const filteredMilk = data.milkRecords.filter(m => m.date >= filterDate);
  const filteredSales = data.sales.filter(s => s.date >= filterDate);
  const filteredExpenses = data.expenses.filter(e => e.date >= filterDate);

  // Per goat milk stats
  const goatMilkStats = data.goats.filter(g => g.status === 'active').map(goat => {
    const records = filteredMilk.filter(m => m.goatId === goat.id);
    const total = records.reduce((s, x) => s + x.total, 0);
    const avg = records.length > 0 ? total / records.length : 0;
    return { name: goat.name, total: Math.round(total * 10) / 10, avg: Math.round(avg * 10) / 10, records: records.length };
  }).sort((a, b) => b.total - a.total);

  // Daily totals for chart
  const dailyData: Record<string, number> = {};
  filteredMilk.forEach(m => {
    dailyData[m.date] = (dailyData[m.date] || 0) + m.total;
  });
  const chartData = Object.entries(dailyData).sort(([a], [b]) => a.localeCompare(b)).map(([date, total]) => ({
    date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    total,
  }));

  // Financial summary
  const income = filteredSales.reduce((s, x) => s + x.total, 0);
  const expenses = filteredExpenses.reduce((s, x) => s + x.amount, 0);

  // Expense categories
  const expByCategory: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount;
  });
  const categoryLabels: Record<string, string> = { feed: 'Корм', vet: 'Ветеринар', purchase: 'Покупка', equipment: 'Оборудование', other: 'Другое' };
  const pieData = Object.entries(expByCategory).map(([key, value]) => ({ name: categoryLabels[key] || key, value }));
  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="pb-4">
      <h1 className="text-2xl font-bold text-white mb-2">Статистика</h1>
      <p className="text-gray-400 text-sm mb-4">Анализ удоев и финансов</p>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {(['week', 'month', 'all'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${period === p ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
            {p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Всё время'}
          </button>
        ))}
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400">Доход</p>
          <p className="text-sm font-bold text-green-400">{formatCurrency(income, data.settings.currency)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400">Расход</p>
          <p className="text-sm font-bold text-red-400">{formatCurrency(expenses, data.settings.currency)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400">Прибыль</p>
          <p className={`text-sm font-bold ${income - expenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(income - expenses, data.settings.currency)}</p>
        </div>
      </div>

      {/* Milk chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-4">Динамика удоев ({data.settings.milkUnit}/день)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per goat stats */}
      {goatMilkStats.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-4">Удои по козам ({data.settings.milkUnit})</h3>
          <div className="space-y-3">
            {goatMilkStats.map((goat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-blue-400">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white text-sm font-medium">{goat.name}</span>
                    <span className="text-blue-400 text-sm font-bold">{goat.total} {data.settings.milkUnit}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${goatMilkStats[0].total > 0 ? (goat.total / goatMilkStats[0].total) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ср. {goat.avg} {data.settings.milkUnit}/день • {goat.records} записей</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense pie chart */}
      {pieData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-4">Структура расходов</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {data.milkRecords.length === 0 && data.sales.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-400">Добавьте данные для отображения статистики</p>
        </div>
      )}
    </div>
  );
}

// ==================== SETTINGS PAGE ====================
function SettingsPage({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm_backup_${getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onUpdate({ ...data, settings: { ...data.settings, lastBackup: new Date().toISOString() } });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importData(ev.target?.result as string);
      if (result) {
        onUpdate(result);
        alert('✅ Данные успешно восстановлены!');
      } else {
        alert('❌ Ошибка: неверный формат файла');
      }
    };
    reader.readAsText(file);
  };

  const handleGoogleDriveBackup = () => {
    // Generate backup file for manual upload to Google Drive
    handleExport();
    alert('📁 Файл сохранён. Загрузите его в папку Google Drive для хранения в облаке.\n\n💡 Совет: Создайте папку "Farm Backup" в Google Drive и настройте автозагрузку.');
  };

  const handleReset = () => {
    if (confirm('⚠️ Удалить ВСЕ данные? Это действие нельзя отменить!')) {
      if (confirm('Вы уверены? Все козы, записи, продажи и расходы будут удалены!')) {
        const emptyData: AppData = {
          goats: [], milkRecords: [], sales: [], expenses: [], invoices: [],
          settings: data.settings,
        };
        onUpdate(emptyData);
      }
    }
  };

  const updateSetting = (key: string, value: string) => {
    onUpdate({ ...data, settings: { ...data.settings, [key]: value } });
  };

  const dataSize = new Blob([JSON.stringify(data)]).size;

  return (
    <div className="pb-4">
      <h1 className="text-2xl font-bold text-white mb-6">Настройки</h1>

      {/* Farm settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">🐐 Ферма</h3>
        <Input label="Название фермы" value={data.settings.farmName} onChange={e => updateSetting('farmName', e.target.value)} />
        <Select label="Валюта" value={data.settings.currency} onChange={e => updateSetting('currency', e.target.value)}>
          <option value="₽">₽ Рубль</option>
          <option value="$">$ Доллар</option>
          <option value="€">€ Евро</option>
          <option value="₸">₸ Тенге</option>
          <option value="₴">₴ Гривна</option>
        </Select>
        <Select label="Единица молока" value={data.settings.milkUnit} onChange={e => updateSetting('milkUnit', e.target.value)}>
          <option value="л">Литры (л)</option>
          <option value="кг">Килограммы (кг)</option>
        </Select>
      </div>

      {/* Backup */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">💾 Данные и бекап</h3>
        
        <div className="bg-gray-800 rounded-xl p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Размер данных:</span>
            <span className="text-white">{(dataSize / 1024).toFixed(1)} КБ</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Коз:</span>
            <span className="text-white">{data.goats.length}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Записей удоев:</span>
            <span className="text-white">{data.milkRecords.length}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Последний бекап:</span>
            <span className="text-white">{data.settings.lastBackup ? formatDate(data.settings.lastBackup.split('T')[0]) : 'Не выполнялся'}</span>
          </div>
        </div>

        <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors mb-2">
          <Download size={18} /> Скачать бекап (JSON)
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors mb-2">
          <Upload size={18} /> Восстановить из файла
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

        <button onClick={handleGoogleDriveBackup} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 19.5h20L12 2zm0 4l7 12.5H5L12 6z" opacity="0.3"/><path d="M7.71 3.5L1.15 15l3.43 5.96L12 5.5 19.42 20.96l3.43-5.96L16.29 3.5H7.71zm-.56 2h9.7L21.15 15l-2.29 3.96L12 7.5 5.14 18.96 2.85 15l4.3-9.5z"/></svg>
          Бекап в Google Drive
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">Файл будет скачан — загрузите его в Google Drive</p>
      </div>

      {/* About */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-semibold mb-3">ℹ️ О приложении</h3>
        <p className="text-gray-400 text-sm">Ферма Manager — приложение для учёта козьей фермы. Все данные хранятся локально на вашем устройстве.</p>
        <p className="text-gray-500 text-xs mt-2">Версия 1.0 • PWA</p>
      </div>

      {/* Danger zone */}
      <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-4">
        <h3 className="text-red-400 font-semibold mb-3">⚠️ Опасная зона</h3>
        <button onClick={handleReset} className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-colors">
          Удалить все данные
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [page, setPage] = useState<PageType>('dashboard');

  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleUpdate = (newData: AppData) => {
    setData(newData);
  };

  const navItems = [
    { id: 'dashboard' as PageType, icon: Home, label: 'Главная' },
    { id: 'goats' as PageType, icon: Users, label: 'Козы' },
    { id: 'production' as PageType, icon: Droplets, label: 'Удои' },
    { id: 'sales' as PageType, icon: ShoppingCart, label: 'Продажи' },
    { id: 'expenses' as PageType, icon: Receipt, label: 'Расходы' },
  ];

  const moreItems = [
    { id: 'invoices' as PageType, icon: FileText, label: 'Счета' },
    { id: 'statistics' as PageType, icon: BarChart3, label: 'Статистика' },
    { id: 'settings' as PageType, icon: Settings, label: 'Настройки' },
  ];

  const [showMore, setShowMore] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard data={data} />;
      case 'goats': return <GoatsPage data={data} onUpdate={handleUpdate} />;
      case 'production': return <ProductionPage data={data} onUpdate={handleUpdate} />;
      case 'sales': return <SalesPage data={data} onUpdate={handleUpdate} />;
      case 'expenses': return <ExpensesPage data={data} onUpdate={handleUpdate} />;
      case 'invoices': return <InvoicesPage data={data} onUpdate={handleUpdate} />;
      case 'statistics': return <StatisticsPage data={data} />;
      case 'settings': return <SettingsPage data={data} onUpdate={handleUpdate} />;
      default: return <Dashboard data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white max-w-lg mx-auto relative">
      {/* Top bar for sub-pages */}
      {page !== 'dashboard' && (
        <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setPage('dashboard')} className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <h2 className="font-semibold text-white capitalize">
            {navItems.find(n => n.id === page)?.label || moreItems.find(n => n.id === page)?.label}
          </h2>
        </div>
      )}

      {/* Main content */}
      <main className="px-4 pt-4 pb-24">
        {renderPage()}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                page === item.id ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              moreItems.some(i => i.id === page) ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="text-lg">⋯</span>
            </div>
            <span className="text-[10px]">Ещё</span>
          </button>
        </div>

        {/* More menu */}
        {showMore && (
          <div className="absolute bottom-full left-0 right-0 bg-gray-900 border border-gray-700 rounded-t-2xl p-4 shadow-2xl">
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setShowMore(false); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                    page === item.id ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
