import React from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from "@/components/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { User as UserIcon, Trash2, Edit } from "lucide-react";
import type { IUser, IUserPaginationMeta } from "@/interfaces";
import { UserRoleBadge } from "./user-role-badge";
import { buildPages } from "@/lib/utils";

type UsersTableProps = {
  users: IUser[];
  meta: IUserPaginationMeta | null;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
  onPageChange?: (page: number) => void;
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  meta,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const hasPagination = meta && meta.last_page > 1 && onPageChange;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;
  const pages = hasPagination ? buildPages(currentPage, lastPage) : [];

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Permissao</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nenhum usuario encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {hasPagination && (
          <div className="flex items-center justify-center border-t px-4 py-3 border-border">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={currentPage === 1}
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage > 1) {
                        onPageChange(currentPage - 1);
                      }
                    }}
                  />
                </PaginationItem>
                {pages.map((page, index) => {
                  if (page === "ellipsis-left" || page === "ellipsis-right") {
                    return (
                      <PaginationItem key={`${page}-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  const pageNumber = page as number;

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          if (pageNumber !== currentPage) {
                            onPageChange(pageNumber);
                          }
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={currentPage === lastPage}
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage < lastPage) {
                        onPageChange(currentPage + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
