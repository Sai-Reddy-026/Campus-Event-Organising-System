/**
 * Hackathons Page - Two clickable module cards navigating to sub-pages
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiArrowRight, FiHome, FiGlobe } from 'react-icons/fi';
import './EventPages.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const Hackathons = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><FiCode style={{ verticalAlign: 'middle', marginRight: 8 }} /> Hackathons</h1>
                <p>Participate in exciting coding challenges and win prizes</p>
            </div>

            <motion.div className="module-cards-layout" variants={container} initial="hidden" animate="show">
                {/* Our College Hackathons */}
                <motion.div
                    className="glass-card module-nav-card"
                    variants={item}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/student/hackathons/our-college')}
                >
                    <div className="module-nav-icon our-college-icon">
                        <FiHome size={36} />
                    </div>
                    <div className="module-nav-content">
                        <h2>🏫 Our College Hackathons</h2>
                        <p>Explore hackathons organized by our college. Compete with your peers and build amazing projects!</p>
                    </div>
                    <div className="module-nav-arrow">
                        <FiArrowRight size={24} />
                    </div>
                </motion.div>

                {/* Other College Hackathons */}
                <motion.div
                    className="glass-card module-nav-card"
                    variants={item}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/student/hackathons/other-college')}
                >
                    <div className="module-nav-icon other-college-icon">
                        <FiGlobe size={36} />
                    </div>
                    <div className="module-nav-content">
                        <h2>🌐 Other College Hackathons</h2>
                        <p>Discover hackathons from other colleges and universities. Expand your network and skills!</p>
                    </div>
                    <div className="module-nav-arrow">
                        <FiArrowRight size={24} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Hackathons;
