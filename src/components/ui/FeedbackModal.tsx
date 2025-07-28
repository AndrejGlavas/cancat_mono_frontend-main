import { useState } from 'react';
import { X as LuX } from "lucide-react";
import { useToast } from '../../components/ToastModule';
import { useAuth } from '../../hooks/useAuth';
import { feedbackApi } from '../../services/feedbackApi';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackApi.submit({
        name: user?.name,
        accountId: user?.id,
        feedback
      });
      setSubmitted(true);
      showToast('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-[201] w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Send Feedback</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LuX size={20} className='text-black'/>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Thank you for your feedback!</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-800 mb-2">
                Sent by: {user?.name} (AccountID {user?.id}) 
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-32 p-3 text-black border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Share your feedback..."
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#fc2544] text-white font-semibold rounded hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {submitting ? 'Submitting...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;