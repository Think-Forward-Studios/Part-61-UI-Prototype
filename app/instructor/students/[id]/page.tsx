"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, UserCog, BookOpen, Trash2, ShieldAlert, Clock, FileText, Award, AlertTriangle, TrendingUp, ClipboardCheck, Ban, Plus, Pencil } from "lucide-react";
import { AddEndorsementDialog } from "@/components/student-detail/add-endorsement-dialog";
import { AddTestGradeDialog } from "@/components/student-detail/add-test-grade-dialog";
import { AddStageCheckDialog } from "@/components/student-detail/add-stage-check-dialog";
import { AddOverrideDialog } from "@/components/student-detail/add-override-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  users, personProfiles, emergencyContacts, enrollments,
  stages, lessons, gradeSheets, reservations, getNextLesson,
  studentEndorsements, stageChecks, flightLogTimes, lineItemGrades,
  testGrades, personHolds, documents, infoReleaseAuthorizations,
  lessonOverrides, noShows, progressForecasts, auditExceptions, lineItems,
  aircraft,
} from "@/lib/mock-data";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const user = users.find(u => u.id === id);
  const profile = personProfiles.find(p => p.userId === id);
  const contacts = emergencyContacts.filter(c => c.userId === id);
  const enrollment = enrollments.find(e => e.userId === id);

  // Progress data
  const completedLessonIds = useMemo(() => {
    if (!enrollment) return new Set<string>();
    return new Set(gradeSheets.filter(gs => gs.studentEnrollmentId === enrollment.id && gs.status === "sealed").map(gs => gs.lessonId));
  }, [enrollment]);
  const nextLesson = enrollment ? getNextLesson(enrollment.id) : null;
  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.size;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  // New data connections
  const holds = personHolds.filter(h => h.userId === id && !h.clearedAt);
  const endorsements = studentEndorsements.filter(e => e.studentUserId === id && !e.revokedAt);
  const studentStageChecks = enrollment ? stageChecks.filter(sc => sc.studentEnrollmentId === enrollment.id) : [];
  const studentFlightTime = flightLogTimes.filter(f => f.userId === id);
  const studentTestGrades = enrollment ? testGrades.filter(t => t.studentEnrollmentId === enrollment.id) : [];
  const studentDocs = documents.filter(d => d.userId === id);
  const studentReleases = infoReleaseAuthorizations.filter(r => r.userId === id && !r.revokedAt);
  const studentOverrides = enrollment ? lessonOverrides.filter(o => o.studentEnrollmentId === enrollment.id && !o.revokedAt) : [];
  const studentNoShows = noShows.filter(n => n.userId === id);
  const forecast = enrollment ? progressForecasts.find(f => f.studentEnrollmentId === enrollment.id) : null;
  const exceptions = enrollment ? auditExceptions.filter(e => e.studentEnrollmentId === enrollment.id && !e.resolvedAt) : [];

  const studentReservations = reservations
    .filter(r => r.studentId === id && r.status !== "cancelled")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Compute flight time totals
  const totalDual = studentFlightTime.filter(f => f.kind === "dual_received").reduce((sum, f) => sum + f.dayMinutes + f.nightMinutes, 0);
  const totalSolo = studentFlightTime.filter(f => f.kind === "solo").reduce((sum, f) => sum + f.dayMinutes + f.nightMinutes, 0);
  const totalXC = studentFlightTime.reduce((sum, f) => sum + f.crossCountryMinutes, 0);
  const totalNight = studentFlightTime.reduce((sum, f) => sum + f.nightMinutes, 0);
  const totalLandings = studentFlightTime.reduce((sum, f) => sum + f.dayLandings + f.nightLandings, 0);
  const totalInstrument = studentFlightTime.reduce((sum, f) => sum + f.instrumentActualMinutes + f.instrumentSimulatedMinutes, 0);

  // Simulator vs Aircraft split
  const simFlightTime = studentFlightTime.filter(f => f.isSimulator);
  const acftFlightTime = studentFlightTime.filter(f => !f.isSimulator);
  const totalSimDual = simFlightTime.filter(f => f.kind === "dual_received").reduce((sum, f) => sum + f.dayMinutes + f.nightMinutes, 0);
  const totalSimSolo = simFlightTime.filter(f => f.kind === "solo").reduce((sum, f) => sum + f.dayMinutes + f.nightMinutes, 0);
  const totalSimXC = simFlightTime.reduce((sum, f) => sum + f.crossCountryMinutes, 0);
  const totalSimNight = simFlightTime.reduce((sum, f) => sum + f.nightMinutes, 0);
  const totalSimInstrument = simFlightTime.reduce((sum, f) => sum + f.instrumentActualMinutes + f.instrumentSimulatedMinutes, 0);
  const totalSimLandings = simFlightTime.reduce((sum, f) => sum + f.dayLandings + f.nightLandings, 0);
  const totalAcftDual = acftFlightTime.filter(f => f.kind === "dual_received").reduce((sum, f) => sum + f.dayMinutes + f.nightMinutes, 0);
  const totalAcftSolo = acftFlightTime.filter(f => f.kind === "solo").reduce((sum, f) => sum + f.dayMinutes + f.nightMinutes, 0);
  const totalAcftXC = acftFlightTime.reduce((sum, f) => sum + f.crossCountryMinutes, 0);
  const totalAcftNight = acftFlightTime.reduce((sum, f) => sum + f.nightMinutes, 0);
  const totalAcftInstrument = acftFlightTime.reduce((sum, f) => sum + f.instrumentActualMinutes + f.instrumentSimulatedMinutes, 0);
  const totalAcftLandings = acftFlightTime.reduce((sum, f) => sum + f.dayLandings + f.nightLandings, 0);

  // Instrument approaches count
  const totalApproaches = studentFlightTime.reduce((sum, f) => sum + f.instrumentApproaches, 0);

  // Dialog states
  const [editDemographics, setEditDemographics] = useState(false);
  const [addEndorsement, setAddEndorsement] = useState(false);
  const [addTestGrade, setAddTestGrade] = useState(false);
  const [addStageCheck, setAddStageCheck] = useState(false);
  const [addOverride, setAddOverride] = useState(false);

  if (!user) return <div className="p-8 text-center text-muted-foreground">Student not found</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Active Holds Banner */}
      {holds.length > 0 && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Active Hold</AlertTitle>
          <AlertDescription>
            {holds.map(h => (
              <div key={h.id} className="mt-1">
                <Badge variant="destructive" className="mr-2">{h.kind}</Badge>
                {h.reason}
                <span className="text-xs ml-2">({format(new Date(h.createdAt), "MMM d, yyyy")})</span>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Audit Exceptions Banner */}
      {exceptions.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/5">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-600 dark:text-yellow-400">Compliance Warnings</AlertTitle>
          <AlertDescription>
            {exceptions.map(ex => (
              <div key={ex.id} className="mt-1 flex items-center gap-2">
                <Badge className={ex.severity === "critical" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : ex.severity === "warn" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}>
                  {ex.severity}
                </Badge>
                <span className="text-sm">{ex.kind.replace(/_/g, " ")}</span>
                <span className="text-xs text-muted-foreground">Detected {format(new Date(ex.firstDetectedAt), "MMM d")}</span>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/instructor/students">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{user.fullName}</h2>
              {holds.length > 0 && <Badge variant="destructive" className="text-xs">HOLD</Badge>}
              {studentNoShows.length > 0 && <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">{studentNoShows.length} No-Show{studentNoShows.length > 1 ? "s" : ""}</Badge>}
            </div>
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

        {/* ════════ DEMOGRAPHICS TAB ════════ */}
        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Personal Information</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setEditDemographics(!editDemographics); alert(editDemographics ? "Edit mode disabled (prototype)" : "Edit mode enabled — fields would become editable (prototype)"); }}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />{editDemographics ? "Done" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {profile && (
                  <>
                    <Row label="Name" value={`${profile.firstName} ${profile.lastName}`} />
                    <Row label="Date of Birth" value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), "MMM d, yyyy") : "—"} />
                    <Row label="Phone" value={profile.phone ?? "—"} />
                    <Row label="Email" value={user.email} />
                    <Row label="Address" value={[profile.addressLine1, profile.addressLine2, profile.city, profile.state, profile.postalCode].filter(Boolean).join(", ") || "—"} />
                    {profile.country && <Row label="Country" value={profile.country} />}
                    {profile.emailAlt && <Row label="Alt. Email" value={profile.emailAlt} />}
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
                    <Row label="Name" value={c.isPrimary ? `${c.name}` : c.name} />
                    {c.isPrimary && <Badge variant="outline" className="text-[10px] mb-1">Primary</Badge>}
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
                {(() => {
                  const medDoc = studentDocs.find(d => d.kind === "medical");
                  return (
                    <>
                      <Row label="Medical on File" value={medDoc ? "Yes" : "No"} />
                      {medDoc?.expiresAt && <Row label="Medical Expiry" value={format(new Date(medDoc.expiresAt), "MMM d, yyyy")} />}
                    </>
                  );
                })()}
                <Row label="Enrolled" value={enrollment ? format(new Date(enrollment.enrolledAt), "MMM d, yyyy") : "—"} />
                <Row label="Program" value="Private Pilot (PPL)" />
                <Row label="Instructor" value={users.find(u => u.id === enrollment?.primaryInstructorId)?.fullName ?? "—"} />
                {enrollment?.planCadenceHoursPerWeek && <Row label="Target Pace" value={`${enrollment.planCadenceHoursPerWeek}h/week`} />}
                {enrollment?.completedAt && <Row label="Status" value={`Completed ${format(new Date(enrollment.completedAt), "MMM d, yyyy")}`} />}
                {enrollment?.withdrawnAt && <Row label="Status" value={`Withdrawn ${format(new Date(enrollment.withdrawnAt), "MMM d, yyyy")}`} />}
                {enrollment?.notes && <Row label="Notes" value={enrollment.notes} />}
              </CardContent>
            </Card>

            {/* Documents Card — NEW */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Documents</CardTitle></CardHeader>
              <CardContent>
                {studentDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents on file</p>
                ) : (
                  <div className="space-y-2">
                    {studentDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between py-1 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{doc.kind.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.expiresAt && (
                            <Badge variant={new Date(doc.expiresAt) < new Date() ? "destructive" : "outline"} className="text-[10px]">
                              {new Date(doc.expiresAt) < new Date() ? "Expired" : `Exp ${format(new Date(doc.expiresAt), "MMM yyyy")}`}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{format(new Date(doc.uploadedAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Release Authorizations — NEW */}
            <Card>
              <CardHeader><CardTitle className="text-base">Info Release Authorizations</CardTitle></CardHeader>
              <CardContent>
                {studentReleases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No release authorizations on file</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {studentReleases.map(r => (
                      <div key={r.id} className="py-1">
                        <Row label="Authorized Person" value={r.name} />
                        <Row label="Relationship" value={r.relationship} />
                        <Row label="Granted" value={format(new Date(r.grantedAt), "MMM d, yyyy")} />
                        {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════ PROGRESS TAB ════════ */}
        <TabsContent value="progress" className="space-y-4">

          {/* Row 1: Overall Progress + Forecast */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Progress Forecast — NEW */}
            {forecast && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Forecast</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">{forecast.confidence} confidence</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Actual / Expected Hours</p>
                      <p className="font-semibold">{forecast.actualHoursToDate} / {forecast.expectedHoursToDate}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ahead / Behind</p>
                      <p className={`font-semibold ${forecast.aheadBehindHours >= 0 ? "text-green-600" : "text-amber-600"}`}>
                        {forecast.aheadBehindHours > 0 ? "+" : ""}{forecast.aheadBehindHours}h ({forecast.aheadBehindWeeks > 0 ? "+" : ""}{forecast.aheadBehindWeeks}w)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="font-semibold">{forecast.remainingHours}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Projected Checkride</p>
                      <p className="font-semibold">{forecast.projectedCheckrideDate ? format(new Date(forecast.projectedCheckrideDate), "MMM d, yyyy") : "—"}</p>
                    </div>
                    {forecast.projectedCompletionDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Projected Completion</p>
                        <p className="font-semibold">{format(new Date(forecast.projectedCompletionDate), "MMM d, yyyy")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Next Lesson */}
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

          {/* Flight Time Summary — NEW */}
          {studentFlightTime.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />Flight Time Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Totals</p>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 text-center">
                    <TimeBlock label="Dual" value={totalDual} />
                    <TimeBlock label="Solo" value={totalSolo} />
                    <TimeBlock label="Cross-Country" value={totalXC} />
                    <TimeBlock label="Night" value={totalNight} />
                    <TimeBlock label="Instrument" value={totalInstrument} />
                    <div>
                      <p className="text-xs text-muted-foreground">Landings</p>
                      <p className="text-lg font-semibold">{totalLandings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Approaches</p>
                      <p className="text-lg font-semibold">{totalApproaches}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Aircraft</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
                    <TimeBlock label="Dual" value={totalAcftDual} />
                    <TimeBlock label="Solo" value={totalAcftSolo} />
                    <TimeBlock label="Cross-Country" value={totalAcftXC} />
                    <TimeBlock label="Night" value={totalAcftNight} />
                    <TimeBlock label="Instrument" value={totalAcftInstrument} />
                    <div>
                      <p className="text-xs text-muted-foreground">Landings</p>
                      <p className="text-lg font-semibold">{totalAcftLandings}</p>
                    </div>
                  </div>
                </div>
                {simFlightTime.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Simulator</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
                        <TimeBlock label="Dual" value={totalSimDual} />
                        <TimeBlock label="Solo" value={totalSimSolo} />
                        <TimeBlock label="Cross-Country" value={totalSimXC} />
                        <TimeBlock label="Night" value={totalSimNight} />
                        <TimeBlock label="Instrument" value={totalSimInstrument} />
                        <div>
                          <p className="text-xs text-muted-foreground">Landings</p>
                          <p className="text-lg font-semibold">{totalSimLandings}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Endorsements — NEW */}
          {endorsements.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4" />Endorsements</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setAddEndorsement(true)}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {endorsements.map(end => (
                    <div key={end.id} className="p-3 rounded-md border bg-muted/30 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{end.category.replace(/_/g, " ")}</Badge>
                        {end.sealed && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px]">Sealed</Badge>}
                        {end.expiresAt && (
                          <Badge variant={new Date(end.expiresAt) < new Date() ? "destructive" : "secondary"} className="text-[10px] ml-auto">
                            {new Date(end.expiresAt) < new Date() ? "Expired" : `Exp ${format(new Date(end.expiresAt), "MMM d, yyyy")}`}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{end.renderedText}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <span>Issued {format(new Date(end.issuedAt), "MMM d, yyyy")}</span>
                        {end.issuedByUserId && <span>by {users.find(u => u.id === end.issuedByUserId)?.fullName ?? "Unknown"}</span>}
                        {end.aircraftContext && <span>| {end.aircraftContext}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Grades — NEW */}
          {studentTestGrades.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" />Test Results</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setAddTestGrade(true)}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[400px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Recorded By</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentTestGrades.map(tg => (
                        <TableRow key={tg.id}>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{tg.testKind}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {tg.score != null ? `${tg.score}/${tg.maxScore}` : "P"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{format(new Date(tg.recordedAt), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{users.find(u => u.id === tg.recordedByUserId)?.fullName ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{tg.remarks ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage Checks — NEW */}
          {studentStageChecks.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4" />Stage Checks</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setAddStageCheck(true)}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentStageChecks.map(sc => {
                    const stage = stages.find(s => s.id === sc.stageId);
                    const checker = users.find(u => u.id === sc.checkerUserId);
                    return (
                      <div key={sc.id} className="p-2 rounded-md border text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`h-2.5 w-2.5 rounded-full ${sc.status === "passed" ? "bg-green-500" : sc.status === "failed" ? "bg-red-500" : "bg-blue-500"}`} />
                          <div className="flex-1">
                            <p className="font-medium">{stage?.title ?? "Stage Check"}</p>
                            <p className="text-xs text-muted-foreground">
                              Checker: {checker?.fullName ?? "—"}
                              {sc.conductedAt ? ` | ${format(new Date(sc.conductedAt), "MMM d, yyyy")}` : sc.scheduledAt ? ` | Scheduled ${format(new Date(sc.scheduledAt), "MMM d, yyyy")}` : ""}
                            </p>
                          </div>
                          <Badge className={sc.status === "passed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : sc.status === "failed" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}>
                            {sc.status}
                          </Badge>
                        </div>
                        {sc.remarks && <p className="text-xs text-muted-foreground mt-1 ml-5 italic">{sc.remarks}</p>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Overrides — NEW */}
          {studentOverrides.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2"><Ban className="h-4 w-4 text-amber-500" />Active Overrides</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setAddOverride(true)}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentOverrides.map(ov => {
                    const lesson = lessons.find(l => l.id === ov.lessonId);
                    return (
                      <div key={ov.id} className="p-2 rounded-md border border-amber-500/20 bg-amber-500/5 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">{ov.kind.replace(/_/g, " ")}</Badge>
                          <span className="font-medium">{lesson?.code}: {lesson?.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{ov.justification}</p>
                        <p className="text-xs text-muted-foreground">
                          Granted {format(new Date(ov.grantedAt), "MMM d, yyyy")}
                          {ov.grantedByUserId && ` by ${users.find(u => u.id === ov.grantedByUserId)?.fullName ?? "Unknown"}`}
                          {" | "}Expires {format(new Date(ov.expiresAt), "MMM d, yyyy")} | {ov.consumedAt ? "Consumed" : "Unused"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Syllabus Breakdown Accordion */}
          <h3 className="text-sm font-medium text-muted-foreground pt-2">Syllabus Breakdown</h3>
          <Accordion multiple defaultValue={stages.map((_, i) => i)}>
            {stages.map(stage => {
              const stageLessons = lessons.filter(l => l.stageId === stage.id);
              const stageCompleted = stageLessons.filter(l => completedLessonIds.has(l.id)).length;
              const stagePercent = stageLessons.length > 0 ? Math.round((stageCompleted / stageLessons.length) * 100) : 0;
              const stageCheck = studentStageChecks.find(sc => sc.stageId === stage.id);

              return (
                <AccordionItem key={stage.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-medium">{stage.code}: {stage.title}</span>
                      {stageCheck && (
                        <Badge className={`text-[10px] ${stageCheck.status === "passed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : stageCheck.status === "scheduled" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : ""}`}>
                          {stageCheck.status === "passed" ? "Check Passed" : stageCheck.status === "scheduled" ? "Check Scheduled" : stageCheck.status}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="ml-auto mr-2">{stageCompleted}/{stageLessons.length}</Badge>
                      <Progress value={stagePercent} className="w-16 h-2" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pl-2">
                      {stageLessons.map(lesson => {
                        const done = completedLessonIds.has(lesson.id);
                        const gs = gradeSheets.find(g => g.lessonId === lesson.id && g.studentEnrollmentId === enrollment?.id);
                        const lessonLineItems = lineItems.filter(li => li.lessonId === lesson.id);
                        const lessonLineGrades = gs ? lineItemGrades.filter(lig => lig.gradeSheetId === gs.id) : [];

                        return (
                          <div key={lesson.id}>
                            <div className="flex items-center gap-3 py-1.5 text-sm">
                              <div className={`h-2.5 w-2.5 rounded-full ${done ? "bg-green-500" : lesson.id === nextLesson?.id ? "bg-blue-500 animate-pulse" : "bg-muted"}`} />
                              <span className={done ? "" : "text-muted-foreground"}>
                                {lesson.code}: {lesson.title}
                              </span>
                              <Badge variant="outline" className="ml-auto text-xs">{lesson.kind}</Badge>
                              {done && gs && (
                                <span className="text-xs text-muted-foreground">{format(new Date(gs.conductedAt), "MMM d")}</span>
                              )}
                            </div>
                            {/* Line Item Grades — NEW */}
                            {lessonLineGrades.length > 0 && (
                              <div className="ml-6 mb-2 space-y-0.5">
                                {lessonLineGrades.map(lig => {
                                  const li = lessonLineItems.find(l => l.id === lig.lineItemId);
                                  return (
                                    <div key={lig.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                                      <span>{li?.title ?? "Line Item"}</span>
                                      <Badge variant="outline" className="text-[10px] ml-auto">{lig.gradeValue}</Badge>
                                      {lig.gradeRemarks && <span className="text-[10px] italic">{lig.gradeRemarks}</span>}
                                    </div>
                                  );
                                })}
                              </div>
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

        {/* ════════ SCHEDULE TAB ════════ */}
        <TabsContent value="schedule" className="space-y-4">
          {/* No-Shows — NEW */}
          {studentNoShows.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle className="text-base flex items-center gap-2 text-amber-600"><AlertTriangle className="h-4 w-4" />No-Show History ({studentNoShows.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentNoShows.map(ns => (
                    <div key={ns.id} className="flex items-center gap-3 p-2 rounded-md bg-amber-500/5 text-sm">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{format(new Date(ns.scheduledAt), "EEE, MMM d, yyyy")}</p>
                        <p className="text-xs">{ns.reason ?? "No reason provided"}</p>
                        <p className="text-xs text-muted-foreground">
                          {ns.instructorId ? `Instructor: ${users.find(u => u.id === ns.instructorId)?.fullName ?? "—"}` : ""}
                          {ns.instructorId && ns.aircraftId ? " | " : ""}
                          {ns.aircraftId ? `Aircraft: ${aircraft.find(a => a.id === ns.aircraftId)?.tailNumber ?? "—"}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

      {/* Dialogs */}
      <AddEndorsementDialog open={addEndorsement} onOpenChange={setAddEndorsement} studentName={user.fullName} />
      <AddTestGradeDialog open={addTestGrade} onOpenChange={setAddTestGrade} studentName={user.fullName} />
      <AddStageCheckDialog open={addStageCheck} onOpenChange={setAddStageCheck} studentName={user.fullName} />
      <AddOverrideDialog open={addOverride} onOpenChange={setAddOverride} studentName={user.fullName} />
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

function TimeBlock({ label, value }: { label: string; value: number }) {
  const hours = (value / 60).toFixed(1);
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{hours}h</p>
    </div>
  );
}
