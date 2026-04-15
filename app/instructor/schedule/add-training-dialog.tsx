"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronRight, UserPlus, Check, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { ExperienceFields } from "@/components/experience-fields";
import { getInstructorStudents, getNextLesson, aircraft, rooms, users, enrollments } from "@/lib/mock-data";
import { IDS } from "@/lib/mock-data/ids";

type Step = "date" | "student" | "training" | "resource" | "new-student" | "confirm";

export function AddTrainingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { currentUser } = useAuth();
  const instructorId = currentUser?.id ?? IDS.instructorMike;
  const myStudents = getInstructorStudents(instructorId);

  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [duration, setDuration] = useState("1.5");
  const [resourceId, setResourceId] = useState("");

  // New student form
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [medicalFileName, setMedicalFileName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const selectedEnrollment = enrollments.find(e => e.userId === studentId);
  const nextLesson = selectedEnrollment ? getNextLesson(selectedEnrollment.id) : null;

  function reset() {
    setStep("date");
    setDate(undefined);
    setTimeOfDay("");
    setStudentId("");
    setIsNewStudent(false);
    setDuration("1.5");
    setResourceId("");
    setNewFirst("");
    setNewLast("");
    setNewEmail("");
    setNewPhone("");
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  const isFlightLesson = nextLesson?.kind === "flight" || nextLesson?.kind === "simulator";
  const resourceLabel = isFlightLesson ? "Aircraft" : "Classroom";
  const resourceOptions = isFlightLesson
    ? aircraft.filter(a => !a.groundedAt).map(a => ({ id: a.id, name: `${a.tailNumber} - ${a.make} ${a.model}` }))
    : rooms.map(r => ({ id: r.id, name: `${r.name} (Cap: ${r.capacity})` }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn("sm:max-w-lg", step === "new-student" && "sm:max-w-xl max-h-[85vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>
            {step === "new-student" ? "Onboard New Student" : "Schedule Training"}
          </DialogTitle>
          {step !== "new-student" && step !== "confirm" && (
            <div className="flex items-center gap-1 pt-2">
              {(["date", "student", "training", "resource"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    step === s ? "bg-primary" : (["date", "student", "training", "resource"].indexOf(step) > i ? "bg-primary/50" : "bg-muted")
                  )} />
                  {i < 3 && <div className="w-6 h-px bg-muted" />}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Step: Date */}
        {step === "date" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger className={cn("w-full justify-start text-left font-normal inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm", !date && "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Time of Day</Label>
              <Select value={timeOfDay} onValueChange={v => v && setTimeOfDay(v)}>
                <SelectTrigger><SelectValue placeholder="Select time block" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (7:00 - 12:00)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12:00 - 17:00)</SelectItem>
                  <SelectItem value="evening">Evening (17:00 - 20:00)</SelectItem>
                  <SelectItem value="night">Night (20:00 - 23:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button disabled={!date || !timeOfDay} onClick={() => setStep("student")}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step: Student */}
        {step === "student" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant={!isNewStudent ? "default" : "outline"} className="flex-1" onClick={() => setIsNewStudent(false)}>
                Current Student
              </Button>
              <Button variant={isNewStudent ? "default" : "outline"} className="flex-1" onClick={() => setIsNewStudent(true)}>
                <UserPlus className="h-4 w-4 mr-1" />New Student
              </Button>
            </div>

            {!isNewStudent ? (
              <div className="space-y-2">
                <Label>Select Student</Label>
                <Select value={studentId} onValueChange={v => v && setStudentId(v)}>
                  <SelectTrigger><SelectValue placeholder="Choose student..." /></SelectTrigger>
                  <SelectContent>
                    {myStudents.map(s => (
                      <SelectItem key={s.user.id} value={s.user.id}>
                        {s.user.fullName} - {s.progressPercent}% complete
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep("date")}>Back</Button>
              {isNewStudent ? (
                <Button onClick={() => setStep("new-student")}>
                  Continue to Onboarding <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button disabled={!studentId} onClick={() => setStep("training")}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </DialogFooter>
          </div>
        )}

        {/* Step: New Student Onboarding */}
        {step === "new-student" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input value={newFirst} onChange={e => setNewFirst(e.target.value)} placeholder="First name" />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input value={newLast} onChange={e => setNewLast(e.target.value)} placeholder="Last name" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="student@email.com" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="512-555-0000" />
            </div>

            <Separator />
            <ExperienceFields />
            <Separator />
            <div className="space-y-1">
              <Label>Medical Class</Label>
              <Select defaultValue="third">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Class</SelectItem>
                  <SelectItem value="second">Second Class</SelectItem>
                  <SelectItem value="third">Third Class</SelectItem>
                  <SelectItem value="basicmed">BasicMed</SelectItem>
                  <SelectItem value="none">None Yet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Upload Medical Certificate (optional)</Label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed cursor-pointer hover:bg-muted/50 transition-colors text-sm text-muted-foreground flex-1">
                  <Upload className="h-4 w-4 shrink-0" />
                  <span className="truncate">{medicalFileName || "Choose image or PDF..."}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setMedicalFileName(file.name);
                    }}
                  />
                </label>
                {medicalFileName && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setMedicalFileName("")}>
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Image will be stored securely and linked to the student record.</p>
            </div>
            <div className="space-y-1">
              <Label>Training Program</Label>
              <Select defaultValue="ppl">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ppl">Private Pilot (PPL)</SelectItem>
                  <SelectItem value="ir">Instrument Rating</SelectItem>
                  <SelectItem value="cpl">Commercial Pilot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep("student")}>Back</Button>
              <Button
                disabled={!newFirst || !newLast || !newEmail}
                onClick={() => {
                  // Simulate onboarding
                  alert(`Student ${newFirst} ${newLast} onboarded! Invitation email sent to ${newEmail}.`);
                  setStep("training");
                }}
              >
                Onboard Student <Check className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step: Training */}
        {step === "training" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Next Training</Label>
              {nextLesson ? (
                <div className="p-3 rounded-md border bg-muted/50">
                  <p className="font-medium">{nextLesson.code}: {nextLesson.title}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{nextLesson.kind}</Badge>
                    {nextLesson.minHours && <Badge variant="secondary">{nextLesson.minHours}h min</Badge>}
                  </div>
                  {nextLesson.objectives && <p className="text-xs text-muted-foreground mt-2">{nextLesson.objectives}</p>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No next lesson found in syllabus.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Duration (hours)</Label>
              <Input
                type="number"
                step="0.5"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep("student")}>Back</Button>
              <Button onClick={() => setStep("resource")}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step: Resource */}
        {step === "resource" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{resourceLabel}</Label>
              <Select value={resourceId} onValueChange={v => v && setResourceId(v)}>
                <SelectTrigger><SelectValue placeholder={`Select ${resourceLabel.toLowerCase()}...`} /></SelectTrigger>
                <SelectContent>
                  {resourceOptions.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        {r.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Showing available {resourceLabel.toLowerCase()}s for {date ? format(date, "MMM d") : "selected date"}, {timeOfDay || "selected time"}
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep("training")}>Back</Button>
              <Button disabled={!resourceId} onClick={() => setStep("confirm")}>
                Review <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{date ? format(date, "EEE, MMM d, yyyy") : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium capitalize">{timeOfDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student</span>
                <span className="font-medium">{users.find(u => u.id === studentId)?.fullName ?? (newFirst ? `${newFirst} ${newLast}` : "New Student")}</span>
              </div>
              {nextLesson && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lesson</span>
                  <span className="font-medium">{nextLesson.code}: {nextLesson.title}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{duration}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{resourceLabel}</span>
                <span className="font-medium">{resourceOptions.find(r => r.id === resourceId)?.name ?? ""}</span>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setStep("resource")}>Back</Button>
              <Button onClick={() => { alert("Training session scheduled! (prototype)"); handleClose(false); }}>
                Schedule Training <Check className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
