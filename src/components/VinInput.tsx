interface Props {
  value: string;
  onChange: (v: string) => void;
  label: string;
  help?: string;
}

export function VinInput({ value, onChange, label, help }: Props) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="input mono"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        maxLength={17}
        placeholder="WVWZZZ1KZAM679548"
        spellCheck={false}
      />
      {help && <span className="field-help">{help}</span>}
    </label>
  );
}
