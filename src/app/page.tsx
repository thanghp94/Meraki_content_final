import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 rounded-full w-fit mb-4">
            <Gamepad2 size={48} className="text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to GridWise Quizzing!</CardTitle>
          <CardDescription className="text-lg">
            The fun and engaging way to review topics with your students.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-center text-muted-foreground">
            Create a customizable grid-based quiz game, manage teams, and track scores in real-time.
            Ready to challenge your class?
          </p>
          <Link href="/setup" legacyBehavior>
            <Button size="lg" className="w-full text-lg py-6">
              Create New Game
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
