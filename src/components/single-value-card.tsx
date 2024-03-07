import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function SingleValueCard({
  title,
  value,
  unit,
}: { title: string; value: string; unit: string }) {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="pb-0">
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center flex-1 py-6">
        <div className="flex flex-col items-center space-y-1">
          <div className="text-4xl font-semibold leading-none">
            {value} {unit}
          </div>
          {/* <div className="text-sm font-medium leading-none">/div> */}
        </div>
      </CardContent>
    </Card>
  );
}
