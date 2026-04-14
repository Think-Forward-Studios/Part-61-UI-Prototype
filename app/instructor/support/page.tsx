"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MapPin, Send } from "lucide-react";

const faq = [
  {
    q: "How do I schedule a training session?",
    a: "Go to the Schedule tab and click 'Add Training'. Follow the step-by-step wizard to select a date, time, student, and resource. The system will automatically suggest the next lesson from the student's syllabus.",
  },
  {
    q: "How do I create a blockout time?",
    a: "From the Schedule tab, click 'Blockout Time'. Select the date range, time range, and reason. This will block your availability for the selected period.",
  },
  {
    q: "How do I view a student's progress?",
    a: "Go to the Students tab and click on the student's name. The Progress sub-tab shows their syllabus completion, including completed lessons, next lesson, and stage-by-stage breakdown.",
  },
  {
    q: "How do I onboard a new student?",
    a: "From the Schedule tab, click 'Add Training', then choose 'New Student'. Fill in the student's demographics, flight experience, medical info, and select a training program. An invitation email will be sent automatically.",
  },
  {
    q: "What do the maintenance status colors mean?",
    a: "Green (Current) = item is within limits. Yellow (Due Soon) = approaching due date or hours. Red (Overdue) = past due, action required. Red with 'Grounding' = aircraft cannot fly until resolved.",
  },
  {
    q: "How do I report a squawk?",
    a: "Go to the Maintenance tab, then the Squawks sub-tab. Click 'Report Squawk' and provide the aircraft, severity level, title, and description. Grounding squawks will immediately restrict dispatch of the aircraft.",
  },
  {
    q: "How does the Live Map work?",
    a: "The Live Map shows real-time ADS-B positions of all aircraft within 50NM of the base. School aircraft are shown as larger blue markers. Click any school aircraft in the bottom bar to center the map on its position.",
  },
  {
    q: "How do I view weather conditions?",
    a: "The Live Map sidebar shows current METAR reports for the base airfield and nearby fields. Color-coded badges indicate flight categories (VFR=green, MVFR=blue, IFR=red, LIFR=purple). Active weather warnings are displayed below.",
  },
];

export default function SupportPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Support</h2>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion>
            {faq.map((item, i) => (
              <AccordionItem key={i}>
                <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>(512) 555-0100</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>support@tfsflightschool.test</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Dothan Regional Airport (KDHN)<br />Dothan, AL 36303</span>
            </div>
            <div className="pt-2 text-xs text-muted-foreground">
              <p>Office Hours: Mon-Fri 7:00 AM - 6:00 PM CST</p>
              <p>Flight Ops: 6:00 AM - 10:00 PM Daily</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submit a Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={e => { e.preventDefault(); alert("Support ticket submitted! (prototype)"); }}>
              <div className="space-y-1">
                <Label className="text-xs">Subject</Label>
                <Input placeholder="Brief description of the issue" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select defaultValue="general">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="scheduling">Scheduling</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Select defaultValue="normal">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea placeholder="Describe your issue in detail..." rows={4} required />
              </div>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-1" />Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
