const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// router.get('/', async (req, res) => {
//   try {
//     const invoices = await Invoice.find()
//       .sort({ createdAt: -1 })
//       .select('customerName customerEmail total items createdAt')
//       .exec();
      
//     res.json(invoices);
//   } catch (error) {
//     console.error('Error fetching invoices:', error);
//     res.status(500).json({ message: 'Error fetching invoices', error: error.message });
//   }
// });

router.get('/', async (req, res) => {
  try {
    console.log('Fetching invoices...');
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .select('customerName customerEmail customerAddress total subtotal tax items createdAt')
      .exec();
    
    console.log('Found invoices:', invoices);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: 'Error creating invoice', error: error.message });
  }
});

module.exports = router;