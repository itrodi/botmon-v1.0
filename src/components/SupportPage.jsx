import React, { useState } from 'react';
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  HelpCircle,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SupportPage = () => {
  // Configuration - Update these with your actual contact details
  const SUPPORT_EMAIL = 'support@automation365.io';
  const WHATSAPP_NUMBER = '2348012345678'; // Format: country code + number without + or spaces
  const SUPPORT_HOURS = 'Monday - Friday, 9:00 AM - 6:00 PM (WAT)';

  // State for the contact form (optional feature)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Handle email click
  const handleEmailClick = () => {
    const subject = encodeURIComponent('Support Request - Automation365');
    const body = encodeURIComponent('Hello Support Team,\n\nI need help with:\n\n');
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hello! I need help with Automation365. ');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission via email
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(formData.subject || 'Support Request');
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // FAQ data
  const faqs = [
    {
      question: "How do I add a new product?",
      answer: "Navigate to the Products page and click the 'Add Product' button. Fill in the required information including product name, price, quantity, and upload an image. You can save it as a draft if you're not ready to publish yet."
    },
    {
      question: "How do I connect my social media accounts?",
      answer: "Go to Settings > Integrations and select the platform you want to connect. Follow the authentication prompts to link your account. Once connected, you can manage your automated messages from the dashboard."
    },
    {
      question: "Can I edit a product after publishing?",
      answer: "Yes! Go to the Products page, find the product you want to edit, and click the edit icon. Make your changes and save. The updates will be reflected immediately in your store."
    },
    {
      question: "How do I manage my subscription?",
      answer: "Navigate to Settings > Billing to view your current plan, update payment methods, or change your subscription. You can upgrade, downgrade, or cancel at any time."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support various payment methods including credit/debit cards, bank transfers, and mobile money. The available options may vary based on your location."
    },
    {
      question: "How do I export my data?",
      answer: "You can export your products, orders, and customer data from Settings > Data Management. Select the data type you want to export and choose your preferred format (CSV or Excel)."
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Support" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <HelpCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">How can we help you?</h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Our support team is here to assist you. Choose your preferred way to reach us.
              </p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Email Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-purple-300 group"
                onClick={handleEmailClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Mail className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
                        Email Support
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Send us an email and we'll get back to you within 24 hours.
                      </p>
                      <div className="flex items-center gap-2 text-purple-600 font-medium">
                        <span>{SUPPORT_EMAIL}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Response time: Within 24 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Card */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:border-green-300 group"
                onClick={handleWhatsAppClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
                        WhatsApp Support
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Chat with us on WhatsApp for quick assistance.
                      </p>
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <span>Click to start chat</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Available: {SUPPORT_HOURS}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Contact Form */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Send us a message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What do you need help with?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe your issue or question in detail..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send via Email
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      Quick answers to common questions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium text-gray-900">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Additional Help Section */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Still need help?</h3>
                  <p className="text-purple-100 text-sm">
                    Our support team is available to assist you with any questions.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="secondary"
                    className="bg-white text-purple-600 hover:bg-purple-50"
                    onClick={handleEmailClick}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </Button>
                  <Button 
                    variant="secondary"
                    className="bg-green-500 text-white hover:bg-green-600 border-0"
                    onClick={handleWhatsAppClick}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SupportPage;