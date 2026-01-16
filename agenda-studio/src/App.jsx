import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const FEATURES = [
  {
    title: "Servicos",
    description: "Cabelo, unhas, estetica e tratamentos sob medida.",
  },
  {
    title: "Profissionais",
    description: "Equipe selecionada para cada tipo de cuidado.",
  },
  {
    title: "Horarios",
    description: "Seg a sab, 9h as 19h com confirmacao rapida.",
  },
];

export default function App() {
  const [dbStatus, setDbStatus] = useState({
    loading: true,
    counts: {},
    errors: [],
  });
  const [authStatus, setAuthStatus] = useState({
    loading: true,
    error: "",
    message: "",
    user: null,
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    async function testSupabase() {
      const tables = ["clients", "staff", "services", "appointments"];
      const results = await Promise.all(
        tables.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select("id", { count: "exact", head: true });
          return { table, count, error };
        })
      );

      const counts = {};
      const errors = [];
      results.forEach((result) => {
        counts[result.table] = result.count ?? 0;
        if (result.error && result.error.message) {
          errors.push({ table: result.table, message: result.error.message });
        }
      });

      console.log("supabase test:", { counts, errors });
      setDbStatus({ loading: false, counts, errors });
    }
    testSupabase();
  }, []);

  useEffect(() => {
    let active = true;
    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        setAuthStatus({ loading: false, error: error.message, message: "", user: null });
        return;
      }
      setAuthStatus({
        loading: false,
        error: "",
        message: "",
        user: data?.session?.user ?? null,
      });
    }
    loadSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        user: session?.user ?? null,
      }));
    });
    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  function normalizeAuthError(message) {
    if (!message) return "";
    const lower = message.toLowerCase();
    if (lower.includes("invalid login")) {
      return "Credenciais invalidas. Verifique email e senha.";
    }
    if (lower.includes("user already registered")) {
      return "Este email ja esta cadastrado.";
    }
    return message;
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setAuthStatus((prev) => ({ ...prev, loading: true, error: "", message: "" }));
    const { email, password } = loginForm;
    if (!email || !password) {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Informe e-mail e senha.",
      }));
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        error: normalizeAuthError(error.message),
      }));
      return;
    }
    setAuthStatus((prev) => ({
      ...prev,
      loading: false,
      error: "",
      message: "Login realizado com sucesso.",
      user: data?.user ?? null,
    }));
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();
    setAuthStatus((prev) => ({ ...prev, loading: true, error: "", message: "" }));
    const { email, password, confirmPassword } = loginForm;
    if (!email || !password) {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Informe e-mail e senha.",
      }));
      return;
    }
    if (password !== confirmPassword) {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        error: "As senhas nao conferem.",
      }));
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        error: normalizeAuthError(error.message),
      }));
      return;
    }
    setAuthStatus((prev) => ({
      ...prev,
      loading: false,
      error: "",
      message: data?.user ? "Conta criada com sucesso." : "Conta criada. Verifique seu e-mail.",
      user: data?.user ?? null,
    }));
  }

  async function handleLogout() {
    setAuthStatus((prev) => ({ ...prev, loading: true, error: "", message: "" }));
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthStatus((prev) => ({
        ...prev,
        loading: false,
        error: normalizeAuthError(error.message),
      }));
      return;
    }
    setAuthStatus((prev) => ({
      ...prev,
      loading: false,
      error: "",
      message: "Sessao encerrada.",
      user: null,
    }));
  }

  return (
    <div className="min-h-screen bg-[#fff4f8] text-slate-900">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap");
        :root { font-family: "Space Grotesk", sans-serif; }
        h1, h2, h3 { font-family: "Playfair Display", serif; }
      `}</style>

      <header className="px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#2f1b23] text-white flex items-center justify-center font-semibold">
              AS
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Agenda Studio</p>
              <h1 className="text-2xl font-semibold text-[#2f1b23]">Beleza com agenda inteligente</h1>
            </div>
          </div>
          {authStatus.user ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-full bg-[#2f1b23] text-white font-semibold hover:opacity-90 transition"
              disabled={authStatus.loading}
            >
              Sair
            </button>
          ) : (
            <span className="text-sm text-slate-500">Entre para continuar</span>
          )}
        </div>
      </header>

      <main>
        <section className="px-6">
          <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="rounded-[32px] bg-white p-10 shadow-[0_24px_60px_rgba(47,27,35,0.15)]">
              <p className="text-xs uppercase tracking-[0.4em] text-[#b24b6f]">Experiencia premium</p>
              <h2 className="mt-4 text-4xl lg:text-5xl text-[#2f1b23]">
                Agende seu momento de beleza com leveza
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Escolha o servico, o profissional e o horario perfeito. Tudo em um painel simples e elegante.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button className="px-6 py-3 rounded-full bg-[#b24b6f] text-white font-semibold shadow-lg shadow-[#b24b6f33]">
                  Agendar agora
                </button>
                <span className="text-sm text-slate-500">Confirmacao em minutos</span>
              </div>
            </div>
            <div className="rounded-[32px] bg-[#2f1b23] text-white p-10 shadow-[0_18px_50px_rgba(47,27,35,0.2)]">
              <h3 className="text-2xl">Agenda do dia</h3>
              <p className="mt-3 text-sm text-white/70">
                Visualize horarios livres, equipes e servicos favoritos com filtros rapidos.
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Disponibilidade</p>
                  <p className="mt-2 text-xl font-semibold">12 slots livres</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Proximo horario</p>
                  <p className="mt-2 text-xl font-semibold">14:30</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 mt-12">
          <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
            {FEATURES.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(47,27,35,0.08)] border border-white"
              >
                <h3 className="text-xl text-[#2f1b23]">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 max-w-4xl mx-auto mt-12">
          <div className="rounded-[28px] bg-white p-8 shadow-[0_12px_30px_rgba(47,27,35,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Acesso do cliente</p>
                <h3 className="text-2xl text-[#2f1b23]">Entrar ou criar conta</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthStatus((prev) => ({ ...prev, error: "", message: "" }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    authMode === "login"
                      ? "bg-[#2f1b23] text-white"
                      : "bg-[#f5e6ee] text-[#2f1b23]"
                  }`}
                  disabled={authStatus.loading}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthStatus((prev) => ({ ...prev, error: "", message: "" }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    authMode === "signup"
                      ? "bg-[#b24b6f] text-white"
                      : "bg-[#f5e6ee] text-[#2f1b23]"
                  }`}
                  disabled={authStatus.loading}
                >
                  Criar conta
                </button>
              </div>
            </div>

            {authStatus.user ? (
              <div className="mt-6 rounded-2xl bg-[#f8edf2] p-4 text-sm text-[#2f1b23]">
                Logado como {authStatus.user.email}
              </div>
            ) : (
              <form
                onSubmit={authMode === "login" ? handleLoginSubmit : handleSignupSubmit}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2" htmlFor="login-email">
                    E-mail
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b24b6f]"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="voce@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2" htmlFor="login-password">
                    Senha
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b24b6f]"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    placeholder="********"
                    required
                  />
                </div>
                {authMode === "signup" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2" htmlFor="login-confirm">
                      Confirmar senha
                    </label>
                    <input
                      id="login-confirm"
                      type="password"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b24b6f]"
                      value={loginForm.confirmPassword}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                      }
                      placeholder="********"
                      required
                    />
                  </div>
                )}
                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                  <button
                    className="px-6 py-3 rounded-full bg-[#b24b6f] text-white font-semibold hover:opacity-90 transition"
                    type="submit"
                    disabled={authStatus.loading}
                  >
                    {authStatus.loading ? "Processando..." : authMode === "login" ? "Entrar" : "Criar conta"}
                  </button>
                  {authStatus.error && (
                    <span className="text-sm text-red-600">{authStatus.error}</span>
                  )}
                  {authStatus.message && (
                    <span className="text-sm text-emerald-600">{authStatus.message}</span>
                  )}
                </div>
              </form>
            )}
          </div>
        </section>

        <section className="px-6 max-w-6xl mx-auto mt-12">
          <div className="rounded-[28px] bg-white p-8 shadow-[0_12px_30px_rgba(47,27,35,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Infra</p>
                <h3 className="text-2xl text-[#2f1b23]">Conexao Supabase</h3>
              </div>
              <span className="text-sm text-slate-500">
                {dbStatus.loading ? "Verificando..." : "Status atualizado"}
              </span>
            </div>
            {!dbStatus.loading && (
              <div className="mt-4 text-sm text-slate-600">
                clients: {dbStatus.counts.clients ?? 0} | staff: {dbStatus.counts.staff ?? 0} | services: {dbStatus.counts.services ?? 0} | appointments: {dbStatus.counts.appointments ?? 0}
              </div>
            )}
            {dbStatus.errors.length > 0 && (
              <div className="mt-3 text-sm text-red-600">
                Erros: {dbStatus.errors.map((err) => `${err.table}: ${err.message}`).join(" | ")}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-16 py-8 text-center text-xs tracking-[0.3em] text-slate-500">
        AGENDA STUDIO · SEGUNDA A SABADO · 9H AS 19H
      </footer>
    </div>
  );
}
