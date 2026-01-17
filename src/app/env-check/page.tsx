function maskAnonKey(value: string | undefined): string {
  if (!value) return "(missing)";
  if (value.length <= 10) return `${value.slice(0, 2)}...${value.slice(-2)}`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function EnvCheckPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <main style={{ padding: 24 }}>
      <h1>Env Check</h1>
      <p>
        <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{" "}
        {supabaseUrl ?? "(missing)"}
      </p>
      <p>
        <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {maskAnonKey(anonKey)}
      </p>
    </main>
  );
}
