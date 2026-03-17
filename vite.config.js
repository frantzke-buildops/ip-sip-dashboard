import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "");
  const jiraUrl = env.JIRA_URL || "https://buildops.atlassian.net";
  const auth = Buffer.from(
    `${env.ATLASSIAN_USERNAME}:${env.ATLASSIAN_API_TOKEN}`
  ).toString("base64");

  console.log(jiraUrl);

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/jira": {
          target: jiraUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace("/api/jira", "/rest/api/3"),
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        },
      },
    },
  };
});
