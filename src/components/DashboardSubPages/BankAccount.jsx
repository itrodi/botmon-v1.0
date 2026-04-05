import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import SettingsLayout from '../SettingsLayout';

const BankAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState(null);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.get('https://api.automation365.io/bank', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBankDetails(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setBankDetails(null);
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load bank details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  return (
    <SettingsLayout title="Payments">
      <Card>
        <CardHeader>
          <CardTitle>Bank Account</CardTitle>
          <CardDescription>
            Information from your bank accounts for payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading bank details...</div>
          ) : bankDetails ? (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Bank Name</span>
                <span className="font-medium">{bankDetails.Bank_Name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Account Name</span>
                <span className="font-medium">{bankDetails.Account_Name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Account Number</span>
                <span className="font-medium">{bankDetails.Account_Number || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">BVN</span>
                <span className="font-medium">{bankDetails.BVN || '—'}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No bank account added yet.
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center gap-2">
            <Link to="/AddBank">
              <Button>{bankDetails ? 'Update Bank Account' : 'Add Bank Account'}</Button>
            </Link>
            <Button variant="outline" onClick={fetchBankDetails} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardFooter>
      </Card>
    </SettingsLayout>
  );
};

export default BankAccount;
