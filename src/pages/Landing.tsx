import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, Wallet, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Users,
    title: "Connect with IITians",
    description: "Find and connect with verified students from all IITs across India.",
  },
  {
    icon: MapPin,
    title: "Plan Trips Together",
    description: "Create or join trips with fellow IITians. Explore new places together.",
  },
  {
    icon: Wallet,
    title: "Split Expenses",
    description: "Built-in expense splitting makes managing group costs effortless.",
  },
  {
    icon: Shield,
    title: "Verified Community",
    description: "OTP verification ensures only genuine IIT students join the platform.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">IIT Connect</h1>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Connect. Plan. Explore.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            The exclusive platform for IIT students to discover each other, 
            plan amazing trips, and split expenses seamlessly.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Join Now
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <h3 className="mb-12 text-center text-3xl font-bold text-foreground">
            Why IIT Connect?
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-card/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h3 className="mb-4 text-3xl font-bold">Ready to explore with your tribe?</h3>
              <p className="mb-8 text-lg opacity-90">
                Join hundreds of IIT students already connecting and traveling together.
              </p>
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Sign Up with Your IIT Email
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 IIT Connect. Made with ❤️ for IITians.</p>
        </div>
      </footer>
    </div>
  );
}
