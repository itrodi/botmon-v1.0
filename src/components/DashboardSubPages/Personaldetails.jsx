import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

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
} from "@/components/ui/select";
import Header from '../Header';

const PersonalDetails = () => {
  const [loading, setLoading] = useState(false);
  const [personalData, setPersonalData] = useState({
    first: '',
    last: '',
    phone: '',
    pemail: '',
    country: '',
    bphone: ''
  });

  // Fetch personal data
  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          return;
        }

        const response = await axios.get('https://api.automation365.io/psettings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setPersonalData(response.data);
      } catch (error) {
        console.error('Error fetching personal data:', error);
        toast.error('Failed to load personal data');
      }
    };

    fetchPersonalData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSavePersonalInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/psettingsp',
        {
          first: personalData.first,
          last: personalData.last,
          phone: personalData.phone,
          email: personalData.pemail,
          country: personalData.country
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "User settings updated successfully") {
        toast.success('Personal information updated successfully');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast.error('Failed to update personal information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <nav className="grid gap-4 text-sm text-muted-foreground">
          <Link to="/Overview" className="font-semibold hover:text-purple-600 transition-colors">
            Home
          </Link>
          <Link to="/ManageStore" className="font-semibold hover:text-purple-600 transition-colors">
            Business Details
          </Link>
          <Link to="/PersonalDetails" className="font-semibold text-purple-600">
            Personal details
          </Link>
          <Link to="/StoreSetting" className="font-semibold hover:text-purple-600 transition-colors">
            Store settings
          </Link>
          <Link to="/Bank" className="font-semibold hover:text-purple-600 transition-colors">
            Payments
          </Link>
          <Link to="/Link" className="font-semibold hover:text-purple-600 transition-colors">
            Connect Social channels
          </Link>
          <Link to="/Advance" className="font-semibold hover:text-purple-600 transition-colors">
            Advance
          </Link>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Edit your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First Name */}
            <div className="grid gap-2">
              <Label htmlFor="first">First Name</Label>
              <Input
                id="first"
                name="first"
                value={personalData.first}
                onChange={handleInputChange}
                placeholder="Enter your first name"
              />
            </div>

            {/* Last Name */}
            <div className="grid gap-2">
              <Label htmlFor="last">Last Name</Label>
              <Input
                id="last"
                name="last"
                value={personalData.last}
                onChange={handleInputChange}
                placeholder="Enter your last name"
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={personalData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="pemail">Email Address</Label>
              <Input
                id="pemail"
                name="pemail"
                type="email"
                value={personalData.pemail}
                onChange={handleInputChange}
                placeholder="Enter your email address"
              />
            </div>

            {/* Country */}
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={personalData.country}
                onValueChange={(value) => handleInputChange({ target: { name: 'country', value } })}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Business Phone (Read-only) */}
            <div className="grid gap-2">
              <Label htmlFor="bphone">Business Phone</Label>
              <Input
                id="bphone"
                name="bphone"
                value={personalData.bphone}
                readOnly
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500">Business phone can only be changed in business settings</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSavePersonalInfo} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default PersonalDetails;