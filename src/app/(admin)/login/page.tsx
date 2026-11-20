import { getSession } from "@/actions/auth";
import { LoginForm } from "@/components/LoginForm";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (session?.userId) {
    redirect("/");
  }

  return (
    <div className="flex-1 flex justify-center items-center py-8 sm:py-16 px-3 sm:px-4 bg-base-200 text-base-content">
      <LoginForm />
    </div>
  );
}
