import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const authenticateGoogle = async () => {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
    ],
  });

  const authClient = (await auth.getClient()) as OAuth2Client;
  return authClient;
};

export const googleDocs = google.docs({
  version: "v1",
  auth: await authenticateGoogle(),
});
export const googleDrive = google.drive({
  version: "v3",
  auth: await authenticateGoogle(),
});
