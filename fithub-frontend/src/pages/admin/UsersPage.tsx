import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { User } from "../../types/User";
import type { Plan } from "../../types/Plan";
import type { Product } from "../../types/Product";

import {
  loadUsers,
  deleteUser as apiDeleteUser,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  reactivateUser,
} from "../../api/users";

import { fetchAllPlans } from "../../api/plans";
import {
  assignPlanToMember,
  deleteMemberPlan,
} from "../../api/subscriptions";
import {
  fetchAllProducts,
  assignProductToMember,
  deleteAssignedProduct,
} from "../../api/products";
import AddUserModal from "../../modals/AddUserModal";
import EditPlanModal from "../../modals/EditPlanModal";
import AssignProductModal from "../../modals/AssignProductModal";
import EditUserModal from "../../modals/EditUserModal";

import UserRow from "./UserRow";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function UsersPage() {
  const queryClient = useQueryClient();

  /* UI STATE */
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [deactivatedEmail, setDeactivatedEmail] = useState<string | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [editPlanMemberId, setEditPlanMemberId] = useState<number | null>(null);
  const [editPlanNewPlanId, setEditPlanNewPlanId] = useState("");
  const [editPlanStartDate, setEditPlanStartDate] = useState("");

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const defaultUserObj = {
    name: "",
    email: "",
    password: "",
    fingerprint: "", // New fingerprint field
    memberDetails: {
      age: "",
      gender: "",
      height: "",
      weight: "",
      goal: "",
      membershipType: "",
      phone: "",
    },
  };

  const [newUser, setNewUser] = useState<any>(defaultUserObj);

  /* LOAD USERS */
  const usersQuery = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: loadUsers,
  });

  /* LOAD PLANS */
  const plansQuery = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: fetchAllPlans,
  });

  /* DELETE USER */
  const deleteUserMutation = useMutation({
    mutationFn: apiDeleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  /* CREATE USER */
  const createUserMutation = useMutation({
    mutationFn: apiCreateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (error: any) => {
      if (error.status === 409) {
        setDeactivatedEmail(newUser.email);
      } else {
        alert("Failed to create user");
      }
    },
  });

  /* REACTIVATE USER */
  const reactivateUserMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("User reactivated successfully!");
    },
    onError: () => {
      alert("Failed to reactivate user");
    },
  });

  /* UPDATE USER */
  const updateUserMutation = useMutation({
    mutationFn: (vars: { id: number; data: any }) =>
      apiUpdateUser(vars.id, vars.data),

    onSuccess: (_res, vars) => {
      queryClient.setQueryData(["users"], (oldUsers: any) => {
        if (!oldUsers) return oldUsers;

        return oldUsers.map((u: User) => {
          if (u.id !== vars.id) return u;

          // Separate top-level and nested properties from the form data
          const {
            age,
            gender,
            height,
            weight,
            goal,
            membershipType,
            phone,
            ...topLevelProps
          } = vars.data;

          const memberDetailsUpdate = {
            ...(age && { age }),
            ...(gender && { gender }),
            ...(height && { height }),
            ...(weight && { weight }),
            ...(goal && { goal }),
            ...(membershipType && { membershipType }),
            ...(phone && { phone }),
          };

          return {
            ...u,
            ...topLevelProps,
            memberDetails: {
              ...u.memberDetails,
              ...memberDetailsUpdate,
            },
          };
        });
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowEditUserModal(false);
    },
  });

  /* ASSIGN PLAN */
  const assignPlanMutation = useMutation<
    any,
    Error,
    { memberId: number; planId: number; startDate: string }
  >({
    mutationFn: (vars) =>
      assignPlanToMember(vars.memberId, vars.planId, vars.startDate),

    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["member-plan", vars.memberId],
      });

      setShowEditPlanModal(false);
      setEditPlanNewPlanId("");
      setEditPlanStartDate("");
    },
  });

  /* DELETE PLAN */
  const deletePlanMutation = useMutation({
    mutationFn: (memberId: number) => deleteMemberPlan(memberId),

    onSuccess: (_res, memberId) => {
      // 🔥 Clear cached plan immediately
      queryClient.setQueryData(["member-plan", memberId], null);

      // 🔥 Ask backend for fresh data (optional but safe)
      queryClient.invalidateQueries({
        queryKey: ["member-plan", memberId],
      });
    },
  });
  /* ASSIGN PRODUCT */
  const assignProductMutation = useMutation<
    any,
    Error,
    { memberId: number; productId: number }
  >({
    mutationFn: (vars) =>
      assignProductToMember(vars.memberId, vars.productId),

    onSuccess: (_res, vars) =>
      queryClient.invalidateQueries({
        queryKey: ["member-products", vars.memberId],
      }),
  });

  /* DELETE PRODUCT */
  const deleteAssignedProductMutation = useMutation({
    mutationFn: (id: number) => deleteAssignedProduct(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["member-products"] }),
  });

  /* LOAD PRODUCTS ONLY WHEN MODAL OPENS */
  useEffect(() => {
    if (showProductModal) {
      setProductsLoading(true);
      fetchAllProducts()
        .then(setAllProducts)
        .finally(() => setProductsLoading(false));
    }
  }, [showProductModal]);

  /* Helper */
  function toggleRow(index: number) {
    setOpenRowIndex((prev) => (prev === index ? null : index));
  }

  /* CREATE USER */
  async function handleCreateUser() {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Name, email, password required");
      return;
    }

    setShowAddUserModal(false);

    const payload = {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      fingerprint: newUser.fingerprint, // Include fingerprint in the payload
      age: Number(newUser.memberDetails.age || 0),
      gender: newUser.memberDetails.gender,
      height: Number(newUser.memberDetails.height || 0),
      weight: Number(newUser.memberDetails.weight || 0),
      goal: newUser.memberDetails.goal,
      membershipType: newUser.memberDetails.membershipType,
      phone: newUser.memberDetails.phone,
    };

    createUserMutation.mutate(payload, {
      onSuccess: (created) => {
        const planId = Number(newUser.memberDetails.membershipType);

        if (planId) {
          assignPlanMutation.mutate({
            memberId: created.id,
            planId,
            startDate: todayISO(),
          });
        }

        setNewUser(defaultUserObj);
      },
    });
  }

  /* UI */
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Members</h1>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white shadow rounded p-6 overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="text-left border-b bg-gray-100">
              <th className="p-3 w-[5%]">#</th>
              <th className="p-3 w-[25%]">Name</th>
              <th className="p-3 w-[25%]">Email</th>
              <th className="p-3 w-[15%]">Phone</th>
              <th className="p-3 w-[20%]">Actions</th>
              <th className="p-3 w-[5%] text-center">▾</th>
            </tr>
          </thead>

          <tbody>
            {usersQuery.isLoading && (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading users...
                </td>
              </tr>
            )}

            {usersQuery.data?.map((u, index) => (
              <UserRow
                key={u.id}
                user={u}
                index={index}
                openRowIndex={openRowIndex}
                toggleRow={toggleRow}
                deleteUserMutation={deleteUserMutation}
                deletePlanMutation={deletePlanMutation}
                deleteAssignedProductMutation={deleteAssignedProductMutation}
                setShowEditPlanModal={setShowEditPlanModal}
                setEditPlanMemberId={setEditPlanMemberId}
                setSelectedMemberId={setSelectedMemberId}
                setShowProductModal={setShowProductModal}
                setSelectedUser={setSelectedUser}
                setShowEditUserModal={setShowEditUserModal}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD USER */}
      {showAddUserModal && (
        <AddUserModal
          newUser={newUser}
          setNewUser={setNewUser}
          plans={plansQuery.data || []}
          creating={createUserMutation.isPending}
          onClose={() => setShowAddUserModal(false)}
          onSave={handleCreateUser}
        />
      )}

      {/* EDIT USER */}
      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          plans={plansQuery.data || []}
          updating={updateUserMutation.isPending}
          onClose={() => setShowEditUserModal(false)}
          onSave={(data) =>
            updateUserMutation.mutate({
              id: selectedUser.id,
              data,
            })
          }
        />
      )}

      {/* EDIT PLAN */}
      {showEditPlanModal && editPlanMemberId && (
        <EditPlanModal
          plans={plansQuery.data || []}
          newPlanId={editPlanNewPlanId}
          setNewPlanId={setEditPlanNewPlanId}
          startDate={editPlanStartDate}
          setStartDate={setEditPlanStartDate}
          onClose={() => setShowEditPlanModal(false)}
          onSave={() =>
            assignPlanMutation.mutate({
              memberId: editPlanMemberId,
              planId: Number(editPlanNewPlanId),
              startDate: editPlanStartDate,
            })
          }
        />
      )}

      {/* ASSIGN PRODUCT */}
      {showProductModal && selectedMemberId && (
        <AssignProductModal
          products={allProducts}
          loading={productsLoading}
          onSelect={(productId: number) =>
            assignProductMutation.mutate({
              memberId: selectedMemberId,
              productId,
            })
          }
          onClose={() => setShowProductModal(false)}
        />
      )}

      {/* CONFIRM REACTIVATION */}
      {deactivatedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Reactivate Account?</h2>
            <p>
              An account with the email <strong>{deactivatedEmail}</strong> is
              currently deactivated.
            </p>
            <p className="mt-2">Would you like to reactivate it?</p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setDeactivatedEmail(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  reactivateUserMutation.mutate(deactivatedEmail);
                  setDeactivatedEmail(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Reactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
