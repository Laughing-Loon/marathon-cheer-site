/** Hidden field bots love to fill. If it has a value, the form pretends to succeed. */
export default function Honeypot() {
  return (
    <label className="hp" aria-hidden="true">
      Leave this empty
      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
    </label>
  );
}

export const isBot = (form: HTMLFormElement) =>
  Boolean((form.elements.namedItem("website") as HTMLInputElement | null)?.value);
