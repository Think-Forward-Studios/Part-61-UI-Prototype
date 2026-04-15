"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, UserPlus, Mail, Clock } from "lucide-react";
import { TFSBadge } from "@/components/tfs-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { Watermark } from "@/components/watermark";
import { useAuth } from "@/lib/auth-context";
import { school, base } from "@/lib/mock-data";

export default function LandingPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = login(email, password);
    if (result.success && result.role) {
      router.push("/instructor/schedule");
    } else {
      setError("Invalid credentials. Try instructor@tfs.test / demo");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Hero + Login Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Branding */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <TFSBadge size={52} />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">TFS Flight School</h1>
                <p className="text-sm text-muted-foreground">Part 61 Flight School</p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
              Your journey to the skies starts here. Professional flight training with experienced
              instructors, modern aircraft, and a structured curriculum.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                5 Aircraft in Fleet
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                3 Certified Instructors
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                {base.name}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {(base.timezone ?? school.timezone).replace("America/", "")} Time
              </div>
            </div>
          </div>

          {/* Right: Login Card */}
          <Card className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@tfs.test"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full">Sign In</Button>
                <p className="text-xs text-muted-foreground text-center pt-1">
                  Demo: instructor@tfs.test / any password
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Prospective Students Section */}
      <section className="border-t bg-muted/40 px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Start Your Aviation Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* What We Offer */}
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">What We Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {["Private Pilot Certificate (PPL)", "Instrument Rating (IR)", "Commercial Pilot Certificate", "Multi-Engine Rating", "CFI / CFII / MEI Certificates"].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* How to Apply */}
            <Card>
              <CardHeader>
                <UserPlus className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">How to Apply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                {[
                  "Contact us or visit for a discovery flight",
                  "Complete enrollment and obtain your medical",
                  "Get paired with an instructor to start training",
                  "Complete your syllabus and pass the FAA checkride",
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-medium">{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={e => { e.preventDefault(); alert("Message sent! (prototype)"); }}>
                  <Input placeholder="Your name" required />
                  <Input type="email" placeholder="Your email" required />
                  <Textarea placeholder="How can we help you?" rows={3} required />
                  <Button type="submit" variant="outline" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Watermark />
    </div>
  );
}
