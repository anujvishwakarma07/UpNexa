"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "@/lib/utils";
import slugify from "slugify";
import { writeClient } from "@/sanity/lib/write-client";
// Optionally add server-side validation:
// import { formSchema } from "@/lib/validation";
// import { z } from "zod";

type ActionState =
  | { status: "INITIAL"; error?: string; _id?: string }
  | { status: "SUCCESS"; _id: string; error?: string }
  | { status: "ERROR"; error: string; _id?: string };

export const createPitch = async (
  _state: ActionState,
  form: FormData,
  pitch: string
): Promise<ActionState> => {
  const session = await auth();
  if (!session) {
    return parseServerActionResponse({
      status: "ERROR",
      error: "Not signed in",
    });
  }

  // Most NextAuth setups expose the user id as session.user.id
  const userId =
    // @ts-ignore – depend on your auth shape
    session?.user?.id || (session as any)?.id;

  if (!userId) {
    return parseServerActionResponse({
      status: "ERROR",
      error: "User id missing in session",
    });
  }

  const title = String(form.get("title") || "");
  const description = String(form.get("description") || "");
  const category = String(form.get("category") || "");
  const link = String(form.get("link") || "");
  const safePitch = String(pitch || "");

  // Optional: server-side validation mirror (recommended)
  // try {
  //   await formSchema.parseAsync({
  //     title,
  //     description,
  //     category,
  //     link,
  //     pitch: safePitch,
  //   });
  // } catch (e) {
  //   return parseServerActionResponse({
  //     status: "ERROR",
  //     error: "Validation failed",
  //   });
  // }

  const slug = slugify(title, { lower: true, strict: true });

  const doc = {
    _type: "startup",
    title,
    description,
    category,
    image: link,
    slug: {
      _type: "slug", // FIXED: must be "slug"
      current: slug,
    },
    author: {
      _type: "reference",
      _ref: userId, // FIXED: use session.user.id
    },
    pitch: safePitch,
  };

  try {
    const created = await writeClient.create(doc);
    // Return minimal shape only to avoid React rendering issues
    return parseServerActionResponse({
      status: "SUCCESS",
      _id: String(created._id),
      error: "",
    });
  } catch (err: any) {
    console.error("createPitch failed:", err);
    return parseServerActionResponse({
      status: "ERROR",
      error: err?.message || "Failed to create pitch",
    });
  }
};