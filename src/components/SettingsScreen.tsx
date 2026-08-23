import { useBakeryInfo } from '../storage';

export function SettingsScreen() {
  const [bakery, setBakery] = useBakeryInfo();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="eyebrow mb-2">Settings</div>
        <h1 className="font-display font-semibold text-4xl tracking-tight lowercase">
          bakery details<span className="text-terracotta">.</span>
        </h1>
        <p className="text-sm text-door-soft mt-3">
          These appear on every generated menu. Update once and forget.
        </p>
      </div>

      <div className="bg-cream-hi rounded-xl2 border border-door/10 p-5 flex flex-col gap-4">
        <Field label="Bakery name">
          <input
            type="text"
            value={bakery.name}
            onChange={(e) => setBakery((b) => ({ ...b, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-door/15 bg-cream"
          />
        </Field>

        <Field label="Address">
          <input
            type="text"
            value={bakery.address}
            onChange={(e) => setBakery((b) => ({ ...b, address: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-door/15 bg-cream"
          />
        </Field>

        <Field label="Contact line (shown prominently on menu)">
          <input
            type="text"
            value={bakery.contact}
            onChange={(e) => setBakery((b) => ({ ...b, contact: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-door/15 bg-cream"
          />
        </Field>

        <Field label="Footer note (optional — e.g., order deadlines)">
          <input
            type="text"
            value={bakery.footerNote}
            onChange={(e) => setBakery((b) => ({ ...b, footerNote: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-door/15 bg-cream"
          />
        </Field>

      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  );
}
