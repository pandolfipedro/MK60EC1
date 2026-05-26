interface Props {
  value: string;
  onCopy: () => void;
  onCopySpaced: () => void;
  copyLabel: string;
  copyVcdsLabel: string;
}

export function HexOutput({
  value,
  onCopy,
  onCopySpaced,
  copyLabel,
  copyVcdsLabel,
}: Props) {
  return (
    <div className="hex-output">
      <code className="hex-value mono">{value || '—'}</code>
      <div className="btn-row">
        <button type="button" className="btn secondary" onClick={onCopy} disabled={!value}>
          {copyLabel}
        </button>
        <button type="button" className="btn secondary" onClick={onCopySpaced} disabled={!value}>
          {copyVcdsLabel}
        </button>
      </div>
    </div>
  );
}
