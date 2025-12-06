import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { IUser, IUserPayload, IUserUpdatePayload } from "@/interfaces";
import { UsersHeader, UsersDeleteDialog, UsersForm, UsersTable } from "./components";
import { useUsers, userFormSchema } from "@/features/users";

type FormModeType = "idle" | "create" | "edit";

interface IFormState {
  mode: FormModeType;
  isOpen: boolean;
  editingId: string | null;
}

interface IDeleteState {
  open: boolean;
  user: IUser | null;
}

const UsersPage: React.FC = () => {
  const {
    users,
    isSubmitting,
    error,
    meta,
    createUser,
    updateUser,
    deleteUser,
    loadUsers,
  } = useUsers();

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const [formState, setFormState] = useState<IFormState>({
    mode: "idle",
    isOpen: false,
    editingId: null,
  });

  const [deleteState, setDeleteState] = useState<IDeleteState>({
    open: false,
    user: null,
  });

  const isEditing = formState.mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IUserUpdatePayload>({
    resolver: yupResolver(userFormSchema),
    context: { isEditing },
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleDeleteClick = (user: IUser) => {
    setDeleteState({
      open: true,
      user,
    });
  };

  const confirmDelete = async () => {
    if (!deleteState.user) return;

    await deleteUser(deleteState.user._id);

    setDeleteState({
      open: false,
      user: null,
    });

    if (meta) {
      await loadUsers({
        limit: meta.limit,
        offset: meta.offset,
      });
    }
  };

  const resetFormState = () => {
    reset({
      name: "",
      email: "",
      password: "",
    });

    setFormState({
      mode: "idle",
      isOpen: false,
      editingId: null,
    });
  };

  const onFormSubmit = async (data: IUserUpdatePayload) => {
    if (isEditing && formState.editingId) {
      const payload: Partial<IUserPayload> = {
        name: data.name,
        email: data.email,
      };

      if (data.password) {
        payload.password = data.password;
      }

      await updateUser(formState.editingId, payload);
    } else {
      await createUser(data as IUserPayload);
    }

    resetFormState();

    if (meta) {
      await loadUsers({
        limit: meta.limit,
        offset: meta.offset,
      });
    }
  };

  const startEdit = (user: IUser) => {
    setFormState({
      mode: "edit",
      isOpen: true,
      editingId: user._id,
    });

    reset({
      name: user.name,
      email: user.email,
      password: "",
    });
  };

  const startNew = () => {
    setFormState({
      mode: "create",
      isOpen: true,
      editingId: null,
    });

    reset({
      name: "",
      email: "",
      password: "",
    });
  };

  const handleCancelForm = () => {
    resetFormState();
  };

  const handlePageChange = async (page: number) => {
    const limit = meta?.limit ?? 10;
    const offset = (page - 1) * limit;

    await loadUsers({
      limit,
      offset,
    });
  };

  return (
    <div className="space-y-6">
      <UsersHeader onNewUser={startNew} isSubmitting={isSubmitting} />

      {formState.isOpen && (
        <UsersForm
          error={error}
          errors={errors}
          register={register}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onFormSubmit)}
          isEditing={isEditing}
          onCancel={handleCancelForm}
        />
      )}

      <UsersTable
        users={users}
        meta={meta}
        onEdit={startEdit}
        onDelete={handleDeleteClick}
        onPageChange={handlePageChange}
      />

      <UsersDeleteDialog
        open={deleteState.open}
        user={deleteState.user}
        isSubmitting={isSubmitting}
        onOpenChange={(open) =>
          setDeleteState((prev) => ({
            ...prev,
            open,
          }))
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default UsersPage;
