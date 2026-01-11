const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for KYC applications (for demo only)
const kycApplications = new Map();
const issuedCredentials = new Map();

// Mock issuer configuration
const ISSUER_CONFIG = {
  address: process.env.ISSUER_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
  publicKeyX: '0x1234...', // Placeholder
  publicKeyY: '0x5678...', // Placeholder
};

// ============ API Endpoints ============

/**
 * POST /api/kyc/submit
 * Submit KYC application
 */
app.post('/api/kyc/submit', (req, res) => {
  try {
    const { firstName, lastName, email, country, isAccredited, dateOfBirth } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !country) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create application
    const applicationId = uuidv4();
    const application = {
      id: applicationId,
      firstName,
      lastName,
      email,
      country,
      isAccredited: isAccredited || false,
      dateOfBirth,
      status: 'pending',
      submittedAt: Date.now(),
    };

    kycApplications.set(applicationId, application);

    // For demo purposes, auto-approve after 2 seconds
    setTimeout(() => {
      const app = kycApplications.get(applicationId);
      if (app) {
        app.status = 'approved';
        kycApplications.set(applicationId, app);
      }
    }, 2000);

    res.json({
      applicationId,
      status: 'pending',
      estimatedTime: '2 seconds (demo)',
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/kyc/status/:applicationId
 * Check KYC application status
 */
app.get('/api/kyc/status/:applicationId', (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = kycApplications.get(applicationId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      applicationId: application.id,
      status: application.status,
      submittedAt: application.submittedAt,
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/kyc/credential
 * Issue KYC credential after approval
 */
app.post('/api/kyc/credential', (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ error: 'Missing applicationId' });
    }

    const application = kycApplications.get(applicationId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'approved') {
      return res.status(400).json({ 
        error: 'Application not approved',
        status: application.status 
      });
    }

    // Generate credential
    const userId = uuidv4();
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiryTimestamp = issuedAt + (365 * 24 * 60 * 60); // 1 year

    // Convert country code to numeric (ISO 3166-1 numeric)
    const countryMap = {
      'US': 840,
      'GB': 826,
      'SG': 702,
      'CH': 756,
      'AE': 784,
    };
    const countryCode = countryMap[application.country] || 840;

    const credential = {
      userId,
      isKYCed: true,
      country: countryCode,
      countryAlpha2: application.country,
      isAccredited: application.isAccredited,
      issuerAddress: ISSUER_CONFIG.address,
      issuedAt,
      expiryTimestamp,
      signature: {
        r: '0x' + '1'.repeat(64), // Mock signature
        s: '0x' + '2'.repeat(64), // Mock signature
      },
    };

    issuedCredentials.set(userId, credential);

    res.json({
      credential,
      issuerPublicKey: {
        x: ISSUER_CONFIG.publicKeyX,
        y: ISSUER_CONFIG.publicKeyY,
      },
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/kyc/issuer-key
 * Get issuer public key
 */
app.get('/api/kyc/issuer-key', (req, res) => {
  res.json({
    publicKey: {
      x: ISSUER_CONFIG.publicKeyX,
      y: ISSUER_CONFIG.publicKeyY,
    },
    address: ISSUER_CONFIG.address,
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeilRWA Mock KYC Issuer running on port ${PORT}`);
  console.log(`📝 Endpoints:`);
  console.log(`   POST /api/kyc/submit`);
  console.log(`   GET  /api/kyc/status/:id`);
  console.log(`   POST /api/kyc/credential`);
  console.log(`   GET  /api/kyc/issuer-key`);
});

module.exports = app;
