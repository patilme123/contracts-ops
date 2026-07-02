import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function UploadJsonButton() {
  return (
    <Button type="button">
      <Upload className="size-4" />
      Upload JSON
    </Button>
  );
}
