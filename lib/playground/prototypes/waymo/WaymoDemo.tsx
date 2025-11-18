/**
 * WaymoDemo - Orchestrator for the Waymo ride booking prototype
 *
 * This file follows the three-layer architecture defined in COLLAB_GUIDELINES.md:
 * - Calls tools (never done in components)
 * - Manages message state
 * - Renders Tool UIs based on ToolUIMessage format
 *
 * @see ../../../../COLLAB_GUIDELINES.md
 */

"use client";

import { useState, useCallback } from "react";
import { RideQuote, BookingConfirmation } from "./components";
import {
  getRiderContext,
  getPickupLocation,
  getQuote,
  bookTrip,
  resolveAddress,
} from "./tools";
import type {
  RiderContext,
  RideQuote as RideQuoteType,
  ToolUIMessage,
  RideQuoteProps,
  BookingConfirmationProps,
} from "./types";

interface Message {
  role: "user" | "assistant";
  content: string | ToolUIMessage;
}

export function WaymoDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<RideQuoteType | null>(null);
  const [riderContext, setRiderContext] = useState<RiderContext | null>(null);
  const [awaitingDestination, setAwaitingDestination] = useState(false);
  const [destinationInput, setDestinationInput] = useState("");

  const handleGoldenPath = useCallback(async () => {
    setIsProcessing(true);
    setMessages([{ role: "user", content: "I need a ride home" }]);

    try {
      // Step 1: Get rider context (silent)
      const context = await getRiderContext();
      setRiderContext(context);

      if (!context.home) {
        // Handle no home case in future iteration
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I notice you don't have a home address saved. Where would you like to go?",
          },
        ]);
        setIsProcessing(false);
        return;
      }

      // Step 2: Get pickup location (silent)
      const pickupResult = await getPickupLocation({
        hint: "current_location",
      });

      if (pickupResult.confidence !== "high") {
        // Handle low confidence in future iteration
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I'm having trouble confirming your location. Are you near ${pickupResult.resolvedLocation.name}?`,
          },
        ]);
        setIsProcessing(false);
        return;
      }

      // Step 3: Get quote
      const quote = await getQuote({
        pickup: pickupResult.resolvedLocation,
        dropoff: context.home,
      });
      setCurrentQuote(quote);

      // Step 4: Show assistant response with RideQuote UI
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I can get you home from ${pickupResult.resolvedLocation.name}.`,
        },
        {
          role: "assistant",
          content: {
            type: "tool-ui",
            component: "RideQuote",
            props: {
              state: "interactive",
              quote,
              paymentMethod: context.defaultPaymentMethod,
            },
          },
        },
      ]);
    } catch (error) {
      console.error("Error in golden path:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while getting your ride quote. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleConfirmRide = useCallback(async () => {
    if (!currentQuote || !riderContext) return;

    setIsProcessing(true);

    try {
      // Book the trip
      const trip = await bookTrip({
        quoteId: currentQuote.quoteId,
        paymentMethodId: riderContext.defaultPaymentMethod?.id,
      });

      // Update the RideQuote to receipt state
      setMessages((prev) => {
        const newMessages = [...prev];
        // Find and update the RideQuote message
        for (let i = newMessages.length - 1; i >= 0; i--) {
          const msg = newMessages[i];
          if (
            msg.role === "assistant" &&
            typeof msg.content === "object" &&
            msg.content.component === "RideQuote"
          ) {
            // Update to receipt state
            newMessages[i] = {
              ...msg,
              content: {
                ...msg.content,
                props: {
                  ...msg.content.props,
                  state: "receipt",
                },
              },
            };
            break;
          }
        }
        return newMessages;
      });

      // Add booking confirmation
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: {
            type: "tool-ui",
            component: "BookingConfirmation",
            props: {
              state: "receipt",
              trip,
            },
          },
        },
      ]);
    } catch (error) {
      console.error("Error booking trip:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't complete your booking. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [currentQuote, riderContext]);

  // Friction variant: No saved home address
  const handleFrictionPath = useCallback(async () => {
    setIsProcessing(true);
    setMessages([{ role: "user", content: "I need a ride home" }]);

    try {
      // Get rider context with no home
      const context = await getRiderContext({ noHome: true });
      setRiderContext(context);

      // No home address - ask for destination
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I notice you don't have a home address saved. Where would you like to go?",
        },
      ]);
      setAwaitingDestination(true);
    } catch (error) {
      console.error("Error in friction path:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Handle manual destination input
  const handleDestinationSubmit = useCallback(async () => {
    if (!destinationInput.trim() || !riderContext) return;

    setAwaitingDestination(false);
    setIsProcessing(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: destinationInput },
    ]);

    try {
      // Resolve the address
      const dropoff = await resolveAddress(destinationInput);
      setDestinationInput("");

      // Get pickup location
      const pickupResult = await getPickupLocation({
        hint: "current_location",
      });

      // Get quote
      const quote = await getQuote({
        pickup: pickupResult.resolvedLocation,
        dropoff,
      });
      setCurrentQuote(quote);

      // Show quote
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I can get you to ${dropoff.name} from ${pickupResult.resolvedLocation.name}.`,
        },
        {
          role: "assistant",
          content: {
            type: "tool-ui",
            component: "RideQuote",
            props: {
              state: "interactive",
              quote,
              paymentMethod: riderContext.defaultPaymentMethod,
            },
          },
        },
      ]);
    } catch (error) {
      console.error("Error processing destination:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't find that address. Please try again with a different address.",
        },
      ]);
      setAwaitingDestination(true);
    } finally {
      setIsProcessing(false);
    }
  }, [destinationInput, riderContext]);

  const renderMessage = (message: Message, index: number) => {
    if (message.role === "user") {
      return (
        <div key={index} className="flex justify-end">
          <div className="bg-primary text-primary-foreground max-w-[80%] rounded-lg px-4 py-2">
            {message.content as string}
          </div>
        </div>
      );
    }

    // Assistant message
    if (typeof message.content === "string") {
      return (
        <div key={index} className="flex justify-start">
          <div className="bg-muted max-w-[80%] rounded-lg px-4 py-2">
            {message.content}
          </div>
        </div>
      );
    }

    // Tool UI message
    const toolUI = message.content as ToolUIMessage;
    if (toolUI.component === "RideQuote") {
      const props = toolUI.props as RideQuoteProps;
      return (
        <div key={index} className="flex justify-start">
          <div className="w-full max-w-lg">
            <RideQuote {...props} onConfirm={handleConfirmRide} />
          </div>
        </div>
      );
    }

    if (toolUI.component === "BookingConfirmation") {
      const props = toolUI.props as BookingConfirmationProps;
      return (
        <div key={index} className="flex justify-start">
          <div className="w-full max-w-lg">
            <BookingConfirmation {...props} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="bg-card mb-6 rounded-lg border p-4">
        <h1 className="text-2xl font-bold">Waymo Demo (v0)</h1>
        <p className="text-muted-foreground mt-2">
          Golden path implementation: &ldquo;I need a ride home&rdquo; → 1 click
          booking
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message, index) => renderMessage(message, index))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="bg-foreground/50 h-2 w-2 animate-pulse rounded-full" />
                <div className="bg-foreground/50 animation-delay-200 h-2 w-2 animate-pulse rounded-full" />
                <div className="bg-foreground/50 animation-delay-400 h-2 w-2 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Destination input for friction path */}
      {awaitingDestination && !isProcessing && (
        <div className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleDestinationSubmit();
                }
              }}
              placeholder="Enter destination address..."
              className="bg-background border-input flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleDestinationSubmit}
              disabled={!destinationInput.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-lg px-4 py-2 font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Start buttons */}
      {messages.length === 0 && !isProcessing && (
        <div className="mt-8 space-y-4 text-center">
          <div>
            <button
              onClick={handleGoldenPath}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              Golden Path: &ldquo;I need a ride home&rdquo;
            </button>
          </div>
          <div>
            <button
              onClick={handleFrictionPath}
              className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              Friction: No Saved Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
