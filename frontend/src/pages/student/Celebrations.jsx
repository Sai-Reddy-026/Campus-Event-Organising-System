/**
 * Celebrations Page - Thunder Thursday with activity cards
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import EventCard from '../../components/EventCard';
import RegistrationModal from '../../components/RegistrationModal';
import toast from 'react-hot-toast';
import { FiMusic, FiArrowLeft } from 'react-icons/fi';
import './EventPages.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const activityCards = [
    { key: 'singing', title: 'Singing', emoji: '🎤', desc: 'Showcase your vocal talent in solo and duet categories', color: '#f59e0b' },
    { key: 'dancing', title: 'Dancing', emoji: '💃', desc: 'Express yourself through classical, contemporary, or street dance', color: '#ec4899' },
    { key: 'cultural', title: 'Cultural Events', emoji: '🎭', desc: 'Drama, mimicry, rangoli, quiz, and more cultural activities', color: '#8b5cf6' }
];

const Celebrations = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events?category=celebration');
                setEvents(res.data.events || []);
            } catch (err) {
                toast.error('Failed to load celebrations');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleRegister = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading celebrations...</p></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><FiMusic style={{ verticalAlign: 'middle', marginRight: 8 }} /> College Celebrations</h1>
                <p>Showcase your talents and win certificates!</p>
            </div>

            <AnimatePresence mode="wait">
                {!showDetail ? (
                    /* Thunder Thursday Card */
                    <motion.div
                        key="thunder"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <motion.div
                            className="glass-card thunder-card"
                            whileHover={{ scale: 1.01, y: -3 }}
                            onClick={() => setShowDetail(true)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="thunder-card-content">
                                <span className="thunder-emoji">⚡</span>
                                <div>
                                    <h2>Thunder Thursday</h2>
                                    <p>Weekly cultural competitions at our campus. Click to explore activities!</p>
                                </div>
                                <span className="thunder-arrow">→</span>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    /* Detailed View with Activity Cards */
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <button className="btn btn-outline back-btn" onClick={() => setShowDetail(false)}>
                            <FiArrowLeft /> Back to Celebrations
                        </button>

                        <h2 className="section-title" style={{ marginTop: 20, marginBottom: 20 }}>
                            ⚡ Thunder Thursday Activities
                        </h2>

                        {/* Activity Cards Side by Side */}
                        <motion.div className="activity-grid" variants={container} initial="hidden" animate="show">
                            {activityCards.map(card => (
                                <motion.div
                                    key={card.key}
                                    className="glass-card activity-card"
                                    variants={item}
                                    whileHover={{ scale: 1.03, y: -4 }}
                                >
                                    <div className="activity-emoji" style={{ background: `${card.color}20`, color: card.color }}>
                                        {card.emoji}
                                    </div>
                                    <h3>{card.title}</h3>
                                    <p>{card.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Event Cards */}
                        <h2 className="section-title" style={{ marginTop: 32, marginBottom: 16 }}>
                            🎉 Celebration Events
                        </h2>
                        <motion.div className="card-grid" variants={container} initial="hidden" animate="show">
                            {events.map(event => (
                                <motion.div key={event._id} variants={item}>
                                    <EventCard event={event} onRegister={handleRegister} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <RegistrationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                event={selectedEvent}
            />
        </div>
    );
};

export default Celebrations;
