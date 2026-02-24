/**
 * Letters Routes - PDF Approval Letter generation (MongoDB)
 */
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Registration = require('../models/Registration');
const { isAuthenticated } = require('../middleware/auth');

// GET /api/letters/:registrationId - Generate and download PDF approval letter
router.get('/:registrationId', isAuthenticated, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.registrationId).populate('event');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Access control
        if (req.user.role !== 'admin' && registration.email !== req.user.email) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Only allow download for approved registrations
        if (registration.status !== 'approved') {
            return res.status(400).json({ message: 'Letter is only available for approved registrations' });
        }

        if (!registration.event) {
            return res.status(400).json({ message: 'Event details missing for this registration' });
        }

        const eventTitle = registration.event.title;
        const eventDate = registration.event.date;
        const category = registration.event.category;
        const studentId = registration.studentId || 'N/A';
        const approvalDate = registration.approvalDate || new Date();

        // Create PDF
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 60, bottom: 60, left: 60, right: 60 }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename=approval_letter_${registration.name.replace(/\s+/g, '_')}_${eventTitle.replace(/\s+/g, '_')}.pdf`
        );

        doc.pipe(res);

        // ─── Header Banner ─────────────────────────────────────
        doc.rect(0, 0, 595, 130).fill('#0a1628');

        // Gold accent line
        doc.rect(0, 130, 595, 4).fill('#d4a843');

        doc.fillColor('#ffffff')
            .fontSize(26)
            .font('Helvetica-Bold')
            .text('College Event Management System', 60, 30, { align: 'center' });

        doc.fontSize(14)
            .font('Helvetica')
            .fillColor('#d4a843')
            .text('OFFICIAL APPROVAL LETTER', 60, 68, { align: 'center' });

        doc.fontSize(10)
            .fillColor('#94a3b8')
            .text(`Reference: APR-${registration._id.toString().slice(-8).toUpperCase()}`, 60, 95, { align: 'center' });

        // ─── Date ─────────────────────────────────────
        doc.fillColor('#475569')
            .fontSize(10)
            .text(`Date: ${new Date(approvalDate).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
            })}`, 60, 155, { align: 'right' });

        // ─── Recipient ─────────────────────────────────────
        doc.fillColor('#1e293b')
            .fontSize(12)
            .font('Helvetica')
            .text('To,', 60, 185);

        doc.font('Helvetica-Bold')
            .fontSize(14)
            .fillColor('#0a1628')
            .text(registration.name, 60, 205);

        doc.font('Helvetica')
            .fontSize(11)
            .fillColor('#475569')
            .text(`Student ID: ${studentId}`, 60, 225)
            .text(`Email: ${registration.email}`, 60, 242)
            .text(`College: ${registration.college}`, 60, 259)
            .text(`Department: ${registration.department}`, 60, 276)
            .text(`Year: ${registration.year}`, 60, 293);

        // ─── Subject ─────────────────────────────────────
        doc.moveDown(2);
        doc.font('Helvetica-Bold')
            .fontSize(13)
            .fillColor('#0a1628')
            .text(`Subject: Official Approval of Registration — ${eventTitle}`, 60, 325);

        // ─── Letter Body ─────────────────────────────────────
        doc.moveDown(1.5);
        doc.font('Helvetica')
            .fontSize(11)
            .fillColor('#334155')
            .text(
                `Dear ${registration.name},\n\n` +
                `We are pleased to inform you that your registration for the event "${eventTitle}" ` +
                `has been officially APPROVED by the administration.\n\n` +
                `This letter serves as your official confirmation of participation. ` +
                `Please find the event details below:`,
                60, 355, { width: 475, lineGap: 5 }
            );

        // ─── Event Details Box ─────────────────────────────────────
        const detailsY = 455;
        // Box background
        doc.rect(60, detailsY, 475, 110)
            .lineWidth(1.5)
            .fillAndStroke('#f8fafc', '#0a1628');

        // Gold accent strip on left
        doc.rect(60, detailsY, 5, 110).fill('#d4a843');

        doc.font('Helvetica-Bold').fontSize(12).fillColor('#0a1628')
            .text('📋 Event Details', 80, detailsY + 15);

        doc.font('Helvetica').fontSize(10).fillColor('#334155')
            .text(`Event Name: ${eventTitle}`, 80, detailsY + 38)
            .text(`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`, 80, detailsY + 55)
            .text(`Date: ${new Date(eventDate).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}`, 80, detailsY + 72)
            .text(`Status: ✅ APPROVED`, 80, detailsY + 89);

        // ─── Approval Signature ─────────────────────────────────────
        doc.font('Helvetica')
            .fontSize(10)
            .fillColor('#334155')
            .text('With best regards,', 60, 600);

        doc.moveDown(2);
        doc.font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#0a1628')
            .text('_________________________', 60, 638)
            .text('Event Coordinator', 60, 656)
            .text('College Event Management System', 60, 672);

        // Approval stamp
        doc.save()
            .translate(400, 620)
            .rotate(-15)
            .rect(-40, -20, 130, 40)
            .lineWidth(2)
            .stroke('#16a34a');

        doc.fillColor('#16a34a')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('APPROVED', -30, -12);

        doc.restore();

        // ─── Footer ─────────────────────────────────────
        doc.rect(0, 770, 595, 50).fill('#0a1628');
        doc.rect(0, 770, 595, 3).fill('#d4a843');

        doc.fillColor('#94a3b8')
            .fontSize(8)
            .text('This is a system-generated document. No physical signature required.', 60, 782, {
                align: 'center', width: 475
            })
            .text(`Generated on: ${new Date().toLocaleString('en-IN')} | Student ID: ${studentId}`, 60, 795, {
                align: 'center', width: 475
            });

        doc.end();
    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ message: 'Error generating letter' });
    }
});

module.exports = router;
