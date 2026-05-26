import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const PRIORITY_COLORS = { LOW: 'text-secondary bg-secondary/10', MEDIUM: 'text-warning bg-warning/10', HIGH: 'text-danger bg-danger/10' };
const STATUS_COLORS = { OPEN: 'text-danger bg-danger/10 border-danger/20', IN_PROGRESS: 'text-warning bg-warning/10 border-warning/20', CLOSED: 'text-secondary bg-secondary/10 border-secondary/20' };

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'OPEN' });

    useEffect(() => {
        fetchIncidents();
    }, [filterStatus, filterPriority]);

    const fetchIncidents = async () => {
        try {
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterPriority) params.priority = filterPriority;
            const { data } = await api.get('/incidents', { params });
            setIncidents(data);
        } catch (error) {
            console.error('Error fetching incidents', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar esta incidencia?')) return;
        try {
            await api.delete(`/incidents/${id}`);
            fetchIncidents();
        } catch (error) {
            console.error('Error deleting incident', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/incidents/${editingId}`, formData);
            } else {
                await api.post('/incidents', formData);
            }
            setIsModalOpen(false);
            fetchIncidents();
        } catch (error) {
            console.error('Error saving incident', error);
        }
    };

    const openNewModal = () => {
        setEditingId(null);
        setFormData({ title: '', description: '', priority: 'MEDIUM', status: 'OPEN' });
        setIsModalOpen(true);
    };

    const openEditModal = (inc) => {
        setEditingId(inc.id);
        setFormData({ title: inc.title, description: inc.description, priority: inc.priority, status: inc.status });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in relative h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Incidencias</h2>
                    <p className="text-gray-400">Gestiona y haz seguimiento de reportes técnicos.</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    Nueva Incidencia
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-dark-800 border border-dark-700 text-white rounded-lg p-2.5 outline-none focus:border-primary"
                >
                    <option value="">Todos los Estados</option>
                    <option value="OPEN">Abierta</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="CLOSED">Cerrada</option>
                </select>
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="bg-dark-800 border border-dark-700 text-white rounded-lg p-2.5 outline-none focus:border-primary"
                >
                    <option value="">Todas las Prioridades</option>
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                </select>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-dark-900 border-b border-dark-700 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Título</th>
                                <th className="p-4 font-medium">Prioridad</th>
                                <th className="p-4 font-medium">Estado</th>
                                <th className="p-4 font-medium">Fecha</th>
                                <th className="p-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                            {incidents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No hay incidencias found.</td>
                                </tr>
                            ) : (
                                incidents.map((inc) => (
                                    <tr key={inc.id} className="hover:bg-dark-700/50 transition-colors">
                                        <td className="p-4">
                                            <p className="text-white font-medium">{inc.title}</p>
                                            <p className="text-gray-400 text-sm truncate max-w-xs">{inc.description}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[inc.priority]}`}>
                                                {inc.priority}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[inc.status]}`}>
                                                {inc.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(inc.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => openEditModal(inc)} className="p-2 text-gray-400 hover:text-primary transition-colors bg-dark-900 rounded-lg">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(inc.id)} className="p-2 text-gray-400 hover:text-danger transition-colors bg-dark-900 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-dark-800 rounded-2xl w-full max-w-lg border border-dark-700 shadow-2xl relative overflow-hidden">
                        <div className="p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
                            <h3 className="text-xl font-bold text-white tracking-wide">
                                {editingId ? 'Editar Incidencia' : 'Nueva Incidencia'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg p-3 outline-none focus:border-primary transition-all"
                                    placeholder="Ej. Servidor caído"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg p-3 outline-none focus:border-primary transition-all resize-none"
                                    placeholder="Detalles sobre el problema..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Prioridad</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg p-3 outline-none focus:border-primary"
                                    >
                                        <option value="LOW">Baja</option>
                                        <option value="MEDIUM">Media</option>
                                        <option value="HIGH">Alta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg p-3 outline-none focus:border-primary"
                                    >
                                        <option value="OPEN">Abierta</option>
                                        <option value="IN_PROGRESS">En Progreso</option>
                                        <option value="CLOSED">Cerrada</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-blue-600 text-white py-3 rounded-lg transition-colors font-medium shadow-lg shadow-primary/20"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Incidents;
