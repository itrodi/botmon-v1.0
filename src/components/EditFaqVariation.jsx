import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EditFaqVariation = ({ onClose, onSuccess, faqId, initialQuestion, initialAnswer }) => {
  const [loading, setLoading] = useState(false);
  const [faqData, setFaqData] = useState({
    question: '',
    answer: ''
  });
  
  useEffect(() => {
    // Initialize form with existing data
    setFaqData({
      question: initialQuestion || '',
      answer: initialAnswer || ''
    });
  }, [initialQuestion, initialAnswer]);

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
        'https://api.automation365.io/edit_faq',
        {
          faq_id: faqId,
          new_question: faqData.question,
          new_answer: faqData.answer
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success === "FAQ updated successfully") {
        toast.success('FAQ updated successfully');
        // Call onSuccess to refresh the data
        if (onSuccess) onSuccess();
        // Close the dialog
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error(error.response?.data?.error || 'Failed to update FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit FAQ</DialogTitle>
        <DialogDescription>
          Update your question and answer
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
          {loading ? 'Updating...' : 'Update FAQ'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditFaqVariation;