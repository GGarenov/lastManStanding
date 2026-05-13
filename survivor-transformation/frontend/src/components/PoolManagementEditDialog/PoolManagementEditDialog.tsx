import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/Dialog/Dialog";
import { Button } from "~/components/Button/Button";
import { Input } from "~/components/Input/Input";
import { Label } from "~/components/Label/Label";
import { Textarea } from "~/components/Textarea/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/Select/Select";
import styles from "./PoolManagementEditDialog.module.less";

type EditFormState = {
  name: string;
  description: string;
  tournamentKey: string;
};

type TournamentOption = {
  key: string;
  label: string;
};

type PoolManagementEditDialogProps = {
  open: boolean;
  isSaving: boolean;
  editForm: EditFormState;
  tournamentOptions: TournamentOption[];
  onOpenChange: (open: boolean) => void;
  onChangeEditForm: (form: EditFormState) => void;
  onSave: () => void;
};

export function PoolManagementEditDialog({
  open,
  isSaving,
  editForm,
  tournamentOptions,
  onOpenChange,
  onChangeEditForm,
  onSave,
}: PoolManagementEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.editDialog}>
        <DialogHeader>
          <DialogTitle>Edit pool</DialogTitle>
          <DialogDescription>
            Update pool name, description, and tournament. The tournament links
            the pool to a config for team flags and Add match dropdowns.
          </DialogDescription>
        </DialogHeader>
        <div className={styles.editDialogBody}>
          <div className={styles.field}>
            <Label htmlFor="edit-name">Pool Name *</Label>
            <Input
              id="edit-name"
              value={editForm.name}
              onChange={(e) =>
                onChangeEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="e.g., EURO 2024 Survivor"
              className={styles.control}
            />
          </div>
          <div className={styles.field}>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editForm.description}
              onChange={(e) =>
                onChangeEditForm({ ...editForm, description: e.target.value })
              }
              placeholder="Describe your pool..."
              className={`${styles.control} ${styles.textarea}`}
              rows={2}
            />
          </div>
          <div className={styles.field}>
            <Label htmlFor="edit-tournament">Tournament</Label>
            <Select
              value={editForm.tournamentKey || "none"}
              onValueChange={(v) =>
                onChangeEditForm({
                  ...editForm,
                  tournamentKey: v === "none" ? "" : v,
                })
              }
            >
              <SelectTrigger id="edit-tournament" className={styles.control}>
                <SelectValue placeholder="Select tournament" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {tournamentOptions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

