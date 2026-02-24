/**
 * Admin Events Management - CRUD panel with registered students, export, close registration
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import {
    FiPlus, FiEdit, FiTrash2, FiCalendar, FiX, FiEye, FiEyeOff,
    FiUsers, FiDownload, FiLock, FiUnlock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminEvents.css';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', category: 'hackathon', subcategory: '',
        college: '', isOwnCollege: true, date: '', venue: '',
        rules: '', teamSize: 1, prizeDetails: '', totalSlots: 50, visible: true
    });
    const [formErrors, setFormErrors] = useState({});

    // Registered students modal state
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [selectedEventStudents, setSelectedEventStudents] = useState([]);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');
    const [loadingStudents, setLoadingStudents] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data.events || []);
        } catch (err) {
            toast.error('Error fetching events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: '' });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.title.trim()) errors.title = 'Title is required';
        if (!form.description.trim()) errors.description = 'Description is required';
        if (!form.date) errors.date = 'Date is required';
        if (!form.venue.trim()) errors.venue = 'Venue is required';
        if (!form.college.trim()) errors.college = 'College is required';
        if (Number(form.totalSlots) < 1) errors.totalSlots = 'Must have at least 1 slot';
        if (Number(form.teamSize) < 1) errors.teamSize = 'Team size must be at least 1';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openCreate = () => {
        setEditingEvent(null);
        setFormErrors({});
        setForm({
            title: '', description: '', category: 'hackathon', subcategory: '',
            college: 'National Institute of Technology', isOwnCollege: true,
            date: '', venue: '', rules: '', teamSize: 1, prizeDetails: '', totalSlots: 50, visible: true
        });
        setShowModal(true);
    };

    const openEdit = (event) => {
        setEditingEvent(event);
        setFormErrors({});
        setForm({
            title: event.title, description: event.description, category: event.category,
            subcategory: event.subcategory || '', college: event.college,
            isOwnCollege: event.isOwnCollege, date: event.date?.split('T')[0] || '',
            venue: event.venue, rules: event.rules?.join(', ') || '',
            teamSize: event.teamSize, prizeDetails: event.prizeDetails || '',
            totalSlots: event.totalSlots, visible: event.visible !== false
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the form errors');
            return;
        }

        try {
            const data = {
                ...form,
                rules: form.rules ? form.rules.split(',').map(r => r.trim()) : [],
                teamSize: Number(form.teamSize),
                totalSlots: Number(form.totalSlots)
            };

            if (editingEvent) {
                await api.put(`/events/${editingEvent._id}`, data);
                toast.success('Event updated!');
            } else {
                await api.post('/events', data);
                toast.success('Event created successfully!');
            }
            setShowModal(false);
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving event');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event? This action cannot be undone.')) return;
        try {
            await api.delete(`/events/${id}`);
            toast.success('Event deleted');
            fetchEvents();
        } catch (err) {
            toast.error('Error deleting event');
        }
    };

    const toggleRegistration = async (event) => {
        try {
            const newState = !event.registrationClosed;
            await api.put(`/events/${event._id}`, { registrationClosed: newState });
            toast.success(newState ? 'Registration closed' : 'Registration opened');
            fetchEvents();
        } catch (err) {
            toast.error('Toggle failed');
        }
    };

    // View registered students
    const viewRegisteredStudents = async (event) => {
        setSelectedEventTitle(event.title);
        setLoadingStudents(true);
        setShowStudentsModal(true);
        try {
            const res = await api.get(`/registrations?event_id=${event._id}`);
            setSelectedEventStudents(res.data.registrations || []);
        } catch (err) {
            toast.error('Error fetching registered students');
            setSelectedEventStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    // Export registrations as CSV
    const exportCSV = async (event) => {
        try {
            const res = await api.get(`/registrations?event_id=${event._id}`);
            const regs = res.data.registrations || [];

            if (regs.length === 0) {
                toast.error('No registrations to export');
                return;
            }

            const headers = ['Name', 'Email', 'College', 'Department', 'Year', 'Student ID', 'Status', 'Date'];
            const rows = regs.map(r => [
                r.name, r.email, r.college, r.department, r.year,
                r.studentId || 'N/A', r.status,
                r.registrationDate ? new Date(r.registrationDate).toLocaleDateString() : 'N/A'
            ]);

            const csvContent = [headers, ...rows].map(row =>
                row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
            ).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${event.title.replace(/\s+/g, '_')}_registrations.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            toast.success('CSV exported!');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1><FiCalendar style={{ verticalAlign: 'middle', marginRight: 8 }} /> Manage Events</h1>
                    <p>Create, edit, and manage events</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <FiPlus /> Create Event
                </button>
            </div>

            <div className="glass-card">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Venue</th>
                                <th>Seats</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No events yet. Click "Create Event" to add one.</td></tr>
                            ) : events.map(event => (
                                <tr key={event._id}>
                                    <td><strong>{event.title}</strong></td>
                                    <td><span className={`badge badge-${event.category === 'hackathon' ? 'approved' : event.category === 'game' ? 'pending' : 'rejected'}`}>
                                        {event.category}
                                    </span></td>
                                    <td>{new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                                    <td>{event.venue || event.location || '—'}</td>
                                    <td>{event.booked_slots || 0}/{event.total_slots || 0}</td>
                                    <td>
                                        <div className="status-badges">
                                            <button
                                                className={`btn btn-sm ${event.visible !== false ? 'btn-success' : 'btn-outline'}`}
                                                onClick={async () => {
                                                    try {
                                                        await api.put(`/events/${event._id}`, { visible: event.visible === false });
                                                        toast.success(event.visible === false ? 'Event visible' : 'Event hidden');
                                                        fetchEvents();
                                                    } catch (err) { toast.error('Toggle failed'); }
                                                }}
                                                title={event.visible !== false ? 'Hide event' : 'Show event'}
                                            >
                                                {event.visible !== false ? <FiEye /> : <FiEyeOff />}
                                            </button>
                                            <button
                                                className={`btn btn-sm ${event.registrationClosed ? 'btn-danger' : 'btn-outline'}`}
                                                onClick={() => toggleRegistration(event)}
                                                title={event.registrationClosed ? 'Open registration' : 'Close registration'}
                                            >
                                                {event.registrationClosed ? <FiLock /> : <FiUnlock />}
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn btn-outline btn-sm" onClick={() => viewRegisteredStudents(event)} title="View registered students">
                                                <FiUsers />
                                            </button>
                                            <button className="btn btn-outline btn-sm" onClick={() => exportCSV(event)} title="Export registrations as CSV">
                                                <FiDownload />
                                            </button>
                                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(event)} title="Edit event">
                                                <FiEdit />
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id)} title="Delete event">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div
                            className="modal glass-card"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="modal-header">
                                <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Title *</label>
                                        <input className={`form-input ${formErrors.title ? 'input-error' : ''}`} name="title" value={form.title} onChange={handleChange} required />
                                        {formErrors.title && <span className="field-error">{formErrors.title}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                                            <option value="hackathon">Hackathon</option>
                                            <option value="game">Game</option>
                                            <option value="celebration">Celebration</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Subcategory</label>
                                        <input className="form-input" name="subcategory" value={form.subcategory} onChange={handleChange} placeholder="e.g., Dancing, Cricket" />
                                    </div>
                                    <div className="form-group">
                                        <label>Date *</label>
                                        <input className={`form-input ${formErrors.date ? 'input-error' : ''}`} type="date" name="date" value={form.date} onChange={handleChange} required />
                                        {formErrors.date && <span className="field-error">{formErrors.date}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Venue *</label>
                                        <input className={`form-input ${formErrors.venue ? 'input-error' : ''}`} name="venue" value={form.venue} onChange={handleChange} required />
                                        {formErrors.venue && <span className="field-error">{formErrors.venue}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>College *</label>
                                        <input className={`form-input ${formErrors.college ? 'input-error' : ''}`} name="college" value={form.college} onChange={handleChange} required />
                                        {formErrors.college && <span className="field-error">{formErrors.college}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Team Size</label>
                                        <input className={`form-input ${formErrors.teamSize ? 'input-error' : ''}`} type="number" name="teamSize" value={form.teamSize} onChange={handleChange} min="1" />
                                        {formErrors.teamSize && <span className="field-error">{formErrors.teamSize}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Total Slots</label>
                                        <input className={`form-input ${formErrors.totalSlots ? 'input-error' : ''}`} type="number" name="totalSlots" value={form.totalSlots} onChange={handleChange} min="1" />
                                        {formErrors.totalSlots && <span className="field-error">{formErrors.totalSlots}</span>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description *</label>
                                    <textarea className={`form-input ${formErrors.description ? 'input-error' : ''}`} name="description" rows="3" value={form.description} onChange={handleChange} required></textarea>
                                    {formErrors.description && <span className="field-error">{formErrors.description}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Rules (comma-separated)</label>
                                    <input className="form-input" name="rules" value={form.rules} onChange={handleChange} placeholder="Rule 1, Rule 2, Rule 3" />
                                </div>
                                <div className="form-group">
                                    <label>Prize Details</label>
                                    <input className="form-input" name="prizeDetails" value={form.prizeDetails} onChange={handleChange} />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input type="checkbox" name="isOwnCollege" checked={form.isOwnCollege} onChange={handleChange} id="ownCollege" />
                                    <label htmlFor="ownCollege" style={{ marginBottom: 0 }}>Our College Event</label>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input type="checkbox" name="visible" checked={form.visible} onChange={handleChange} id="eventVisible" />
                                    <label htmlFor="eventVisible" style={{ marginBottom: 0 }}>Visible to Students</label>
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                    {editingEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Registered Students Modal */}
            <AnimatePresence>
                {showStudentsModal && (
                    <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
                        <motion.div
                            className="modal glass-card students-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="modal-header">
                                <h2><FiUsers style={{ marginRight: 8 }} /> Registered Students — {selectedEventTitle}</h2>
                                <button className="modal-close" onClick={() => setShowStudentsModal(false)}><FiX /></button>
                            </div>
                            <div className="students-body">
                                {loadingStudents ? (
                                    <div className="loading-container"><div className="spinner"></div></div>
                                ) : selectedEventStudents.length === 0 ? (
                                    <div className="students-empty">
                                        <FiUsers size={40} />
                                        <p>No students registered yet.</p>
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>College</th>
                                                    <th>Department</th>
                                                    <th>Year</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedEventStudents.map((s, i) => (
                                                    <tr key={s._id}>
                                                        <td>{i + 1}</td>
                                                        <td><strong>{s.name}</strong></td>
                                                        <td>{s.email}</td>
                                                        <td>{s.college}</td>
                                                        <td>{s.department}</td>
                                                        <td>{s.year}</td>
                                                        <td>
                                                            <span className={`badge badge-${s.status === 'approved' ? 'approved' : s.status === 'rejected' ? 'rejected' : 'pending'}`}>
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminEvents;
