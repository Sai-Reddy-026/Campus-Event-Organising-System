/**
 * Reusable Event Card Component - With registration status indicator
 */
import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './EventCard.css';

const statusConfig = {
    pending: { label: 'Pending Approval', color: '#f59e0b', bg: '#fffbeb', icon: <FiClock /> },
    approved: { label: 'Approved ✓', color: '#10b981', bg: '#ecfdf5', icon: <FiCheckCircle /> },
    rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2', icon: <FiXCircle /> }
};

const EventCard = ({ event, onRegister, registrationStatus }) => {
    const status = registrationStatus ? statusConfig[registrationStatus] : null;

    return (
        <motion.div
            className="glass-card event-card"
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
        >
            {/* Event Image */}
            <div className="event-card-image">
                <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'}
                    alt={event.title}
                    loading="lazy"
                />
                <div className={`event-card-badge ${event.category}`}>
                    {event.category}
                </div>
            </div>

            {/* Card Body */}
            <div className="event-card-body">
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-desc">{event.description}</p>

                <div className="event-card-meta">
                    <span><FiCalendar /> {new Date(event.date).toLocaleDateString('en-IN', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    })}</span>
                    {event.venue && (
                        <span><FiMapPin /> {event.venue}</span>
                    )}
                </div>

                {/* Slots info */}
                <div className="event-card-slots">
                    <div className="slots-bar">
                        <div
                            className="slots-fill"
                            style={{
                                width: `${Math.min((event.booked_slots / event.total_slots) * 100, 100)}%`
                            }}
                        />
                    </div>
                    <span className="slots-text">
                        {event.booked_slots || 0}/{event.total_slots} slots filled
                    </span>
                </div>

                {/* Registration Status Indicator */}
                {status ? (
                    <div className="registration-status" style={{ color: status.color, background: status.bg }}>
                        {status.icon}
                        <span>{status.label}</span>
                    </div>
                ) : (
                    <button
                        className="btn btn-primary event-register-btn"
                        onClick={() => onRegister(event)}
                        disabled={event.booked_slots >= event.total_slots}
                    >
                        {event.booked_slots >= event.total_slots ? 'Event Full' : 'Register Now'}
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default EventCard;
