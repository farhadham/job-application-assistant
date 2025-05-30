import { ZodSchema } from "zod";
import type { ValidationTargets } from "hono";
import { zValidator as zv } from "@hono/zod-validator";

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets = keyof ValidationTargets
>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: result.error.issues
            .map((issue) => {
              return `Validation error happened at ${issue.path.join(
                " - "
              )}. cause: ${issue.message}`;
            })
            .join(" | "),
        },
        400
      );
    }
  });
