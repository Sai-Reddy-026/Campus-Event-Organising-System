/**
 * Games Page - Two clickable module cards navigating to sub-pages
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAward, FiArrowRight, FiHome, FiGlobe } from 'react-icons/fi';
import './EventPages.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const Games = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><FiAward style={{ verticalAlign: 'middle', marginRight: 8 }} /> Games & Sports</h1>
                <p>Compete in exciting sports events and showcase your athletic skills</p>
            </div>

            <motion.div className="module-cards-layout" variants={container} initial="hidden" animate="show">
                {/* Our College Games */}
                <motion.div
                    className="glass-card module-nav-card"
                    variants={item}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/student/games/our-college')}
                >
                    <div className="module-nav-icon our-college-icon">
                        <FiHome size={36} />
                    </div>
                    <div className="module-nav-content">
                        <h2>🏫 Our College Games</h2>
                        <p>Participate in sports tournaments organized by our college. Show your athletic prowess!</p>
                    </div>
                    <div className="module-nav-arrow">
                        <FiArrowRight size={24} />
                    </div>
                </motion.div>

                {/* Other College Games */}
                <motion.div
                    className="glass-card module-nav-card"
                    variants={item}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/student/games/other-college')}
                >
                    <div className="module-nav-icon other-college-icon">
                        <FiGlobe size={36} />
                    </div>
                    <div className="module-nav-content">
                        <h2>🌐 Other College Games</h2>
                        <p>Compete in inter-college sports events. Represent your college on a bigger stage!</p>
                    </div>
                    <div className="module-nav-arrow">
                        <FiArrowRight size={24} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Games;
