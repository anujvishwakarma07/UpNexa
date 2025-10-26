"use server";

import { auth } from "@/auth";
import { parseServerActionResponse } from "@/lib/utils";
import slugify from "slugify";
import { writeClient } from "@/sanity/lib/write-client";

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

  // Get githubId from session
  const githubId =
    session?.user?.githubId || (session as any)?.user?.githubId || (session as any)?.githubId;

  if (!githubId) {
    return parseServerActionResponse({
      status: "ERROR",
      error: "Missing githubId in session.",
    });
  }

  // Lookup author document by githubId
  const authorDoc = await writeClient.fetch(
    '*[_type == "author" && githubId == $githubId][0]',
    { githubId }
  );
  const authorId = authorDoc?._id;

  if (!authorId) {
    return parseServerActionResponse({
      status: "ERROR",
      error: "Could not find author profile for this user.",
    });
  }

  const title = String(form.get("title") || "");
  const description = String(form.get("description") || "");
  const category = String(form.get("category") || "");
  const link = String(form.get("link") || "");
  const safePitch = String(pitch || "");

  const slug = slugify(title, { lower: true, strict: true });

  const doc = {
    _type: "startup",
    title,
    description,
    category,
    image: link,
    slug: {
      _type: "slug",
      current: slug,
    },
    author: {
      _type: "reference",
      _ref: authorId,
    },
    pitch: safePitch,
  };

  try {
    const created = await writeClient.create(doc);
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
