import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

const AGE_VERIFICATION_KEY = "ai_viral_age_verified";
const AGE_VERIFICATION_TIMESTAMP = "ai_viral_age_verified_at";
const VERIFICATION_EXPIRY_DAYS = 365; // 1 year

interface AgeVerificationModalProps {
  onVerified: () => void;
}

export default function AgeVerificationModal({ onVerified }: AgeVerificationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyAgeMutation = trpc.auth.verifyAge.useMutation();

  useEffect(() => {
    // Check if user has already verified age
    const verified = localStorage.getItem(AGE_VERIFICATION_KEY);
    const verifiedAt = localStorage.getItem(AGE_VERIFICATION_TIMESTAMP);

    if (verified && verifiedAt) {
      const verificationDate = new Date(verifiedAt);
      const expiryDate = new Date(verificationDate.getTime() + VERIFICATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      if (new Date() < expiryDate) {
        onVerified();
        return;
      }
    }

    // Show modal if not verified
    setIsOpen(true);
  }, [onVerified]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const handleVerify = async () => {
    setError("");

    if (!birthDate) {
      setError("Please enter your birth date");
      return;
    }

    const age = calculateAge(birthDate);

    if (age < 18) {
      setError("You must be at least 18 years old to use this service");
      return;
    }

    if (age > 120) {
      setError("Please enter a valid birth date");
      return;
    }

    try {
      setIsLoading(true);

      // Save to localStorage
      localStorage.setItem(AGE_VERIFICATION_KEY, "true");
      localStorage.setItem(AGE_VERIFICATION_TIMESTAMP, new Date().toISOString());

      // Save to database via tRPC
      await verifyAgeMutation.mutateAsync({ birthDate });

      setIsOpen(false);
      onVerified();
    } catch (err) {
      setError("Failed to verify age. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  if (!isOpen) {
    return null;
  }

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-400" />
            Age Verification
          </CardTitle>
          <CardDescription>
            We require users to be at least 18 years old to use AI Viral Creation
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              This is required to comply with content generation policies. Your birth date will be securely stored and never shared.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Birth Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                max={maxDate}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-400">Format: YYYY-MM-DD</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleVerify}
              disabled={isLoading || !birthDate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? "Verifying..." : "Verify Age"}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              By proceeding, you confirm that you are at least 18 years old
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
