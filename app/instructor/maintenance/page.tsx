"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, AlertTriangle, Wrench, ClipboardList, ChevronRight, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { aircraft, aircraftTotals, maintenanceItems, squawks, workOrders, users } from "@/lib/mock-data";
import type { AircraftSquawk, MaintenanceItem, WorkOrder } from "@/lib/types";

const statusBadge: Record<string, string> = {
  current: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  due_soon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  grounding: "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300",
};

const severityBadge: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  watch: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  grounding: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const woStatusBadge: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  pending_signoff: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  closed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default function MaintenancePage() {
  const [selectedSquawk, setSelectedSquawk] = useState<AircraftSquawk | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Maintenance</h2>

      {/* Aircraft Status Cards */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Fleet Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {aircraft.map(ac => {
            const totals = aircraftTotals.find(t => t.aircraftId === ac.id);
            const acMx = maintenanceItems.filter(m => m.aircraftId === ac.id);
            const dueSoon = acMx.filter(m => m.status === "due_soon").length;
            const overdue = acMx.filter(m => m.status === "overdue" || m.status === "grounding").length;
            const isGrounded = !!ac.groundedAt;

            return (
              <Card key={ac.id} className={isGrounded ? "border-red-500/50" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className={`h-4 w-4 ${isGrounded ? "text-red-500" : "text-green-500"}`} />
                      <span className="font-semibold text-sm">{ac.tailNumber}</span>
                    </div>
                    <Badge className={isGrounded ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}>
                      {isGrounded ? "Grounded" : "Airworthy"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{ac.make} {ac.model}</p>
                  {totals && (
                    <p className="text-xs text-muted-foreground">Hobbs: {totals.currentHobbs.toFixed(1)}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {dueSoon > 0 && <Badge variant="outline" className="text-[10px] text-yellow-600">Due Soon: {dueSoon}</Badge>}
                    {overdue > 0 && <Badge variant="outline" className="text-[10px] text-red-600">Overdue: {overdue}</Badge>}
                    {dueSoon === 0 && overdue === 0 && <Badge variant="outline" className="text-[10px] text-green-600">All Current</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items"><Wrench className="h-3.5 w-3.5 mr-1" />Due Items</TabsTrigger>
          <TabsTrigger value="squawks"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Squawks</TabsTrigger>
          <TabsTrigger value="workorders"><ClipboardList className="h-3.5 w-3.5 mr-1" />Work Orders</TabsTrigger>
        </TabsList>

        {/* Due / Overdue Items */}
        <TabsContent value="items">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Done</TableHead>
                  <TableHead>Next Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceItems
                  .sort((a, b) => {
                    const order = { grounding: 0, overdue: 1, due_soon: 2, current: 3 };
                    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
                  })
                  .map(item => {
                    const ac = aircraft.find(a => a.id === item.aircraftId);
                    const isExpanded = expandedItemId === item.id;
                    return (
                      <>
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        >
                          <TableCell className="w-8 pr-0">
                            {isExpanded
                              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </TableCell>
                          <TableCell className="font-medium">{ac?.tailNumber}</TableCell>
                          <TableCell>{item.title}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{item.kind.replace(/_/g, " ")}</Badge></TableCell>
                          <TableCell><Badge className={statusBadge[item.status] ?? ""}>{item.status.replace(/_/g, " ")}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.lastCompletedAt ? format(new Date(item.lastCompletedAt), "MMM d, yyyy") : "\u2014"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.nextDueAt ? format(new Date(item.nextDueAt), "MMM d, yyyy") : ""}
                            {item.nextDueHours ? `${item.nextDueHours.toFixed(0)} hrs` : ""}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${item.id}-detail`}>
                            <TableCell colSpan={7} className="bg-muted/30 px-8 py-3">
                              <div className="text-sm">
                                <span className="font-medium text-muted-foreground">Description:</span>
                                <p className="mt-1">{item.description ?? "No description available."}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Squawks */}
        <TabsContent value="squawks">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {squawks.map(sq => {
                  const ac = aircraft.find(a => a.id === sq.aircraftId);
                  return (
                    <TableRow key={sq.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSquawk(sq)}>
                      <TableCell className="font-medium">{ac?.tailNumber}</TableCell>
                      <TableCell><Badge className={severityBadge[sq.severity] ?? ""}>{sq.severity}</Badge></TableCell>
                      <TableCell>{sq.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{sq.status.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(sq.openedAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <Sheet open={!!selectedSquawk} onOpenChange={open => { if (!open) setSelectedSquawk(null); }}>
            <SheetContent>
              {selectedSquawk && (
                <>
                  <SheetHeader><SheetTitle>{selectedSquawk.title}</SheetTitle></SheetHeader>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex gap-2">
                      <Badge className={severityBadge[selectedSquawk.severity] ?? ""}>{selectedSquawk.severity}</Badge>
                      <Badge variant="outline">{selectedSquawk.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <div><span className="text-muted-foreground">Aircraft:</span> <span className="font-medium">{aircraft.find(a => a.id === selectedSquawk.aircraftId)?.tailNumber}</span></div>
                    <div><span className="text-muted-foreground">Opened:</span> <span className="font-medium">{format(new Date(selectedSquawk.openedAt), "MMM d, yyyy")}</span></div>
                    <div><span className="text-muted-foreground">Reported by:</span> <span className="font-medium">{users.find(u => u.id === selectedSquawk.openedByUserId)?.fullName}</span></div>
                    {selectedSquawk.description && <div><span className="text-muted-foreground">Description:</span><p className="mt-1">{selectedSquawk.description}</p></div>}
                    {selectedSquawk.deferredUntil && (
                      <div className="border-t pt-3 mt-3">
                        <span className="font-medium text-muted-foreground">Deferral Information</span>
                        <div className="mt-2 space-y-2">
                          <div><span className="text-muted-foreground">Deferred until:</span> <span className="font-medium">{format(new Date(selectedSquawk.deferredUntil), "MMM d, yyyy")}</span></div>
                          {selectedSquawk.deferralJustification && (
                            <div><span className="text-muted-foreground">Justification:</span><p className="mt-1">{selectedSquawk.deferralJustification}</p></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </TabsContent>

        {/* Work Orders */}
        <TabsContent value="workorders">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map(wo => {
                  const ac = aircraft.find(a => a.id === wo.aircraftId);
                  const assignee = users.find(u => u.id === wo.assignedToUserId);
                  return (
                    <TableRow key={wo.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedWorkOrder(wo)}>
                      <TableCell className="font-medium">{ac?.tailNumber}</TableCell>
                      <TableCell>{wo.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{wo.kind.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell><Badge className={woStatusBadge[wo.status] ?? ""}>{wo.status.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="text-sm">{assignee?.fullName ?? "Unassigned"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(wo.createdAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <Sheet open={!!selectedWorkOrder} onOpenChange={open => { if (!open) setSelectedWorkOrder(null); }}>
            <SheetContent>
              {selectedWorkOrder && (() => {
                const ac = aircraft.find(a => a.id === selectedWorkOrder.aircraftId);
                const assignee = users.find(u => u.id === selectedWorkOrder.assignedToUserId);
                const signedOffBy = selectedWorkOrder.signedOffByUserId
                  ? users.find(u => u.id === selectedWorkOrder.signedOffByUserId)
                  : null;
                return (
                  <>
                    <SheetHeader><SheetTitle>{selectedWorkOrder.title}</SheetTitle></SheetHeader>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex gap-2">
                        <Badge className={woStatusBadge[selectedWorkOrder.status] ?? ""}>{selectedWorkOrder.status.replace(/_/g, " ")}</Badge>
                        <Badge variant="outline">{selectedWorkOrder.kind.replace(/_/g, " ")}</Badge>
                      </div>
                      <div><span className="text-muted-foreground">Aircraft:</span> <span className="font-medium">{ac?.tailNumber}</span></div>
                      <div><span className="text-muted-foreground">Assigned to:</span> <span className="font-medium">{assignee?.fullName ?? "Unassigned"}</span></div>
                      {selectedWorkOrder.description && (
                        <div><span className="text-muted-foreground">Description:</span><p className="mt-1">{selectedWorkOrder.description}</p></div>
                      )}

                      {/* Timeline */}
                      <div className="border-t pt-3 mt-3">
                        <span className="font-medium text-muted-foreground">Timeline</span>
                        <div className="mt-3 relative pl-4 border-l-2 border-muted space-y-4">
                          <div className="relative">
                            <div className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-blue-500" />
                            <div>
                              <p className="font-medium">Created</p>
                              <p className="text-muted-foreground">{format(new Date(selectedWorkOrder.createdAt), "MMM d, yyyy h:mm a")}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full ${selectedWorkOrder.startedAt ? "bg-yellow-500" : "bg-muted"}`} />
                            <div>
                              <p className="font-medium">Started</p>
                              <p className="text-muted-foreground">
                                {selectedWorkOrder.startedAt
                                  ? format(new Date(selectedWorkOrder.startedAt), "MMM d, yyyy h:mm a")
                                  : "Pending"}
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full ${selectedWorkOrder.completedAt ? "bg-green-500" : "bg-muted"}`} />
                            <div>
                              <p className="font-medium">Completed</p>
                              <p className="text-muted-foreground">
                                {selectedWorkOrder.completedAt
                                  ? format(new Date(selectedWorkOrder.completedAt), "MMM d, yyyy h:mm a")
                                  : "Pending"}
                              </p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full ${selectedWorkOrder.signedOffAt ? "bg-purple-500" : "bg-muted"}`} />
                            <div>
                              <p className="font-medium">Signed Off</p>
                              <p className="text-muted-foreground">
                                {selectedWorkOrder.signedOffAt
                                  ? `${format(new Date(selectedWorkOrder.signedOffAt), "MMM d, yyyy h:mm a")} by ${signedOffBy?.fullName ?? "Unknown"}`
                                  : "Pending"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </SheetContent>
          </Sheet>
        </TabsContent>
      </Tabs>
    </div>
  );
}
