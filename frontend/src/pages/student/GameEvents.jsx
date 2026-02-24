/**
 * GameEvents - Sub-page showing game events filtered by college type
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import EventCard from '../../components/EventCard';
import RegistrationModal from '../../components/RegistrationModal';
import toast from 'react-hot-toast';
import { FiAward, FiArrowLeft } from 'react-icons/fi';
import './EventPages.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const GameEvents = () => {
    const { collegeType } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const typeFilter = collegeType === 'our-college' ? 'our_college' : 'other_college';
    const pageTitle = collegeType === 'our-college' ? '🏫 Our College Games' : '🌐 Other College Games';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventsRes, statusRes] = await Promise.all([
                    api.get(`/events?category=game&type=${typeFilter}`),
                    api.get('/registrations/my-status')
                ]);
                setEvents(eventsRes.data.events || []);
                setStatusMap(statusRes.data.statusMap || {});
            } catch (err) {
                toast.error('Failed to load games');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [typeFilter]);

    const handleRegister = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        api.get('/registrations/my-status').then(res => {
            setStatusMap(res.data.statusMap || {});
        }).catch(() => { });
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading games...</p></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/student/games')}>
                    <FiArrowLeft size={18} /> Back
                </button>
                <h1><FiAward style={{ verticalAlign: 'middle', marginRight: 8 }} /> {pageTitle}</h1>
                <p>Browse and register for sports events</p>
            </div>

            {events.length === 0 ? (
                <div className="empty-state">
                    <FiAward size={48} />
                    <h3>No games available</h3>
                    <p>Check back later for new events!</p>
                </div>
            ) : (
                <motion.div className="card-grid" variants={container} initial="hidden" animate="show">
                    {events.map(event => (
                        <motion.div key={event._id} variants={item}>
                            <EventCard
                                event={event}
                                onRegister={handleRegister}
                                registrationStatus={statusMap[event._id]}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <RegistrationModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                event={selectedEvent}
            />
        </div>
    );
};

export default GameEvents;
