"use client";

import React, { useState, useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPitch } from "@/lib/actions";

type ActionState =
  | { status: "INITIAL"; error?: string; _id?: string }
  | { status: "SUCCESS"; _id: string; error?: string }
  | { status: "ERROR"; error: string; _id?: string };

type FieldErrors = Partial<{
  title: string;
  description: string;
  category: string;
  link: string;
  pitch: string;
}>;

const initialState: ActionState = { status: "INITIAL" };

export default function StartupForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pitch, setPitch] = useState<string>("");
  const router = useRouter();

  const handleFormSubmit = async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    try {
      const formValues = {
        title: (formData.get("title") as string) ?? "",
        description: (formData.get("description") as string) ?? "",
        category: (formData.get("category") as string) ?? "",
        link: (formData.get("link") as string) ?? "",
        pitch: pitch ?? "",
      };

      // Validate with Zod
      await formSchema.parseAsync(formValues);

      // Call your server action
      const result = await createPitch(prevState, formData, pitch ?? "");

      // Normalize result into a minimal action state to avoid accidental rendering of big objects
      const id =
        result?._id ??
        (result as any)?.id ??
        (result as any)?.insertedId ??
        (result as any)?.data?._id ??
        (result as any)?.data?.id;

      if (result?.status === "SUCCESS" && id) {
        toast.success("Success", {
          description: "Your startup pitch has been created successfully",
        });
        router.push(`/startup/${String(id)}`);
        return { status: "SUCCESS", _id: String(id) };
      }

      const message =
        (typeof result?.error === "string" && result.error) ||
        "Something went wrong while creating your pitch";
      toast.error(message);
      return { status: "ERROR", error: message };
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fe = err.flatten().fieldErrors;
        setErrors({
          title: fe.title?.join(", "),
          description: fe.description?.join(", "),
          category: fe.category?.join(", "),
          link: fe.link?.join(", "),
          pitch: fe.pitch?.join(", "),
        });
        toast.error("Please check your inputs and try again");
        return { status: "ERROR", error: "Validation failed" };
      }

      console.error("Submit failed:", err);
      toast.error("An unexpected error has occurred");
      return { status: "ERROR", error: "Unexpected error" };
    }
  };

  // React 19's useActionState returns [state, action, isPending]
    const [state, formAction, isPending] = useActionState<ActionState>(
      handleFormSubmit as unknown as (state: ActionState) => ActionState | Promise<ActionState>,
      initialState
    );

  return (
    <form action={formAction} className="startup-form">
      {/* Title */}
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
        />
        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Startup Description"
        />
        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup Category (Tech, Health, Education...)"
        />
        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      {/* Image Link */}
      <div>
        <label htmlFor="link" className="startup-form_label">
          Image URL
        </label>
        <Input
          id="link"
          name="link"
          className="startup-form_input"
          required
          placeholder="Startup Image URL"
        />
        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      {/* Pitch (Markdown) */}
      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>

        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value ?? "")}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          className="startup-form_pitch"
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />
        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Your Pitch"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
}

/*
Note:
- If your app uses React 18 (Next 14), replace useActionState with useFormState/useFormStatus from "react-dom".
  Example:
    import { useFormState, useFormStatus } from "react-dom";
    const [state, formAction] = useFormState(handleFormSubmit, initialState);
    function SubmitButton() {
      const { pending } = useFormStatus();
      return <Button disabled={pending}>...</Button>;
    }
*/