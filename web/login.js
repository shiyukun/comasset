(function () {
  const form = document.getElementById("loginForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const showPassword = document.getElementById("showPassword");
  const error = document.getElementById("loginError");
  const button = document.getElementById("loginButton");

  function safeNext() {
    const value = new URLSearchParams(window.location.search).get("next") || "/";
    return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/login") ? value : "/";
  }

  async function checkSession() {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (response.ok) window.location.replace(safeNext());
    } catch (_error) {
      error.textContent = "无法连接本地登录服务。";
    }
  }

  showPassword.addEventListener("change", () => {
    password.type = showPassword.checked ? "text" : "password";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    button.disabled = true;
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.value.trim(), password: password.value }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        error.textContent = response.status === 429
          ? `尝试次数过多，请在 ${payload.retryAfterSeconds || 60} 秒后重试。`
          : "用户名或密码不正确。";
        password.select();
        return;
      }
      window.location.replace(safeNext());
    } catch (_error) {
      error.textContent = "登录服务暂时不可用。";
    } finally {
      button.disabled = false;
    }
  });

  checkSession();
})();
