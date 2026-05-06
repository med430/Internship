import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OauthNoticeCard() {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-blue-900 dark:text-blue-100">
          OAuth Account
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Email and password management is handled by your OAuth provider.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
