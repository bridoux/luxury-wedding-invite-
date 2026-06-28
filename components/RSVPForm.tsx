"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { submitRsvp } from "@/lib/rsvpService";
import { attendanceOptions } from "@/lib/config";
import { useLocalizedConfig } from "@/components/WeddingConfigProvider";
import { useT } from "@/components/LanguageProvider";
import { getIcsDataUri } from "@/lib/calendar";
import { CardCorners, MonogramCrest, FloralDivider } from "@/components/Ornaments";
import type { RsvpFormValues } from "@/types/rsvp";

interface RSVPFormProps {
  guestCode?: string;
  defaultName?: string;
  maxGuests?: number;
  /** When true, redirect to /thank-you on success instead of showing inline card. */
  redirectToThankYou?: boolean;
}

export default function RSVPForm({
  guestCode,
  defaultName = "",
  maxGuests = 6,
  redirectToThankYou = false
}: RSVPFormProps) {
  const weddingConfig = useLocalizedConfig();
  const t = useT();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [mocked, setMocked] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<RsvpFormValues>({
    defaultValues: {
      guestCode,
      fullName: defaultName,
      email: "",
      phone: "",
      attendanceStatus: "attending",
      guestCount: 1,
      additionalGuestNames: "",
      mealPreference: "",
      dietaryRestrictions: "",
      accommodationNeeded: false,
      message: "",
      consentUpdates: false
    }
  });

  const attendance = watch("attendanceStatus");
  const guestCount = Number(watch("guestCount"));
  const isAttending = attendance === "attending";

  const onSubmit = async (values: RsvpFormValues) => {
    setServerError(null);
    const result = await submitRsvp({ ...values, guestCode });

    if (!result.success) {
      setServerError(result.error ?? t.rsvp.serverError);
      return;
    }

    if (redirectToThankYou) {
      const summary = {
        name: values.fullName,
        status: values.attendanceStatus,
        guestCount: values.guestCount,
        mocked: result.mocked
      };
      try {
        sessionStorage.setItem("rsvp_summary", JSON.stringify(summary));
      } catch {
        /* ignore storage errors */
      }
      router.push("/thank-you");
      return;
    }

    setMocked(result.mocked);
    setSubmitted(true);
  };

  // ── Inline success card ──────────────────────────────────
  if (submitted) {
    const values = getValues();
    const statusLabel = t.attendance[values.attendanceStatus];
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="paper-card relative mx-auto max-w-lg px-8 py-12 text-center sm:px-12"
      >
        <CardCorners />
        <div className="relative z-20 flex flex-col items-center">
          <MonogramCrest initials={weddingConfig.couple.initials} size={96} />
          <h3 className="mt-5 script text-5xl">
            {t.rsvp.thankYou}{values.fullName ? `, ${values.fullName.split(" ")[0]}` : ""}
          </h3>
          <FloralDivider className="my-5" />
          <p className="font-serif text-lg font-light text-ink-soft">{t.rsvp.received}</p>
          <p className="mt-3 font-sans text-sm uppercase tracking-[0.2em] text-champagne-dark">
            {statusLabel}
            {isAttending &&
              ` · ${values.guestCount} ${values.guestCount > 1 ? t.rsvp.guests : t.rsvp.guest}`}
          </p>
          {mocked && (
            <p className="mt-4 rounded-md bg-sage-light/25 px-3 py-2 font-sans text-xs text-ink-soft">
              {t.rsvp.demoMode}
            </p>
          )}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={getIcsDataUri(weddingConfig)} download="wedding.ics" className="btn-gold">
              {t.cta.addToCalendar}
            </a>
            <button type="button" onClick={() => setSubmitted(false)} className="btn-outline">
              {t.rsvp.editResponse}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── The form ─────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="paper-card relative mx-auto max-w-2xl px-6 py-10 sm:px-10 sm:py-12"
      noValidate
    >
      <CardCorners />
      <div className="relative z-20 space-y-6">
        <div className="mb-2 text-center">
          <p className="eyebrow-plain text-[0.62rem]">{t.rsvp.replyCard}</p>
          <p className="script mt-1 text-3xl">{t.rsvp.withPleasure}</p>
        </div>

        {/* Attendance status — segmented choice */}
        <fieldset>
          <legend className="field-label mx-auto text-center">{t.rsvp.joining}</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {attendanceOptions.map((opt) => (
              <label
                key={opt.value}
                className="relative cursor-pointer rounded-lg border border-champagne/30 bg-ivory-50/70 p-4 text-center transition-all duration-300 hover:border-champagne/60 has-[:checked]:border-champagne has-[:checked]:bg-champagne/10 has-[:checked]:shadow-gold"
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register("attendanceStatus", { required: true })}
                />
                <span className="block text-2xl">{opt.icon}</span>
                <span className="mt-1.5 block font-sans text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">
                  {t.attendance[opt.value]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="field-label">
            {t.rsvp.fullName} *
          </label>
          <input
            id="fullName"
            className="input-field"
            placeholder={t.rsvp.namePlaceholder}
            aria-invalid={!!errors.fullName}
            {...register("fullName", { required: t.rsvp.nameRequired })}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-blush-dark">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            {t.rsvp.email}
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t.rsvp.emailInvalid
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-blush-dark">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="field-label">
            {t.rsvp.phone}
          </label>
          <input
            id="phone"
            type="tel"
            className="input-field"
            placeholder="+1 (555) 000-0000"
            {...register("phone")}
          />
        </div>

        <div>
          <label htmlFor="guestCount" className="field-label">
            {t.rsvp.guestCount}
          </label>
          <select
            id="guestCount"
            className="input-field"
            disabled={!isAttending}
            {...register("guestCount", { valueAsNumber: true })}
          >
            {Array.from({ length: maxGuests }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional attending-only fields */}
      <AnimatePresence initial={false}>
        {isAttending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            {guestCount > 1 && (
              <div>
                <label htmlFor="additionalGuestNames" className="field-label">
                  {t.rsvp.additionalNames}
                </label>
                <input
                  id="additionalGuestNames"
                  className="input-field"
                  placeholder="e.g. Jane Doe, John Doe"
                  {...register("additionalGuestNames")}
                />
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label htmlFor="message" className="field-label">
          {t.rsvp.message}
        </label>
        <textarea
          id="message"
          rows={3}
          className="input-field resize-none"
          placeholder={t.rsvp.messagePlaceholder}
          {...register("message")}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 accent-champagne"
          {...register("consentUpdates")}
        />
        <span className="font-sans text-sm text-ink-soft">
          {t.rsvp.consent}
        </span>
      </label>

      {serverError && (
        <p className="rounded-xl bg-blush-light/60 px-4 py-2 text-center font-sans text-sm text-blush-dark">
          {serverError}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileTap={{ scale: 0.97 }}
        className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? t.rsvp.sending : t.rsvp.send}
      </motion.button>

        <p className="text-center font-sans text-xs uppercase tracking-[0.18em] text-ink-light">
          {weddingConfig.couple.combined} · {weddingConfig.date.display}
        </p>
      </div>
    </form>
  );
}
