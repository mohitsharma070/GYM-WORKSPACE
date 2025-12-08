import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { User } from "../../types/User";
import type { ProductAssignment } from "../../types/Product";

import { loadPlan } from "../../api/subscriptions";
import { loadProducts } from "../../api/products";

import Detail from "../../components/Detail";
import Pulse from "../../components/Pulse";

function getDaysLeft(endDate?: string) {
  if (!endDate) return "N/A";
  const diff =
    new Date(endDate).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function UserRow({
  user,
  index,
  openRowIndex,
  toggleRow,
  deleteUserMutation,
  deletePlanMutation,
  deleteAssignedProductMutation,
  setShowEditPlanModal,
  setEditPlanMemberId,
  setSelectedMemberId,
  setShowProductModal,
  setSelectedUser,
  setShowEditUserModal,
}: any) {
  const queryClient = useQueryClient();

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
      {/* MAIN ROW */}
      <tr
        className="border-b hover:bg-gray-50 cursor-pointer"
        onClick={() => toggleRow(index)}
      >
        <td className="p-3">{index + 1}</td>
        <td className="p-3 font-medium">{user.name}</td>
        <td className="p-3">{user.email}</td>

        <td className="p-3">
          <div className="flex gap-2">
            {/* EDIT USER BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const users =
                  queryClient.getQueryData<User[]>(["users"]) || [];
                const freshUser = users.find((u) => u.id === user.id);
                setSelectedUser(freshUser || user);
                setShowEditUserModal(true);
              }}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
            >
              Edit
            </button>

            {/* DELETE USER */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete user?")) {
                  deleteUserMutation.mutate(user.id);
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Delete
            </button>
          </div>
        </td>

        <td className="p-3 text-center">
          <button
            className="hover:text-black"
            onClick={(e) => {
              e.stopPropagation();
              toggleRow(index);
            }}
          >
            ▼
          </button>
        </td>
      </tr>

      {/* DETAILS EXPANDED ROW */}
      {openRowIndex === index && (
        <tr className="bg-gray-50 border-b">
          <td colSpan={5} className="p-5">
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
                  <button
                    onClick={() => {
                      setEditPlanMemberId(user.id);
                      setShowEditPlanModal(true);
                    }}
                    className="px-3 py-1 bg-teal-600 text-white rounded"
                  >
                    Edit Plan
                  </button>

                  <button
                    onClick={() => deletePlanMutation.mutate(user.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Remove Plan
                  </button>
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

                      <button
                        onClick={() =>
                          deleteAssignedProductMutation.mutate(p.id)
                        }
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ASSIGN PLAN BUTTON */}
            <button
              onClick={() => {
                setEditPlanMemberId(user.id);
                setShowEditPlanModal(true);
              }}
              className="mt-5 px-4 py-2 bg-purple-600 text-white rounded mr-3"
            >
              + Assign Plan
            </button>

            {/* ASSIGN PRODUCT BUTTON */}
            <button
              onClick={() => {
                setSelectedMemberId(user.id);
                setShowProductModal(true);
              }}
              className="mt-5 px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Assign Product
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

export default UserRow;