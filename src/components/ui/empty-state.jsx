import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './button';

/**
 * Reusable empty state component.
 *
 * Props:
 *  - icon:        Lucide icon component (defaults to Inbox)
 *  - title:       Primary heading text
 *  - description: Secondary helper text
 *  - actionLabel: Optional CTA button label
 *  - onAction:    Optional CTA button click handler
 *  - secondaryActionLabel / onSecondaryAction: optional secondary CTA
 *  - className:   Extra classes on the wrapping card
 *  - compact:     Use smaller padding (for table bodies, etc.)
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  compact = false,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`bg-white rounded-lg shadow-sm text-center ${
        compact ? 'p-6' : 'p-10'
      } ${className}`}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50">
        <Icon className="h-7 w-7 text-purple-500" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="mx-auto max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
