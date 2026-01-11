# VeilRWA Backend - Mock KYC Issuer

Mock KYC credential issuance service for VeilRWA development and testing.

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```
PORT=4000
ISSUER_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
ISSUER_PRIVATE_KEY=your_private_key
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Submit KYC Application
```
POST /api/kyc/submit
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "country": "US",
  "isAccredited": true,
  "dateOfBirth": "1990-01-01"
}
```

### Check Status
```
GET /api/kyc/status/:applicationId
```

### Get Credential
```
POST /api/kyc/credential
{
  "applicationId": "uuid"
}
```

### Get Issuer Public Key
```
GET /api/kyc/issuer-key
```
