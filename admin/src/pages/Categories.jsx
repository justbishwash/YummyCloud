import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencilSquare } from 'react-icons/hi2';
import api from '../services/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', name_ne: '', icon: '', image: null, imagePreview: '' });
  const [showForm, setShowForm] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const foodEmojis = [
    '🥟', '🍚', '🍜', '🥤', '🍿', '🍰', '🍕', '🍔', '🌮', '🌯',
    '🥗', '🍝', '🍛', '🍲', '🥘', '🍱', '🍣', '🍤', '🥩', '🍗',
    '🍖', '🥚', '🧀', '🥐', '🍞', '🥪', '🌭', '🍟', '🥓', '🍳',
    '🥞', '🧇', '🥯', '🍩', '🍪', '🎂', '🍫', '🍬', '🍭', '🍮',
    '🍦', '🧁', '☕', '🍵', '🧃', '🥛', '🍺', '🍷', '🧊', '🍽️',
  ];

  useEffect(() => { api.getCategories().then((res) => setCategories(res.categories || [])).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (form.name_ne) formData.append('name_ne', form.name_ne);
      if (form.icon) formData.append('icon', form.icon);
      if (form.image) formData.append('image', form.image);

      if (editingId) {
        const res = await api.upload(`/admin/categories/${editingId}`, formData);
        setCategories(categories.map((c) => c.id === editingId ? (res.category || { ...c, ...form }) : c));
      } else {
        const res = await api.upload('/admin/categories', formData);
        setCategories([...categories, res.category]);
      }
      resetForm();
    } catch (err) {
      console.error('Category save error:', err);
      alert(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name || '', name_ne: cat.name_ne || '', icon: cat.icon || '', image: null, imagePreview: cat.image || '' });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', name_ne: '', icon: '', image: null, imagePreview: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.deleteCategory(deleteTarget.id); setCategories(categories.filter((c) => c.id !== deleteTarget.id)); setDeleteTarget(null); } catch (err) { alert(err.message); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Categories</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"><HiOutlinePlus className="w-4 h-4" /> Add</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={resetForm} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (English)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" required />
              <input type="text" value={form.name_ne} onChange={(e) => setForm({ ...form, name_ne: e.target.value })} placeholder="Name (Nepali)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Icon</label>
                <div className="relative">
                  <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full text-left hover:border-primary">
                    {form.icon ? `${form.icon} Selected` : 'Choose an icon'}
                  </button>
                  {showIconPicker && (
                    <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 w-full grid grid-cols-10 gap-1">
                      {foodEmojis.map((emoji) => (
                        <button key={emoji} type="button" onClick={() => { setForm({ ...form, icon: emoji }); setShowIconPicker(false); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-lg">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Category Image</label>
                <div className="flex items-center gap-3">
                  {(form.imagePreview || form.image) && (
                    <img src={form.image ? URL.createObjectURL(form.image) : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${form.imagePreview}`} alt="" className="w-14 h-14 rounded-lg border border-gray-200 object-cover" />
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {form.image || form.imagePreview ? 'Change' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files[0]) setForm({ ...form, image: e.target.files[0] }); }} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} disabled={saving} className="flex-1 py-2 rounded-lg text-sm bg-gray-100 text-gray-600">Cancel</button>
                <button type="submit" disabled={saving || !form.name.trim()} className="flex-1 py-2 rounded-lg text-sm bg-primary text-white font-medium disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th className="px-4 py-3 text-left">Image</th><th className="px-4 py-3 text-left">Icon</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Nepali</th><th className="px-4 py-3 text-center">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {cat.image ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${cat.image}`} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg" />}
                  </td>
                  <td className="px-4 py-3 text-xl">{cat.icon}</td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.name_ne}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(cat)} className="p-1.5 rounded hover:bg-blue-50" title="Edit">
                        <HiOutlinePencilSquare className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded hover:bg-red-50" title="Delete">
                        <HiOutlineTrash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineTrash className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Delete Category</h3>
            <p className="text-sm text-gray-500 mt-2">Delete <strong>{deleteTarget.name}</strong>? Items in this category won't be deleted.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
