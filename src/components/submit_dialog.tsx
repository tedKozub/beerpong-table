import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SubmitDialog({
  handleModalConfirm,
  description,
  disabled,
}: any) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="btn btn-primary" disabled={disabled}>
          {disabled ? "Ukládám..." : "Uložit výsledek"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-base-100 border border-base-300 text-base-content">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-base-content">
            Opravdu uložit výsledek?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base-content/70">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="btn btn-secondary">
            Zrušit
          </AlertDialogCancel>
          <AlertDialogAction onClick={(e) => handleModalConfirm(e)}>
            Uložit zápas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
