import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Onboarding1 = () => {
  const [formData, setFormData] = useState({
    image: null,
    name: '',
    description: '',
    number: '',
    category: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOnboarding1Completion = () => {
    localStorage.setItem('onboarding1Completed', 'true');
    navigate('/Onboarding2');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

   

    const data = new FormData();
    data.append('image', formData.image);
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('number', formData.number);
    data.append('category', formData.category);

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('https://f5eb-172-212-98-191.ngrok-free.app/buisness', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setIsLoading(false);
      if (response.status === 200) {
        setMessage({ text: 'Business profile updated successfully!', type: 'success' });
        setTimeout(() => {
          navigate('/Onboarding2'); // Replace with the next page route
        }, 2000);
      } else {
        setMessage({ text: 'Business profile update failed.', type: 'error' });
      }
    } catch (error) {
      setIsLoading(false);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Business Setup</h1>
            <p className="text-muted-foreground">Complete your business profile</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Business Name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Business Description"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="number">Business Phone Number</Label>
                <Input
                  id="number"
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Business Category"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Logo</Label>
                <Input
                  id="image"
                  type="file"
                  name="image"
                  onChange={handleChange}
                  required
                />
              </div>
              {imagePreview && (
                <div className="grid gap-2">
                  <Label>Image Preview</Label>
                  <img src={imagePreview} alt="Image Preview" className="h-32 w-32 object-cover" />
                </div>
              )}
              {message.text && (
                <div className={`p-2 text-center text-sm ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {message.text}
                </div>
              )}
              <Button onClick={handleOnboarding1Completion} type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">Botmon</div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Set up your business profile to start managing your products and services effectively.&rdquo;
            </p>
            <footer className="text-sm">Botmon</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Onboarding1;
