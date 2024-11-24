const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Property = require('../backend/PropertySchema');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/properties', {
   useNewUrlParser: true,
   useUnifiedTopology: true,
})
   .then(() => console.log('Connected to MongoDB'))
   .catch((error) => console.error('MongoDB connection error:', error));

// Routes

// Get all properties
app.get('/api/properties', async (req, res) => {
   try {
      const properties = await Property.find();
      res.json(properties);
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Get a single property by ID
app.get('/api/properties/:id', async (req, res) => {
   try {
      const property = await Property.findById(req.params.id);
      if (!property) return res.status(404).json({ message: 'Property not found' });
      res.json(property);
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Create a new property
app.post('/api/properties', async (req, res) => {
   try {
      const property = new Property(req.body);
      await property.save();
      res.status(201).json(property);
   } catch (error) {
      res.status(400).json({ message: error.message });
   }
});

// Update a property
app.put('/api/properties/:id', async (req, res) => {
   try {
      const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!property) return res.status(404).json({ message: 'Property not found' });
      res.json(property);
   } catch (error) {
      res.status(400).json({ message: error.message });
   }
});

// Delete a property
app.delete('/api/properties/:id', async (req, res) => {
   try {
      const property = await Property.findByIdAndDelete(req.params.id);
      if (!property) return res.status(404).json({ message: 'Property not found' });
      res.json({ message: 'Property deleted successfully' });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
