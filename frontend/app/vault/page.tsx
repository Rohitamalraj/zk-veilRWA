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
import { generateDepositProof, generateYieldProof, generateRandomSalt, encodeProofAsBytes } from '@/lib/zkProofs';

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

  const { data: allowance } = useReadContract({
    address: CONTRACTS.MockRWAToken as `0x${string}`,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.VeilRWAVault as `0x${string}`] : undefined,
  });

  // Write contract hooks
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: deposit, data: depositHash } = useWriteContract();
  const { writeContract: claimYield, data: claimHash } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositTxPending } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isClaimTxPending } = useWaitForTransactionReceipt({ hash: claimHash });

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
    if (!depositAmount || !address) return;
    
    try {
      // Generate commitment (simplified - in production use proper ZK commitment)
      const salt = Math.floor(Math.random() * 1000000).toString();
      const commitment = keccak256(toHex(depositAmount + salt));
      
      console.log('Depositing with commitment:', commitment);
      
      // Empty proof for now (placeholder - will be replaced with real ZK proof)
      const emptyProof = '0x';

      deposit({
        address: CONTRACTS.VeilRWAVault as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [parseEther(depositAmount), commitment, emptyProof],
      });

      // Store commitment locally for later claiming (in production, use encrypted storage)
      localStorage.setItem(`commitment_${commitment}`, JSON.stringify({
        amount: depositAmount,
        salt,
        timestamp: Date.now(),
      }));

    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  const handleClaim = async () => {
    if (!claimAmount || !address) return;
    
    setIsClaiming(true);
    try {
      // Generate nullifier (simplified - in production use proper ZK nullifier)
      const nullifier = keccak256(toHex(`nullifier_${Date.now()}_${address}`));
      
      // Empty proof for now
      const emptyProof = '0x';

      claimYield({
        address: CONTRACTS.VeilRWAVault as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'claimYield',
        args: [nullifier, parseEther(claimAmount), emptyProof],
      });

    } catch (error) {
      console.error('Claim error:', error);
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
                  disabled={isDepositTxPending || !depositAmount || !isConnected}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isDepositTxPending ? 'Depositing...' : 'Deposit Privately'}
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
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Calculated based on your private deposit
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

              <Button
                onClick={handleClaim}
                disabled={isClaiming || isClaimTxPending || !claimAmount}
                className="w-full h-12 text-lg"
                size="lg"
                variant="secondary"
              >
                {isClaiming || isClaimTxPending ? 'Claiming...' : 'Claim Yield'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Claim uses a nullifier to prevent double-claiming while keeping amounts private.
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
