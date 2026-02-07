import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { BackgroundEffects } from "@/components/BackgroundEffects";

import Home from "@/pages/Home";
import Controls from "@/pages/Controls";
import Leaderboard from "@/pages/Leaderboard";
import Story from "@/pages/Story";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/controls" component={Controls} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/story" component={Story} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BackgroundEffects />
        <Navigation />
        <main className="relative z-10">
          <Router />
        </main>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
