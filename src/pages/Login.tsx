import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success("Account created successfully! Please check your email to verify.");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-24 flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md px-6">
          <AnimatedSection>
            <div className="bg-gradient-card border border-border rounded-lg p-8">
              <div className="text-center mb-8">
                <span className="font-display text-2xl font-bold text-gradient-gold">Foundarly</span>
                <h1 className="font-display text-2xl font-bold mt-4">{isSignup ? "Create Account" : "Welcome Back"}</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {isSignup ? "Join the Foundarly community." : "Sign in to your account."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                    <Input
                      required
                      placeholder="John Doe"
                      className="bg-secondary border-border"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="bg-secondary border-border"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                  <Input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="bg-secondary border-border"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full glow-gold-sm" disabled={loading}>
                  {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <button onClick={() => setIsSignup(!isSignup)} className="text-primary hover:underline font-medium">
                  {isSignup ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}
