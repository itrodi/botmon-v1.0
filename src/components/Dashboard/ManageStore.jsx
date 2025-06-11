import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { MoreHorizontal, PlusCircle, Facebook, Instagram, Upload, Package2, Search, Share2, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Header from '../Header';
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Switch } from "@/components/ui/switch"
import FaqVariation from '../FaqVariation';
import EditFaqVariation from '../EditFaqVariation';

const ManageStore = () => {
  const [workingHours, setWorkingHours] = useState({
    Monday: { open: '09:00', close: '18:00', isActive: false },
    Tuesday: { open: '09:00', close: '18:00', isActive: false },
    Wednesday: { open: '09:00', close: '18:00', isActive: false },
    Thursday: { open: '09:00', close: '18:00', isActive: false },
    Friday: { open: '09:00', close: '18:00', isActive: false },
    Saturday: { open: '09:00', close: '18:00', isActive: false },
    Sunday: { open: '09:00', close: '18:00', isActive: false }
  });
  const [loadingHours, setLoadingHours] = useState(false);
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    bname: '',
    bphone: '',
    bcountry: '',
    bemail: '',
    baddress: '',
    bcategory: '',
    bcurrency: '',
    blogo: '',
    bbanner: '',
    questions: [],
    answers: [],
    faqIds: [],
    description: '',
    insta: '',
    facebook: '',
    twitter: '',
    whatsapp: ''   
  });
  const [newLogo, setNewLogo] = useState(null);
  const [newBanner, setNewBanner] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState({
    id: null,
    question: '',
    answer: ''
  });
  const [deletingFaq, setDeletingFaq] = useState(false);

  const itemsPerPage = 5;

  // Fetch existing business data
  const fetchBusinessData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.get('https://api.automation365.io/settings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Backend response:', response.data);

      // Transform the FAQ data format
      const faqs = response.data.faq || [];
      const questions = faqs.map(faq => faq.question);
      const answers = faqs.map(faq => faq.answer);

      // Set all business data including transformed FAQ data
      setBusinessData(prev => ({
        ...prev,
        ...response.data,
        questions: questions,
        answers: answers,
        faqIds: faqs.map(faq => faq.id), // Store IDs for edit/delete operations
        // Handle logo and banner URLs properly
        blogo: response.data.blogo || '',
        bbanner: response.data.bbanner || ''
      }));

      // Set preview URLs to existing images
      setLogoPreview(response.data.blogo || '');
      setBannerPreview(response.data.bbanner || '');

      // Reset the file states since we're loading existing data
      setNewLogo(null);
      setNewBanner(null);

    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business data');
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const handleEditFaq = (id, question, answer) => {
    setSelectedFaq({
      id,
      question,
      answer
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteFaq = async (faqId) => {
    setDeletingFaq(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/delete_faq',
        {
          faq_id: faqId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success === "FAQ deleted successfully") {
        toast.success('FAQ deleted successfully');
        fetchBusinessData(); // Refresh the data
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error(error.response?.data?.error || 'Failed to delete FAQ');
    } finally {
      setDeletingFaq(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File size should be less than 10MB');
      return false;
    }

    return true;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setNewLogo(file);
      // Create preview URL for new uploads
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      // Update business data for immediate preview
      setBusinessData(prev => ({
        ...prev,
        blogo: previewUrl
      }));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setNewBanner(file);
      // Create preview URL for new uploads
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      // Update business data for immediate preview
      setBusinessData(prev => ({
        ...prev,
        bbanner: previewUrl
      }));
    }
  };

  const handleSaveBusinessInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('bname', businessData.bname);
      formData.append('bphone', businessData.bphone);
      formData.append('bcountry', businessData.bcountry);
      formData.append('bemail', businessData.bemail);
      formData.append('baddress', businessData.baddress);
      formData.append('bcategory', businessData.bcategory);
      formData.append('bcurrency', businessData.bcurrency);

      // Only append files if new ones were selected
      if (newLogo) {
        formData.append('blogo', newLogo);
      }
      if (newBanner) {
        formData.append('bbanner', newBanner);
      }

      console.log('Submitting business info:', {
        hasNewLogo: !!newLogo,
        hasNewBanner: !!newBanner,
        logoSize: newLogo ? `${(newLogo.size / 1024 / 1024).toFixed(2)}MB` : 'No new logo',
        bannerSize: newBanner ? `${(newBanner.size / 1024 / 1024).toFixed(2)}MB` : 'No new banner'
      });

      const response = await axios.post(
        'https://api.automation365.io/settingsp',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data === "done") {
        toast.success('Business information updated successfully');
        // Refresh the data to get the new URLs from backend
        await fetchBusinessData();
      }
    } catch (error) {
      console.error('Error updating business info:', error);
      toast.error('Failed to update business information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
  
        const response = await axios.get('https://api.automation365.io/open', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        const hoursData = response.data;
        const formattedHours = {};
        
        Object.keys(hoursData).forEach(day => {
          if (hoursData[day]) {
            const [open, close, isActive] = hoursData[day].split(',');
            // Format the time to ensure it has leading zeros
            const formatTime = (time) => {
              if (!time) return '09:00';
              // If single digit hour, add leading zero
              if (time.length === 4) return `0${time}`;
              return time;
            };
  
            formattedHours[day] = {
              open: formatTime(open),
              close: formatTime(close),
              isActive: isActive === 'true'
            };
          } else {
            formattedHours[day] = {
              open: '09:00',
              close: '18:00',
              isActive: false
            };
          }
        });
  
        setWorkingHours(formattedHours);
      } catch (error) {
        console.error('Error fetching working hours:', error);
        toast.error('Failed to load working hours');
      }
    };
  
    fetchWorkingHours();
  }, []);

  // Add these handler functions
  const handleTimeChange = (day, type, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSwitchChange = (day) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isActive: !prev[day].isActive
      }
    }));
  };

  const handleSaveWorkingHours = async () => {
    setLoadingHours(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      // Format data for backend
      const formattedData = {};
      Object.entries(workingHours).forEach(([day, hours]) => {
        formattedData[day] = hours.isActive ? `${hours.open},${hours.close},true` : '';
      });

      const response = await axios.post(
        'https://api.automation365.io/close',
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Times updated successfully") {
        toast.success('Working hours updated successfully');
      }
    } catch (error) {
      console.error('Error updating working hours:', error);
      toast.error('Failed to update working hours');
    } finally {
      setLoadingHours(false);
    }
  };

  const handleSaveDescriptionAndSocials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        'https://api.automation365.io/settinghp',
        {
          description: businessData.description,
          insta: businessData.insta,
          facebook: businessData.facebook,
          twitter: businessData.twitter,
          whatsapp: businessData.whatsapp
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data === "done") {
        toast.success('Social details updated successfully');
      }
    } catch (error) {
      console.error('Error updating social details:', error);
      toast.error('Failed to update social details');
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
          <Link to="/ManageStore" className="font-semibold text-purple-600">
            Business Details
          </Link>
          <Link to="/PersonalDetails" className="font-semibold hover:text-purple-600 transition-colors">
            Personal details
          </Link>
          <Link to="/StoreSetting" className="font-semibold hover:text-purple-600 transition-colors">
            Store settings
          </Link>
          <Link to="/Bank" className="font-semibold hover:text-purple-600 transition-colors">
            Payments
          </Link>
          <Link to="/LinkAccount" className="font-semibold hover:text-purple-600 transition-colors">
            Connect Social channels
          </Link>
          <Link to="/AdvanceSettings" className="font-semibold hover:text-purple-600 transition-colors">
            Advance
          </Link>
        </nav>
        
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Edit your business information</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Logo Upload */}
            <div className="grid gap-3">
              <Label htmlFor="logo">Logo</Label>
              <div className="relative">
                {logoPreview ? (
                  <div className="relative h-[100px] w-[100px]">
                    <img 
                      src={logoPreview}
                      alt="Business Logo"
                      className="h-full w-full object-cover rounded-md border"
                      onError={(e) => {
                        console.log('Logo image failed to load:', logoPreview);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center bg-gray-100 rounded-md border">
                      <span className="text-gray-500 text-sm">Logo not found</span>
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-md">
                      <Upload className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleLogoChange}
                        accept="image/*"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex aspect-square h-[100px] w-[100px] items-center justify-center rounded-md border border-dashed cursor-pointer hover:border-purple-400 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLogoChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
              {newLogo && (
                <p className="text-xs text-green-600">New logo selected - click Save to upload</p>
              )}
            </div>

            {/* Banner Upload */}
            <div className="grid gap-3 mt-4">
              <Label htmlFor="banner">Banner</Label>
              <div className="relative">
                {bannerPreview ? (
                  <div className="relative h-[100px] w-[400px]">
                    <img 
                      src={bannerPreview}
                      alt="Business Banner"
                      className="h-full w-full object-cover rounded-md border"
                      onError={(e) => {
                        console.log('Banner image failed to load:', bannerPreview);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center bg-gray-100 rounded-md border">
                      <span className="text-gray-500 text-sm">Banner not found</span>
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-md">
                      <Upload className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleBannerChange}
                        accept="image/*"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex aspect-square h-[100px] w-[400px] items-center justify-center rounded-md border border-dashed cursor-pointer hover:border-purple-400 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleBannerChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
              {newBanner && (
                <p className="text-xs text-green-600">New banner selected - click Save to upload</p>
              )}
            </div>

            {/* Business Name */}
            <div className="grid gap-3 mt-4">
              <Label htmlFor="bname">Business Name</Label>
              <Input
                name="bname"
                value={businessData.bname}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Enter Business Name"
              />
            </div>

            {/* Business Phone */}
            <div className="grid gap-3 mt-4">
              <Label htmlFor="bphone">Phone Number</Label>
              <Input
                name="bphone"
                value={businessData.bphone}
                onChange={handleInputChange}
                className="w-full"
                placeholder="+234"
              />
            </div>

            {/* Country */}
            <div className="grid gap-3 mt-4">
              <Label htmlFor="bcountry">Country</Label>
              <Select 
                value={businessData.bcountry}
                onValueChange={(value) => handleInputChange({ target: { name: 'bcountry', value } })}
              >
                <SelectTrigger id="bcountry">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="grid gap-3 mt-4">
              <Label htmlFor="bemail">Email Address</Label>
              <Input
                name="bemail"
                value={businessData.bemail}
                onChange={handleInputChange}
                className="w-full"
                type="email"
              />
            </div>

            {/* Address */}
            <div className="grid gap-3 mt-4">
              <Label htmlFor="baddress">Business Address</Label>
              <Input
                name="baddress"
                value={businessData.baddress}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            {/* Category */}
            <div className="grid gap-3 mt-4">
              <Label htmlFor="bcategory">Business Category</Label>
              <Select 
                value={businessData.bcategory}
                onValueChange={(value) => handleInputChange({ target: { name: 'bcategory', value } })}
              >
                <SelectTrigger id="bcategory">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="DigitalProduct">Digital product</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="grid gap-3 mt-4">
              <Label htmlFor="bcurrency">Default Currency</Label>
              <Select 
                value={businessData.bcurrency}
                onValueChange={(value) => handleInputChange({ target: { name: 'bcurrency', value } })}
              >
                <SelectTrigger id="bcurrency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="Cedis">Cedis</SelectItem>
                  <SelectItem value="RWD">RWD</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveBusinessInfo} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card x-chunk="dashboard-04-chunk-2">
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Please set the Day and Time which your business is usually Active
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="grid gap-3 mt-4">
                <Label htmlFor={day}>{day}</Label>
                <div className="flex items-center gap-4">
                  <Label htmlFor={`${day}-open`} className="text-right">
                    Open
                  </Label>
                  <Input
                    id={`${day}-open`}
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                    className="col-span-4"
                    disabled={!hours.isActive}
                  />
                  <Label htmlFor={`${day}-close`} className="text-right">
                    Close
                  </Label>
                  <Input
                    id={`${day}-close`}
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                    className="col-span-4"
                    disabled={!hours.isActive}
                  />
                  <div className="ml-5">
                    <Switch
                      id={`${day}-switch`}
                      checked={hours.isActive}
                      onCheckedChange={() => handleSwitchChange(day)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button 
              onClick={handleSaveWorkingHours} 
              disabled={loadingHours}
            >
              {loadingHours ? 'Saving...' : 'Save'}
            </Button>
          </CardFooter>
        </Card>

        {/* FAQ Card */}
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
            <CardDescription>
              Input questions and answers that your customers usually ask
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Question</TableHead>
                  <TableHead className="w-[300px]">Answer</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessData?.questions && businessData.questions.length > 0 ? (
                  businessData.questions
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((question, index) => {
                      const actualIndex = (currentPage - 1) * itemsPerPage + index;
                      return (
                        <TableRow key={businessData.faqIds[actualIndex]}>
                          <TableCell className="font-semibold">{question}</TableCell>
                          <TableCell>{businessData.answers[actualIndex]}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditFaq(
                                  businessData.faqIds[actualIndex],
                                  question,
                                  businessData.answers[actualIndex]
                                )}>
                                  Edit
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete this FAQ. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteFaq(businessData.faqIds[actualIndex])}
                                        disabled={deletingFaq}
                                      >
                                        {deletingFaq ? 'Deleting...' : 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No FAQs found. Add your first FAQ below.
                    </TableCell>
                  </TableRow>
                )}

                {/* Add empty rows to maintain consistent height - only if we have questions */}
                {businessData?.questions?.length > 0 &&
                  Array.from({ length: Math.max(5 - businessData.questions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).length, 0) }).map((_, i) => (
                    <TableRow key={`empty-${i}`}>
                      <TableCell>&nbsp;</TableCell>
                      <TableCell>&nbsp;</TableCell>
                      <TableCell>&nbsp;</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* Pagination - only show if we have more than 5 questions */}
            {businessData?.questions?.length > itemsPerPage && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center justify-center text-sm">
                  Page {currentPage} of {Math.ceil(businessData.questions.length / itemsPerPage)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => 
                    Math.min(Math.ceil(businessData.questions.length / itemsPerPage), prev + 1)
                  )}
                  disabled={currentPage === Math.ceil(businessData.questions.length / itemsPerPage)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t p-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add FAQ
                </Button>
              </DialogTrigger>
              <FaqVariation 
                onClose={() => setIsDialogOpen(false)}
                onSuccess={fetchBusinessData}
              />
            </Dialog>

            {/* Edit FAQ Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <EditFaqVariation 
                onClose={() => setIsEditDialogOpen(false)}
                onSuccess={fetchBusinessData}
                faqId={selectedFaq.id}
                initialQuestion={selectedFaq.question}
                initialAnswer={selectedFaq.answer}
              />
            </Dialog>
          </CardFooter>
        </Card>

        <Card x-chunk="dashboard-04-chunk-2">
          <CardHeader>
            <CardTitle>Business Description and Socials</CardTitle>
            <CardDescription>
              Edit business description and socials details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="col-span-2"
                value={businessData.description}
                onChange={(e) => handleInputChange({ target: { name: 'description', value: e.target.value } })}
                placeholder="Enter your business description"
              />
            </div>
            <div className="grid gap-3 mt-5">
              <Label htmlFor="name">Social Media Handles</Label>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <Input
                  name="insta"
                  type="text"
                  className="w-full"
                  value={businessData.insta}
                  onChange={handleInputChange}
                  placeholder="Enter instagram handle"
                />
              </div>

              <div className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                <Input
                  name="twitter"
                  type="text"
                  className="w-full"
                  value={businessData.twitter}
                  onChange={handleInputChange}
                  placeholder="Enter twitter handle"
                />
              </div>

              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                <Input
                  name="facebook"
                  type="text"
                  className="w-full"
                  value={businessData.facebook}
                  onChange={handleInputChange}
                  placeholder="Enter Facebook handle"
                />
              </div>

              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="h-4 w-4">
                  <path d="M 12.011719 2 C 6.5057187 2 2.0234844 6.478375 2.0214844 11.984375 C 2.0204844 13.744375 2.4814687 15.462563 3.3554688 16.976562 L 2 22 L 7.2324219 20.763672 C 8.6914219 21.559672 10.333859 21.977516 12.005859 21.978516 L 12.009766 21.978516 C 17.514766 21.978516 21.995047 17.499141 21.998047 11.994141 C 22.000047 9.3251406 20.962172 6.8157344 19.076172 4.9277344 C 17.190172 3.0407344 14.683719 2.001 12.011719 2 z M 12.009766 4 C 14.145766 4.001 16.153109 4.8337969 17.662109 6.3417969 C 19.171109 7.8517969 20.000047 9.8581875 19.998047 11.992188 C 19.996047 16.396187 16.413812 19.978516 12.007812 19.978516 C 10.674812 19.977516 9.3544062 19.642812 8.1914062 19.007812 L 7.5175781 18.640625 L 6.7734375 18.816406 L 4.8046875 19.28125 L 5.2851562 17.496094 L 5.5019531 16.695312 L 5.0878906 15.976562 C 4.3898906 14.768562 4.0204844 13.387375 4.0214844 11.984375 C 4.0234844 7.582375 7.6067656 4 12.009766 4 z"></path>
                </svg>
                <Input
                  name="whatsapp"
                  type="text"
                  className="w-full"
                  value={businessData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Enter whatsapp number"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveDescriptionAndSocials} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default ManageStore;