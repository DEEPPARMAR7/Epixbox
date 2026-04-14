import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Shield, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const axiosClient = axios.create({ baseURL: API_BASE });

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('epixbox-auth');
  if (token) {
    config.headers.Authorization = `Bearer ${JSON.parse(token).token}`;
  }
  return config;
});

function Enable2FADialog() {
  const [step, setStep] = useState('init'); // init, qr, verify, success
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const enableMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post('/auth/2fa/enable');
      return res.data;
    },
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('qr');
    },
    onError: () => toast.error('Failed to enable 2FA'),
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post('/auth/2fa/verify', {
        token,
        secret,
        backupCodes,
      });
      return res.data;
    },
    onSuccess: () => {
      setStep('success');
      setTimeout(() => {
        setOpen(false);
        setStep('init');
        toast.success('2FA enabled successfully!');
      }, 3000);
    },
    onError: () => toast.error('Invalid token. Try again.'),
  });

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Enable Two-Factor Auth</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
        </DialogHeader>

        {step === 'init' && (
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Enhance your security</p>
                <p className="text-blue-800">2FA adds an extra layer of protection using an authenticator app.</p>
              </div>
            </div>
            <Button onClick={() => enableMutation.mutate()} className="w-full" disabled={enableMutation.isPending}>
              {enableMutation.isPending ? 'Generating...' : 'Get Started'}
            </Button>
          </div>
        )}

        {step === 'qr' && (
          <div className="space-y-4 py-4">
            <div>
              <Label className="block mb-3">1. Scan QR Code</Label>
              <div className="bg-gray-100 p-6 rounded-lg flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                Scan with Google Authenticator, Microsoft Authenticator, or Authy
              </p>
            </div>

            <div>
              <Label className="block mb-3">2. Manual Entry (if QR doesn't work)</Label>
              <code className="block bg-gray-100 p-3 rounded font-mono text-sm break-all">{secret}</code>
            </div>

            <div>
              <Label htmlFor="token" className="block mb-2">3. Enter 6-Digit Code</Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                maxLength="6"
                className="text-2xl tracking-widest text-center"
              />
            </div>

            <Button
              onClick={() => verifyMutation.mutate()}
              className="w-full"
              disabled={token.length !== 6 || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-green-900">2FA Enabled!</p>
                <p className="text-green-800">Save your backup codes in a safe place.</p>
              </div>
            </div>

            <div>
              <Label className="block mb-2 font-semibold">Backup Codes</Label>
              <div className="bg-gray-50 p-4 rounded font-mono text-sm space-y-1 border border-gray-200">
                {backupCodes.map((code, idx) => (
                  <div key={idx}>{code}</div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={copyBackupCodes}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Codes'}
              </Button>
            </div>

            <p className="text-xs text-gray-600">
              You can use these codes to access your account if you lose your authenticator.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Disable2FADialog() {
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);

  const disableMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post('/auth/2fa/disable', { password });
      return res.data;
    },
    onSuccess: () => {
      setOpen(false);
      setPassword('');
      toast.success('2FA disabled');
    },
    onError: (error) => toast.error(error.response?.data?.error || 'Failed to disable'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Disable 2FA</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-900">This reduces your security</p>
              <p className="text-red-800">Your account will be less secure without 2FA.</p>
            </div>
          </div>
          <div>
            <Label htmlFor="password">Enter Your Password to Confirm</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => disableMutation.mutate()}
              variant="destructive"
              className="flex-1"
              disabled={!password || disableMutation.isPending}
            >
              Disable 2FA
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SecurityPage() {
  const [user] = useState(JSON.parse(localStorage.getItem('epixbox-auth') || '{}').user || {});
  const twoFAEnabled = user.two_factor_enabled || false;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account security and authentication.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Status</p>
              <p className="text-sm text-gray-600">
                {twoFAEnabled ? '✅ Enabled' : '❌ Not enabled'}
              </p>
            </div>
            {twoFAEnabled ? <Disable2FADialog /> : <Enable2FADialog />}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 mb-2">What is 2FA?</p>
            <p className="text-blue-800">
              Two-factor authentication requires you to enter a code from your phone when logging in, making your account much more secure.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Manage your active login sessions.</p>
          <Button variant="outline">Sign Out All Sessions</Button>
        </CardContent>
      </Card>
    </div>
  );
}
