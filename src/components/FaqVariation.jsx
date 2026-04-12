import { API_BASE_URL } from '@/config/api';
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FaqVariation = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [faqData, setFaqData] = useState({
    question: '',
    answer: ''
  });

  const handleInputChange = (e, field) => {
    setFaqData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!faqData.question.trim() || !faqData.answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.post(
        API_BASE_URL + '/faq',
        {
          questions: [faqData.question],
          answers: [faqData.answer]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "FAQ updated successfully") {
        toast.success('FAQ added successfully');
        setFaqData({ question: '', answer: '' });
        // Call onSuccess to refresh the data
        if (onSuccess) onSuccess();
        // Close the dialog
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast.error(error.response?.data?.error || 'Failed to add FAQ');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add FAQ</DialogTitle>
        <DialogDescription>
          Create different questions and answers about your business
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="question" className="text-right">
            Question
          </Label>
          <Textarea
            id="question"
            className="col-span-3"
            value={faqData.question}
            onChange={(e) => handleInputChange(e, 'question')}
            placeholder="Enter your question"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="answer" className="text-right">
            Answer
          </Label>
          <Textarea
            id="answer"
            className="col-span-3"
            value={faqData.answer}
            onChange={(e) => handleInputChange(e, 'answer')}
            placeholder="Enter your answer"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add FAQ'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default FaqVariation;