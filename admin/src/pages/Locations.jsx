import { useState, useEffect } from 'react';
import {
  HiOutlineMapPin,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineXMark,
} from 'react-icons/hi2';
import api from '../services/api';

function Locations() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProvince, setExpandedProvince] = useState(null);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [editingProvince, setEditingProvince] = useState(null);
  const [editingCity, setEditingCity] = useState(null);
  const [provinceForm, setProvinceForm] = useState({ name: '', sort_order: 0 });
  const [cityForm, setCityForm] = useState({ province_id: '', name: '', delivery_fee: 0, sort_order: 0 });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await api.getLocations();
      setProvinces(res.provinces || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Province handlers
  const openAddProvince = () => {
    setEditingProvince(null);
    setProvinceForm({ name: '', sort_order: provinces.length + 1 });
    setShowProvinceModal(true);
  };

  const openEditProvince = (province) => {
    setEditingProvince(province);
    setProvinceForm({ name: province.name, sort_order: province.sort_order || 0 });
    setShowProvinceModal(true);
  };

  const handleSaveProvince = async (e) => {
    e.preventDefault();
    try {
      if (editingProvince) {
        const res = await api.updateProvince(editingProvince.id, provinceForm);
        setProvinces(provinces.map((p) => (p.id === editingProvince.id ? res.province : p)));
      } else {
        const res = await api.createProvince(provinceForm);
        setProvinces([...provinces, res.province]);
      }
      setShowProvinceModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save province');
    }
  };

  const handleDeleteProvince = async (id) => {
    if (!confirm('Delete this province and all its cities?')) return;
    try {
      await api.deleteProvince(id);
      setProvinces(provinces.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  // City handlers
  const openAddCity = (provinceId) => {
    setEditingCity(null);
    setCityForm({ province_id: provinceId, name: '', delivery_fee: 0, sort_order: 0 });
    setShowCityModal(true);
  };

  const openEditCity = (city) => {
    setEditingCity(city);
    setCityForm({ province_id: city.province_id, name: city.name, delivery_fee: city.delivery_fee || 0, sort_order: city.sort_order || 0 });
    setShowCityModal(true);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    try {
      if (editingCity) {
        const res = await api.updateCity(editingCity.id, cityForm);
        setProvinces(provinces.map((p) => ({
          ...p,
          cities: p.cities.map((c) => (c.id === editingCity.id ? res.city : c)),
        })));
      } else {
        const res = await api.createCity(cityForm);
        setProvinces(provinces.map((p) =>
          p.id === Number(cityForm.province_id) ? { ...p, cities: [...(p.cities || []), res.city] } : p
        ));
      }
      setShowCityModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save city');
    }
  };

  const handleDeleteCity = async (cityId, provinceId) => {
    if (!confirm('Delete this city?')) return;
    try {
      await api.deleteCity(cityId);
      setProvinces(provinces.map((p) =>
        p.id === provinceId ? { ...p, cities: p.cities.filter((c) => c.id !== cityId) } : p
      ));
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage provinces, cities & delivery fees</p>
        </div>
        <button
          onClick={openAddProvince}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Province
        </button>
      </div>

      {provinces.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <HiOutlineMapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No provinces added yet</p>
          <button onClick={openAddProvince} className="mt-4 text-primary text-sm font-medium">
            + Add your first province
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {provinces.map((province) => (
            <div key={province.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Province Header */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedProvince(expandedProvince === province.id ? null : province.id)}
              >
                {expandedProvince === province.id ? (
                  <HiOutlineChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <HiOutlineChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">{province.name}</h3>
                  <p className="text-xs text-gray-500">{(province.cities || []).length} cities</p>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openAddCity(province.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Add city"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditProvince(province)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit province"
                  >
                    <HiOutlinePencilSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProvince(province.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete province"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cities List */}
              {expandedProvince === province.id && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  {(province.cities || []).length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-gray-400">No cities added</p>
                      <button
                        onClick={() => openAddCity(province.id)}
                        className="text-xs text-primary font-medium mt-2"
                      >
                        + Add city
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {province.cities.map((city) => (
                        <div key={city.id} className="flex items-center gap-3 px-4 py-2.5 pl-10">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 font-medium">{city.name}</span>
                            {Number(city.delivery_fee) > 0 && (
                              <span className="ml-2 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                Rs. {city.delivery_fee}
                              </span>
                            )}
                            {city.is_local && (
                              <span className="ml-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                Local
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditCity(city)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCity(city.id, province.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <HiOutlineTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Province Modal */}
      {showProvinceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowProvinceModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingProvince ? 'Edit Province' : 'Add Province'}
              </h3>
              <button onClick={() => setShowProvinceModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <HiOutlineXMark className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveProvince} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={provinceForm.name}
                  onChange={(e) => setProvinceForm({ ...provinceForm, name: e.target.value })}
                  placeholder="e.g. Bagmati Province"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Sort Order</label>
                <input
                  type="number"
                  value={provinceForm.sort_order}
                  onChange={(e) => setProvinceForm({ ...provinceForm, sort_order: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProvinceModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">
                  {editingProvince ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* City Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCityModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCity ? 'Edit City' : 'Add City'}
              </h3>
              <button onClick={() => setShowCityModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <HiOutlineXMark className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveCity} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">City Name</label>
                <input
                  type="text"
                  value={cityForm.name}
                  onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                  placeholder="e.g. Kathmandu"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Delivery Fee (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cityForm.delivery_fee}
                  onChange={(e) => setCityForm({ ...cityForm, delivery_fee: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">Set to 0 for free delivery</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Sort Order</label>
                <input
                  type="number"
                  value={cityForm.sort_order}
                  onChange={(e) => setCityForm({ ...cityForm, sort_order: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCityModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">
                  {editingCity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Locations;
