import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Edit, Trash, MinusCircle, UserCheck, UserX, TrendingUp } from 'lucide-react'; // Import the icon
import { Button } from '../../components/Button'; // Import Button component
import { StatCard } from '../../components/StatCard';
import PageHeader from '../../components/PageHeader'; // Import PageHeader

import type { User } from "../../types/User";
import type { Plan } from "../../types/Plan";
import type { Product } from "../../types/Product";
import type { SortDirection, UserSortBy } from "../../types/Page";

import {
  deleteUser as apiDeleteUser,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  reactivateUser,
} from "../../api/users";
import { useUsers } from "../../hooks/useUsers";

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

import Table from "../../components/Table";
import Detail from "../../components/Detail";
import Pulse from "../../components/Pulse";
import { loadPlan } from "../../api/subscriptions";
import { loadProducts } from "../../api/products";
import type { ProductAssignment } from "../../types/Product";
import { todayISO, getDaysLeft, isExpired } from "../../utils/dateUtils";

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

  /* SEARCH AND PAGINATION STATE */
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<UserSortBy>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  /* LOAD USERS */
  const usersQuery = useUsers({
    page: currentPage - 1,
    size: pageSize,
    sortBy,
    sortDir,
    search: searchTerm || undefined,
  });

  const paginatedUsers = usersQuery.data?.content || [];
  const totalPages = usersQuery.data?.totalPages || 0;
  const totalItems = usersQuery.data?.totalElements || 0;
  const usersForStats = paginatedUsers;



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

  /* LOAD PLANS FOR ALL USERS */
  const [userPlans, setUserPlans] = useState<Record<number, Plan | null>>({});
  useEffect(() => {
    async function fetchPlans() {
      if (!paginatedUsers.length) return;

      const missingUsers = paginatedUsers.filter((user) => userPlans[user.id] === undefined);
      if (!missingUsers.length) return;

      const plans: Record<number, Plan | null> = {};
      await Promise.all(
        missingUsers.map(async (user) => {
          try {
            plans[user.id] = await loadPlan(user.id);
          } catch {
            plans[user.id] = null;
          }
        })
      );

      if (Object.keys(plans).length) {
        setUserPlans((prev) => ({ ...prev, ...plans }));
      }
    }
    fetchPlans();
  }, [paginatedUsers, userPlans]);

  /* Helper */
  function toggleRow(index: number) {
    setOpenRowIndex((prev) => (prev === index ? null : index));
  }

  /* ADD USER */
  async function handleAddUser() {
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

  /* EDIT USER */
  async function handleEditUser(id: number, data: any) {
    updateUserMutation.mutate({ id, data });
  }

  /* UI */
  const tableHeaders = ["#", "Member Name", "Email Address", "Phone Number", "Actions", "Details"];

  const getUserCells = (user: User, index: number) => [
    <span className="text-gray-600 font-medium">{index + 1 + (currentPage - 1) * pageSize}</span>,
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <Users size={16} className="text-green-600" />
      </div>
      <span className="font-semibold text-gray-900">{user.name}</span>
    </div>,
    <span className="text-gray-700">{user.email}</span>,
    <span className="text-gray-600">{user.memberDetails?.phone || 'Not provided'}</span>,
    <div className="flex gap-2 justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedUser(user);
          setShowEditUserModal(true);
        }}
      >
        <Edit size={16} className="mr-1" /> Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {
          if (confirm("Are you sure you want to delete this member?")) {
            deleteUserMutation.mutate(user.id);
          }
        }}
      >
        <Trash size={16} className="mr-1" /> Delete
      </Button>
    </div>,
    <div className="text-center">
      <button className="text-green-600 hover:text-green-800 transition-colors">
        <span className={`inline-block transform transition-transform duration-200 ${
          openRowIndex === index ? "rotate-180" : ""
        }`}>
          ▼
        </span>
      </button>
    </div>,
  ];

  const renderExpandedUserContent = (user: User, index: number) => {
    const planQuery = useQuery({
      queryKey: ["member-plan", user.id],
      queryFn: () => loadPlan(user.id),
      enabled: openRowIndex === index,
    });

    const productsQuery = useQuery({
      queryKey: ["member-products", user.id],
      queryFn: () => loadProducts(user.id),
      enabled: openRowIndex === index,
    });

    return (
      <>
        {/* MEMBER DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Detail label="Age" value={user.memberDetails?.age} />
          <Detail label="Gender" value={user.memberDetails?.gender} />
          <Detail label="Phone" value={user.memberDetails?.phone} />
          <Detail label="Height" value={user.memberDetails?.height} />
          <Detail label="Weight" value={user.memberDetails?.weight} />
          <Detail label="Goal" value={user.memberDetails?.goal} />
        </div>

        {/* PLAN SECTION */}
        {planQuery.isLoading && <Pulse />}

        {planQuery.data && (
          <div className="mt-6 p-4 border rounded bg-white">
            <h3 className="text-lg font-bold mb-2">Active Plan</h3>

            <p><strong>Name:</strong> {planQuery.data.name}</p>
            <p><strong>Price:</strong> ₹{planQuery.data.price}</p>
            <p><strong>Duration:</strong> {planQuery.data.durationDays} days</p>
            <p><strong>Description:</strong> {planQuery.data.description}</p>
            <p><strong>Start:</strong> {planQuery.data.startDate}</p>
            <p><strong>End:</strong> {planQuery.data.endDate}</p>
            <p><strong>Days Left:</strong> {getDaysLeft(planQuery.data.endDate)}</p>

            <div className="mt-3 flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditPlanMemberId(user.id);
                              setShowEditPlanModal(true);
                            }}
                          >
                            <Edit size={16} /> Edit Plan
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to remove this plan from the member?")) {
                                deletePlanMutation.mutate(user.id);
                              }
                            }}
                          >
                            <MinusCircle size={16} /> Remove Plan
                          </Button>
            </div>
          </div>
        )}

        {/* PRODUCT SECTION */}
        {productsQuery.isLoading && <Pulse />}

        {productsQuery.data && (
          <div className="mt-6 p-4 border rounded bg-white">
            <h3 className="text-lg font-bold mb-3">Assigned Products</h3>

            <ul className="space-y-3">
              {productsQuery.data.map((p: ProductAssignment) => (
                <li
                  key={p.id}
                  className="p-3 border rounded bg-gray-50 flex justify-between"
                >
                  <div>
                    <p><strong>Name:</strong> {p.product.name}</p>
                    <p><strong>Category:</strong> {p.product.category}</p>
                    <p><strong>Price:</strong> ₹{p.product.price}</p>
                    <p><strong>Assigned:</strong> {p.assignedDate}</p>
                  </div>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this assigned product?")) {
                                    deleteAssignedProductMutation.mutate(p.id);
                                  }
                                }}
                              >
                                <MinusCircle size={16} /> Delete Product
                              </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ASSIGN BUTTONS */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={() => {
              setEditPlanMemberId(user.id);
              setShowEditPlanModal(true);
            }}
          >
            <Plus size={16} className="mr-2" /> Assign Plan
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedMemberId(user.id);
              setShowProductModal(true);
            }}
          >
            <Plus size={16} className="mr-2" /> Assign Product
          </Button>
        </div>
      </>
    );
  };
  return (
    <div className="space-y-8">
      <PageHeader
        icon={Users}
        title="Members"
        subtitle="Manage gym members and their details."
        actions={
          <Button
            onClick={() => setShowAddUserModal(true)}
            size="default"
          >
            <Plus size={18} className="mr-2" /> Add Member
          </Button>
        }
      />

      {/* STATS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={totalItems}
          icon={Users}
          description="All registered members"
          variant="success"
        />
        <StatCard
          title="Active Plans"
          value={usersForStats.filter(u => {
            const plan = userPlans[u.id];
            return plan && plan.endDate && !isExpired(plan.endDate);
          }).length}
          icon={UserCheck}
          description="Members with active plans"
          variant="info"
        />
        <StatCard
          title="Expired Plans"
          value={usersForStats.filter(u => {
            const plan = userPlans[u.id];
            return plan && plan.endDate && isExpired(plan.endDate);
          }).length}
          icon={UserX}
          description="Members with expired plans"
          variant="destructive"
        />
        {/* Dynamic Growth Card */}
        <StatCard
          title="Growth"
          value={(() => {
            // Calculate new members this month and growth percent
            function getMonthYear(date: Date) {
              return `${date.getFullYear()}-${date.getMonth() + 1}`;
            }
            const now = new Date();
            const thisMonth = getMonthYear(now);
            const lastMonth = getMonthYear(new Date(now.getFullYear(), now.getMonth() - 1, 1));
            const usersWithDate = usersForStats || [];
            const newMembersThisMonth = usersWithDate.filter(u => {
              if (!u.createdAt) return false;
              return getMonthYear(new Date(u.createdAt)) === thisMonth;
            });
            const newMembersLastMonth = usersWithDate.filter(u => {
              if (!u.createdAt) return false;
              return getMonthYear(new Date(u.createdAt)) === lastMonth;
            });
            const growthPercent = newMembersLastMonth.length === 0
              ? (newMembersThisMonth.length > 0 ? 100 : 0)
              : Math.round(((newMembersThisMonth.length - newMembersLastMonth.length) / newMembersLastMonth.length) * 100);
            // Return only the percentage for the main value
            return `${growthPercent > 0 ? '+' : ''}${growthPercent}%`;
          })()}
          icon={TrendingUp}
          description={(() => {
            // Show new members count as sub-label
            function getMonthYear(date: Date) {
              return `${date.getFullYear()}-${date.getMonth() + 1}`;
            }
            const now = new Date();
            const thisMonth = getMonthYear(now);
            const usersWithDate = usersForStats || [];
            const newMembersThisMonth = usersWithDate.filter(u => {
              if (!u.createdAt) return false;
              return getMonthYear(new Date(u.createdAt)) === thisMonth;
            });
            return `${newMembersThisMonth.length} new member${newMembersThisMonth.length === 1 ? '' : 's'} this month`;
          })()}
          variant="success"
        />
      </div>

      <div className="bg-yellow-100 shadow-sm rounded-lg p-6 border border-gray-100">
        {usersQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading members...</p>
            </div>
          </div>
        ) : (
          <Table
            headers={tableHeaders}
            columnClasses={['w-1/12 text-center', 'w-2/12', 'w-3/12', 'w-2/12', 'w-3/12 text-center', 'w-1/12 text-center']}
            data={paginatedUsers}
            renderCells={getUserCells}
            renderExpandedContent={renderExpandedUserContent}
            keyExtractor={(user) => user.id}
            openRowIndex={openRowIndex}
            toggleRow={toggleRow}
            searchPlaceholder="Search members by name or email..."
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            totalItems={totalItems}
            sortableColumns={{ 0: "id", 1: "name", 2: "email" }}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={(column, direction) => {
              setSortBy(column as UserSortBy);
              setSortDir(direction);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* ADD USER */}
      {showAddUserModal && (
            <AddUserModal
              newUser={newUser}
              setNewUser={setNewUser}
              plans={plansQuery.data || []}
              loading={createUserMutation.isPending}
              onClose={() => setShowAddUserModal(false)}
              handleSubmit={handleAddUser}
            />
      )}

      {/* EDIT USER */}
      {showEditUserModal && selectedUser && (
            <EditUserModal
              user={selectedUser}
              plans={plansQuery.data || []}
              loading={updateUserMutation.isPending}
              onClose={() => setShowEditUserModal(false)}
              handleSubmit={(data: any) => handleEditUser(selectedUser.id, data)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reactivate Account?</h2>
            <div className="text-gray-600 space-y-3">
              <p>
                An account with the email <strong className="text-gray-900">{deactivatedEmail}</strong> is
                currently deactivated.
              </p>
              <p>Would you like to reactivate it?</p>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeactivatedEmail(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  reactivateUserMutation.mutate(deactivatedEmail);
                  setDeactivatedEmail(null);
                }}
              >
                Reactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
