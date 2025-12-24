import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../api/users';
import { 
  Dumbbell, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  Calendar,
  Scale,
  Ruler,
  Target,
  Users
} from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    dateOfBirth: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prepare user data according to backend API expectations
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth || undefined,
        role: 'ROLE_MEMBER',
        memberDetails: {
          phone: formData.phone || undefined,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender || undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          goal: formData.goal || undefined,
        }
      };

      await createUser(userData);
      
      // Success - redirect to login
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! Please log in.' 
        } 
      });
    } catch (err: any) {
      setLoading(false);
      console.error('Sign up failed:', err);
      
      if (err.status === 409) {
        setError('An account with this email already exists.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <div className="login-bg">
      <div className="login-overlay"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">

          {/* Logo Section */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Dumbbell size={36} className="text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            Join FitHub
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Start your fitness journey today
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === 1 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {step === 1 ? '1' : '✓'}
              </div>
              <div className={`w-20 h-1 ${step === 2 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === 2 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 px-4 py-3 rounded-xl text-center border border-red-200 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSignUp}>
            {/* Step 1: Account Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                      placeholder="Create a password (min. 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-4 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600"
                >
                  Next: Personal Details
                </button>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                      placeholder="e.g., +1234567890"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                      placeholder="YYYY-MM-DD"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      min="1"
                      max="150"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                      placeholder="e.g., 25"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Gender
                  </label>
                  <select
                    name="gender"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-500" />
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                      placeholder="e.g., 175"
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-gray-500" />
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                      placeholder="e.g., 70"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    Fitness Goal
                  </label>
                  <select
                    name="goal"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-700 bg-gray-50 focus:bg-white transition-all"
                    value={formData.goal}
                    onChange={handleChange}
                  >
                    <option value="">Select your fitness goal</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Strength Training">Strength Training</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 py-4 text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-2/3 py-4 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] 
                     bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 
                     hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600
                     ${loading ? "opacity-50 cursor-not-allowed transform-none" : ""}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-violet-600 hover:text-violet-700 font-semibold hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>

          <div className="mt-4">
            <p className="text-center text-gray-500 text-xs">
              © {new Date().getFullYear()} FitHub Fitness Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}