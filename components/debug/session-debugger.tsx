"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SessionDebugger() {
  const { data: session } = useSession();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mb-4 border-dashed border-orange-300">
      <CardHeader>
        <CardTitle className="text-sm text-orange-600">Debug Session</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify({
            sessionExists: !!session,
            userExists: !!session?.user,
            userId: session?.user?.id,
            userEmail: session?.user?.email,
            userName: session?.user?.name
          }, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
