"use client";

import React, { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChatPanel } from "./ai-chat-panel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AIChatTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating trigger button - only show when panel is closed */}
      {!isOpen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                size="icon"
                className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>AIアシスタント</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Chat panel */}
      <AIChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
