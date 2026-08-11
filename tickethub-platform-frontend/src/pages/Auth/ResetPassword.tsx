import { useSearchParams } from "react-router";
import { ResetPasswordForm } from "@/components/sections/Auth/ResetPasswordForm";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return (
    <main>
      <ResetPasswordForm token={token} />
    </main>
  );
}