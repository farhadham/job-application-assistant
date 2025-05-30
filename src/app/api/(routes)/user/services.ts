import { db } from "@/database";
import { userTable } from "@/database/schema";
import { UpdateUserRequestType } from "./validators";

export const selectUser = async () => {
  return db
    .select()
    .from(userTable)
    .then((rows) => rows.at(0));
};

export const updateUser = (payload: UpdateUserRequestType) => {
  return db
    .insert(userTable)
    .values(payload)
    .onConflictDoUpdate({ set: payload, target: userTable.email });
};
