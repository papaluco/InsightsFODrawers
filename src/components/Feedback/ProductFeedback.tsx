import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2, CheckCircle } from 'lucide-react';
import type {
  FeedbackType,
  SchoolieFeedbackPayload,
  SchoolieFeedbackValue,
  FeedbackContextKey,
  SchoolieSourceEntryPoint,
} from '../../types/feedbackTypes';
import {
  submitFeedback,
  updateFeedback,
  getExistingFeedback,
} from '../../services/feedbackService';
import { FEEDBACK_REASONS } from './feedbackConstants';

interface ProductFeedbackProps {
  feedbackType: FeedbackType;
  sourceEntryPoint: string;
  analysisIdentifier: string;
  variant: 'drawer' | 'dashboard';
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export const ProductFeedback: React.FC<ProductFeedbackProps> = ({
  feedbackType,
  sourceEntryPoint,
  analysisIdentifier,
  variant,
}) => {
  const [feedbackValue, setFeedbackValue] = useState<SchoolieFeedbackValue | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [existingFeedbackId, setExistingFeedbackId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const reasons = FEEDBACK_REASONS[feedbackType];

  useEffect(() => {
    if (submitState !== 'success') return;
    setShowConfirmation(true);
    const timer = setTimeout(() => setShowConfirmation(false), 5000);
    return () => clearTimeout(timer);
  }, [submitState]);

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const key: FeedbackContextKey = {
          userId: 'demo-user',
          districtId: 'demo-district',
          sourceEntryPoint: sourceEntryPoint as SchoolieSourceEntryPoint,
          feedbackType,
          analysisIdentifier,
          promptVersion: 1,
        };
        const existing = await getExistingFeedback(key);
        if (existing) {
          setExistingFeedbackId(existing.feedbackId);
          setFeedbackValue(existing.feedbackValue);
          setSelectedReasons(existing.reasonCodes ?? []);
          setComment(existing.comment ?? '');
          setSubmitState('success');
        }
      } catch {
        // Don't block the UI if the check fails
      }
    };
    checkExisting();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildPayload(
    value: SchoolieFeedbackValue,
    reasonCodes: string[],
    userComment: string
  ): SchoolieFeedbackPayload {
    return {
      userId: 'demo-user',
      districtId: 'demo-district',
      platform: 'SchoolCafe',
      sourceEntryPoint: sourceEntryPoint as SchoolieSourceEntryPoint,
      feedbackType,
      feedbackValue: value,
      analysisIdentifier,
      promptType: 'product_feedback',
      promptVersion: 1,
      promptText: '',
      reasonCodes: reasonCodes.length > 0 ? reasonCodes : undefined,
      comment: userComment.trim() || undefined,
    };
  }

  async function doSubmit(
    value: SchoolieFeedbackValue,
    reasonCodes: string[],
    userComment: string
  ) {
    setSubmitState('submitting');
    try {
      const payload = buildPayload(value, reasonCodes, userComment);
      if (existingFeedbackId) {
        const updated = await updateFeedback(existingFeedbackId, payload);
        setExistingFeedbackId(updated.feedbackId);
      } else {
        const created = await submitFeedback(payload);
        setExistingFeedbackId(created.feedbackId);
      }
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  }

  const handleThumbsUp = () => {
    if (feedbackValue === 'thumbs_up' && submitState === 'success') return;
    setFeedbackValue('thumbs_up');
    setSelectedReasons([]);
    doSubmit('thumbs_up', [], comment);
  };

  const handleThumbsDown = () => {
    if (feedbackValue === 'thumbs_down' && submitState === 'success') return;
    setFeedbackValue('thumbs_down');
    if (submitState === 'success') setSubmitState('idle');
  };

  const toggleReason = (code: string) => {
    setSelectedReasons(prev =>
      prev.includes(code) ? prev.filter(r => r !== code) : [...prev, code]
    );
  };

  const isSubmitting = submitState === 'submitting';
  const isSuccess = submitState === 'success';
  const showReasonPanel = feedbackValue === 'thumbs_down' && !isSuccess;
  const otherSelected = selectedReasons.includes('other');

  const content = (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm text-gray-400">Was this helpful?</span>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleThumbsUp}
            disabled={isSubmitting}
            aria-label="Mark as helpful"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              feedbackValue === 'thumbs_up'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${feedbackValue === 'thumbs_up' ? 'fill-green-500 text-green-500' : ''}`} />
            <span>Helpful</span>
          </button>

          <button
            onClick={handleThumbsDown}
            disabled={isSubmitting}
            aria-label="Mark as not helpful"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              feedbackValue === 'thumbs_down'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${feedbackValue === 'thumbs_down' ? 'fill-red-400 text-red-400' : ''}`} />
            <span>Not helpful</span>
          </button>
        </div>
      </div>

      {showConfirmation && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-400 animate-in fade-in duration-300">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span>Thanks for your feedback.</span>
        </div>
      )}

      {submitState === 'error' && (
        <p className="mt-2 text-xs text-red-500 animate-in fade-in duration-200">
          Couldn't save your feedback — please try again.
        </p>
      )}

      {showReasonPanel && (
        <div className="mt-4 animate-in fade-in duration-200">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Why wasn't this helpful?{' '}
            <span className="font-normal text-gray-400">(optional)</span>
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {reasons.map(reason => (
              <button
                key={reason.code}
                onClick={() => toggleReason(reason.code)}
                disabled={isSubmitting}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all disabled:opacity-50 ${
                  selectedReasons.includes(reason.code)
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                {reason.label}
              </button>
            ))}
          </div>

          {otherSelected && (
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={isSubmitting}
              placeholder="Tell us more about the issue..."
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 disabled:opacity-50 mb-3"
            />
          )}

          <button
            onClick={() => doSubmit('thumbs_down', selectedReasons, comment)}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Feedback</span>
            )}
          </button>
        </div>
      )}
    </>
  );

  if (variant === 'dashboard') {
    return (
      <div className="max-w-[480px] mx-auto py-2">
        {content}
      </div>
    );
  }

  return (
    <div className="mt-6 pt-5 border-t border-gray-100">
      {content}
    </div>
  );
};
