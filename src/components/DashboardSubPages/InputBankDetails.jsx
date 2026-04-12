import { API_BASE_URL } from '@/config/api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SettingsLayout from '../SettingsLayout';

const InputBankDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bank: '',
    account: '',
    number: '',
    bvn: ''
  });

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.bank || !form.account || !form.number || !form.bvn) {
      toast.error('Please fill all bank details');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      await axios.post(
        API_BASE_URL + '/bank',
        {
          bank: form.bank,
          account: form.account,
          number: form.number,
          bvn: form.bvn
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Bank details saved');
      navigate('/Bank');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save bank details';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout title="Payments">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link to="/Bank">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <div>
              <CardTitle>Add Bank Account</CardTitle>
              <CardDescription>
                Input bank details for payouts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bank">Select Bank</Label>
              <Select value={form.bank} onValueChange={(value) => handleChange('bank', value)}>
                <SelectTrigger id="bank" aria-label="Select bank">
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Access">Access Bank</SelectItem>
                  <SelectItem value="FirstBank">First Bank</SelectItem>
                  <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                  <SelectItem value="Opay">Opay digital services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account">Bank Account Name</Label>
              <Input
                id="account"
                type="text"
                value={form.account}
                onChange={(e) => handleChange('account', e.target.value)}
                placeholder="Enter Account Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="number">Bank Account Number</Label>
              <Input
                id="number"
                type="text"
                value={form.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder="Enter Account Number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bvn">BVN</Label>
              <Input
                id="bvn"
                type="text"
                value={form.bvn}
                onChange={(e) => handleChange('bvn', e.target.value)}
                placeholder="Enter BVN"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
    </SettingsLayout>
  );
};

export default InputBankDetails;
