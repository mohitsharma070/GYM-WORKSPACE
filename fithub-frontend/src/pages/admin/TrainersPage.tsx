import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { Trainer } from "../../types/Trainer";
import {
  fetchTrainers,
  deleteTrainer,
  createTrainer,
  updateTrainer,
} from "../../api/trainers";

import AddTrainerModal from "../../modals/AddTrainerModal";
import EditTrainerModal from "../../modals/EditTrainerModal";

/* Small reusable component for trainer detail fields */
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 border rounded bg-white">
      <p className="text-gray-600">{label}</p>
      <p className="font-semibold">{value ?? "-"}</p>
    </div>
  );
}

export default function TrainersPage() {
  const queryClient = useQueryClient();

  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);

  /* NEW: Edit modal state */
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showEditTrainerModal, setShowEditTrainerModal] = useState(false);

  /* ------------------ QUERY: LOAD TRAINERS ------------------ */
  const trainersQuery = useQuery<Trainer[]>({
    queryKey: ["trainers"],
    queryFn: fetchTrainers,
  });

  /* ------------------ MUTATION: CREATE TRAINER ------------------ */
  const createTrainerMutation = useMutation({
    mutationFn: createTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
  });

  /* ------------------ MUTATION: DELETE TRAINER ------------------ */
  const deleteTrainerMutation = useMutation({
    mutationFn: deleteTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
  });

  /* ------------------ MUTATION: UPDATE TRAINER ------------------ */
  const updateTrainerMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateTrainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
  });

  function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    deleteTrainerMutation.mutate(id);
  }

  async function handleAddTrainer(data: any) {
    await createTrainerMutation.mutateAsync(data);
    setShowAddTrainerModal(false);
  }

  async function handleUpdateTrainer(data: any) {
    if (!selectedTrainer) return;

    await updateTrainerMutation.mutateAsync({
      id: selectedTrainer.id,
      data,
    });

    setShowEditTrainerModal(false);
    setSelectedTrainer(null);
  }

  return (
    <div>
      {/* HEADER + ADD TRAINER BUTTON */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trainers</h1>

        <button
          onClick={() => setShowAddTrainerModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Trainer
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b bg-gray-100">
              <th className="p-3 w-[5%]">#</th>
              <th className="p-3 w-[30%]">Name</th>
              <th className="p-3 w-[35%]">Email</th>
              <th className="p-3 w-[20%] text-right">Actions</th>
              <th className="p-3 w-[5%] text-center">▾</th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}
            {trainersQuery.isLoading && (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Loading trainers...
                </td>
              </tr>
            )}

            {/* ERROR */}
            {trainersQuery.error && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-red-600">
                  Failed to load trainers
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {trainersQuery.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-600">
                  No trainers found.
                </td>
              </tr>
            )}

            {/* LIST */}
            {trainersQuery.data?.map((t, index) => (
              <React.Fragment key={t.id}>
                {/* MAIN ROW */}
                <tr
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    setOpenRowIndex(openRowIndex === index ? null : index)
                  }
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3">{t.email}</td>

                  <td className="p-3 text-right flex gap-2 justify-end">

                    {/* EDIT BUTTON */}
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrainer(t);
                        setShowEditTrainerModal(true);
                      }}
                    >
                      Edit
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(t.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`inline-block transform transition-transform ${
                        openRowIndex === index ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </td>
                </tr>

                {/* DROPDOWN DETAILS */}
                {openRowIndex === index && (
                  <tr className="bg-gray-50 border-b">
                    <td colSpan={5} className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Info
                          label="Specialization"
                          value={t.trainerDetails?.specialization}
                        />
                        <Info
                          label="Experience (Years)"
                          value={t.trainerDetails?.experienceYears}
                        />
                        <Info
                          label="Certification"
                          value={t.trainerDetails?.certification}
                        />
                        <Info label="Phone" value={t.trainerDetails?.phone} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD TRAINER MODAL */}
      {showAddTrainerModal && (
        <AddTrainerModal
          onClose={() => setShowAddTrainerModal(false)}
          onSave={handleAddTrainer}
          creating={createTrainerMutation.isPending}
        />
      )}

      {/* EDIT TRAINER MODAL */}
      {showEditTrainerModal && selectedTrainer && (
        <EditTrainerModal
          trainer={selectedTrainer}
          show={showEditTrainerModal}
          onClose={() => setShowEditTrainerModal(false)}
          onUpdated={handleUpdateTrainer}
        />
      )}
    </div>
  );
}
