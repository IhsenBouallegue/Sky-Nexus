"use client";

import Title from "@/components/title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Page() {
  return (
    <div className="flex flex-col p-6 w-full">
      <Title>Network</Title>

      <Accordion type="single" collapsible>
        <AccordionItem value="1">
          <AccordionTrigger>System ID and Component ID</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>Heartbeat Rate</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="3">
          <AccordionTrigger>Connection Ports</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="4">
          <AccordionTrigger>Device List</AccordionTrigger>
          <AccordionContent>Som</AccordionContent>
        </AccordionItem>
        <AccordionItem value="5">
          <AccordionTrigger>System ID and Component ID</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
