/**
 * CEMS / Updates Page - Clean centered layout
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { FiCalendar } from 'react-icons/fi';
import './StudentCalendar.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const StudentCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvents(res.data.events || []);
            } catch (err) {
                console.error('Error fetching events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading events...</p></div>;
    }

    return (
        <div className="page-container cems-page">
            <div className="page-header" style={{ textAlign: 'center' }}>
                <h1><FiCalendar style={{ verticalAlign: 'middle', marginRight: 8 }} /> Updates</h1>
                <p>All upcoming events and announcements</p>
            </div>

            <motion.div className="cems-events-list" variants={container} initial="hidden" animate="show">
                {events.length === 0 ? (
                    <div className="glass-card empty-state">
                        <FiCalendar size={48} />
                        <h3>No Events Scheduled</h3>
                        <p>Events will appear here when they are created.</p>
                    </div>
                ) : (
                    events.map(event => (
                        <motion.div key={event._id} className="glass-card cems-event-item" variants={item}>
                            <div className="cems-event-date">
                                <span className="cems-date-day">
                                    {new Date(event.date).getDate()}
                                </span>
                                <span className="cems-date-month">
                                    {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                                </span>
                            </div>
                            <div className="cems-event-info">
                                <h3>{event.title}</h3>
                                <p>{event.description}</p>
                                <div className="cems-event-tags">
                                    <span className={`cems-tag ${event.category}`}>{event.category}</span>
                                    <span className="cems-tag type">{event.type === 'our_college' ? 'Our College' : 'Other College'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );
};

export default StudentCalendar;
