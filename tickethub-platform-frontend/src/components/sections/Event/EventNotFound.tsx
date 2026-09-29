import React from "react";
import { Link } from "react-router";
import { CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EventNotFound: React.FC = () => (
  <div className="h-screen flex flex-col items-center justify-center text-center px-4">
    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
      <CalendarOff className="w-30 h-30 text-primary" />
    </div>

    <h1 className="text-2xl font-bold text-foreground mb-2">Event not found</h1>

    <p className="text-neutral-500 max-w-sm mb-6">
      This event doesn't exist or may have been removed.
    </p>

    <div className="flex gap-3 justify-center items-center">
      <Button className="p-2 mt-2 rounded-full">
        <Link to="/events" className="p-2">
          Browse events
        </Link>
      </Button>

      <Button variant="outline" className="mt-2 rounded-full">
        <Link to="/" className="p-2">
          Go home
        </Link>
      </Button>
    </div>
  </div>
);
