/**
 * Checkbox styled like shadcn/ui (rounded border, checkmark when checked).
 */
function ConsumedCheckbox({ id, checked, onChange, label = 'Consumed', disabled }) {
  return (
    <label className="consumed-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-checked={checked}
        aria-label={label}
        className="consumed-checkbox-input"
      />
      <span className="consumed-checkbox-box" aria-hidden>
        {checked && (
          <svg className="consumed-checkbox-check" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7l3 3 5-6" />
          </svg>
        )}
      </span>
      <span className="consumed-checkbox-label">{label}</span>
    </label>
  );
}

export default ConsumedCheckbox;
