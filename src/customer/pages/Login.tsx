import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { signIn, sendPasswordReset } from "../../services/auth";
import { validateLoginForm } from "../../utils/authValidation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (currentUser) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Login failed.");
      setErrors({ form: error.message || "Login failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    setResetLoading(true);
    try {
      const result = await sendPasswordReset(email);
      if (result.success) {
        toast.success(result.message!);
        setShowForgotPassword(false);
      } else {
        toast.error(result.message!);
      }
    } catch (_error) {
      toast.error("Failed to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Welcome back to Camera World</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-sm text-error-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-sm text-error-500">{errors.password}</p>}
            </div>
            <div className="text-right">
              <Button
                type="button"
                variant="link"
                onClick={() => setShowForgotPassword(true)}
                disabled={loading}
              >
                Forgot your password?
              </Button>
            </div>
            {errors.form && (
              <div className="flex items-center space-x-2 text-sm text-error-500 bg-error-100 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.form}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block">
          <p className="text-sm text-neutral-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      <Modal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        title="Reset Password"
        description="Enter your email and we'll send you a link to reset your password."
      >
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label htmlFor="reset-email">Email Address</label>
                <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={resetLoading}
                />
            </div>
        </div>
        <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setShowForgotPassword(false)} disabled={resetLoading}>
                Cancel
            </Button>
            <Button onClick={handleForgotPassword} disabled={resetLoading || !email}>
                {resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;