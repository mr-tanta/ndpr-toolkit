import React from 'react';
import { resolveClass } from '../../utils/styling';

export interface ComplianceScoreRingProps {
  score: number;
  maxScore: number;
  rating: string;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const RATING_COLORS: Record<string, { stroke: string; text: string }> = {
  compliant: {
    stroke: 'stroke-green-500 dark:stroke-green-400',
    text: 'ndpr-text-success',
  },
  nearly_compliant: {
    stroke: 'stroke-amber-500 dark:stroke-amber-400',
    text: 'ndpr-text-warning',
  },
  not_compliant: {
    stroke: 'stroke-red-500 dark:stroke-red-400',
    text: 'ndpr-text-destructive',
  },
};

const RATING_LABELS: Record<string, string> = {
  compliant: 'Compliant',
  nearly_compliant: 'Nearly Compliant',
  not_compliant: 'Not Compliant',
};

export const ComplianceScoreRing: React.FC<ComplianceScoreRingProps> = ({
  score,
  maxScore,
  rating,
  classNames,
  unstyled,
}) => {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const colors = RATING_COLORS[rating] ?? RATING_COLORS.not_compliant;

  // SVG circle parameters
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      data-ndpr-component="compliance-score-ring"
      className={resolveClass(
        'flex flex-col items-center gap-2',
        classNames?.root,
        unstyled,
      )}
    >
      <div className={resolveClass('relative w-24 h-24', classNames?.svgWrapper, unstyled)}>
        <svg
          className="w-24 h-24 -rotate-90"
          viewBox="0 0 96 96"
          aria-hidden="true"
        >
          {/* Track circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            className={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>

        {/* Center text */}
        <div
          className={resolveClass(
            'absolute inset-0 flex flex-col items-center justify-center',
            classNames?.centerText,
            unstyled,
          )}
        >
          <span
            className={resolveClass(
              `text-xl font-bold leading-none ${colors.text}`,
              classNames?.scoreValue,
              unstyled,
            )}
            aria-label={`${percentage}% compliance score`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      <p
        className={resolveClass(
          `text-xs font-semibold text-center ${colors.text}`,
          classNames?.ratingLabel,
          unstyled,
        )}
      >
        {RATING_LABELS[rating] ?? rating}
      </p>

      <p
        className={resolveClass(
          'text-xs ndpr-text-muted text-center',
          classNames?.scoreDetail,
          unstyled,
        )}
      >
        {score} / {maxScore} pts
      </p>
    </div>
  );
};

export default ComplianceScoreRing;
