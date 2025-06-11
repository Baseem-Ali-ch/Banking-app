"use client";

import type React from "react";
import { toast } from 'sonner'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { depositToWallet } from "@/store/slices/walletSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export function WalletDepositForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { wallet, isLoading } = useAppSelector((state) => state.wallet);

  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ amount?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: { amount?: string } = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors
    setErrors({});

    try {
      // Process the deposit
      const result = await dispatch(
        depositToWallet({
          amount: Number(amount),
          location: location || "Unknown",
          description: description || "Wallet deposit",
        })
      ).unwrap();

      // Show success message
      toast.success("Deposit Successful", {
        description: result.message || 'Add money transaction created successfully. Please wait for admin approval',
        duration: 1500,
        position: 'top-right'
      });

      // Redirect to wallet page
      router.push("/dashboard");
    } catch (error: any) {
      // Show error message
      toast.error("Deposit Failed", {
        description: error?.message || "An error occurred while processing your deposit.",
        duration: 1500,
        position: 'top-right'
      });
    }
  };

  return (
    <div className="container px-4 py-6 pb-20">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 p-0 h-8 w-8"
          onClick={() => router.push("/dashboard/wallet")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Add Money</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Money to Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {wallet?.currency === "USD"
                      ? "$"
                      : wallet?.currency === "EUR"
                        ? "€"
                        : wallet?.currency === "GBP"
                          ? "£"
                          : wallet?.currency === "SAR"
                            ? "﷼"
                            : "$"}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  type="string"
                  placeholder="Enter your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}

                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a note for this deposit"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Add Funds"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
