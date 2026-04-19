const Booking = require("../models/Booking");
const crypto = require("crypto");

exports.processPayment = async (req, res, next) => {
  try {
    const { bookingId, method, cardNumber, expiry, cvv, upiId } = req.body;

    if (!bookingId || !method) {
      const error = new Error("Incomplete payment details");
      error.status = 400;
      return next(error);
    }

    if (method === "card" && (!cardNumber || !expiry || !cvv)) {
      const error = new Error("Incomplete card details");
      error.status = 400;
      return next(error);
    }

    if (method === "upi" && !upiId) {
       const error = new Error("UPI ID is required");
       error.status = 400;
       return next(error);
    }

    // Verify booking
    const booking = await Booking.findOne({ _id: bookingId, userId: req.user.userId })
        .populate('userId')
        .populate('destinationId');
        
    if (!booking) {
      const error = new Error("Booking not found");
      error.status = 404;
      return next(error);
    }

    if (booking.paymentStatus === 'paid') {
      const error = new Error("Booking has already been paid");
      error.status = 400;
      return next(error);
    }

    // SIMULATED MOCK PAYMENT DELAY
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update booking status
    booking.paymentStatus = 'paid';
    // Generate a fake mock transaction ID
    booking.transactionId = 'txn_' + crypto.randomBytes(16).toString('hex');
    await booking.save();

    // Send Electronic Verified Ticket Email
    const sendEmail = require('../utils/email');
    if (booking.userId.email) {
        setImmediate(() => {
            const htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                    <h2 style="color: #000; text-transform: uppercase;">Official Voyage Record</h2>
                    <p>Dear ${booking.userId.fullName},</p>
                    <p>Your expedition to <strong>${booking.destinationId.name}</strong> has been secured and confirmed. The transaction (ID: ${booking.transactionId}) was processed successfully.</p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                    <h3>Expedition Details:</h3>
                    <ul>
                        <li><strong>Departure:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
                        <li><strong>Crew Size:</strong> ${booking.travelers}</li>
                    </ul>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">Thank you for choosing Travaya. We look forward to guiding your journey.</p>
                </div>
            `;
            sendEmail({
                to: booking.userId.email,
                subject: `Confirmed: Your Expedition to ${booking.destinationId.name}`,
                html: htmlContent
            });
        });
    }

    res.json({
      success: true,
      transactionId: booking.transactionId,
      message: "Payment processed successfully!"
    });
  } catch (error) {
    next(error);
  }
};
