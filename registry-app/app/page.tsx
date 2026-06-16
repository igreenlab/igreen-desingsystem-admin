export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>iGreen DS registry</h1>
      <p>
        Registry privado (copy-in shadcn). Use <code>shadcn add @igreen/&lt;item&gt;</code> com
        o header <code>Authorization: Bearer ${"{IGREEN_TOKEN}"}</code> configurado no consumidor.
      </p>
    </main>
  );
}
