import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Lock, Coins, ChevronRight, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-zinc-950 to-emerald-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_65%)]" />
        
        <div className="relative container mx-auto px-4 py-24 sm:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge variant="outline" className="border-violet-500/50 text-violet-400 px-4 py-1.5">
              <Zap className="w-3 h-3 mr-2" />
              Built on Mantle Network
            </Badge>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight bg-gradient-to-br from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent max-w-4xl">
              Privacy-Preserving RealFi on Mantle
            </h1>
            
            <p className="text-xl sm:text-2xl text-zinc-400 max-w-3xl">
              Compliant access to real-world yield using zero-knowledge proofs. Prove eligibility without revealing identity, balances, or strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8">
                Launch App
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                Read Documentation
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-zinc-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-400">ZK Proofs</div>
                <div className="text-sm text-zinc-500 mt-1">Privacy First</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">Compliant</div>
                <div className="text-sm text-zinc-500 mt-1">KYC Verified</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">5% APY</div>
                <div className="text-sm text-zinc-500 mt-1">Fixed Yield</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The RealFi Dilemma</h2>
            <p className="text-xl text-zinc-400">
              In 2025, RWAs hit a wall: Compliance demands identity, but users demand privacy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-zinc-900 border-red-900/30">
              <CardHeader>
                <CardTitle className="text-red-400">Current RWA Protocols</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">✗</div>
                  <div>
                    <div className="font-medium">Wallet Whitelists</div>
                    <div className="text-sm text-zinc-500">Identity permanently linked</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">✗</div>
                  <div>
                    <div className="font-medium">Transparent Balances</div>
                    <div className="text-sm text-zinc-500">Position exposure on-chain</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-400 mt-1">✗</div>
                  <div>
                    <div className="font-medium">Public Yields</div>
                    <div className="text-sm text-zinc-500">Strategy disclosure required</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-emerald-900/30">
              <CardHeader>
                <CardTitle className="text-emerald-400">VeilRWA Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-emerald-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium">ZK-KYC Credentials</div>
                    <div className="text-sm text-zinc-500">Selective disclosure only</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-emerald-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium">Private Commitments</div>
                    <div className="text-sm text-zinc-500">Balance never revealed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-emerald-400 mt-1">✓</div>
                  <div>
                    <div className="font-medium">ZK Yield Proofs</div>
                    <div className="text-sm text-zinc-500">Correctness without disclosure</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-zinc-400">
              Five simple steps to private, compliant yield
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                icon: Shield,
                title: "Complete KYC",
                description: "Off-chain verification, receive ZK credential"
              },
              {
                step: "2",
                icon: Lock,
                title: "Generate Proof",
                description: "Prove eligibility without revealing identity"
              },
              {
                step: "3",
                icon: Coins,
                title: "Deposit Funds",
                description: "Balance stored as commitment, fully private"
              },
              {
                step: "4",
                icon: Eye,
                title: "Earn Yield",
                description: "5% APY accumulates over time"
              },
              {
                step: "5",
                icon: Zap,
                title: "Claim Privately",
                description: "ZK proof verifies yield without revealing amount"
              }
            ].map((item) => (
              <Card key={item.step} className="bg-zinc-900 border-zinc-800 text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="text-sm text-violet-400 font-semibold">Step {item.step}</div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ZK Magic Section */}
      <section className="py-24 border-b border-zinc-800 bg-gradient-to-b from-zinc-950 to-violet-950/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-4">
                Core Innovation
              </Badge>
              <h2 className="text-4xl font-bold mb-4">What the ZK Proof Asserts</h2>
              <p className="text-xl text-zinc-400">
                Not just zk-login — this is zk-correctness for yield
              </p>
            </div>
            
            <Card className="bg-zinc-900 border-violet-900/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-violet-400 font-bold">1</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">Valid KYC Credential</div>
                    <div className="text-zinc-400">
                      The prover holds a valid, unexpired KYC credential signed by authorized issuer
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-violet-400 font-bold">2</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">Regulatory Compliance</div>
                    <div className="text-zinc-400">
                      Credential attributes satisfy rules (jurisdiction, accreditation status)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-violet-400 font-bold">3</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">Commitment Ownership</div>
                    <div className="text-zinc-400">
                      The prover owns a commitment C corresponding to deposited balance B
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-violet-400 font-bold">4</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">Yield Correctness</div>
                    <div className="text-zinc-400">
                      Yield Y is computed correctly as Y = B × rate × time_elapsed
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-violet-400 font-bold">5</span>
                  </div>
                  <div>
                    <div className="font-semibold text-lg mb-1">Zero Information Leakage</div>
                    <div className="text-zinc-400">
                      No information about B, Y, or identity is revealed on-chain
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mantle Advantage */}
      <section className="py-24 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Mantle Network?</h2>
              <p className="text-xl text-zinc-400">
                VeilRWA is only practical because of Mantle
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>⚡ Low Gas Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">
                    Frequent ZK proof verification becomes economically viable with Mantle's low fees
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>🚀 High Throughput</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">
                    Consumer-grade UX with fast transaction finality for proof submissions
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>🔧 EVM Compatible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">
                    Easy deployment of Solidity verifier contracts and existing tooling
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>🏦 RealFi Ecosystem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">
                    Perfect fit for Mantle's institutional DeFi and real-world asset narrative
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Experience Private RealFi?</h2>
            <p className="text-xl text-zinc-400 mb-8">
              Join the future of compliant, privacy-preserving yield on Mantle Network
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8">
                Launch App
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                View on GitHub
              </Button>
            </div>
            
            <div className="mt-12 pt-12 border-t border-zinc-800">
              <p className="text-sm text-zinc-500">
                <strong className="text-zinc-400">Compliance Notice:</strong> MVP uses mock/simulated RWAs. 
                Designed to integrate with licensed issuers. No custody of real regulated assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              VeilRWA
            </div>
            
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="#" className="hover:text-zinc-300 transition">Documentation</Link>
              <Link href="#" className="hover:text-zinc-300 transition">GitHub</Link>
              <Link href="#" className="hover:text-zinc-300 transition">Twitter</Link>
              <Link href="#" className="hover:text-zinc-300 transition">Discord</Link>
            </div>
            
            <div className="text-sm text-zinc-500">
              Built for Mantle Global Hackathon 2025
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
