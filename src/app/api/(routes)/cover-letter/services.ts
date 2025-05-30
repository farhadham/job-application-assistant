import { eq, getTableColumns } from "drizzle-orm";

import { db } from "@/database";
import { jobPostingTable, userTable } from "@/database/schema";

export const selectDataForCoverLetterContent = async (jobPostingId: number) => {
  return db
    .select({
      jobPosting: {
        jobDescription: jobPostingTable.jobDescription,
        title: jobPostingTable.title,
        companyName: jobPostingTable.companyName,
        location: jobPostingTable.location,
      },
      user: getTableColumns(userTable),
    })
    .from(jobPostingTable)
    .crossJoin(userTable)
    .where(eq(jobPostingTable.id, jobPostingId))
    .then((rows) => rows.at(0));
};

export const updateJobPostingAddCoverLetterContent = async (
  jobPostingId: number,
  content: string,
) => {
  return db
    .update(jobPostingTable)
    .set({ usedCoverLetterContent: content })
    .where(eq(jobPostingTable.id, jobPostingId));
};
