const projectId = "prj_X9W60658ukfZAh3lleXZ1AxhM0Ks";
const teamId = "team_4vqh0dQUzTsp0WZgGA18Uvvl";
const token = "vcp_7zvGS8UGOAndni54rMLanbIWihoQ8pYEKppA99gdpESX1O6Q0f0CFCGn";

const envVars = [
  {
    key: "DATABASE_URL",
    value: "postgresql://neondb_owner:npg_vrxI5i4EsnUb@ep-old-haze-bd20b2it.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    type: "encrypted",
    target: ["production", "preview", "development"]
  },
  {
    key: "GROQ_API_KEY",
    value: "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",
    type: "encrypted",
    target: ["production", "preview", "development"]
  },
  {
    key: "GEMINI_API_KEY",
    value: "AIzaSyDU1XI04tYaC2A2JzdPDSvVrq7S6yxmq30",
    type: "encrypted",
    target: ["production", "preview", "development"]
  },
  {
    key: "AUTH_SECRET",
    value: "gapfinder_super_secret_jwt_encryption_key_2026_production",
    type: "encrypted",
    target: ["production", "preview", "development"]
  },
  {
    key: "NEXTAUTH_SECRET",
    value: "gapfinder_super_secret_jwt_encryption_key_2026_production",
    type: "encrypted",
    target: ["production", "preview", "development"]
  },
  {
    key: "NEXTAUTH_URL",
    value: "https://gapfinder-ai.vercel.app",
    type: "plain",
    target: ["production", "preview", "development"]
  }
];

async function setEnvs() {
  console.log("Setting environment variables on Vercel project...");
  for (const env of envVars) {
    try {
      const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(env)
      });
      const data = await res.json();
      console.log(`Set ${env.key}:`, data.error ? data.error.message : "Success");
    } catch (e) {
      console.error(`Failed ${env.key}:`, e.message);
    }
  }
}

setEnvs();
