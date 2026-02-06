import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md mx-4 glass-panel border-white/10">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500 opacity-80" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-white">Path Lost</h1>
          
          <p className="text-white/60 font-body">
            You've wandered too far into the mists. This clearing does not exist on any map.
          </p>
          
          <Link href="/">
            <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to the Grove
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
