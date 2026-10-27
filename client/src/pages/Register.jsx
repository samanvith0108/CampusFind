import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getApiErrorMessage } from '../utils/apiError';

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+=\-{}[\]:;"'<>,.?\/\\|~`])/;

const calculatePasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: 'Too short', color: 'bg-slate-200' };
  const score = [
    pass.length >= 8,
    /[a-z]/.test(pass),
    /[A-Z]/.test(pass),
    /\d/.test(pass),
    /[@$!%*?&^#()_+=\-{}[\]:;"'<>,.?\/\\|~`]/.test(pass),
  ].filter(Boolean).length;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score === 4) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
};

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password', '');
  const strength = calculatePasswordStrength(watchedPassword);

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      await registerAuth({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setAuthError(getApiErrorMessage(err, 'Registration failed. Please check your details.'));
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Visual Branding Panel */}
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center space-x-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight">CampusFind</span>
            </div>

            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Join Campus Network
              </span>
              <h2 className="text-3xl font-extrabold leading-tight">
                Create your student verified profile.
              </h2>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                Connect with peers across departments. Report missing items, return found possessions, and earn campus trust.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 space-y-3">
            <div className="flex items-center text-xs text-indigo-200">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400 shrink-0" />
              <span>Official @sst.scaler.com institutional account</span>
            </div>
            <div className="flex items-center text-xs text-indigo-200">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400 shrink-0" />
              <span>Private ownership verification workflows</span>
            </div>
            <div className="flex items-center text-xs text-indigo-200">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400 shrink-0" />
              <span>Real-time notifications on item discoveries</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create an Account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Fill in your university details to get started.
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be between 2 and 100 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Name must be between 2 and 100 characters',
                    },
                  })}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Campus Email (@sst.scaler.com)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  placeholder="student@sst.scaler.com"
                  {...register('email', {
                    required: 'Institutional email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@sst\.scaler\.com$/,
                      message: 'Only @sst.scaler.com emails are accepted',
                    },
                  })}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8+ characters with mixed case, number, and symbol"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: PASSWORD_PATTERN,
                      message:
                        'Include an uppercase letter, lowercase letter, number, and special character',
                    },
                  })}
                  className={`w-full pl-11 pr-11 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="mt-1 text-[11px] text-slate-500">
                Use at least 8 characters, including uppercase, lowercase, a number, and a special character.
              </p>

              {/* Password Strength Indicator */}
              {watchedPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>Strength: {strength.label}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) =>
                      val === watchedPassword || 'Passwords do not match',
                  })}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors ml-1"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
