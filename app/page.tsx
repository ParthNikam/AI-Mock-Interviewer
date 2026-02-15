"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { startInterview } from "@/lib/actions/interview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const Orb = dynamic(() => import("@/components/Orb"), { ssr: false });

const ROLES = [
  "Product Manager",
  "Technical Architect",
  "Software Engineer",
  "Data Scientist",
  "Human Resources",
  "Growth Marketer",
  "Customer Success Lead",
  "Visionary Leader",
];

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState("random");
  const [category, setCategory] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { user } = useAuth()

  const handleStartInterview = async () => {
    if (!user) return router.push('/auth/signin')

    try {
      const { chatId } = await startInterview(selectedRole || "Product Manager");
      const params = new URLSearchParams({
        mode,
        category: category || "all",
        role: selectedRole || "Product Manager",
      });
      router.push(`/chat/${chatId}?${params.toString()}`);
    } catch (err) {
      console.error("Failed to start interview:", err);
    }
  };

  return (
    <div className="h-full w-full relative flex items-center min-h-screen">
     
        {/* Orb - centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="size-72 md:size-80 lg:size-96">
            <Orb
              hoverIntensity={2}
              rotateOnHover
              hue={20}
              forceHoverState={isSpeaking}
              backgroundColor="#000000"
            />
          </div>
        </div>

        {/* Config card */}
        <div className="ml-auto pr-16 w-full max-w-md">

        <Card className="w-full max-w-md shrink-0">
        <CardHeader>
            <CardTitle>Interview Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Interview Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select interview role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Interview button */}
            <Button
              size="lg"
              className="mt-2 w-full text-base font-semibold py-6"
              onClick={handleStartInterview}
            >
              Start Interview
            </Button>
          </CardContent>
        </Card>
        </div>
    </div>
  );
}
