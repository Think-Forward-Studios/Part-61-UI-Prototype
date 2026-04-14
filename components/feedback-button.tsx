"use client";

import { useState, useCallback } from "react";
import { MessageSquarePlus, Camera, Download, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FEEDBACK_EMAIL = "joshuabone@thinkforwardstudio.com";

type FeedbackType = "bug" | "layout" | "suggestion" | "question" | "general";

const typeLabels: Record<FeedbackType, string> = {
  bug: "Bug / Broken",
  layout: "Layout / Design",
  suggestion: "Feature Suggestion",
  question: "Question",
  general: "General Feedback",
};

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [comment, setComment] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general");
  const [name, setName] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [sent, setSent] = useState(false);

  const handleOpen = useCallback(() => {
    setCurrentPage(window.location.pathname);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setScreenshotUrl(null);
    setScreenshotBlob(null);
    setComment("");
    setFeedbackType("general");
    setName("");
    setSent(false);
  }, []);

  const handleSubmit = useCallback(() => {
    // Build mailto
    const subject = encodeURIComponent(
      `[Part 61 UI Feedback] ${typeLabels[feedbackType]} - ${currentPage}`
    );
    const body = encodeURIComponent(
      [
        `Type: ${typeLabels[feedbackType]}`,
        `Page: ${currentPage}`,
        `From: ${name || "Anonymous"}`,
        ``,
        `Feedback:`,
        comment,
        ``,
        `---`,
        screenshotBlob
          ? `Screenshot was downloaded - please attach it to this email.`
          : `No screenshot captured.`,
        ``,
        `Sent from Part 61 UI Prototype`,
      ].join("\n")
    );

    window.open(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
  }, [screenshotBlob, feedbackType, currentPage, name, comment]);

  return (
    <div id="feedback-widget" className="fixed bottom-4 right-4 z-[200]">
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="group flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="text-sm font-medium">Test Feedback</span>
        </button>
      )}

      {/* Feedback panel */}
      {open && (
        <div className="w-[380px] rounded-xl border bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in-0 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Test Feedback</span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-md p-1 hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {sent ? (
            /* Success state */
            <div className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium">Feedback ready!</p>
              <p className="text-sm text-muted-foreground">
                Your email client should have opened with the feedback details. Attach your screenshot if you have one, then hit send.
              </p>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          ) : (
            /* Form */
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {/* Screenshot upload */}
              {screenshotUrl ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Screenshot attached
                    </Label>
                    <button
                      onClick={() => { setScreenshotUrl(null); setScreenshotBlob(null); }}
                      className="flex items-center gap-1 text-xs text-destructive hover:underline"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                  <div className="rounded-md border overflow-hidden bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotUrl}
                      alt="Screenshot"
                      className="w-full h-auto max-h-32 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-1.5 rounded-md border border-dashed p-3 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Take a screenshot (<span className="font-mono">Cmd+Shift+4</span>) then click here to attach
                  </span>
                  <span className="text-xs text-primary font-medium">
                    Attach Screenshot
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setScreenshotBlob(file);
                      setScreenshotUrl(URL.createObjectURL(file));
                    }}
                  />
                </label>
              )}

              {/* Name */}
              <div className="space-y-1">
                <Label className="text-xs">Your Name (optional)</Label>
                <Input
                  placeholder="Who's sending this?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <Label className="text-xs">Feedback Type</Label>
                <Select
                  value={feedbackType}
                  onValueChange={(v) => v && setFeedbackType(v as FeedbackType)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <Label className="text-xs">
                  Comment <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder="What did you notice? What should change?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                  autoFocus
                />
              </div>

              {/* Page context */}
              <p className="text-[10px] text-muted-foreground">
                Page: {currentPage}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!comment.trim()}
                  onClick={handleSubmit}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Feedback
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
