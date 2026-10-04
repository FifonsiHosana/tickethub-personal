import { Link } from "react-router";

type Props = {
  title: string;
  message: string;
};

export function ForgotPasswordResult({ title, message }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Link
        to="/login"
        className="mt-2 text-sm font-medium text-primary/80 underline underline-offset-4 hover:text-primary/70"
      >
        Back to login
      </Link>
    </div>
  );
}
