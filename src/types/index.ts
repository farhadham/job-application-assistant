import { InferSelectModel } from "drizzle-orm";

import { availableResumeList } from "@/data/constants";
import {
  jobPostingAnalyzeTable,
  jobPostingTable,
  userTable,
} from "@/database/schema";

// Error message sent by the RPC endpoint
export type APIErrorResponseType = {
  error: string;
};

export type UserType = InferSelectModel<typeof userTable>;
export type JobPostingType = InferSelectModel<typeof jobPostingTable>;
export type JobPostingAnalyzeType = InferSelectModel<
  typeof jobPostingAnalyzeTable
>;

export type AvailableResumeListType = (typeof availableResumeList)[number];
