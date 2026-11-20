"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { loginAction } from "@/actions/auth";
import { Loader2 } from "lucide-react";

interface LoginFormInputs {
  name: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      name: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    try {
      const res = await loginAction(data);
      if (!res.success) {
        const errorMsg = res.error || "Nesprávné přihlašovací jméno nebo heslo.";
        setServerError(errorMsg);
        toast({
          title: "Chyba přihlášení",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Přihlášení úspěšné",
        description: "Vítejte v administraci ligy.",
      });

      router.push("/");
      router.refresh();
    } catch (err: any) {
      const errorMsg = err?.message || "Došlo k neočekávané chybě při přihlašování.";
      setServerError(errorMsg);
      toast({
        title: "Chyba přihlášení",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="card bg-base-100 w-full max-w-sm mx-auto p-5 sm:p-8 rounded-2xl shadow-xl border border-base-300"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black tracking-tight text-base-content mb-1">
          Přihlášení
        </h1>
        <p className="text-xs text-base-content/60">
          Správa turnajů a zápasů SPPDF
        </p>
      </div>

      {serverError && (
        <div className="alert alert-error text-xs py-2 mb-4 rounded-lg">
          <span>{serverError}</span>
        </div>
      )}

      <div className="form-control mb-4">
        <label htmlFor="name" className="label py-1">
          <span className="label-text font-semibold text-base-content">Jméno</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="admin"
          disabled={isSubmitting}
          className={`input input-bordered w-full bg-base-100 text-base-content border-base-300 ${
            errors.name ? "input-error" : ""
          }`}
          {...register("name", {
            required: "Vyplňte prosím uživatelské jméno",
          })}
        />
        {errors.name && (
          <span className="text-error text-xs mt-1 font-medium">
            {errors.name.message}
          </span>
        )}
      </div>

      <div className="form-control mb-6">
        <label htmlFor="password" className="label py-1">
          <span className="label-text font-semibold text-base-content">Heslo</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={isSubmitting}
          className={`input input-bordered w-full bg-base-100 text-base-content border-base-300 ${
            errors.password ? "input-error" : ""
          }`}
          {...register("password", {
            required: "Vyplňte prosím heslo",
          })}
        />
        {errors.password && (
          <span className="text-error text-xs mt-1 font-medium">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full font-bold gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Ověřuji...</span>
          </>
        ) : (
          <span>Přihlásit se</span>
        )}
      </button>
    </form>
  );
}
