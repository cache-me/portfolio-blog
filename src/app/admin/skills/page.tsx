"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Code2,
  Eye,
  EyeOff,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc, orpcClient } from "@/lib/client";
import { cn } from "@/lib/utils";
import { SkillCategoryForm } from "./_components/skill-category-form";
import { SkillForm } from "./_components/skill-form";

type Skill = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  yearsOfExperience?: number | null;
  categoryId?: string | null;
  isVisible: boolean;
  sortOrder: number;
};

type SkillCategory = {
  id: string;
  name: string;
  icon?: string | null;
  sortOrder: number;
  skills: Skill[];
};

const LEVEL_CONFIG = {
  BEGINNER: {
    label: "Beginner",
    className:
      "bg-slate-500/10 text-slate-600 border-slate-200 dark:text-slate-400",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    className:
      "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400",
  },
  ADVANCED: {
    label: "Advanced",
    className:
      "bg-violet-500/10 text-violet-600 border-violet-200 dark:text-violet-400",
  },
  EXPERT: {
    label: "Expert",
    className:
      "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400",
  },
} as const;

function SkillRow({
  skill,
  onEdit,
  onDelete,
}: {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
}) {
  const level = LEVEL_CONFIG[skill.level];

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 group hover:bg-muted/30 rounded-lg transition-colors">
      <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0 text-base">
        {skill.icon ? (
          <span>{skill.icon}</span>
        ) : (
          <Code2 className="size-4 text-muted-foreground/50" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-sm font-medium",
              !skill.isVisible && "text-muted-foreground line-through",
            )}
          >
            {skill.name}
          </span>
          {!skill.isVisible && (
            <EyeOff className="size-3 text-muted-foreground/50" />
          )}
        </div>
        {skill.yearsOfExperience && (
          <p className="text-[11px] text-muted-foreground">
            {skill.yearsOfExperience} yr
            {skill.yearsOfExperience !== 1 ? "s" : ""} experience
          </p>
        )}
      </div>

      <Badge
        variant="outline"
        className={cn("text-[10px] h-5 px-2 hidden sm:flex", level.className)}
      >
        {level.label}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => onEdit(skill)}>
            <Pencil className="mr-2 size-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(skill)}
          >
            <Trash2 className="mr-2 size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CategorySection({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddSkill,
  onEditSkill,
  onDeleteSkill,
}: {
  category: SkillCategory;
  onEditCategory: (cat: SkillCategory) => void;
  onDeleteCategory: (cat: SkillCategory) => void;
  onAddSkill: (categoryId: string) => void;
  onEditSkill: (skill: Skill) => void;
  onDeleteSkill: (skill: Skill) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 flex-1 min-w-0 text-left group/trigger">
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
                    !open && "-rotate-90",
                  )}
                />
                <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 text-sm">
                  {category.icon ?? (
                    <FolderOpen className="size-3.5 text-primary" />
                  )}
                </div>
                <CardTitle className="text-sm font-semibold">
                  {category.name}
                </CardTitle>
                <span className="text-xs text-muted-foreground ml-1">
                  ({category.skills.length})
                </span>
              </button>
            </CollapsibleTrigger>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => onAddSkill(category.id)}
              >
                <Plus className="size-3.5" />
                Add skill
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <Settings2 className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEditCategory(category)}>
                    <Pencil className="mr-2 size-3.5" />
                    Edit category
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeleteCategory(category)}
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    Delete category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 px-3">
            {category.skills.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Code2 className="size-6 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">
                  No skills yet in this category
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 mt-1"
                  onClick={() => onAddSkill(category.id)}
                >
                  <Plus className="mr-1.5 size-3" />
                  Add first skill
                </Button>
              </div>
            ) : (
              <div className="space-y-0.5">
                {category.skills.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    onEdit={onEditSkill}
                    onDelete={onDeleteSkill}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function AdminSkillsPage() {
  const queryClient = useQueryClient();

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(
    null,
  );
  const [deleteCategoryTarget, setDeleteCategoryTarget] =
    useState<SkillCategory | null>(null);

  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(
    null,
  );
  const [deleteSkillTarget, setDeleteSkillTarget] = useState<Skill | null>(
    null,
  );

  const { data: grouped, isLoading } = useQuery(
    orpc.skill.grouped.queryOptions(),
  );

  const { data: allSkills } = useQuery(
    orpc.skill.list.queryOptions({ input: {} }),
  );

  const uncategorised = (allSkills ?? []).filter((s) => !s.categoryId);

  const deleteSkillMutation = useMutation({
    mutationFn: (id: string) => orpcClient.skill.delete({ id }),
    onSuccess: () => {
      toast.success("Skill deleted");
      queryClient.invalidateQueries({ queryKey: orpc.skill.grouped.key() });
      queryClient.invalidateQueries({ queryKey: orpc.skill.list.key() });
      setDeleteSkillTarget(null);
    },
    onError: () => toast.error("Failed to delete skill"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => orpcClient.skill.deleteCategory({ id }),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: orpc.skill.grouped.key() });
      setDeleteCategoryTarget(null);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const openAddSkill = (categoryId: string) => {
    setEditingSkill(null);
    setDefaultCategoryId(categoryId);
    setSkillFormOpen(true);
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setDefaultCategoryId(null);
    setSkillFormOpen(true);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const openEditCategory = (cat: SkillCategory) => {
    setEditingCategory(cat);
    setCategoryFormOpen(true);
  };

  const totalSkills = allSkills?.length ?? 0;
  const visibleSkills = allSkills?.filter((s) => s.isVisible).length ?? 0;
  const totalCategories = grouped?.length ?? 0;
  const expertCount =
    allSkills?.filter((s) => s.level === "EXPERT").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your skills and technology categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openAddCategory}
            icon={<FolderOpen className="mr-1.5 size-4" />}
          >
            New Category
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingSkill(null);
              setDefaultCategoryId(null);
              setSkillFormOpen(true);
            }}
            icon={<Plus className="mr-1.5 size-4" />}
          >
            New Skill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Skills",
            value: totalSkills,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Visible",
            value: visibleSkills,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Categories",
            value: totalCategories,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
          },
          {
            label: "Expert Level",
            value: expertCount,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map(({ label, value, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("rounded-lg p-2 shrink-0", bg)}>
                <Code2 className={cn("size-4", color)} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-32" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(grouped ?? []).map((category) => (
            <CategorySection
              key={category.id}
              category={category as SkillCategory}
              onEditCategory={openEditCategory}
              onDeleteCategory={setDeleteCategoryTarget}
              onAddSkill={openAddSkill}
              onEditSkill={openEditSkill}
              onDeleteSkill={setDeleteSkillTarget}
            />
          ))}

          {uncategorised.length > 0 && (
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Code2 className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    Uncategorised
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    ({uncategorised.length})
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-3">
                <div className="space-y-0.5">
                  {uncategorised.map((skill) => (
                    <SkillRow
                      key={skill.id}
                      skill={skill as Skill}
                      onEdit={openEditSkill}
                      onDelete={setDeleteSkillTarget}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!grouped?.length && !uncategorised.length && (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <Code2 className="size-10 text-muted-foreground/30" />
                <div>
                  <p className="text-sm font-medium">No skills yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Start by creating a category, then add skills to it.
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openAddCategory}
                    icon={<FolderOpen className="mr-1.5 size-3.5" />}
                  >
                    New Category
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSkillFormOpen(true)}
                    icon={<Plus className="mr-1.5 size-3.5" />}
                  >
                    New Skill
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <SkillCategoryForm
        open={categoryFormOpen}
        onOpenChange={(v) => {
          setCategoryFormOpen(v);
          if (!v) setEditingCategory(null);
        }}
        category={editingCategory}
      />

      <SkillForm
        open={skillFormOpen}
        onOpenChange={(v) => {
          setSkillFormOpen(v);
          if (!v) {
            setEditingSkill(null);
            setDefaultCategoryId(null);
          }
        }}
        skill={editingSkill}
        defaultCategoryId={defaultCategoryId}
      />

      <AlertDialog
        open={!!deleteSkillTarget}
        onOpenChange={(v) => !v && setDeleteSkillTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete skill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                &quot;{deleteSkillTarget?.name}&quot;
              </span>
              . It will also be removed from any projects and certificates that
              reference it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSkillMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSkillMutation.isPending}
              onClick={() =>
                deleteSkillTarget &&
                deleteSkillMutation.mutate(deleteSkillTarget.id)
              }
            >
              {deleteSkillMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteCategoryTarget}
        onOpenChange={(v) => !v && setDeleteCategoryTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete{" "}
              <span className="font-medium text-foreground">
                &quot;{deleteCategoryTarget?.name}&quot;
              </span>
              . Skills inside will become uncategorised (not deleted).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategoryMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategoryMutation.isPending}
              onClick={() =>
                deleteCategoryTarget &&
                deleteCategoryMutation.mutate(deleteCategoryTarget.id)
              }
            >
              {deleteCategoryMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
