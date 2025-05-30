import { Hono } from "hono";

import { zValidator } from "../../(utils)";
import { jobPostingIdSchema } from "../job-posting/validators";
import { selectUser } from "../user/services";
import {
  getGeminiCoverLetterResult,
  prepareCoverLetterFile,
} from "./controllers";
import {
  selectDataForCoverLetterContent,
  updateJobPostingAddCoverLetterContent,
} from "./services";
import {
  downloadCoverLetterRequestSchema,
  generateCoverLetterRequestSchema,
} from "./validators";

const coverLetterRoute = new Hono()
  .post(
    "/:id",
    zValidator("param", jobPostingIdSchema),
    zValidator("json", generateCoverLetterRequestSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { additionalInfo, resumeNumber } = c.req.valid("json");

      const data = await selectDataForCoverLetterContent(id);

      if (!data) {
        return c.json(
          { error: "User profile or job posting is not found" },
          404,
        );
      }
      if (!data.user.geminiKey) {
        return c.json(
          {
            error: "Gemini api key not found, please complete your profile",
          },
          400,
        );
      }
      if (!data.user[`resumeContent${resumeNumber}`]) {
        return c.json(
          {
            error: "Resume content not found, please complete your profile",
          },
          400,
        );
      }

      const letterContent = await getGeminiCoverLetterResult({
        positionDetails: {
          companyName: data.jobPosting.companyName,
          title: data.jobPosting.title,
        },
        jobDescription: data.jobPosting.jobDescription,
        cvText: data.user[`resumeContent${resumeNumber}`]!,
        aiKey: data.user.geminiKey,
        additionalInfo,
        location: data.jobPosting.location,
        systemPrompt: data.user.coverLetterPrompt,
      });

      return c.json(
        {
          letterContent,
        },
        200,
      );
    },
  )
  .post(
    "/:id/download",
    zValidator("param", jobPostingIdSchema),
    zValidator("json", downloadCoverLetterRequestSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const payload = c.req.valid("json");

      const selectedUser = await selectUser();

      if (!selectedUser) return c.json({ error: "Profile is not set" }, 401);

      // Save the last generated cover letter in db
      await updateJobPostingAddCoverLetterContent(id, payload.letterContent);

      const data = await prepareCoverLetterFile(payload);

      c.header("Content-Type", "application/pdf");
      c.header(
        "Content-Disposition",
        `attachment; filename="cover-letter-${selectedUser.name.toLowerCase().split(" ").join("-")}.pdf"`,
      );
      return c.body(Buffer.from(data as ArrayBuffer));
    },
  );

export default coverLetterRoute;
