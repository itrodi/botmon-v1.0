import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Check, ChevronsUpDown, Loader2, Pencil, Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { API_BASE_URL } from '@/config/api';
import { fetchBanks } from '@/utils/banks';

const initialForm = { bank: '', bankCode: '', account: '', number: '' };

const maskAccountNumber = (value) => {
  if (!value) return '—';
  const str = String(value);
  if (str.length <= 4) return str;
  return `${'•'.repeat(str.length - 4)}${str.slice(-4)}`;
};

const BankPicker = ({ banks, loading, value, onChange, hasError }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return banks;
    const q = query.toLowerCase();
    return banks.filter((b) => b.name.toLowerCase().includes(q));
  }, [banks, query]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        aria-invalid={hasError ? 'true' : 'false'}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border bg-white ${
          hasError ? 'border-red-500' : 'border-gray-200'
        } disabled:opacity-60`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {loading
            ? 'Loading banks…'
            : value || 'Select bank'}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md border border-gray-200 shadow-lg">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search banks"
              className="flex-1 text-sm outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No banks found</li>
            ) : (
              filtered.map((b) => (
                <li key={b.id ?? b.code ?? b.name}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(b);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-purple-50"
                  >
                    <span className="text-gray-800">{b.name}</span>
                    {value === b.name && (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const BankAccountCard = () => {
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);

  const fetchBankDetails = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/bank`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = response.data;
      console.log('[BankAccountCard] /bank GET response:', raw);
      console.log('[BankAccountCard] /bank response keys:', raw && typeof raw === 'object' ? Object.keys(raw) : 'n/a');
      // Normalize various possible response shapes
      const details =
        raw && (raw.Bank_Name || raw.Account_Name || raw.Account_Number)
          ? raw
          : raw?.data && (raw.data.Bank_Name || raw.data.Account_Name)
          ? raw.data
          : raw?.bank && (raw.bank.Bank_Name || raw.bank.Account_Name)
          ? raw.bank
          : raw && (raw.bank_name || raw.account_name || raw.account_number)
          ? {
              Bank_Name: raw.bank_name || raw.bank,
              Bank_Code: raw.bank_code || '',
              Account_Name: raw.account_name || raw.account,
              Account_Number: raw.account_number || raw.number,
            }
          : raw || null;
      console.log('[BankAccountCard] normalized bank details:', details);
      setBankDetails(details);
    } catch (error) {
      console.error('[BankAccountCard] /bank fetch error:', error, error.response?.data);
      if (error.response?.status === 404) {
        setBankDetails(null);
      } else if (error.response?.status !== 401) {
        toast.error('Failed to load bank details');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankDetails();
  }, [fetchBankDetails]);

  const loadBanks = useCallback(async () => {
    if (banks.length > 0) return;
    setBanksLoading(true);
    try {
      const list = await fetchBanks();
      setBanks(list);
      if (list.length === 0) {
        toast.error('Could not load bank list. Please check your connection.');
      }
    } finally {
      setBanksLoading(false);
    }
  }, [banks.length]);

  const openDialog = () => {
    setForm(
      bankDetails
        ? {
            bank: bankDetails.Bank_Name || '',
            bankCode: bankDetails.Bank_Code || '',
            account: bankDetails.Account_Name || '',
            number: bankDetails.Account_Number || '',
          }
        : initialForm
    );
    setErrors({});
    setDialogOpen(true);
    loadBanks();
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.bank) nextErrors.bank = 'Select a bank';
    if (!form.account.trim()) nextErrors.account = 'Account name is required';
    if (!form.number.trim()) {
      nextErrors.number = 'Account number is required';
    } else if (!/^\d{6,}$/.test(form.number.trim())) {
      nextErrors.number = 'Enter a valid account number';
    }
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }
      await axios.post(
        `${API_BASE_URL}/bank`,
        {
          bank: form.bank,
          bank_code: form.bankCode || undefined,
          account: form.account.trim(),
          number: form.number.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Optimistically show the saved details immediately so the card
      // updates even if the GET re-fetch is slow or cached.
      setBankDetails({
        Bank_Name: form.bank,
        Bank_Code: form.bankCode || '',
        Account_Name: form.account.trim(),
        Account_Number: form.number.trim(),
      });
      toast.success('Bank details saved');
      setDialogOpen(false);
      // Re-fetch after a short delay to pick up any server-side
      // enrichments (e.g. verified account name).
      setTimeout(() => fetchBankDetails(), 800);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save bank details';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600">
              Payout bank account
            </h3>
            {loading ? (
              <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading bank details…
              </div>
            ) : bankDetails ? (
              <div className="mt-2 space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  {bankDetails.Bank_Name || '—'}
                </p>
                <p className="text-sm text-gray-600">
                  {bankDetails.Account_Name || '—'}
                </p>
                <p className="text-sm text-gray-500 tracking-wider">
                  {maskAccountNumber(bankDetails.Account_Number)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                No bank account added yet. Add one to receive payouts.
              </p>
            )}
          </div>
          <Button
            variant={bankDetails ? 'outline' : 'default'}
            onClick={openDialog}
            disabled={loading}
            className={
              bankDetails
                ? 'flex items-center gap-2'
                : 'flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700'
            }
          >
            {bankDetails ? (
              <>
                <Pencil className="w-4 h-4" />
                Update
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Bank
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bankDetails ? 'Update bank account' : 'Add bank account'}
            </DialogTitle>
            <DialogDescription>
              Bank details are used to receive payouts from successful
              transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="bank-select">Bank</Label>
              <BankPicker
                banks={banks}
                loading={banksLoading}
                value={form.bank}
                hasError={Boolean(errors.bank)}
                onChange={(bank) => {
                  setForm((prev) => ({
                    ...prev,
                    bank: bank.name,
                    bankCode: bank.code || '',
                  }));
                  if (errors.bank) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.bank;
                      return next;
                    });
                  }
                }}
              />
              {errors.bank && (
                <p className="text-sm text-red-600">{errors.bank}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-account-name">Account name</Label>
              <Input
                id="bank-account-name"
                value={form.account}
                onChange={(e) => handleChange('account', e.target.value)}
                placeholder="Account holder's name"
                aria-invalid={errors.account ? 'true' : 'false'}
                className={errors.account ? 'border-red-500' : ''}
              />
              {errors.account && (
                <p className="text-sm text-red-600">{errors.account}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank-account-number">Account number</Label>
              <Input
                id="bank-account-number"
                inputMode="numeric"
                value={form.number}
                onChange={(e) =>
                  handleChange('number', e.target.value.replace(/[^\d]/g, ''))
                }
                placeholder="10-digit account number"
                aria-invalid={errors.number ? 'true' : 'false'}
                className={errors.number ? 'border-red-500' : ''}
              />
              {errors.number && (
                <p className="text-sm text-red-600">{errors.number}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              aria-busy={saving}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BankAccountCard;
