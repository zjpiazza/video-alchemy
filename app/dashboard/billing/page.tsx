"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export default function BillingPage() {
  const { user } = useAuth()

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic video transformations with client-side processing",
      features: [
        "Client-side processing only",
        "5 transformations per month",
        "720p max resolution",
        "Basic effects (resize, compress, trim)",
        "No watermark",
      ],
      limitations: ["No server-side processing", "Limited effects", "No batch processing"],
      current: user?.plan === "free",
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "Advanced video transformations with server-side processing",
      features: [
        "Client and server-side processing",
        "50 transformations per month",
        "4K resolution support",
        "All effects including advanced ones",
        "Batch processing",
        "5GB storage",
        "Priority support",
      ],
      current: user?.plan === "pro",
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per month",
      description: "For teams and businesses with high-volume needs",
      features: [
        "Unlimited transformations",
        "8K resolution support",
        "Custom effects",
        "API access",
        "50GB storage",
        "Dedicated support",
        "Custom branding",
      ],
      current: user?.plan === "enterprise",
    },
  ]

  // Mock billing history
  const billingHistory = [
    {
      id: "INV-001",
      date: "May 1, 2023",
      amount: "$12.00",
      status: "Paid",
    },
    {
      id: "INV-002",
      date: "Apr 1, 2023",
      amount: "$12.00",
      status: "Paid",
    },
    {
      id: "INV-003",
      date: "Mar 1, 2023",
      amount: "$12.00",
      status: "Paid",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing</h1>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={`flex flex-col ${plan.current ? "border-primary bg-primary/5" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.current && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Current Plan
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations?.map((limitation) => (
                      <li key={limitation} className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">✕ {limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant={plan.current ? "outline" : "default"} className="w-full" disabled={plan.current}>
                    {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 border-b p-3 font-medium">
                  <div>Invoice</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                {billingHistory.map((invoice) => (
                  <div key={invoice.id} className="grid grid-cols-4 border-b p-3 last:border-0">
                    <div className="font-medium">{invoice.id}</div>
                    <div>{invoice.date}</div>
                    <div>{invoice.amount}</div>
                    <div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-md bg-muted p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2024</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Add Payment Method</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
