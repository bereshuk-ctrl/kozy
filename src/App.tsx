import { useState, useEffect, useRef } from 'react';
import { Home, Users, Droplets, ShoppingCart, Receipt, FileText, BarChart3, Settings, Plus, Trash2, Edit2, X, TrendingUp, TrendingDown, Download, Upload, ArrowLeft, Server, Check, Copy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { AppData, Goat, MilkRecord, Poultry, PoultryType, EggRecord, FeedRecord, EquipmentRecord, Sale, Expense, Invoice, PageType } from './types';
import { loadData, saveData, exportData, importData, generateId, formatCurrency, formatDate, getToday } from './store';

// ==================== MODAL & INPUTS ====================
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-5 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg"><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const Input = ({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="mb-3"><label className="block text-sm text-gray-400 mb-1">{label}</label><input {...p} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" /></div>
);
const Select = ({ label, children, ...p }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="mb-3"><label className="block text-sm text-gray-400 mb-1">{label}</label><select {...p} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none">{children}</select></div>
);
const TextArea = ({ label, ...p }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="mb-3"><label className="block text-sm text-gray-400 mb-1">{label}</label><textarea {...p} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none min-h-[80px]" /></div>
);

// ==================== DASHBOARD ====================
function Dashboard(props: { data: AppData }) {
  const data = props.data;
  const activeGoats = data.goats.filter(g => g.status === 'active');
  const activePoultry = data.poultry.filter(p => p.status === 'active');
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthSales = data.sales.filter(s => s.date.startsWith(thisMonth));
  const monthExpenses = data.expenses.filter(e => e.date.startsWith(thisMonth));
  const monthMilk = data.milkRecords.filter(m => m.date.startsWith(thisMonth));
  const monthEggs = data.eggRecords.filter(e => e.date.startsWith(thisMonth));
  const totalIncome = monthSales.reduce((s, x) => s + x.total, 0);
  const totalExpense = monthExpenses.reduce((s, x) => s + x.amount, 0);
  const totalMilk = monthMilk.reduce((s, x) => s + x.total, 0);
  const totalEggs = monthEggs.reduce((s, x) => s + x.net, 0);
  const profit = totalIncome - totalExpense;

  const stats = [
    { label: 'Козы', value: activeGoats.length.toString(), icon: '🐐' },
    { label: 'Птица', value: activePoultry.reduce((s, p) => s + p.count, 0).toString(), icon: '🐔' },
    { label: `Удой (${data.settings.milkUnit})`, value: totalMilk.toFixed(1), icon: '🥛' },
    { label: 'Яйца (шт)', value: totalEggs.toString(), icon: '🥚' },
  ];

  const last7days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
  const milkChartData = last7days.map(date => { const total = data.milkRecords.filter(m => m.date === date).reduce((s, x) => s + x.total, 0); return { date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), milk: total }; });

  return (
    <div className="pb-4">
      <div className="mb-6"><h1 className="text-2xl font-bold text-white">{data.settings.farmName}</h1><p className="text-gray-400 text-sm">Обзор за текущий месяц</p></div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((s, i) => (<div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><div className="text-2xl mb-2">{s.icon}</div><div className="text-lg font-bold text-white">{s.value}</div><div className="text-xs text-gray-400">{s.label}</div></div>))}
      </div>
      <div className={`rounded-2xl p-5 mb-6 ${profit >= 0 ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20' : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20'}`}>
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-gray-400">Финансовый результат</p><p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{profit >= 0 ? '+' : ''}{formatCurrency(profit, data.settings.currency)}</p></div>
          <div className={`p-3 rounded-xl ${profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>{profit >= 0 ? <TrendingUp size={24} className="text-green-400" /> : <TrendingDown size={24} className="text-red-400" />}</div>
        </div>
      </div>
      {data.milkRecords.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-4">Удой за 7 дней ({data.settings.milkUnit})</h3>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={milkChartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} /><YAxis tick={{ fill: '#888', fontSize: 11 }} /><Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} /><Bar dataKey="milk" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      )}
    </div>
  );
}

// ==================== GOATS PAGE ====================
function GoatsPage(props: { data: AppData; onUpdate: (d: AppData) => void }) {
  const { data, onUpdate } = props;
  const [showModal, setShowModal] = useState(false);
  const [editGoat, setEditGoat] = useState<Goat | null>(null);
  const [form, setForm] = useState<Partial<Goat>>({ status: 'active' });

  const openAdd = () => { setForm({ status: 'active', purchasePrice: 0 }); setEditGoat(null); setShowModal(true); };
  const openEdit = (g: Goat) => { setForm(g); setEditGoat(g); setShowModal(true); };
  const handleSave = () => {
    if (!form.name) return;
    if (editGoat) { onUpdate({ ...data, goats: data.goats.map(g => g.id === editGoat.id ? { ...g, ...form } as Goat : g) }); }
    else { onUpdate({ ...data, goats: [...data.goats, { id: generateId(), name: form.name || '', breed: form.breed || '', birthDate: form.birthDate || '', purchaseDate: form.purchaseDate || getToday(), purchasePrice: form.purchasePrice || 0, notes: form.notes || '', status: form.status || 'active', tag: form.tag || '' }] }); }
    setShowModal(false);
  };
  const handleDelete = (id: string) => { if (confirm('Удалить козу?')) onUpdate({ ...data, goats: data.goats.filter(g => g.id !== id) }); };

  const activeGoats = data.goats.filter(g => g.status === 'active');
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-white">Поголовье</h1><p className="text-gray-400 text-sm">{activeGoats.length} активных</p></div>
        <button onClick={openAdd} className="p-3 bg-blue-500 rounded-xl hover:bg-blue-600"><Plus size={20} className="text-white" /></button>
      </div>
      {activeGoats.length === 0 ? (<div className="text-center py-12"><div className="text-5xl mb-4">🐐</div><p className="text-gray-400">Нет активных коз</p><button onClick={openAdd} className="mt-4 text-blue-400 text-sm">+ Добавить козу</button></div>) : (
        <div className="space-y-3">{activeGoats.map(goat => (
          <div key={goat.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><h3 className="text-white font-semibold">{goat.name}</h3>{goat.tag && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">#{goat.tag}</span>}</div>
                <p className="text-sm text-gray-400">{goat.breed || 'Порода не указана'}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">{goat.birthDate && <span>🎂 {formatDate(goat.birthDate)}</span>}{goat.purchaseDate && <span>📅 {formatDate(goat.purchaseDate)}</span>}{goat.purchasePrice > 0 && <span>💰 {formatCurrency(goat.purchasePrice, data.settings.currency)}</span>}</div>
              </div>
              <div className="flex gap-1"><button onClick={() => openEdit(goat)} className="p-2 hover:bg-gray-800 rounded-lg"><Edit2 size={16} className="text-gray-400" /></button><button onClick={() => handleDelete(goat.id)} className="p-2 hover:bg-gray-800 rounded-lg"><Trash2 size={16} className="text-red-400" /></button></div>
            </div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editGoat ? 'Редактировать козу' : 'Новая коза'}>
        <Input label="Кличка *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Зорька" />
        <Input label="Номер/бирка" value={form.tag || ''} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="001" />
        <Input label="Порода" value={form.breed || ''} onChange={e => setForm({ ...form, breed: e.target.value })} placeholder="Зааненская" />
        <Input label="Дата рождения" type="date" value={form.birthDate || ''} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
        <Input label="Дата покупки" type="date" value={form.purchaseDate || ''} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
        <Input label="Цена покупки" type="number" value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })} />
        <Select label="Статус" value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value as Goat['status'] })}><option value="active">Активна</option><option value="sold">Продана</option><option value="dead">Пала</option></Select>
        <TextArea label="Заметки" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button onClick={handleSave} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl">{editGoat ? 'Сохранить' : 'Добавить'}</button>
      </Modal>
    </div>
  );
}

// ==================== POULTRY PAGE ====================
function PoultryPage({ data, onUpdate }: {  AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Poultry | null>(null);
  const [form, setForm] = useState<Partial<Poultry>>({ status: 'active', type: 'chicken', purpose: 'layer', count: 1, purchasePrice: 0 });
  const [filterType, setFilterType] = useState<PoultryType | 'all'>('all');
  const typeIcons: Record<PoultryType, string> = { chicken: '🐔', turkey: '🦃', goose: '🪿', duck: '🦆', broiler: '🐥' };
  const openAdd = () => { setForm({ status: 'active', type: 'chicken', purpose: 'layer', count: 1, purchasePrice: 0 }); setEditItem(null); setShowModal(true); };
  const openEdit = (p: Poultry) => { setForm(p); setEditItem(p); setShowModal(true); };
  const handleSave = () => {
    if (!form.name) return;
    if (editItem) { onUpdate({ ...data, poultry: data.poultry.map(p => p.id === editItem.id ? { ...p, ...form } as Poultry : p) }); }
    else { onUpdate({ ...data, poultry: [...data.poultry, { id: generateId(), name: form.name || '', type: form.type || 'chicken', breed: form.breed || '', birthDate: form.birthDate || '', purchaseDate: form.purchaseDate || getToday(), purchasePrice: form.purchasePrice || 0, purpose: form.purpose || 'layer', count: form.count || 1, notes: form.notes || '', status: form.status || 'active' }] }); }
    setShowModal(false);
  };
  const handleDelete = (id: string) => { if (confirm('Удалить?')) onUpdate({ ...data, poultry: data.poultry.filter(p => p.id !== id) }); };
  const activePoultry = data.poultry.filter(p => p.status === 'active');
  const filtered = filterType === 'all' ? activePoultry : activePoultry.filter(p => p.type === filterType);
  const totalByType = (type: PoultryType) => activePoultry.filter(p => p.type === type).reduce((s, p) => s + p.count, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-bold text-white">Птица</h1><p className="text-gray-400 text-sm">{activePoultry.reduce((s, p) => s + p.count, 0)} голов</p></div><button onClick={openAdd} className="p-3 bg-amber-500 rounded-xl hover:bg-amber-600"><Plus size={20} className="text-white" /></button></div>
      <div className="grid grid-cols-5 gap-2 mb-4">{(Object.keys(typeIcons) as PoultryType[]).map(type => (<button key={type} onClick={() => setFilterType(filterType === type ? 'all' : type)} className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${filterType === type ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-gray-900 border border-gray-800'}`}><span className="text-xl">{typeIcons[type]}</span><span className="text-xs text-white font-bold mt-1">{totalByType(type)}</span></button>))}</div>
      {filtered.length === 0 ? (<div className="text-center py-12"><div className="text-5xl mb-4">🐔</div><p className="text-gray-400">Нет птицы</p><button onClick={openAdd} className="mt-4 text-amber-400 text-sm">+ Добавить партию</button></div>) : (
        <div className="space-y-3">{filtered.map(p => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><span className="text-xl">{typeIcons[p.type]}</span><h3 className="text-white font-semibold">{p.name}</h3><span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{p.count} гол.</span></div>
                <p className="text-sm text-gray-400">{p.breed || 'Порода не указана'}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">{p.purchaseDate && <span>📅 {formatDate(p.purchaseDate)}</span>}{p.purchasePrice > 0 && <span>💰 {formatCurrency(p.purchasePrice, data.settings.currency)}</span>}<span>{p.purpose === 'layer' ? '🥚 Несушки' : p.purpose === 'meat' ? '🍖 Мясо' : '🧬 Племя'}</span></div>
              </div>
              <div className="flex gap-1"><button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-800 rounded-lg"><Edit2 size={16} className="text-gray-400" /></button><button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-gray-800 rounded-lg"><Trash2 size={16} className="text-red-400" /></button></div>
            </div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Редактировать' : 'Новая партия'}>
        <Input label="Название *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Куры-несушки №1" />
        <Select label="Вид птицы" value={form.type || 'chicken'} onChange={e => setForm({ ...form, type: e.target.value as PoultryType })}><option value="chicken">🐔 Куры</option><option value="turkey">🦃 Индюки</option><option value="goose">🪿 Гуси</option><option value="duck">🦆 Индоутки</option><option value="broiler">🐥 Бройлеры</option></Select>
        <Input label="Порода" value={form.breed || ''} onChange={e => setForm({ ...form, breed: e.target.value })} />
        <Input label="Количество (голов)" type="number" value={form.count || ''} onChange={e => setForm({ ...form, count: Number(e.target.value) })} />
        <Select label="Назначение" value={form.purpose || 'layer'} onChange={e => setForm({ ...form, purpose: e.target.value as Poultry['purpose'] })}><option value="layer">🥚 Несушки</option><option value="meat">🍖 На мясо</option><option value="breeding">🧬 Племенное</option></Select>
        <Input label="Дата покупки" type="date" value={form.purchaseDate || ''} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
        <Input label="Цена покупки" type="number" value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })} />
        <button onClick={handleSave} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl">{editItem ? 'Сохранить' : 'Добавить'}</button>
      </Modal>
    </div>
  );
}

// ==================== EGGS PAGE ====================
function EggsPage({ data, onUpdate }: {  AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<EggRecord>>({ date: getToday(), quantity: 0, broken: 0 });
  const [filterDate, setFilterDate] = useState(getToday());
  const layers = data.poultry.filter(p => p.status === 'active' && p.purpose === 'layer');
  const dayRecords = data.eggRecords.filter(e => e.date === filterDate);
  const dayTotal = dayRecords.reduce((s, x) => s + x.net, 0);
  const handleSave = () => {
    if (!form.poultryId) return;
    const qty = Number(form.quantity) || 0, brk = Number(form.broken) || 0;
    onUpdate({ ...data, eggRecords: [...data.eggRecords, { id: generateId(), poultryId: form.poultryId!, date: form.date || getToday(), quantity: qty, broken: brk, net: qty - brk, notes: form.notes || '' }] });
    setShowModal(false); setForm({ date: getToday(), quantity: 0, broken: 0 });
  };
  const handleDelete = (id: string) => onUpdate({ ...data, eggRecords: data.eggRecords.filter(e => e.id !== id) });
  const getPoultryName = (id: string) => data.poultry.find(p => p.id === id)?.name || '?';
  const typeIcons: Record<PoultryType, string> = { chicken: '🐔', turkey: '🦃', goose: '🪿', duck: '🦆', broiler: '🐥' };
  const getPoultryIcon = (id: string) => { const p = data.poultry.find(p => p.id === id); return p ? typeIcons[p.type] : '🥚'; };
  const last7days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0]; });
  const weeklyTotal = data.eggRecords.filter(e => last7days.includes(e.date)).reduce((s, x) => s + x.net, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-bold text-white">Яйца</h1><p className="text-gray-400 text-sm">Учёт яйценоскости</p></div><button onClick={() => setShowModal(true)} className="p-3 bg-amber-500 rounded-xl hover:bg-amber-600"><Plus size={20} className="text-white" /></button></div>
      <div className="grid grid-cols-2 gap-3 mb-4"><div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-gray-400">Сегодня</p><p className="text-2xl font-bold text-amber-400">{dayTotal} <span className="text-sm text-gray-400">шт</span></p></div><div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><p className="text-xs text-gray-400">За 7 дней</p><p className="text-2xl font-bold text-amber-400">{weeklyTotal} <span className="text-sm text-gray-400">шт</span></p></div></div>
      <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm mb-4" />
      {layers.length === 0 ? (<div className="text-center py-8"><div className="text-5xl mb-4">🥚</div><p className="text-gray-400">Добавьте несушек в разделе «Птица»</p></div>) : dayRecords.length === 0 ? (<div className="text-center py-8"><div className="text-5xl mb-4">🥚</div><p className="text-gray-400">Нет записей за {formatDate(filterDate)}</p></div>) : (
        <div className="space-y-3">{dayRecords.map(r => (
          <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div><div className="flex items-center gap-2"><span className="text-lg">{getPoultryIcon(r.poultryId)}</span><h3 className="text-white font-semibold">{getPoultryName(r.poultryId)}</h3></div><div className="flex gap-4 mt-1 text-sm"><span className="text-amber-400">🥚 {r.quantity} шт</span>{r.broken > 0 && <span className="text-red-400">💔 {r.broken} шт</span>}</div></div>
              <div className="flex items-center gap-3"><span className="text-lg font-bold text-green-400">{r.net} шт</span><button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-gray-800 rounded-lg"><Trash2 size={16} className="text-red-400" /></button></div>
            </div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Записать яйца">
        <Select label="Партия птицы *" value={form.poultryId || ''} onChange={e => setForm({ ...form, poultryId: e.target.value })}><option value="">Выберите</option>{layers.map(p => <option key={p.id} value={p.id}>{typeIcons[p.type]} {p.name} ({p.count} гол.)</option>)}</Select>
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Input label="Собрано (шт) *" type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
        <Input label="Бой/брак (шт)" type="number" value={form.broken || ''} onChange={e => setForm({ ...form, broken: Number(e.target.value) })} />
        <button onClick={handleSave} className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl">Записать</button>
      </Modal>
    </div>
  );
}

// ==================== PRODUCTION PAGE ====================
function ProductionPage({ data, onUpdate }: {  AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<MilkRecord>>({ date: getToday(), morning: 0, evening: 0 });
  const [filterDate, setFilterDate] = useState(getToday());
  const activeGoats = data.goats.filter(g => g.status === 'active');
  const dayRecords = data.milkRecords.filter(m => m.date === filterDate);
  const handleSave = () => {
    if (!form.goatId) return;
    const morning = Number(form.morning) || 0, evening = Number(form.evening) || 0;
    onUpdate({ ...data, milkRecords: [...data.milkRecords, { id: generateId(), goatId: form.goatId!, date: form.date || getToday(), morning, evening, total: morning + evening }] });
    setShowModal(false); setForm({ date: getToday(), morning: 0, evening: 0 });
  };
  const handleDelete = (id: string) => onUpdate({ ...data, milkRecords: data.milkRecords.filter(m => m.id !== id) });
  const getGoatName = (id: string) => data.goats.find(g => g.id === id)?.name || '?';
  const dayTotal = dayRecords.reduce((s, x) => s + x.total, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-bold text-white">Удои</h1><p className="text-gray-400 text-sm">Учёт молочной продукции</p></div><button onClick={() => setShowModal(true)} className="p-3 bg-blue-500 rounded-xl hover:bg-blue-600"><Plus size={20} className="text-white" /></button></div>
      <div className="flex items-center gap-3 mb-4"><input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm flex-1" /><div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2"><span className="text-blue-400 font-bold">{dayTotal.toFixed(1)}</span><span className="text-gray-400 text-sm ml-1">{data.settings.milkUnit}</span></div></div>
      {dayRecords.length === 0 ? (<div className="text-center py-12"><div className="text-5xl mb-4">🥛</div><p className="text-gray-400">Нет записей</p></div>) : (
        <div className="space-y-3">{dayRecords.map(r => (
          <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div><h3 className="text-white font-semibold">{getGoatName(r.goatId)}</h3><div className="flex gap-4 mt-1 text-sm"><span className="text-yellow-400">🌅 {r.morning} {data.settings.milkUnit}</span><span className="text-blue-400">🌙 {r.evening} {data.settings.milkUnit}</span></div></div>
              <div className="flex items-center gap-3"><span className="text-lg font-bold text-green-400">{r.total} {data.settings.milkUnit}</span><button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-gray-800 rounded-lg"><Trash2 size={16} className="text-red-400" /></button></div>
            </div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Записать удой">
        <Select label="Коза *" value={form.goatId || ''} onChange={e => setForm({ ...form, goatId: e.target.value })}><option value="">Выберите</option>{activeGoats.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</Select>
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Input label={`Утро (${data.settings.milkUnit})`} type="number" step="0.1" value={form.morning || ''} onChange={e => setForm({ ...form, morning: Number(e.target.value) })} />
        <Input label={`Вечер (${data.settings.milkUnit})`} type="number" step="0.1" value={form.evening || ''} onChange={e => setForm({ ...form, evening: Number(e.target.value) })} />
        <button onClick={handleSave} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl">Записать</button>
      </Modal>
    </div>
  );
}

// ==================== SALES PAGE ====================
function SalesPage({ data, onUpdate }: {  AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Sale>>({ date: getToday(), product: 'Молоко', unit: data.settings.milkUnit, quantity: 0, pricePerUnit: 0 });
  const handleSave = () => {
    if (!form.buyer || !form.quantity) return;
    const qty = Number(form.quantity) || 0, price = Number(form.pricePerUnit) || 0;
    onUpdate({ ...data, sales: [...data.sales, { id: generateId(), date: form.date || getToday(), product: form.product || '', quantity: qty, unit: form.unit || data.settings.milkUnit, pricePerUnit: price, total: qty * price, buyer: form.buyer || '' }] });
    setShowModal(false); setForm({ date: getToday(), product: 'Молоко', unit: data.settings.milkUnit, quantity: 0, pricePerUnit: 0 });
  };
  const handleDelete = (id: string) => onUpdate({ ...data, sales: data.sales.filter(s => s.id !== id) });
  const totalSales = data.sales.reduce((s, x) => s + x.total, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-bold text-white">Продажи</h1><p className="text-gray-400 text-sm">Реализация продукции</p></div><button onClick={() => setShowModal(true)} className="p-3 bg-green-500 rounded-xl hover:bg-green-600"><Plus size={20} className="text-white" /></button></div>
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 mb-4"><p className="text-sm text-gray-400">Общий объём</p><p className="text-2xl font-bold text-green-400">{formatCurrency(totalSales, data.settings.currency)}</p></div>
      {data.sales.length === 0 ? (<div className="text-center py-12"><div className="text-5xl mb-4">🛒</div><p className="text-gray-400">Нет продаж</p></div>) : (
        <div className="space-y-3">{[...data.sales].reverse().map(s => (
          <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div><h3 className="text-white font-semibold">{s.product} — {s.buyer}</h3><p className="text-sm text-gray-400">{s.quantity} {s.unit} × {formatCurrency(s.pricePerUnit, data.settings.currency)}</p><p className="text-xs text-gray-500 mt-1">{formatDate(s.date)}</p></div>
              <div className="text-right"><span className="text-green-400 font-bold">+{formatCurrency(s.total, data.settings.currency)}</span><button onClick={() => handleDelete(s.id)} className="block ml-auto mt-1 p-1 hover:bg-gray-800 rounded"><Trash2 size={14} className="text-red-400" /></button></div>
            </div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новая продажа">
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Select label="Продукт" value={form.product || ''} onChange={e => setForm({ ...form, product: e.target.value })}><option value="Молоко">🥛 Молоко</option><option value="Творог">🧀 Творог</option><option value="Сыр">🧀 Сыр</option><option value="Яйца куриные">🥚 Яйца куриные</option><option value="Яйца утиные">🥚 Яйца утиные</option><option value="Курица">🐔 Курица</option><option value="Индейка">🦃 Индейка</option><option value="Бройлер">🐥 Бройлер</option><option value="Другое">📦 Другое</option></Select>
        <Input label="Покупатель *" value={form.buyer || ''} onChange={e => setForm({ ...form, buyer: e.target.value })} />
        <div className="flex gap-3"><div className="flex-1"><Input label="Количество *" type="number" step="0.1" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div><div className="flex-1"><Select label="Ед." value={form.unit || ''} onChange={e => setForm({ ...form, unit: e.target.value })}><option value={data.settings.milkUnit}>{data.settings.milkUnit}</option><option value="кг">кг</option><option value="шт">шт</option></Select></div></div>
        <Input label={`Цена за единицу (${data.settings.currency})`} type="number" value={form.pricePerUnit || ''} onChange={e => setForm({ ...form, pricePerUnit: Number(e.target.value) })} />
        <button onClick={handleSave} className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl">Добавить</button>
      </Modal>
    </div>
  );
}

// ==================== EXPENSES PAGE ====================
function ExpensesPage({ data, onUpdate }: {  AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Expense>>({ date: getToday(), category: 'feed', amount: 0 });
  const handleSave = () => {
    if (!form.description || !form.amount) return;
    onUpdate({ ...data, expenses: [...data.expenses, { id: generateId(), date: form.date || getToday(), category: form.category || 'other', description: form.description || '', amount: Number(form.amount) || 0 }] });
    setShowModal(false); setForm({ date: getToday(), category: 'feed', amount: 0 });
  };
  const handleDelete = (id: string) => onUpdate({ ...data, expenses: data.expenses.filter(e => e.id !== id) });
  const categoryLabels: Record<string, string> = { feed: '🌾 Корм', vet: '💊 Ветеринар', purchase: '🐐 Покупка', equipment: '🔧 Оборудование', other: '📦 Другое' };
  const totalExpenses = data.expenses.reduce((s, x) => s + x.amount, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-bold text-white">Расходы</h1><p className="text-gray-400 text-sm">Корм, ветеринар, покупки</p></div><button onClick={() => setShowModal(true)} className="p-3 bg-red-500 rounded-xl hover:bg-red-600"><Plus size={20} className="text-white" /></button></div>
      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-4 mb-4"><p className="text-sm text-gray-400">Общие расходы</p><p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses, data.settings.currency)}</p></div>
      {data.expenses.length === 0 ? (<div className="text-center py-12"><div className="text-5xl mb-4">💸</div><p className="text-gray-400">Нет расходов</p></div>) : (
        <div className="space-y-3">{[...data.expenses].reverse().map(e => (
          <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div><span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{categoryLabels[e.category]}</span><h3 className="text-white font-semibold mt-1">{e.description}</h3><p className="text-xs text-gray-500 mt-1">{formatDate(e.date)}</p></div>
              <div className="text-right"><span className="text-red-400 font-bold">-{formatCurrency(e.amount, data.settings.currency)}</span><button onClick={() => handleDelete(e.id)} className="block ml-auto mt-1 p-1 hover:bg-gray-800 rounded"><Trash2 size={14} className="text-red-400" /></button></div>
            </div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новый расход">
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Select label="Категория" value={form.category || 'feed'} onChange={e => setForm({ ...form, category: e.target.value as Expense['category'] })}><option value="feed">🌾 Корм</option><option value="vet">💊 Ветеринар</option><option value="purchase">🐐 Покупка</option><option value="equipment">🔧 Оборудование</option><option value="other">📦 Другое</option></Select>
        <Input label="Описание *" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
        <Input label={`Сумма (${data.settings.currency}) *`} type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
        <button onClick={handleSave} className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl">Добавить</button>
      </Modal>
    </div>
  );
}

// ==================== FEED PAGE ====================
function FeedPage({ data, onUpdate }: {  AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<FeedRecord>>({ date: getToday(), type: 'all', category: 'compound', quantity: 0, unit: 'кг', cost: 0 });
  const handleSave = () => {
    if (!form.description) return;
    onUpdate({ ...data, feedRecords: [...data.feedRecords, { id: generateId(), date: form.date || getToday(), type: form.type || 'all', category: form.category || 'compound', description: form.description || '', quantity: Number(form.quantity) || 0, unit: form.unit || 'кг', cost: Number(form.cost) || 0 }] });
    setShowModal(false); setForm({ date: getToday(), type: 'all', category: 'compound', quantity: 0, unit: 'кг', cost: 0 });
  };
  const handleDelete = (id: string) => onUpdate({ ...data, feedRecords: data.feedRecords.filter(f => f.id !== id) });
  const categoryLabels: Record<string, string> = { grain: '🌾 Зерно', compound: '🥣 Комбикорм', hay: '🌿 Сено', vegetables: '🥕 Овощи', supplements: '💊 Добавки', other: '📦 Другое' };
  const typeLabels: Record<string, string> = { goat: '🐐 Козы', poultry: '🐔 Птица', all: '🐾 Все' };
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTotal = data.feedRecords.filter(f => f.date.startsWith(thisMonth)).reduce((s, x) => s + x.cost, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-bold text-white">Корма</h1><p className="text-gray-400 text-sm">Учёт закупки кормов</p></div><button onClick={() => setShowModal(true)} className="p-3 bg-green-600 rounded-xl hover:bg-green-700"><Plus size={20} className="text-white" /></button></div>
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 mb-4"><p className="text-sm text-gray-400">Расход (месяц)</p><p className="text-2xl font-bold text-green-400">{formatCurrency(monthTotal, data.settings.currency)}</p></div>
      {data.feedRecords.length === 0 ? (<div className="text-center py-12"><div className="text-5xl mb-4">🌾</div><p className="text-gray-400">Нет записей</p></div>) : (
        <div className="space-y-3">{[...data.feedRecords].reverse().map(f => (
          <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div><div className="flex items-center gap-2 mb-1"><span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{categoryLabels[f.category]}</span><span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{typeLabels[f.type]}</span></div><h3 className="text-white font-semibold">{f.description}</h3><div className="flex gap-3 mt-1 text-xs text-gray-500"><span>{f.quantity} {f.unit}</span><span>{formatDate(f.date)}</span></div></div>
              <div className="text-right"><span className="text-green-400 font-bold">{formatCurrency(f.cost, data.settings.currency)}</span><button onClick={() => handleDelete(f.id)} className="block ml-auto mt-1 p-1 hover:bg-gray-800 rounded"><Trash2 size={14} className="text-red-400" /></button></div>
            </div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Закупка корма">
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Select label="Для кого" value={form.type || 'all'} onChange={e => setForm({ ...form, type: e.target.value as FeedRecord['type'] })}><option value="all">🐾 Все</option><option value="goat">🐐 Козы</option><option value="poultry">🐔 Птица</option></Select>
        <Select label="Категория" value={form.category || 'compound'} onChange={e => setForm({ ...form, category: e.target.value as FeedRecord['category'] })}><option value="grain">🌾 Зерно</option><option value="compound">🥣 Комбикорм</option><option value="hay">🌿 Сено</option><option value="vegetables">🥕 Овощи</option><option value="supplements">💊 Добавки</option><option value="other">📦 Другое</option></Select>
        <Input label="Описание *" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="flex gap-3"><div className="flex-1"><Input label="Количество" type="number" step="0.1" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div><div className="flex-1"><Select label="Ед." value={form.unit || 'кг'} onChange={e => setForm({ ...form, unit: e.target.value })}><option value="кг">кг</option><option value="т">т</option><option value="шт">шт</option><option value="уп">уп</option></Select></div></div>
        <Input label={`Стоимость (${data.settings.currency})`} type="number" value={form.cost || ''} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
        <button onClick={handleSave} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl">Добавить</button>
      </Modal>
    </div>
  );
}

// ==================== EQUIPMENT PAGE ====================
function EquipmentPage({ data, onUpdate }: {  AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<EquipmentRecord>>({ date: getToday(), category: 'general', cost: 0 });
  const handleSave = () => {
    if (!form.name) return;
    onUpdate({ ...data, equipmentRecords: [...data.equipmentRecords, { id: generateId(), date: form.date || getToday(), name: form.name || '', category: form.category || 'general', cost: Number(form.cost) || 0, notes: form.notes || '' }] });
    setShowModal(false); setForm({ date: getToday(), category: 'general', cost: 0 });
  };
  const handleDelete = (id: string) => onUpdate({ ...data, equipmentRecords: data.equipmentRecords.filter(e => e.id !== id) });
  const categoryLabels: Record<string, string> = { poultry: '🐔 Для птицы', goat: '🐐 Для коз', general: '🔧 Общее' };
  const totalEquipment = data.equipmentRecords.reduce((s, x) => s + x.cost, 0);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-bold text-white">Оборудование</h1><p className="text-gray-400 text-sm">Инвентарь и техника</p></div><button onClick={() => setShowModal(true)} className="p-3 bg-indigo-500 rounded-xl hover:bg-indigo-600"><Plus size={20} className="text-white" /></button></div>
      <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-4"><p className="text-sm text-gray-400">Всего вложено</p><p className="text-2xl font-bold text-indigo-400">{formatCurrency(totalEquipment, data.settings.currency)}</p></div>
      {data.equipmentRecords.length === 0 ? (<div className="text-center py-12"><div className="text-5xl mb-4">🔧</div><p className="text-gray-400">Нет записей</p></div>) : (
        <div className="space-y-3">{[...data.equipmentRecords].reverse().map(e => (
          <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div><span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{categoryLabels[e.category]}</span><h3 className="text-white font-semibold mt-1">{e.name}</h3><p className="text-xs text-gray-500 mt-1">{formatDate(e.date)}</p></div>
              <div className="text-right"><span className="text-indigo-400 font-bold">{formatCurrency(e.cost, data.settings.currency)}</span><button onClick={() => handleDelete(e.id)} className="block ml-auto mt-1 p-1 hover:bg-gray-800 rounded"><Trash2 size={14} className="text-red-400" /></button></div>
            </div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новое оборудование">
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Select label="Категория" value={form.category || 'general'} onChange={e => setForm({ ...form, category: e.target.value as EquipmentRecord['category'] })}><option value="poultry">🐔 Для птицы</option><option value="goat">🐐 Для коз</option><option value="general">🔧 Общее</option></Select>
        <Input label="Название *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label={`Стоимость (${data.settings.currency})`} type="number" value={form.cost || ''} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
        <TextArea label="Заметки" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button onClick={handleSave} className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl">Добавить</button>
      </Modal>
    </div>
  );
}

// ==================== INVOICES PAGE ====================
function InvoicesPage({ data, onUpdate }: {  AppData; onUpdate: (d: AppData) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Invoice>>({ date: getToday(), items: [], status: 'pending' });
  const addItem = () => setForm({ ...form, items: [...(form.items || []), { product: '', quantity: 1, unit: data.settings.milkUnit, price: 0, total: 0 }] });
  const updateItem = (i: number, field: string, value: string | number) => { const items = [...(form.items || [])]; (items[i] as any)[field] = value; items[i].total = items[i].quantity * items[i].price; setForm({ ...form, items }); };
  const removeItem = (i: number) => setForm({ ...form, items: (form.items || []).filter((_, idx) => idx !== i) });
  const invoiceTotal = (form.items || []).reduce((s, x) => s + x.total, 0);
  const handleSave = () => {
    if (!form.buyer || !form.items?.length) return;
    const invoice: Invoice = { id: generateId(), number: form.number || `СЧ-${String(data.invoices.length + 1).padStart(4, '0')}`, date: form.date || getToday(), dueDate: form.dueDate || '', buyer: form.buyer || '', buyerPhone: form.buyerPhone || '', items: form.items || [], total: invoiceTotal, status: (form.status as Invoice['status']) || 'pending', notes: form.notes || '' };
    onUpdate({ ...data, invoices: [...data.invoices, invoice] });
    setShowModal(false); setForm({ date: getToday(), items: [], status: 'pending' });
  };
  const toggleStatus = (id: string) => { const updated = data.invoices.map(inv => inv.id === id ? { ...inv, status: (inv.status === 'pending' ? 'paid' : inv.status === 'paid' ? 'overdue' : 'pending') as Invoice['status'] } : inv); onUpdate({ ...data, invoices: updated }); };
  const handleDelete = (id: string) => onUpdate({ ...data, invoices: data.invoices.filter(i => i.id !== id) });
  const statusColors = { pending: 'text-yellow-400 bg-yellow-500/10', paid: 'text-green-400 bg-green-500/10', overdue: 'text-red-400 bg-red-500/10' };
  const statusLabels = { pending: 'Ожидает', paid: 'Оплачен', overdue: 'Просрочен' };

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-bold text-white">Счета</h1><p className="text-gray-400 text-sm">Выставление и отслеживание</p></div><button onClick={() => { setForm({ date: getToday(), items: [{ product: 'Молоко', quantity: 1, unit: data.settings.milkUnit, price: 0, total: 0 }], status: 'pending', number: `СЧ-${String(data.invoices.length + 1).padStart(4, '0')}` }); setShowModal(true); }} className="p-3 bg-purple-500 rounded-xl hover:bg-purple-600"><Plus size={20} className="text-white" /></button></div>
      {data.invoices.length === 0 ? (<div className="text-center py-12"><div className="text-5xl mb-4">📄</div><p className="text-gray-400">Нет счетов</p></div>) : (
        <div className="space-y-3">{[...data.invoices].reverse().map(inv => (
          <div key={inv.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2"><div><div className="flex items-center gap-2"><h3 className="text-white font-semibold">{inv.number}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>{statusLabels[inv.status]}</span></div><p className="text-sm text-gray-400 mt-1">{inv.buyer}</p></div><span className="text-lg font-bold text-white">{formatCurrency(inv.total, data.settings.currency)}</span></div>
            <div className="flex gap-2 mt-3"><button onClick={() => toggleStatus(inv.id)} className="flex-1 text-xs py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700">{inv.status === 'pending' ? '✓ Оплачен' : inv.status === 'paid' ? '⏰ Просрочен' : '↩ Ожидает'}</button><button onClick={() => handleDelete(inv.id)} className="px-3 py-2 bg-gray-800 rounded-lg text-red-400 hover:bg-gray-700"><Trash2 size={14} /></button></div>
          </div>
        ))}</div>
      )}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Новый счёт">
        <Input label="Номер" value={form.number || ''} onChange={e => setForm({ ...form, number: e.target.value })} />
        <Input label="Дата" type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Input label="Покупатель *" value={form.buyer || ''} onChange={e => setForm({ ...form, buyer: e.target.value })} />
        <div className="mb-3"><div className="flex items-center justify-between mb-2"><label className="text-sm text-gray-400">Позиции</label><button onClick={addItem} className="text-xs text-blue-400">+ Добавить</button></div>{(form.items || []).map((item, i) => (<div key={i} className="bg-gray-800 rounded-xl p-3 mb-2"><div className="flex gap-2 mb-2"><input value={item.product} onChange={e => updateItem(i, 'product', e.target.value)} placeholder="Продукт" className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-white" /><button onClick={() => removeItem(i)} className="p-2 text-red-400"><X size={16} /></button></div><div className="flex gap-2"><input type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} placeholder="Кол-во" className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-white" /><input type="number" value={item.price || ''} onChange={e => updateItem(i, 'price', Number(e.target.value))} placeholder="Цена" className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-white" /><span className="text-sm text-gray-400 self-center">{formatCurrency(item.total, data.settings.currency)}</span></div></div>))}</div>
        <div className="bg-gray-800 rounded-xl p-3 mb-3 text-center"><span className="text-gray-400 text-sm">Итого: </span><span className="text-white font-bold text-lg">{formatCurrency(invoiceTotal, data.settings.currency)}</span></div>
        <button onClick={handleSave} className="w-full mt-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl">Создать</button>
      </Modal>
    </div>
  );
}

// ==================== STATISTICS PAGE ====================
function StatisticsPage({ data }: {  AppData }) {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const getDateFilter = () => { const d = new Date(); if (period === 'week') d.setDate(d.getDate() - 7); else if (period === 'month') d.setMonth(d.getMonth() - 1); else return '2000-01-01'; return d.toISOString().split('T')[0]; };
  const filterDate = getDateFilter();
  const filteredMilk = data.milkRecords.filter(m => m.date >= filterDate);
  const filteredEggs = data.eggRecords.filter(e => e.date >= filterDate);
  const filteredSales = data.sales.filter(s => s.date >= filterDate);
  const filteredExpenses = data.expenses.filter(e => e.date >= filterDate);
  const goatMilkStats = data.goats.filter(g => g.status === 'active').map(goat => { const records = filteredMilk.filter(m => m.goatId === goat.id); const total = records.reduce((s, x) => s + x.total, 0); return { name: goat.name, total: Math.round(total * 10) / 10 }; }).sort((a, b) => b.total - a.total);
  const poultryEggStats = data.poultry.filter(p => p.status === 'active' && p.purpose === 'layer').map(p => { const records = filteredEggs.filter(e => e.poultryId === p.id); const total = records.reduce((s, x) => s + x.net, 0); const icons: Record<PoultryType, string> = { chicken: '🐔', turkey: '🦃', goose: '🪿', duck: '🦆', broiler: '🐥' }; return { name: p.name, icon: icons[p.type] || '🥚', total }; }).sort((a, b) => b.total - a.total);
  const dailyMilkData: Record<string, number> = {}; filteredMilk.forEach(m => { dailyMilkData[m.date] = (dailyMilkData[m.date] || 0) + m.total; });
  const milkChartData = Object.entries(dailyMilkData).sort(([a], [b]) => a.localeCompare(b)).map(([date, total]) => ({ date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), total }));
  const dailyEggData: Record<string, number> = {}; filteredEggs.forEach(e => { dailyEggData[e.date] = (dailyEggData[e.date] || 0) + e.net; });
  const eggChartData = Object.entries(dailyEggData).sort(([a], [b]) => a.localeCompare(b)).map(([date, total]) => ({ date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), total }));
  const income = filteredSales.reduce((s, x) => s + x.total, 0);
  const expenses = filteredExpenses.reduce((s, x) => s + x.amount, 0);
  const expByCategory: Record<string, number> = {}; filteredExpenses.forEach(e => { expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount; });
  const categoryLabels: Record<string, string> = { feed: 'Корм', vet: 'Ветеринар', purchase: 'Покупка', equipment: 'Оборудование', other: 'Другое' };
  const pieData = Object.entries(expByCategory).map(([key, value]) => ({ name: categoryLabels[key] || key, value }));
  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="pb-4">
      <h1 className="text-2xl font-bold text-white mb-2">Статистика</h1>
      <p className="text-gray-400 text-sm mb-4">Анализ удоев и финансов</p>
      <div className="flex gap-2 mb-6">{(['week', 'month', 'all'] as const).map(p => (<button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${period === p ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>{p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Всё время'}</button>))}</div>
      <div className="grid grid-cols-3 gap-3 mb-6"><div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center"><p className="text-xs text-gray-400">Доход</p><p className="text-sm font-bold text-green-400">{formatCurrency(income, data.settings.currency)}</p></div><div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center"><p className="text-xs text-gray-400">Расход</p><p className="text-sm font-bold text-red-400">{formatCurrency(expenses, data.settings.currency)}</p></div><div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center"><p className="text-xs text-gray-400">Прибыль</p><p className={`text-sm font-bold ${income - expenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(income - expenses, data.settings.currency)}</p></div></div>
      {milkChartData.length > 0 && (<div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6"><h3 className="text-white font-semibold mb-4">Удои ({data.settings.milkUnit}/день)</h3><div className="h-52"><ResponsiveContainer width="100%" height="100%"><LineChart data={milkChartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} /><YAxis tick={{ fill: '#888', fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} /><Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} /></LineChart></ResponsiveContainer></div></div>)}
      {eggChartData.length > 0 && (<div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6"><h3 className="text-white font-semibold mb-4">Яйценоскость (шт/день)</h3><div className="h-52"><ResponsiveContainer width="100%" height="100%"><LineChart data={eggChartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} /><YAxis tick={{ fill: '#888', fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} /><Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} /></LineChart></ResponsiveContainer></div></div>)}
      {goatMilkStats.length > 0 && (<div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6"><h3 className="text-white font-semibold mb-4">Удои по козам</h3><div className="space-y-3">{goatMilkStats.map((goat, i) => (<div key={i} className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-blue-400">{i + 1}</div><div className="flex-1"><div className="flex justify-between items-center mb-1"><span className="text-white text-sm font-medium">{goat.name}</span><span className="text-blue-400 text-sm font-bold">{goat.total} {data.settings.milkUnit}</span></div><div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${goatMilkStats[0].total > 0 ? (goat.total / goatMilkStats[0].total) * 100 : 0}%` }} /></div></div></div>))}</div></div>)}
      {poultryEggStats.length > 0 && (<div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6"><h3 className="text-white font-semibold mb-4">Яйценоскость по партиям</h3><div className="space-y-3">{poultryEggStats.map((p, i) => (<div key={i} className="flex items-center gap-3"><div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-sm">{p.icon}</div><div className="flex-1"><div className="flex justify-between items-center mb-1"><span className="text-white text-sm font-medium">{p.name}</span><span className="text-amber-400 text-sm font-bold">{p.total} шт</span></div><div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full" style={{ width: `${poultryEggStats[0].total > 0 ? (p.total / poultryEggStats[0].total) * 100 : 0}%` }} /></div></div></div>))}</div></div>)}
      {pieData.length > 0 && (<div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><h3 className="text-white font-semibold mb-4">Структура расходов</h3><div className="h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} /></PieChart></ResponsiveContainer></div></div>)}
    </div>
  );
}

// ==================== SETTINGS PAGE ====================
function SettingsPage({ data, onUpdate, onOpenServer }: {  AppData; onUpdate: (d: AppData) => void; onOpenServer: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleExport = () => { const json = exportData(data); const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `farm_backup_${getToday()}.json`; a.click(); URL.revokeObjectURL(url); onUpdate({ ...data, settings: { ...data.settings, lastBackup: new Date().toISOString() } }); };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const result = importData(ev.target?.result as string); if (result) { onUpdate(result); alert('✅ Данные восстановлены!'); } else alert('❌ Ошибка формата'); }; reader.readAsText(file); };
  const handleReset = () => { if (confirm('⚠️ Удалить ВСЕ данные?')) { if (confirm('Вы уверены?')) onUpdate({ ...data, goats: [], milkRecords: [], poultry: [], eggRecords: [], feedRecords: [], equipmentRecords: [], sales: [], expenses: [], invoices: [] }); } };
  const updateSetting = (key: string, value: string) => onUpdate({ ...data, settings: { ...data.settings, [key]: value } });

  return (
    <div className="pb-4">
      <h1 className="text-2xl font-bold text-white mb-6">Настройки</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-semibold mb-4">🐐 Ферма</h3>
        <Input label="Название" value={data.settings.farmName} onChange={e => updateSetting('farmName', e.target.value)} />
        <Select label="Валюта" value={data.settings.currency} onChange={e => updateSetting('currency', e.target.value)}><option value="₽">₽ Рубль</option><option value="$">$ Доллар</option><option value="€">€ Евро</option></Select>
        <Select label="Единица молока" value={data.settings.milkUnit} onChange={e => updateSetting('milkUnit', e.target.value)}><option value="л">Литры (л)</option><option value="кг">Килограммы (кг)</option></Select>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-semibold mb-4">💾 Данные и бекап</h3>
        <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium mb-2"><Download size={18} /> Скачать бекап</button>
        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium"><Upload size={18} /> Восстановить из файла</button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
        <h3 className="text-white font-semibold mb-3">🖥️ Сервер</h3>
        <p className="text-gray-400 text-sm mb-3">Инструкция по установке на Ubuntu</p>
        <button onClick={onOpenServer} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium"><Server size={18} /> Открыть инструкцию</button>
      </div>
      <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-4">
        <h3 className="text-red-400 font-semibold mb-3">⚠️ Опасная зона</h3>
        <button onClick={handleReset} className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium hover:bg-red-500/20">Удалить все данные</button>
      </div>
    </div>
  );
}

// ==================== SERVER GUIDE PAGE ====================
function ServerGuidePage({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState('');
  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 2000); };

  const CodeBlock = ({ code, id, title }: { code: string; id: string; title?: string }) => (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden my-3">
      {title && <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800"><span className="text-xs text-gray-400 font-mono">{title}</span><button onClick={() => copy(code, id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">{copied === id ? <><Check size={12} className="text-green-400" /> OK</> : <><Copy size={12} /> Copy</>}</button></div>}
      <pre className="p-4 overflow-x-auto text-sm"><code className="text-gray-300 font-mono whitespace-pre">{code}</code></pre>
    </div>
  );

  return (
    <div className="pb-4">
      <div className="flex items-center gap-3 mb-6"><button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} className="text-gray-400" /></button><div><h1 className="text-2xl font-bold text-white">Установка на Ubuntu</h1><p className="text-gray-400 text-sm">Руководство по развёртыванию</p></div></div>
      
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5 mb-6">
        <h2 className="text-lg font-bold mb-2">📋 Что нужно</h2>
        <p className="text-gray-300 text-sm mb-3">Приложение — статический сайт. Сервер нужен только для раздачи файлов.</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-900/50 rounded-xl p-2 text-center"><p className="text-xs text-gray-400">Обязательно</p><p className="text-white font-semibold text-sm">Nginx</p></div>
          <div className="bg-gray-900/50 rounded-xl p-2 text-center"><p className="text-xs text-gray-400">RAM</p><p className="text-white font-semibold text-sm">512 МБ</p></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">1️⃣ Обновление системы</h3>
          <CodeBlock id="1" code="sudo apt update && sudo apt upgrade -y" />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">2️⃣ Установка Nginx</h3>
          <CodeBlock id="2" code={`sudo apt install nginx -y\nsudo systemctl start nginx\nsudo systemctl enable nginx`} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">3️⃣ Развёртывание</h3>
          <CodeBlock id="3" code={`# Создаём папку\nsudo mkdir -p /var/www/farm-manager\nsudo chown $USER:$USER /var/www/farm-manager\n\n# Загружаем файлы (локально)\nscp -r dist/* user@server:/var/www/farm-manager/`} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">4️⃣ Настройка Nginx</h3>
          <CodeBlock id="4" code={`sudo nano /etc/nginx/sites-available/farm-manager`} title="Создайте файл" />
          <CodeBlock id="5" code={`server {
    listen 80;
    server_name your-domain.com;
    root /var/www/farm-manager;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}`} title="Конфиг" />
          <CodeBlock id="6" code={`sudo ln -s /etc/nginx/sites-available/farm-manager /etc/nginx/sites-enabled/\nsudo nginx -t\nsudo systemctl reload nginx`} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">5️⃣ SSL (HTTPS)</h3>
          <CodeBlock id="7" code={`sudo apt install certbot python3-certbot-nginx -y\nsudo certbot --nginx -d your-domain.com`} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">6️⃣ Firewall</h3>
          <CodeBlock id="8" code={`sudo ufw allow OpenSSH\nsudo ufw allow 'Nginx Full'\nsudo ufw enable`} />
        </div>
      </div>

      <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
        <p className="text-green-400 font-semibold text-sm">✅ Готово! Откройте http://your-server-ip</p>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [page, setPage] = useState<PageType>('dashboard');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => { saveData(data); }, [data]);
  const handleUpdate = (newData: AppData) => setData(newData);

  const navItems = [
    { id: 'dashboard' as PageType, icon: Home, label: 'Главная' },
    { id: 'goats' as PageType, icon: Users, label: 'Козы' },
    { id: 'poultry' as PageType, icon: () => <span className="text-xl">🐔</span>, label: 'Птица' },
    { id: 'eggs' as PageType, icon: () => <span className="text-xl">🥚</span>, label: 'Яйца' },
    { id: 'sales' as PageType, icon: ShoppingCart, label: 'Продажи' },
  ];
  const moreItems = [
    { id: 'production' as PageType, icon: Droplets, label: 'Удои' },
    { id: 'feed' as PageType, icon: () => <span className="text-xl">🌾</span>, label: 'Корма' },
    { id: 'equipment' as PageType, icon: () => <span className="text-xl">🔧</span>, label: 'Оборуд.' },
    { id: 'expenses' as PageType, icon: Receipt, label: 'Расходы' },
    { id: 'invoices' as PageType, icon: FileText, label: 'Счета' },
    { id: 'statistics' as PageType, icon: BarChart3, label: 'Статистика' },
    { id: 'settings' as PageType, icon: Settings, label: 'Настройки' },
  ];

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard data={data} />;
      case 'goats': return <GoatsPage data={data} onUpdate={handleUpdate} />;
      case 'poultry': return <PoultryPage data={data} onUpdate={handleUpdate} />;
      case 'eggs': return <EggsPage data={data} onUpdate={handleUpdate} />;
      case 'production': return <ProductionPage data={data} onUpdate={handleUpdate} />;
      case 'feed': return <FeedPage data={data} onUpdate={handleUpdate} />;
      case 'equipment': return <EquipmentPage data={data} onUpdate={handleUpdate} />;
      case 'sales': return <SalesPage data={data} onUpdate={handleUpdate} />;
      case 'expenses': return <ExpensesPage data={data} onUpdate={handleUpdate} />;
      case 'invoices': return <InvoicesPage data={data} onUpdate={handleUpdate} />;
      case 'statistics': return <StatisticsPage data={data} />;
      case 'settings': return <SettingsPage data={data} onUpdate={handleUpdate} onOpenServer={() => setPage('server')} />;
      case 'server': return <ServerGuidePage onBack={() => setPage('settings')} />;
      default: return <Dashboard data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white max-w-lg mx-auto relative">
      {page !== 'dashboard' && page !== 'server' && (
        <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setPage('dashboard')} className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} className="text-gray-400" /></button>
          <h2 className="font-semibold text-white">{navItems.find(n => n.id === page)?.label || moreItems.find(n => n.id === page)?.label}</h2>
        </div>
      )}
      <main className="px-4 pt-4 pb-24">{renderPage()}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (<button key={item.id} onClick={() => setPage(item.id)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${page === item.id ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}><item.icon size={22} /><span className="text-[10px]">{item.label}</span></button>))}
          <button onClick={() => setShowMore(!showMore)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${moreItems.some(i => i.id === page) ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}><div className="w-6 h-6 flex items-center justify-center"><span className="text-lg">⋯</span></div><span className="text-[10px]">Ещё</span></button>
        </div>
        {showMore && (<div className="absolute bottom-full left-0 right-0 bg-gray-900 border border-gray-700 rounded-t-2xl p-4 shadow-2xl"><div className="grid grid-cols-4 gap-2">{moreItems.map(item => (<button key={item.id} onClick={() => { setPage(item.id); setShowMore(false); }} className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${page === item.id ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}><item.icon size={20} /><span className="text-[10px]">{item.label}</span></button>))}</div></div>)}
      </nav>
    </div>
  );
}
