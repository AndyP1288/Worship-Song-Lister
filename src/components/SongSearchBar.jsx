export default function SongSearchBar({ value, onChange, placeholder = 'Search songs...' }) {
  return (
    <input
      className="input"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
