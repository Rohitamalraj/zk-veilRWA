'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheckIcon, CheckCircleIcon, LoaderIcon } from 'lucide-react';

// Import issuer (will need to adapt for frontend)
// For now, we'll create a simplified version

export default function KYCTestPage() {
  const [selectedCountry, setSelectedCountry] = useState('840'); // USA
  const [isAccredited, setIsAccredited] = useState(false);
  const [credential, setCredential] = useState<any>(null);
  const [proof, setProof] = useState<any>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const countries = [
    { code: '840', name: 'United States' },
    { code: '826', name: 'United Kingdom' },
    { code: '124', name: 'Canada' },
    { code: '276', name: 'Germany' },
    { code: '250', name: 'France' },
    { code: '392', name: 'Japan' },
    { code: '702', name: 'Singapore' },
    { code: '756', name: 'Switzerland' },
  ];

  const handleIssueCredential = async () => {
    setIsIssuing(true);
    try {
      // Mock wallet address for testing
      const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5';

      // Import the simplified issuer
      const { issueKYCCredential } = await import('../../../shared/kycIssuerSimple');
      
      const signedCredential = await issueKYCCredential(
        walletAddress,
        parseInt(selectedCountry),
        isAccredited
      );

      console.log('✅ Credential issued:', signedCredential);
      setCredential(signedCredential);
    } catch (error) {
      console.error('❌ Failed to issue credential:', error);
      alert('Failed to issue credential: ' + error);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleGenerateProof = async () => {
    if (!credential) return;

    setIsGeneratingProof(true);
    try {
      const { generateKYCProofSimple } = await import('@/lib/zkProofs');

      const currentTime = Math.floor(Date.now() / 1000);
      const allowedCountry = parseInt(selectedCountry); // MVP: match selected country

      const { proof: zkProof, publicSignals } = await generateKYCProofSimple(
        credential.credential,
        allowedCountry,
        currentTime,
        credential.signature.issuerCommitment
      );

      console.log('✅ KYC Proof generated:', zkProof);
      console.log('📊 Public signals:', publicSignals);
      setProof({ zkProof, publicSignals });

      // Verify the proof client-side
      const { verifyKYCProofSimple } = await import('@/lib/zkProofs');
      const isValid = await verifyKYCProofSimple(zkProof, publicSignals);
      console.log('🔍 Proof verification:', isValid);
      setVerificationResult(isValid);
    } catch (error) {
      console.error('❌ Failed to generate proof:', error);
      alert('Failed to generate proof: ' + error);
    } finally {
      setIsGeneratingProof(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8 pt-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheckIcon className="w-12 h-12 text-zinc-400" />
            <h1 className="text-4xl font-bold text-zinc-100">KYC ZK Testing</h1>
          </div>
          <p className="text-zinc-500">
            Test the zero-knowledge KYC credential system
          </p>
        </div>

        {/* Step 1: Issue Credential */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">
                Step 1
              </Badge>
              <h2 className="text-2xl font-semibold text-zinc-100">Issue KYC Credential</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Country</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <Checkbox
                    checked={isAccredited}
                    onCheckedChange={(checked) => setIsAccredited(checked as boolean)}
                  />
                  Accredited Investor
                </label>
              </div>
            </div>

            <Button
              onClick={handleIssueCredential}
              disabled={isIssuing || !!credential}
              className="w-full"
            >
              {isIssuing ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  Issuing Credential...
                </>
              ) : credential ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Credential Issued
                </>
              ) : (
                'Issue KYC Credential'
              )}
            </Button>

            {credential && (
              <div className="mt-4 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 space-y-2">
                <h3 className="text-sm font-semibold text-zinc-300">Credential Details:</h3>
                <div className="text-xs text-zinc-400 space-y-1">
                  <p>• KYC Status: {credential.credential.isKYCed ? 'Verified' : 'Not Verified'}</p>
                  <p>• Country: {countries.find(c => c.code === credential.credential.countryCode.toString())?.name}</p>
                  <p>• Accredited: {credential.credential.isAccredited ? 'Yes' : 'No'}</p>
                  <p>• Expiry: {new Date(credential.credential.expiry * 1000).toLocaleDateString()}</p>
                  <p>• User Secret: {credential.credential.userSecret.slice(0, 20)}...</p>
                  <p>• Credential Salt: {credential.credential.credentialSalt.slice(0, 20)}...</p>
                  <p>• Issuer Commitment: {credential.signature.issuerCommitment.slice(0, 30)}...</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Step 2: Generate ZK Proof */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">
                Step 2
              </Badge>
              <h2 className="text-2xl font-semibold text-zinc-100">Generate ZK Proof</h2>
            </div>

            <p className="text-sm text-zinc-400">
              Generate a zero-knowledge proof that you have a valid KYC credential without revealing any personal information.
            </p>

            <Button
              onClick={handleGenerateProof}
              disabled={!credential || isGeneratingProof || !!proof}
              className="w-full"
            >
              {isGeneratingProof ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  🔐 Generating ZK Proof...
                </>
              ) : proof ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Proof Generated
                </>
              ) : (
                'Generate ZK Proof'
              )}
            </Button>

            {proof && (
              <div className="mt-4 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 space-y-2">
                <h3 className="text-sm font-semibold text-zinc-300">Proof Details:</h3>
                <div className="text-xs text-zinc-400 space-y-1">
                  <p>• Proof Type: Groth16</p>
                  <p>• Curve: bn128</p>
                  <p>• Public Signals: {proof.publicSignals.length}</p>
                  <p className="text-yellow-400">• pi_a: [{proof.zkProof.pi_a[0].slice(0, 15)}..., {proof.zkProof.pi_a[1].slice(0, 15)}...]</p>
                  <p className="text-blue-400">• pi_b: [...]</p>
                  <p className="text-green-400">• pi_c: [{proof.zkProof.pi_c[0].slice(0, 15)}..., {proof.zkProof.pi_c[1].slice(0, 15)}...]</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Step 3: Verification Result */}
        {verificationResult !== null && (
          <Card className={`p-6 border-2 ${verificationResult ? 'bg-zinc-900/50 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800'}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={verificationResult ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}>
                  Step 3
                </Badge>
                <h2 className="text-2xl font-semibold text-zinc-100">Verification Result</h2>
              </div>

              <div className={`text-center py-8 ${verificationResult ? 'text-zinc-300' : 'text-zinc-400'}`}>
                {verificationResult ? (
                  <>
                    <CheckCircleIcon className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">✅ Proof Verified!</h3>
                    <p className="text-zinc-500 mt-2">
                      The ZK proof is cryptographically valid. This proves eligibility without revealing personal data.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">❌</span>
                    </div>
                    <h3 className="text-2xl font-bold">Proof Invalid</h3>
                    <p className="text-zinc-500 mt-2">
                      The ZK proof verification failed.
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Info */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">How it works</h3>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li>1. <strong>Credential Issuance:</strong> A KYC provider signs your credentials using EdDSA</li>
            <li>2. <strong>Proof Generation:</strong> You generate a ZK proof that proves credential validity without revealing personal data</li>
            <li>3. <strong>Verification:</strong> The proof can be verified on-chain without exposing your identity</li>
            <li>4. <strong>Privacy:</strong> Only your eligibility is proven - no PII is revealed!</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
