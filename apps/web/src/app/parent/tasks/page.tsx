"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Button, Modal, Page, Skeleton, Tabs, Toast } from "@/components/ui";
import type { ParentKid } from "@/components/parent/ParentKidCard";
import { ProfilePickerLink } from "@/components/parent/ProfilePickerLink";
import { TaskCard } from "@/components/parent/TaskCard";
import { TaskForm } from "@/components/parent/TaskForm";
import type { ParentTaskRecord } from "@/components/parent/task-shared";

function TasksSkeleton() {
  return (
    <div className="flex flex-col gap-3 mt-6">
      {[0, 1, 2].map((i) => (
        <Skeleton.Block key={i} className="h-28 w-full rounded-[20px]" />
      ))}
    </div>
  );
}

function ParentTasksContent() {
  const [kids, setKids] = useState<ParentKid[]>([]);
  const [tasks, setTasks] = useState<ParentTaskRecord[]>([]);
  const [selectedKidId, setSelectedKidId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ParentTaskRecord | undefined>();
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/kids").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/tasks").then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([kidsData, tasksData]) => {
        setKids(kidsData.kids ?? []);
        setTasks(tasksData.tasks ?? []);
      })
      .catch(() => setError("Couldn't load tasks. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = useMemo(() => {
    if (selectedKidId === "all") return tasks;
    return tasks.filter((task) => task.kidId === selectedKidId);
  }, [tasks, selectedKidId]);

  function openCreateForm() {
    setEditingTask(undefined);
    setFormOpen(true);
  }

  function openEditForm(task: ParentTaskRecord) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingTask(undefined);
  }

  function handleSaved(task: ParentTaskRecord) {
    setTasks((current) => {
      const exists = current.some((item) => item.id === task.id);
      return exists
        ? current.map((item) => (item.id === task.id ? task : item))
        : [task, ...current];
    });
    setToast(editingTask ? "Task updated" : "Task created");
    closeForm();
  }

  function handleUpdated(task: ParentTaskRecord) {
    setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
  }

  function handleDeleted(taskId: string) {
    setTasks((current) => current.filter((item) => item.id !== taskId));
    setToast("Task deleted");
  }

  const defaultKidId =
    selectedKidId !== "all" ? selectedKidId : kids[0]?.id;

  return (
    <Page>
      <Page.Content className="max-w-[760px] mx-auto w-full pt-6 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-1">
          <div>
            <h1 className="font-display font-bold text-[28px] text-ink leading-tight">
              Tasks
            </h1>
            <p className="font-body font-[800] text-[13px] text-ink-soft mt-1.5">
              Create chores and set coin rewards for each kid
            </p>
          </div>
          <ProfilePickerLink className="self-start sm:mt-1" />
        </div>

        {error && (
          <p className="font-body text-[14px] text-red-600 mt-4" role="alert">
            {error}
          </p>
        )}

        {loading && <TasksSkeleton />}

        {!loading && !error && kids.length === 0 && (
          <p className="font-body text-[14px] text-ink-soft mt-4">
            Add a kid profile before creating tasks.
          </p>
        )}

        {!loading && !error && kids.length > 0 && (
          <>
            <Tabs.Root
              value={selectedKidId}
              onValueChange={(value) => setSelectedKidId(String(value))}
              className="mt-5"
            >
              <Tabs.List className="flex-wrap">
                <Tabs.Tab value="all" variant="parent" className="flex-none px-5">
                  All kids
                </Tabs.Tab>
                {kids.map((kid) => (
                  <Tabs.Tab key={kid.id} value={kid.id} variant="parent" className="flex-none px-5">
                    {kid.name}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.Root>

            <Button
              type="button"
              variant="purple"
              size="full"
              onClick={openCreateForm}
              className="mt-6"
            >
              + New task
            </Button>

            <div className="mt-4 flex flex-col gap-3">
              {filteredTasks.length === 0 ? (
                <p className="font-body text-[14px] text-ink-soft text-center py-8">
                  No tasks yet for this view.
                </p>
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditForm}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                  />
                ))
              )}
            </div>
          </>
        )}
      </Page.Content>

      <Modal
        open={formOpen}
        onClose={closeForm}
        width="md"
        aria-label={editingTask ? "Edit task" : "New task"}
      >
        <TaskForm
          kids={kids}
          task={editingTask}
          defaultKidId={defaultKidId}
          onSuccess={handleSaved}
          onCancel={closeForm}
        />
      </Modal>

      <Toast message={toast} visible={!!toast} onDismiss={() => setToast("")} />
    </Page>
  );
}

export default function ParentTasksPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <Page.Content className="max-w-[760px] mx-auto pt-6">
            <TasksSkeleton />
          </Page.Content>
        </Page>
      }
    >
      <ParentTasksContent />
    </Suspense>
  );
}
