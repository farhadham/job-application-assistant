import { Hono } from "hono";

import { zValidator } from "../../(utils)";
import { selectUser } from "../user/services";
import { getGeminiPredictResult } from "./controllers";
import {
  deleteJobPosting,
  insertJobPosting,
  selectAppliedJobPostings,
  selectDataForReanalyze,
  selectJobDescriptionByJobId,
  selectJobPostingById,
  selectJobPostingByUrl,
  selectJobPostings,
  selectUsedCoverLetterByJobId,
  selectUsedResumeByJobId,
  updateJobPostingAnalyze,
  updateJobPostingApplicationStatus,
  updateJobPostingToApplied,
} from "./services";
import {
  createJobPostingRequestSchema,
  getAppliedJobsQuerySchema,
  jobPostingIdSchema,
  markAsAppliedRequestSchema,
  reanalyzeResumeRequestSchema,
  updateApplicationStatusRequestSchema,
} from "./validators";

const jobPostingRoute = new Hono()
  .get("/", zValidator("query", getAppliedJobsQuerySchema), async (c) => {
    const queries = c.req.valid("query");

    const selectedJobPostings = await selectJobPostings(queries);

    return c.json(selectedJobPostings, 200);
  })
  .post("/", zValidator("json", createJobPostingRequestSchema), async (c) => {
    const payload = c.req.valid("json");

    // Prevent duplicate job posting
    const duplicateJobPosting = await selectJobPostingByUrl(payload.url);
    if (duplicateJobPosting) {
      return c.json({ error: "Job posting already exist" }, 400);
    }

    // Getting Gemini key from User
    const selectedUser = await selectUser();
    if (!selectedUser) {
      return c.json({ error: "Your profile is not complete" }, 401);
    }
    if (!selectedUser.geminiKey) {
      return c.json({ error: "Gemini api key not found" }, 404);
    }
    if (!selectedUser.resumeContent1) {
      return c.json({ error: "Resume content not found" }, 404);
    }

    const { jobDescription, ...payloadRest } = payload;

    // using Gemini
    const aiResult = await getGeminiPredictResult({
      title: payloadRest.title,
      jobDescription,
      cvText: selectedUser.resumeContent1,
      aiKey: selectedUser.geminiKey,
      location: payloadRest.location,
    });

    await insertJobPosting({ aiResult, payload });

    return c.json({ message: "Job posting created successfully" }, 201);
  })
  .get(
    "/applied",
    zValidator("query", getAppliedJobsQuerySchema),
    async (c) => {
      const queries = c.req.valid("query");

      const selectedUser = await selectUser();
      if (!selectedUser) {
        return c.json({ error: "Your profile is not complete" }, 401);
      }

      const selectedJobPostings = await selectAppliedJobPostings(queries);

      return c.json(selectedJobPostings, 200);
    },
  )
  .delete("/:id", zValidator("param", jobPostingIdSchema), async (c) => {
    const { id } = c.req.valid("param");

    const updatedRow = await deleteJobPosting(id);

    if (!updatedRow.length) {
      return c.json({ message: "Job posting doesn't exist" }, 404);
    }

    return c.json({ message: "Success" }, 200);
  })
  .get(
    "/:id/used-resume",
    zValidator("param", jobPostingIdSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const selectedJobPosting = await selectUsedResumeByJobId(id);

      if (!selectedJobPosting) {
        return c.json({ error: "Job posting doesn't exist" }, 404);
      }

      return c.json(selectedJobPosting, 200);
    },
  )
  .get(
    "/:id/used-cover-letter",
    zValidator("param", jobPostingIdSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const selectedJobPosting = await selectUsedCoverLetterByJobId(id);

      if (!selectedJobPosting) {
        return c.json({ error: "Job posting doesn't exist" }, 404);
      }

      return c.json(selectedJobPosting, 200);
    },
  )
  .get(
    "/:id/job-description",
    zValidator("param", jobPostingIdSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const selectedJobPosting = await selectJobDescriptionByJobId(id);

      if (!selectedJobPosting) {
        return c.json({ error: "Job posting doesn't exist" }, 404);
      }

      return c.json(selectedJobPosting, 200);
    },
  )
  .post(
    "/:id/reanalyze",
    zValidator("param", jobPostingIdSchema),
    zValidator("json", reanalyzeResumeRequestSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { resumeNumber } = c.req.valid("json");

      const initialData = await selectDataForReanalyze(id);
      if (!initialData) {
        return c.json(
          { error: "Job posting doesn't exist or profile is not set" },
          404,
        );
      }
      if (!initialData.user.geminiKey) {
        return c.json({ error: "Gemini api key not found" }, 404);
      }
      if (!initialData?.user[`resumeContent${resumeNumber}`]) {
        return c.json(
          { error: `Resume ${resumeNumber} content not found` },
          404,
        );
      }

      // using Gemini
      const aiResult = await getGeminiPredictResult({
        title: initialData.jobPosting.title,
        jobDescription: initialData.jobPosting.jobDescription,
        cvText: initialData.user[`resumeContent${resumeNumber}`]!,
        aiKey: initialData.user.geminiKey,
        location: initialData.jobPosting.location,
      });

      await updateJobPostingAnalyze(id, aiResult);

      return c.json({ message: "Success" }, 200);
    },
  )
  .patch(
    "/:id/applied",
    zValidator("param", jobPostingIdSchema),
    zValidator("json", markAsAppliedRequestSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const payload = c.req.valid("json");

      const selectedUser = await selectUser();
      if (!selectedUser) {
        return c.json({ error: "Your profile is not complete" }, 401);
      }
      if (!selectedUser[`resumeContent${payload.resumeNumber}`]) {
        return c.json(
          { error: `Resume ${payload.resumeNumber} content not found` },
          404,
        );
      }

      const selectedJobPosting = await selectJobPostingById(id);
      if (!selectedJobPosting) {
        return c.json({ error: "Job posting doesn't exist" }, 404);
      }

      const selectedResumeContent =
        selectedUser[`resumeContent${payload.resumeNumber}`];

      await updateJobPostingToApplied(id, {
        payload,
        resumeContent: selectedResumeContent!,
      });

      return c.json({ message: "Success" }, 200);
    },
  )
  .patch(
    "/:id/application-status",
    zValidator("param", jobPostingIdSchema),
    zValidator("json", updateApplicationStatusRequestSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const payload = c.req.valid("json");

      const updatedRow = await updateJobPostingApplicationStatus(id, payload);
      if (!updatedRow.length)
        return c.json({ error: "Job posting doesn't exist" }, 404);

      return c.json({ message: "Success" }, 200);
    },
  );

export default jobPostingRoute;
