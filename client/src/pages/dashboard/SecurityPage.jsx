import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, Copy, Check, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import * as twoFactorApi from '../../api/twoFactorApi';

function SecurityPage() {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.two_factor_enabled || false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: initial, 2: scanning, 3: verify
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [tempBackupCodes, setTempBackupCodes] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Start 2FA setup
  const handleStartSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await twoFactorApi.enable2FA();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setTempBackupCodes(result.backupCodes);
      setSetupStep(2);
    } catch (err) {
      setError(err.message || 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA
  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await twoFactorApi.verify2FA(verificationCode, secret, tempBackupCodes);

      setSuccess('2FA enabled successfully! Make sure to save your backup codes.');
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setSetupStep(1);
      setVerificationCode('');
      setSecret(null);
      setQrCode(null);
    } catch (err) {
      setError(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable = async () => {
    if (!password) {
      setError('Password is required to disable 2FA');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await twoFactorApi.disable2FA(password);

      setSuccess('2FA has been disabled.');
      setTwoFactorEnabled(false);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  // Copy backup code
  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Security Settings - EpixBox</title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Settings</h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Two-Factor Authentication Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-gray-600 text-sm mt-1">
                {twoFactorEnabled
                  ? 'Your account is protected with two-factor authentication'
                  : 'Add an extra layer of security to your account'}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                twoFactorEnabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {twoFactorEnabled ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {twoFactorEnabled
                ? 'Your account is protected. You will be asked for a verification code when logging in from a new device.'
                : 'Your account is not using two-factor authentication. Enable it to add an extra layer of security.'}
            </p>
          </div>

          {/* Actions */}
          {!twoFactorEnabled ? (
            <>
              {!showSetup ? (
                <button
                  onClick={handleStartSetup}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Enable 2FA'}
                </button>
              ) : (
                <>
                  {setupStep === 2 && (
                    <div className="space-y-6">
                      <div className="bg-indigo-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Step 1: Scan QR Code</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) to scan this QR code:
                        </p>
                        {qrCode && (
                          <div className="mb-4 p-4 bg-white rounded flex justify-center">
                            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          Can't scan? Enter this code manually: <code className="font-mono bg-white p-1 rounded">{secret}</code>
                        </p>
                      </div>

                      <div className="bg-indigo-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Step 2: Verify Code</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Enter the 6-digit code from your authenticator app:
                        </p>
                        <input
                          type="text"
                          maxLength="6"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-wider mb-4"
                          disabled={loading}
                        />
                        <button
                          onClick={handleVerifySetup}
                          disabled={loading || verificationCode.length !== 6}
                          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 mb-4"
                        >
                          {loading ? 'Verifying...' : 'Verify'}
                        </button>

                        <h3 className="font-semibold text-gray-900 mb-4">Step 3: Save Backup Codes</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Save these backup codes in a safe place. You can use them to access your account if you lose access to your authenticator app:
                        </p>
                        <div className="bg-white p-4 rounded border border-gray-300 space-y-2 mb-4">
                          {tempBackupCodes?.map((code, idx) => (
                            <div key={idx} className="flex items-center justify-between font-mono text-sm">
                              <span>{code}</span>
                              <button
                                onClick={() => handleCopyCode(code, idx)}
                                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                              >
                                {copiedIndex === idx ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => setShowSetup(false)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setShowPassword(!showPassword) || setShowBackupCodes(false)}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
              >
                Regenerate Backup Codes
              </button>

              {showPassword && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-4">Enter your password to regenerate backup codes:</p>
                  <div className="relative mb-4">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisable}
                      disabled={loading || !password}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Regenerate'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPassword(false);
                        setPassword('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Disable 2FA</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Disabling two-factor authentication will make your account less secure.
                </p>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg mb-4"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleDisable}
                  disabled={loading || !password}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SecurityPage;
