import React from 'react';
import { resolveClass } from '../../utils/styling';
import type {
  ComplianceReport,
  ModuleScore,
  Recommendation,
  ComplianceRating,
} from '../../utils/compliance-score';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface NDPRDashboardClassNames {
  root?: string;
  header?: string;
  scoreCircle?: string;
  scoreValue?: string;
  ratingBadge?: string;
  modulesGrid?: string;
  moduleCard?: string;
  moduleTitle?: string;
  moduleScore?: string;
  moduleGaps?: string;
  recommendationsSection?: string;
  recommendationItem?: string;
  recommendationPriority?: string;
  recommendationTitle?: string;
  primaryButton?: string;
  secondaryButton?: string;
}

export interface NDPRDashboardProps {
  /** Compliance report produced by getComplianceScore() */
  report: ComplianceReport;
  /** Dashboard heading. Defaults to "NDPA Compliance Dashboard" */
  title?: string;
  /** Show/hide the recommendations section. Defaults to true */
  showRecommendations?: boolean;
  /** Maximum number of recommendations to render. Defaults to 5 */
  maxRecommendations?: number;
  /** Per-section class name overrides */
  classNames?: NDPRDashboardClassNames;
  /** When true, strips all default classes so consumers can style from scratch */
  unstyled?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  consent: 'Consent',
  dsr: 'Data Subject Rights',
  dpia: 'DPIA',
  breach: 'Breach Notification',
  policy: 'Privacy Policy',
  lawfulBasis: 'Lawful Basis',
  crossBorder: 'Cross-Border',
  ropa: 'ROPA',
};

// CSS-variable-backed colour tokens for each rating level.
const RATING_COLORS: Record<ComplianceRating, string> = {
  critical: 'rgb(var(--ndpr-destructive))',
  'needs-work': 'rgb(var(--ndpr-warning))',
  good: 'rgb(var(--ndpr-primary))',
  excellent: 'rgb(var(--ndpr-success))',
};

const RATING_LABELS: Record<ComplianceRating, string> = {
  critical: 'Critical',
  'needs-work': 'Needs Work',
  good: 'Good',
  excellent: 'Excellent',
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ScoreCircleProps {
  score: number;
  rating: ComplianceRating;
  classNames?: Pick<NDPRDashboardClassNames, 'scoreCircle' | 'scoreValue'>;
  unstyled?: boolean;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, rating, classNames, unstyled }) => {
  const color = RATING_COLORS[rating];
  // SVG ring: r=40, circumference ≈ 251.3
  const CIRCUMFERENCE = 2 * Math.PI * 40;
  const dashOffset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div
      className={resolveClass(
        'relative inline-flex items-center justify-center',
        classNames?.scoreCircle,
        unstyled,
      )}
      role="img"
      aria-label={`Compliance score: ${score} out of 100, rated ${RATING_LABELS[rating]}`}
    >
      <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden="true">
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <span
        className={resolveClass(
          'absolute text-2xl font-bold tabular-nums',
          classNames?.scoreValue,
          unstyled,
        )}
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
};

interface RatingBadgeProps {
  rating: ComplianceRating;
  className?: string;
  unstyled?: boolean;
}

const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, className, unstyled }) => {
  const color = RATING_COLORS[rating];
  return (
    <span
      className={resolveClass(
        'inline-block px-3 py-1 rounded-full text-sm font-semibold',
        className,
        unstyled,
      )}
      style={{
        backgroundColor: `${color.replace('rgb(', 'rgba(').replace(')', ', 0.12)')}`,
        color,
        border: `1px solid ${color.replace('rgb(', 'rgba(').replace(')', ', 0.3)')}`,
      }}
      role="status"
      aria-live="polite"
    >
      {RATING_LABELS[rating]}
    </span>
  );
};

interface ModuleCardProps {
  moduleKey: string;
  module: ModuleScore;
  classNames?: Pick<
    NDPRDashboardClassNames,
    'moduleCard' | 'moduleTitle' | 'moduleScore' | 'moduleGaps'
  >;
  unstyled?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ moduleKey, module, classNames, unstyled }) => {
  const rating: ComplianceRating =
    module.score >= 90
      ? 'excellent'
      : module.score >= 70
      ? 'good'
      : module.score >= 40
      ? 'needs-work'
      : 'critical';

  const color = RATING_COLORS[rating];
  const passedCount = Math.round((module.score / 100) * (module.gaps.length + Math.round((module.score / 100) * 5)));
  const gapCount = module.gaps.length;
  const displayName = MODULE_DISPLAY_NAMES[moduleKey] ?? moduleKey;

  return (
    <div
      className={resolveClass(
        'rounded-lg border p-4 flex flex-col gap-2',
        classNames?.moduleCard,
        unstyled,
      )}
      style={{
        borderColor: `${color.replace('rgb(', 'rgba(').replace(')', ', 0.25)')}`,
        backgroundColor: `${color.replace('rgb(', 'rgba(').replace(')', ', 0.04)')}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className={resolveClass(
            'text-sm font-semibold truncate',
            classNames?.moduleTitle,
            unstyled,
          )}
        >
          {displayName}
        </span>
        <span
          className={resolveClass(
            'text-lg font-bold tabular-nums',
            classNames?.moduleScore,
            unstyled,
          )}
          style={{ color }}
          role="status"
          aria-label={`${displayName} score: ${module.score}`}
        >
          {module.score}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
        role="progressbar"
        aria-valuenow={module.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${displayName} compliance score: ${module.score}%`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${module.score}%`, backgroundColor: color }}
        />
      </div>

      {gapCount > 0 && (
        <p
          className={resolveClass(
            'ndpr-form-field__hint',
            classNames?.moduleGaps,
            unstyled,
          )}
        >
          {gapCount} gap{gapCount !== 1 ? 's' : ''} to address
        </p>
      )}
    </div>
  );
};

interface RecommendationItemProps {
  rec: Recommendation;
  classNames?: Pick<
    NDPRDashboardClassNames,
    'recommendationItem' | 'recommendationPriority' | 'recommendationTitle'
  >;
  unstyled?: boolean;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ rec, classNames, unstyled }) => {
  const priorityColors: Record<string, string> = {
    critical: RATING_COLORS.critical,
    high: RATING_COLORS['needs-work'],
    medium: RATING_COLORS.good,
    low: RATING_COLORS.excellent,
  };

  const color = priorityColors[rec.priority] ?? RATING_COLORS.good;

  return (
    <div
      data-testid="recommendation-item"
      className={resolveClass(
        'flex gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800',
        classNames?.recommendationItem,
        unstyled,
      )}
    >
      <span
        className={resolveClass(
          'mt-0.5 shrink-0 inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide',
          classNames?.recommendationPriority,
          unstyled,
        )}
        style={{
          backgroundColor: `${color.replace('rgb(', 'rgba(').replace(')', ', 0.12)')}`,
          color,
        }}
      >
        {PRIORITY_LABELS[rec.priority] ?? rec.priority}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={resolveClass(
            'text-sm font-medium ndpr-text-foreground',
            classNames?.recommendationTitle,
            unstyled,
          )}
        >
          {rec.label}
        </p>
        <p className="mt-0.5 text-xs ndpr-text-muted leading-relaxed">
          {rec.recommendation}
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {rec.ndpaSection} &bull; Effort: {rec.effort}
        </p>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Read-only compliance dashboard.
 *
 * Visualises a `ComplianceReport` (from `getComplianceScore()`) showing the
 * overall score, per-module cards, and a prioritised recommendations list.
 */
export const NDPRDashboard: React.FC<NDPRDashboardProps> = ({
  report,
  title = 'NDPA Compliance Dashboard',
  showRecommendations = true,
  maxRecommendations = 5,
  classNames,
  unstyled = false,
}) => {
  const visibleRecommendations = report.recommendations.slice(0, maxRecommendations);
  const moduleEntries = Object.entries(report.modules);

  return (
    <div
      data-ndpr-component="compliance-dashboard"
      className={resolveClass(
        'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6 flex flex-col gap-8',
        classNames?.root,
        unstyled,
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className={resolveClass(
          'flex flex-col sm:flex-row items-start sm:items-center gap-6',
          classNames?.header,
          unstyled,
        )}
      >
        <ScoreCircle
          score={report.score}
          rating={report.rating}
          classNames={{ scoreCircle: classNames?.scoreCircle, scoreValue: classNames?.scoreValue }}
          unstyled={unstyled}
        />

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold ndpr-text-foreground leading-tight">
            {title}
          </h2>
          <RatingBadge
            rating={report.rating}
            className={classNames?.ratingBadge}
            unstyled={unstyled}
          />
          <p className='ndpr-form-field__hint'>
            Generated on{' '}
            {new Date(report.generatedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* ── Module grid ────────────────────────────────────────────────────── */}
      <div
        className={resolveClass(
          'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3',
          classNames?.modulesGrid,
          unstyled,
        )}
      >
        {moduleEntries.map(([key, module]) => (
          <ModuleCard
            key={key}
            moduleKey={key}
            module={module}
            classNames={{
              moduleCard: classNames?.moduleCard,
              moduleTitle: classNames?.moduleTitle,
              moduleScore: classNames?.moduleScore,
              moduleGaps: classNames?.moduleGaps,
            }}
            unstyled={unstyled}
          />
        ))}
      </div>

      {/* ── Recommendations ────────────────────────────────────────────────── */}
      {showRecommendations && visibleRecommendations.length > 0 && (
        <div
          className={resolveClass(
            'flex flex-col gap-3',
            classNames?.recommendationsSection,
            unstyled,
          )}
        >
          <h3 className="text-base font-semibold ndpr-text-foreground">
            Recommendations
          </h3>
          {visibleRecommendations.map((rec) => (
            <RecommendationItem
              key={`${rec.module}-${rec.key}`}
              rec={rec}
              classNames={{
                recommendationItem: classNames?.recommendationItem,
                recommendationPriority: classNames?.recommendationPriority,
                recommendationTitle: classNames?.recommendationTitle,
              }}
              unstyled={unstyled}
            />
          ))}
        </div>
      )}
    </div>
  );
};
