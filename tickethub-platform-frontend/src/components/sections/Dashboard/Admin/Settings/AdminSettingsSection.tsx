import { useState } from "react";
import {
  useAdminSettings,
  useUpdateSettings,
} from "@/hooks/admin/useAdminSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SaveIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsSection() {
  const { data: settings, isLoading } = useAdminSettings();
  // console.log(settings);

  const updateMutation = useUpdateSettings();
  const [values, setValues] = useState<Record<string, string>>({});

  if (isLoading)
    return <div className="h-32 bg-muted animate-pulse rounded-xl" />;

  if (!settings?.length) {
    return (
      <div className="space-y-3 p-1">
        <h1 className="text-xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          No settings found. Seed the PlatformSettings table.
        </p>
      </div>
    );
  }

  if (Object.keys(values).length === 0 && settings.length > 0) {
    const initial: Record<string, string> = {};
    settings.forEach((s) => {
      initial[s.key] = s.value;
    });
    setValues(initial);
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
    }
  };

  const paymentProviders = ["paystack", "hubtel"];

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Platform Settings</h1>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          <SaveIcon className="h-3 w-3 mr-1" />{" "}
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {settings.map((setting) => (
          <Card key={setting.key} className="shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-medium capitalize">
                {setting.key.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              {setting.key === "payment_provider" ? (
                <Select
                  disabled
                  value={values[setting.key] ?? setting.value}
                  onValueChange={(v) => {
                    if (v) setValues((prev) => ({ ...prev, [setting.key]: v }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentProviders.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : setting.key === "auto_approve_events" ? (
                <Select
                  value={values[setting.key] ?? setting.value}
                  onValueChange={(v) => {
                    if (v) setValues((prev) => ({ ...prev, [setting.key]: v }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={values[setting.key] ?? setting.value}
                  disabled={
                    setting.key.includes("currency") ||
                    setting.key.includes("min_payout_amount")
                  }
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [setting.key]: e.target.value,
                    }))
                  }
                  type={
                    setting.key.includes("percent") ||
                    setting.key.includes("fee") ||
                    setting.key.includes("amount") ||
                    setting.key.includes("capacity")
                      ? "number"
                      : "text"
                  }
                />
              )}
              {setting.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {setting.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
