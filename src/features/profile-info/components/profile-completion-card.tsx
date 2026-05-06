import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProfileCompletionCardProps {
  completion: number;
}

export function ProfileCompletionCard({
  completion,
}: ProfileCompletionCardProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Completion</CardTitle>
          </div>
          <Badge
            variant={completion >= 80 ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {completion}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={completion} className="h-3" />
        {completion < 100 && (
          <p className="text-sm text-muted-foreground mt-3">
            Fill in more information to increase your profile completion and
            improve job matching accuracy.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
