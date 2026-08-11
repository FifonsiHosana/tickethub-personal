import { useSearchParams } from "react-router";
import { SignUpForm } from "@/components/sections/Auth/SignUpForm";
import { SignUpWizard } from "@/components/sections/Auth/SignUpWizard/SignUpWizard";

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token");

  return <main>{inviteToken ? <SignUpForm /> : <SignUpWizard />}</main>;
}