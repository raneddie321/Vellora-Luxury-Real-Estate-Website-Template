"use client";

import * as React from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { contactContent } from "@/config/content";
import { email as emailRule, minLength, required, submitDemo, validate } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Values = {
  name: string;
  email: string;
  phone: string;
  reason: string;
  message: string;
};

const initial: Values = { name: "", email: "", phone: "", reason: "", message: "" };

/**
 * Frontend-only by design — `submitDemo` stands in for a request so every
 * state is real and visible. Point it at your own endpoint (see .env.example)
 * and the rest of the component is unchanged.
 */
export function ContactForm({
  compact = false,
  defaultReason,
  recipient,
  className,
}: {
  compact?: boolean;
  defaultReason?: string;
  recipient?: string;
  className?: string;
}) {
  const id = React.useId();
  const [values, setValues] = React.useState<Values>({
    ...initial,
    reason: defaultReason ?? "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof Values, string>>>({});
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");
  const { toast } = useToast();

  const set = (key: keyof Values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate(values, {
      name: [required("Your name")],
      email: [emailRule],
      reason: [required("A reason")],
      message: [required("A message"), minLength(12, "Your message")],
    });
    setErrors(found);
    if (Object.keys(found).length) {
      // Move focus to the first problem so keyboard users are not hunting.
      const firstKey = Object.keys(found)[0];
      document.getElementById(`${id}-${firstKey}`)?.focus();
      return;
    }
    setState("loading");
    await submitDemo(values);
    setState("done");
    toast({
      title: "Enquiry sent",
      description: recipient ? `${recipient} will reply shortly.` : "We will reply shortly.",
      tone: "success",
    });
  }

  if (state === "done") {
    return (
      <div
        role="status"
        className={cn("border border-hairline bg-surface-raised p-8 text-center", className)}
      >
        <span className="mx-auto flex size-12 items-center justify-center border border-[var(--accent)] text-[var(--accent)]">
          <Check className="size-5" aria-hidden />
        </span>
        <h3 className="mt-6 font-serif text-2xl tracking-[-0.025em] text-content">
          Thank you — that has reached us.
        </h3>
        <p className="measure-tight mx-auto mt-3 text-sm leading-relaxed text-content-muted">
          {recipient ? `${recipient} will` : "An advisor will"} reply within one working day,
          usually much sooner. If it is urgent, please call the office.
        </p>
        <Button
          variant="outline"
          className="mt-7"
          onClick={() => {
            setValues({ ...initial, reason: defaultReason ?? "" });
            setState("idle");
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("space-y-7", className)}>
      <div className={cn("grid gap-7", compact ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
        <Field id={`${id}-name`} label="Name" required error={errors.name}>
          <Input
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
            placeholder="Your full name"
          />
        </Field>
        <Field id={`${id}-email`} label="Email" required error={errors.email}>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>
        <Field id={`${id}-phone`} label="Phone" hint="Optional" error={errors.phone}>
          <Input
            type="tel"
            value={values.phone}
            onChange={(e) => set("phone")(e.target.value)}
            autoComplete="tel"
            placeholder="+351 000 000 000"
          />
        </Field>
        <div className="space-y-2.5">
          <Label htmlFor={`${id}-reason`}>
            Reason<span className="ml-1 text-[var(--accent)]">*</span>
          </Label>
          <Select value={values.reason} onValueChange={set("reason")}>
            <SelectTrigger
              id={`${id}-reason`}
              aria-invalid={errors.reason ? true : undefined}
              aria-describedby={errors.reason ? `${id}-reason-error` : undefined}
            >
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              {contactContent.reasons.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.reason ? (
            <p id={`${id}-reason-error`} role="alert" className="text-xs text-[var(--color-danger)]">
              {errors.reason}
            </p>
          ) : null}
        </div>
      </div>

      <Field id={`${id}-message`} label="Message" required error={errors.message}>
        <Textarea
          rows={5}
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder="Tell us what you are looking for, or what you are thinking of selling."
        />
      </Field>

      <div className="flex flex-wrap items-center gap-5 pt-1">
        <Button type="submit" size="lg" disabled={state === "loading"}>
          {state === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
          {state === "loading" ? "Sending" : "Send enquiry"}
        </Button>
        <p className="max-w-xs text-xs leading-relaxed text-content-faint">
          This demo form does not send anything. Connect your own endpoint to make it live.
        </p>
      </div>
    </form>
  );
}
