"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createSeason } from "@/actions/seasons";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

interface CreateSeasonInputs {
  name: string;
  isActive: boolean;
}

export function CreateSeasonForm() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSeasonInputs>({
    defaultValues: {
      name: "",
      isActive: false,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: CreateSeasonInputs) => {
    try {
      const res = await createSeason({
        name: data.name.trim(),
        isActive: data.isActive,
      });

      if (!res.success) {
        toast({
          title: "Chyba při vytváření semestru",
          description: res.error || "Vytvoření se nezdařilo.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Semestr vytvořen",
        description: `Semestr „${data.name.trim()}“ byl úspěšně založen s 5 koly.`,
      });
      reset();
      router.refresh();
    } catch (err: unknown) {
      const errorObj = err as { message?: string } | null;
      toast({
        title: "Chyba při vytváření semestru",
        description: errorObj?.message || "Vytvoření se nezdařilo.",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-3"
      noValidate
    >
      <div className="flex flex-col w-full sm:w-80">
        <input
          placeholder="Např. Podzimní semestr 2026"
          disabled={isSubmitting}
          className={`input input-bordered input-sm w-full ${
            errors.name ? "input-error" : ""
          }`}
          {...register("name", {
            required: "Vyplňte prosím název semestru",
          })}
        />
        {errors.name && (
          <span className="text-error text-xs mt-1 font-medium">
            {errors.name.message}
          </span>
        )}
      </div>

      <label className="label cursor-pointer gap-2 py-0">
        <input
          type="checkbox"
          disabled={isSubmitting}
          className="checkbox checkbox-success checkbox-sm"
          {...register("isActive")}
        />
        <span className="label-text text-xs font-semibold">
          Nastavit rovnou jako aktivní
        </span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary btn-sm gap-1.5"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Vytvářím...</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            <span>Vytvořit semestr (s 5 koly)</span>
          </>
        )}
      </button>
    </form>
  );
}
