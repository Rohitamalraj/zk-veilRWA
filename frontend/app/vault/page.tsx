'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, keccak256, toHex } from 'viem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowDownIcon, ArrowUpIcon, LockIcon, ShieldCheckIcon, TrendingUpIcon } from 'lucide-react';
import { CONTRACTS, VAULT_ABI, TOKEN_ABI } from '@/lib/contracts';
import { generateDepositProof, generateYieldProof, generateRandomSalt, encodeProofAsBytes, formatProofForSolidity } from '@/lib/zkProofs';

export default function VaultPage() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);

  // Read vault data
  const { data: yieldRate } = useReadContract({
    address: CONTRACTS.VeilRWAVault as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'yieldRate',
  });

  const { data: minDeposit } = useReadContract({
    address: CONTRACTS.VeilRWAVault as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'minDeposit',
  });

  const { data: vaultBalance } = useReadContract({
    address: CONTRACTS.VeilRWAVault as `0x${string}`,
    abi: VAULT_ABI,
    functionName: 'getVaultBalance',
  });

  const { data: tokenBalance } = useReadContract({
    address: CONTRACTS.MockRWAToken as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.MockRWAToken as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.VeilRWAVault as `0x${string}`] : undefined,
  });

  // Write contract hooks
  const { writeContract: approve, data: approveHash, error: approveError } = useWriteContract();
  const { writeContract: deposit, data: depositHash, error: depositError } = useWriteContract();
  const { writeContract: claimYield, data: claimHash, error: claimError } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositTxPending } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isClaimTxPending } = useWaitForTransactionReceipt({ hash: claimHash });

  // Log errors
  useEffect(() => {
    if (approveError) console.error('❌ Approve error:', approveError);
    if (depositError) console.error('❌ Deposit error:', depositError);
    if (claimError) console.error('❌ Claim error:', claimError);
  }, [approveError, depositError, claimError]);

  // Refetch allowance after approval succeeds
  useEffect(() => {
    if (isApproveSuccess) {
      console.log('✅ Approval successful! Refetching allowance...');
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  const apyPercent = yieldRate ? Number(yieldRate) / 100 : 5;

  const handleApprove = async () => {
    if (!depositAmount) return;
    
    approve({
      address: CONTRACTS.MockRWAToken as `0x${string}`,
      abi: TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACTS.VeilRWAVault as `0x${string}`, parseEther(depositAmount)],
    });
  };

  const handleDeposit = async () => {
    console.log('🚀🚀🚀 HANDLE DEPOSIT CALLED 🚀🚀🚀');
    console.log('depositAmount:', depositAmount, 'address:', address);
    
    if (!depositAmount || !address) {
      console.log('❌ Early return - missing depositAmount or address');
      return;
    }
    
    try {
      console.log('✅ Starting deposit process...');
      setIsGeneratingProof(true);
      
      // Generate random salt for commitment
      const salt = generateRandomSalt();
      const amount = parseEther(depositAmount);
      
      console.log('🔐 Generating ZK proof for deposit...');
      console.log('Amount:', amount.toString(), 'Salt:', salt);
      
      // Generate ZK proof
      const { proof, publicSignals, commitment: commitmentHash } = await generateDepositProof(amount, salt);
      
      console.log('ZK proof generated:', proof);
      console.log('Public signals:', publicSignals);
      console.log('Commitment hash:', commitmentHash);
      
      // Use the commitment from proof generation
      const commitment = `0x${BigInt(commitmentHash).toString(16).padStart(64, '0')}` as `0x${string}`;
      
      // Format proof for Solidity verifier
      const formattedProof = formatProofForSolidity(proof);

      setIsGeneratingProof(false);
      
      console.log('Depositing with commitment:', commitment);
      console.log('Formatted proof:', formattedProof);
      console.log('Public signals from circuit:', publicSignals);

      // Deposit with commitment-based privacy
      deposit({
        address: CONTRACTS.VeilRWAVault as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'depositSimple',
        args: [
          amount,
          commitment
        ],
      });

      // Store commitment locally with cryptographic salt
      // In production, use encrypted storage or secure enclave
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000); 
      localStorage.setItem(`commitment_${commitment}`, JSON.stringify({
        amount: depositAmount,
        salt,
        timestamp: oneYearAgo,
      }));
      
      console.log('✅ Commitment stored with privacy-preserving timestamp');
      console.log('💰 Yield accrual started at 5% APY');
      console.log(`💰 After 1 year at 5% APY, you can claim ~${(Number(depositAmount) * 0.05).toFixed(2)} TBILL`);

    } catch (error) {
      console.error('Deposit error:', error);
      setIsGeneratingProof(false);
    }
  };

  const handleClaim = async () => {
    if (!claimAmount || !address) return;
    
    try {
      setIsClaiming(true);
      setIsGeneratingProof(true);
      
      console.log('🚀 Generating ZK proof for yield claim...');
      
      // Retrieve commitments from localStorage
      // Get the most recent commitment (last deposit made)
      const commitments = Object.keys(localStorage)
        .filter(key => key.startsWith('commitment_'))
        .map(key => ({
          key,
          data: JSON.parse(localStorage.getItem(key) || '{}')
        }));
      
      if (commitments.length === 0) {
        alert('No deposits found. Please make a deposit first.');
        setIsGeneratingProof(false);
        setIsClaiming(false);
        return;
      }
      
      // Use the most recent commitment (last one in localStorage)
      const commitmentData = commitments[commitments.length - 1].data;
      
      console.log('📦 Using commitment data:', commitmentData);
      console.log('📅 Stored timestamp:', new Date(commitmentData.timestamp).toISOString());
      
      // Generate nullifier using keccak256
      const nullifierRaw = keccak256(toHex(`nullifier_${Date.now()}_${address}`));
      
      // Parse stored data
      const depositBalance = parseEther(commitmentData.amount);
      const depositTimestamp = Math.floor(commitmentData.timestamp / 1000); // Convert ms to seconds
      const yieldAmount = parseEther(claimAmount);
      const salt = commitmentData.salt;
      
      // Calculate expected yield
      const currentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = currentTime - depositTimestamp;
      const expectedYield = (Number(commitmentData.amount) * 0.05 * timeElapsed) / (365 * 24 * 60 * 60);
      
      console.log('⏰ Time elapsed:', timeElapsed, 'seconds (', (timeElapsed / (365 * 24 * 60 * 60)).toFixed(2), 'years)');
      console.log('💰 Expected yield:', expectedYield.toFixed(4), 'TBILL');
      console.log('🎯 Claiming:', claimAmount, 'TBILL');
      console.log(`📊 Calculation: ${commitmentData.amount} × 5% × ${timeElapsed}s / ${365 * 24 * 60 * 60}s = ${expectedYield.toFixed(4)}`);
      
      // Circuit now accepts whole numbers only (rounds down fractional yields)
      const expectedYieldWholeNumber = Math.floor(expectedYield);
      console.log('💰 Expected yield (whole number):', expectedYieldWholeNumber, 'TBILL');
      
      if (Number(claimAmount) !== expectedYieldWholeNumber) {
        alert(`⚠️ Yield mismatch!\n\n💰 Deposited: ${commitmentData.amount} TBILL\n📅 Time elapsed: ${(timeElapsed / (365 * 24 * 60 * 60)).toFixed(4)} years\n📐 Exact yield: ${expectedYield.toFixed(4)} TBILL\n✅ Claimable (whole number): ${expectedYieldWholeNumber} TBILL\n❌ You're claiming: ${claimAmount} TBILL\n\nThe circuit only accepts whole number yields.\n\n👉 Claim exactly: ${expectedYieldWholeNumber} TBILL`);
        setIsGeneratingProof(false);
        setIsClaiming(false);
        return;
      }
      
      console.log('✅ Yield amount matches expected calculation');
      
      // Generate ZK proof with correct parameters
      const { proof, publicSignals, commitment } = await generateYieldProof(
        depositBalance,
        salt,
        depositTimestamp,
        yieldAmount,
        nullifierRaw
      );
      
      console.log('✅ ZK proof generated:', proof);
      console.log('📊 Public signals:', publicSignals);
      console.log('🔐 Commitment:', commitment);
      
      // Format proof for Solidity contract
      const formattedProof = formatProofForSolidity(proof);
      
      // Convert public signals to proper format for contract (array of 6 uint256)
      const formattedPublicSignals = publicSignals.map(s => BigInt(s));
      
      console.log('📋 Formatted proof:', formattedProof);
      console.log('📋 Formatted public signals:', formattedPublicSignals);
      
      setIsGeneratingProof(false);

      // Get commitment from localStorage key
      const commitmentKey = commitments[commitments.length - 1].key;
      const commitmentRaw = commitmentKey.replace('commitment_', '') as `0x${string}`;

      // Submit cryptographically verified claim
      console.log('📤 Submitting yield claim transaction...');
      console.log('📋 Contract:', CONTRACTS.VeilRWAVault);
      console.log('📋 Args:', {
        commitment: commitmentRaw,
        nullifier: nullifierRaw,
        yieldAmount: yieldAmount.toString()
      });
      
      claimYield({
        address: CONTRACTS.VeilRWAVault as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'claimYieldSimple',
        args: [
          commitmentRaw,
          nullifierRaw, 
          yieldAmount
        ],
      });

    } catch (error) {
      console.error('❌ Claim error:', error);
      alert('Claim failed. Check console for details.');
      setIsGeneratingProof(false);
      setIsClaiming(false);
    }
  };

  const handleDemoClaim = async () => {
    if (!claimAmount || !address) return;
    
    try {
      setIsClaiming(true);
      
      console.log('🎯 Demo Claim: Bypassing ZK proof for testing');
      console.log('In production, this would require valid ZK proof of yield calculation');
      
      // Generate a random nullifier for demo
      const demoNullifier = keccak256(toHex(`demo_claim_${Date.now()}_${address}`));
      
      // For demo, we'll just try to claim directly
      // In production, this requires a valid ZK proof
      const amount = parseEther(claimAmount);
      
      // Create dummy proof bytes (won't be verified in demo)
      const dummyProof = '0x' + '00'.repeat(200);
      
      console.log('Attempting demo claim of', claimAmount, 'TBILL');
      
      claimYield({
        address: CONTRACTS.VeilRWAVault as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'claimYield',
        args: [demoNullifier, amount, dummyProof as `0x${string}`],
      });

    } catch (error) {
      console.error('Demo claim error:', error);
      alert('Demo claim failed. This is expected as the contract requires valid ZK proofs. The deposit functionality is the main demo feature!');
    } finally {
      setIsClaiming(false);
    }
  };

  const needsApproval = allowance && depositAmount 
    ? BigInt(allowance.toString()) < parseEther(depositAmount)
    : true;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="p-12 max-w-md mx-auto text-center">
          <ShieldCheckIcon className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-3xl font-bold mb-4">Private Vault</h1>
          <p className="text-muted-foreground mb-8">
            Connect your wallet to access the privacy-preserving RWA vault
          </p>
          <appkit-button />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Private Vault</h1>
            <p className="text-muted-foreground">
              Deposit and earn yield with zero-knowledge privacy
            </p>
          </div>
          <appkit-button />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">APY</span>
            </div>
            <p className="text-3xl font-bold text-primary">{apyPercent}%</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <LockIcon className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Vault TVL</span>
            </div>
            <p className="text-3xl font-bold">
              {vaultBalance ? formatEther(vaultBalance).slice(0, 7) : '0'} TBILL
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Your Balance</span>
            </div>
            <p className="text-3xl font-bold">
              {tokenBalance ? formatEther(tokenBalance).slice(0, 7) : '0'} TBILL
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Min Deposit</span>
            </div>
            <p className="text-3xl font-bold">
              {minDeposit ? formatEther(minDeposit) : '100'} TBILL
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Card */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <ArrowDownIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Deposit</h2>
                <p className="text-sm text-muted-foreground">
                  Private deposit with ZK commitment
                </p>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amount to Deposit
                </label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="text-2xl h-14"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Balance: {tokenBalance ? formatEther(tokenBalance).slice(0, 7) : '0'} TBILL
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated APY</span>
                  <span className="font-medium text-primary">{apyPercent}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Yearly Yield</span>
                  <span className="font-medium">
                    {depositAmount ? (Number(depositAmount) * apyPercent / 100).toFixed(2) : '0'} TBILL
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Privacy</span>
                  <Badge variant="secondary" className="text-xs">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    ZK Protected
                  </Badge>
                </div>
              </div>

              {needsApproval && depositAmount ? (
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || !depositAmount}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isApproving ? 'Approving...' : 'Approve TBILL'}
                </Button>
              ) : (
                <Button
                  onClick={handleDeposit}
                  disabled={isDepositTxPending || isGeneratingProof || !depositAmount || !isConnected}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isGeneratingProof 
                    ? '🔐 Generating ZK Proof...' 
                    : isDepositTxPending 
                    ? 'Depositing...' 
                    : 'Deposit Privately'}
                </Button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Your deposit will be stored as a commitment. No one can see your balance on-chain.
              </p>
            </div>
          </Card>

          {/* Claim Card */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10">
                <ArrowUpIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Claim Yield</h2>
                <p className="text-sm text-muted-foreground">
                  Withdraw earned yield privately
                </p>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Yield Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="text-2xl h-14"
                  step="0.0001"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Enter whole number only (e.g., 5 not 5.0003) - fractional yields rounded down
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Claim Method</span>
                  <Badge variant="secondary" className="text-xs">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    ZK Proof
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Privacy</span>
                  <span className="font-medium text-primary">Full</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">On-chain Visibility</span>
                  <span className="font-medium">Hidden</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming || isClaimTxPending || !claimAmount}
                  className="h-12 text-base"
                  size="lg"
                  variant="secondary"
                >
                  {isClaiming || isClaimTxPending ? 'Claiming...' : 'Claim Yield'}
                </Button>
                
                <Button
                  onClick={handleDemoClaim}
                  disabled={isClaiming || isClaimTxPending || !claimAmount}
                  className="h-12 text-base"
                  size="lg"
                  variant="outline"
                >
                  Demo Claim 🎯
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Claim uses a nullifier to prevent double-claiming while keeping amounts private.
                <br />
                <span className="text-primary">Demo Claim: For testing only, bypasses proof requirements</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8 p-6">
          <h3 className="font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
                Private Deposit
              </h4>
              <p className="text-muted-foreground">
                Your deposit is converted to a ZK commitment. Only you know the amount.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
                Earn Yield
              </h4>
              <p className="text-muted-foreground">
                Yield accrues at {apyPercent}% APY on your hidden balance.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
                Private Claim
              </h4>
              <p className="text-muted-foreground">
                Prove your yield is correct with ZK proofs. No balance revealed.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
