const { spawn } = require("child_process");

// Antivirus/proxy SSL inspection on some Windows setups breaks Node → Supabase.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const child = spawn("next", ["dev"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
