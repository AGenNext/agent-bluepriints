export default function Home() {
  return (
    <main style={{fontFamily:'system-ui', maxWidth: 960, margin: '0 auto', padding: '4rem 1.5rem'}}>
      <h1 style={{fontSize: '3rem', fontWeight: 700}}>Build AI Agents for OpenMetadata</h1>
      <p style={{fontSize: '1.25rem', lineHeight: 1.6, marginTop: '1rem'}}>
        Agent Blueprints helps teams build production-ready metadata copilots for governance, lineage, and catalog operations.
      </p>
      <div style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
        <a href="https://github.com/AGenNext/agent-bluepriints">View on GitHub</a>
        <a href="/docs">Documentation</a>
      </div>
    </main>
  );
}
