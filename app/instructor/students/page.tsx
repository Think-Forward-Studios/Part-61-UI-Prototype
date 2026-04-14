"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getInstructorStudents, users, personHolds, noShows } from "@/lib/mock-data";
import { IDS } from "@/lib/mock-data/ids";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

export default function StudentsPage() {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("mine");

  const instructors = users.filter(u => u.id === IDS.instructorMike || u.id === IDS.instructorSarah || u.id === IDS.instructorJames);

  const allStudents = useMemo(() => {
    if (instructorFilter === "mine") {
      return getInstructorStudents(currentUser?.id ?? IDS.instructorMike);
    }
    if (instructorFilter === "all") {
      return [
        ...getInstructorStudents(IDS.instructorMike),
        ...getInstructorStudents(IDS.instructorSarah),
        ...getInstructorStudents(IDS.instructorJames),
      ];
    }
    return getInstructorStudents(instructorFilter);
  }, [instructorFilter, currentUser?.id]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return allStudents;
    if (statusFilter === "idle") return allStudents.filter(s => s.daysSinceActivity > 30);
    return allStudents.filter(s => s.status === statusFilter);
  }, [allStudents, statusFilter]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Students</h2>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={v => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="idle">Idle (&gt;30 days)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={instructorFilter} onValueChange={v => v && setInstructorFilter(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mine">My Students</SelectItem>
              <SelectItem value="all">All Instructors</SelectItem>
              {instructors.map(i => (
                <SelectItem key={i.id} value={i.id}>{i.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No students found</TableCell>
              </TableRow>
            )}
            {filtered.map(s => {
              const hasHold = personHolds.some(h => h.userId === s.user.id && !h.clearedAt);
              const noShowCount = noShows.filter(n => n.userId === s.user.id).length;
              return (
              <TableRow key={s.user.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/instructor/students/${s.user.id}`} className="font-medium hover:underline">
                      {s.user.fullName}
                    </Link>
                    {hasHold && <Badge variant="destructive" className="text-[10px]">HOLD</Badge>}
                    {noShowCount > 0 && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-400">{noShowCount} NS</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{s.user.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={s.status === "active" ? "default" : "secondary"} className={
                    s.daysSinceActivity > 30 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : ""
                  }>
                    {s.daysSinceActivity > 30 ? "Idle" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">Private Pilot (PPL)</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(s.lastActivity), "MMM d, yyyy")}
                  <span className="text-xs block">{s.daysSinceActivity}d ago</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={s.progressPercent} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">{s.progressPercent}%</span>
                  </div>
                </TableCell>
              </TableRow>
            );})}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
