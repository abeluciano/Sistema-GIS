import { LogIn, MapPinned } from "lucide-react";
import { FormEvent, useState } from "react";

type LoginPanelProps = {
  onLogin: (usuario: string, password: string) => Promise<void>;
};

export function LoginPanel({ onLogin }: LoginPanelProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onLogin(usuario, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-panel" aria-label="Acceso administrativo">
        <div className="brand-row">
          <span className="brand-mark"><MapPinned size={24} /></span>
          <div>
            <p>Sistema GIS</p>
            <h1>Dashboard administrativo</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Usuario
            <input value={usuario} onChange={(event) => setUsuario(event.target.value)} autoComplete="username" />
          </label>
          <label>
            Contrasena
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? "Ingresando" : "Ingresar"}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
