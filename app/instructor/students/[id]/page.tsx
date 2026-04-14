"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, UserCog, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  users, personProfiles, emergencyContacts, enrollments,
  stages, lessons, gradeSheets, reservations, getNextLesson,
} from "@/lib/mock-data";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const user = users.find(u => u.id === id);
  const profile = personProfiles.find(p => p.userId === id);
  const contacts = emergencyContacts.filter(c => c.userId === id);
  const enrollment = enrollments.find(e => e.userId === id);

  const completedLessonIds = useMemo(() => {
    if (!enrollment) return new Set<string>();
    return new Set(gradeSheets.filter(gs => gs.studentEnrollmentId === enrollment.id && gs.status === "sealed").map(gs => gs.lessonId));
  }, [enrollment]);

  const nextLesson = enrollment ? getNextLesson(enrollment.id) : null;
  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.size;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const studentReservations = reservations
    .filter(r => r.studentId === id && r.status !== "cancelled")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (!user) return <div className="p-8 text-center text-muted-foreground">Student not found</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/instructor/students">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-1" />Schedule Training</Button>
          <Button variant="outline" size="sm"><UserCog className="h-4 w-4 mr-1" />Change Instructor</Button>
          <Button variant="outline" size="sm"><BookOpen className="h-4 w-4 mr-1" />Change Syllabus</Button>
          <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="h-4 w-4 mr-1" />Remove</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Demographics */}
        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {profile && (
                  <>
                    <Row label="Name" value={`${profile.firstName} ${profile.lastName}`} />
                    <Row label="Date of Birth" value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), "MMM d, yyyy") : "—"} />
                    <Row label="Phone" value={profile.phone ?? "—"} />
                    <Row label="Email" value={user.email} />
                    <Row label="Address" value={[profile.addressLine1, profile.city, profile.state, profile.postalCode].filter(Boolean).join(", ") || "—"} />
                    <Row label="FAA Cert #" value={profile.faaAirmanCertNumber ?? "Not on file"} />
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Emergency Contact</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {contacts.length > 0 ? contacts.map(c => (
                  <div key={c.id}>
                    <Row label="Name" value={c.name} />
                    <Row label="Relationship" value={c.relationship} />
                    <Row label="Phone" value={c.phone} />
                    <Row label="Email" value={c.email ?? "—"} />
                  </div>
                )) : <p className="text-muted-foreground">No emergency contact on file</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Medical & Enrollment</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Medical Class" value="Third Class" />
                <Row label="Medical Expiry" value="Dec 31, 2027" />
                <Row label="Enrolled" value={enrollment ? format(new Date(enrollment.enrolledAt), "MMM d, yyyy") : "—"} />
                <Row label="Program" value="Private Pilot (PPL)" />
                <Row label="Instructor" value={users.find(u => u.id === enrollment?.primaryInstructorId)?.fullName ?? "—"} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{completedCount} / {totalLessons} lessons</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{progressPercent}% complete</p>
            </CardContent>
          </Card>

          {nextLesson && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">Next Lesson</p>
                <p className="font-semibold mt-1">{nextLesson.code}: {nextLesson.title}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">{nextLesson.kind}</Badge>
                  {nextLesson.minHours && <Badge variant="secondary">{nextLesson.minHours}h</Badge>}
                </div>
              </CardContent>
            </Card>
          )}

          <Accordion multiple defaultValue={stages.map((_, i) => i)}>
            {stages.map(stage => {
              const stageLessons = lessons.filter(l => l.stageId === stage.id);
              const stageCompleted = stageLessons.filter(l => completedLessonIds.has(l.id)).length;
              const stagePercent = stageLessons.length > 0 ? Math.round((stageCompleted / stageLessons.length) * 100) : 0;

              return (
                <AccordionItem key={stage.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-medium">{stage.code}: {stage.title}</span>
                      <Badge variant="secondary" className="ml-auto mr-2">{stageCompleted}/{stageLessons.length}</Badge>
                      <Progress value={stagePercent} className="w-16 h-2" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pl-2">
                      {stageLessons.map(lesson => {
                        const done = completedLessonIds.has(lesson.id);
                        const gs = gradeSheets.find(g => g.lessonId === lesson.id && g.studentEnrollmentId === enrollment?.id);
                        return (
                          <div key={lesson.id} className="flex items-center gap-3 py-1.5 text-sm">
                            <div className={`h-2.5 w-2.5 rounded-full ${done ? "bg-green-500" : lesson.id === nextLesson?.id ? "bg-blue-500 animate-pulse" : "bg-muted"}`} />
                            <span className={done ? "" : "text-muted-foreground"}>
                              {lesson.code}: {lesson.title}
                            </span>
                            <Badge variant="outline" className="ml-auto text-xs">{lesson.kind}</Badge>
                            {done && gs && (
                              <span className="text-xs text-muted-foreground">{format(new Date(gs.conductedAt), "MMM d")}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Upcoming & Recent Sessions</CardTitle></CardHeader>
            <CardContent>
              {studentReservations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scheduled sessions</p>
              ) : (
                <div className="space-y-2">
                  {studentReservations.map(r => {
                    const lesson = lessons.find(l => l.id === r.lessonId);
                    const isPast = new Date(r.endTime) < new Date();
                    return (
                      <div key={r.id} className={`flex items-center gap-3 p-2 rounded-md text-sm ${isPast ? "opacity-60" : "bg-muted/50"}`}>
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: isPast ? "#9ca3af" : "#3b82f6" }} />
                        <div className="flex-1">
                          <p className="font-medium">{lesson ? `${lesson.code}: ${lesson.title}` : (r.notes ?? r.activityType)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(r.startTime), "EEE, MMM d")} {format(new Date(r.startTime), "h:mm a")} - {format(new Date(r.endTime), "h:mm a")}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">{r.activityType}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
