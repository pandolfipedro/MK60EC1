import type { ValidationIssue } from '../lib/types';

interface Props {
  issues: ValidationIssue[];
  title: string;
}

export function WarningsPanel({ issues, title }: Props) {
  if (!issues.length) return null;

  return (
    <aside className="warnings">
      <h3>{title}</h3>
      <ul>
        {issues.map((issue, i) => (
          <li key={i} className={`issue-${issue.level}`}>
            {issue.message}
          </li>
        ))}
      </ul>
    </aside>
  );
}
