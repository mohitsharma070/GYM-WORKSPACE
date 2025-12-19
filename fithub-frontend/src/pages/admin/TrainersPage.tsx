import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dumbbell } from 'lucide-react'; // Import the icon
import PageHeader from '../../components/PageHeader'; // Import PageHeader

import type { Trainer } from "../../types/Trainer";
import {
  fetchTrainers,
  deleteTrainer,
  createTrainer,
  updateTrainer,
} from "../../api/trainers";

import AddTrainerModal from "../../modals/AddTrainerModal";
import EditTrainerModal from "../../modals/EditTrainerModal";

import Table from "../../components/Table";

export default function TrainersPage() {
  const queryClient = useQueryClient();

  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);

  /* NEW: Edit modal state */
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showEditTrainerModal, setShowEditTrainerModal] = useState(false);

  /* SEARCH AND PAGINATION STATE */
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // You can adjust this number

  /* ------------------ QUERY: LOAD TRAINERS ------------------ */
  const trainersQuery = useQuery<Trainer[]>({
    queryKey: ["trainers"],
    queryFn: fetchTrainers,
  });

  /* FILTER AND PAGINATE TRAINERS */
  const filteredTrainers = trainersQuery.data?.filter(trainer =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.trainerDetails?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);
  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <PageHeader
        icon={Dumbbell}
        title="Trainers"
        subtitle="Manage gym trainers and their specializations."
        actions={
          <button
            onClick={() => setShowAddTrainerModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add Trainer
          </button>
        }
      />

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        {trainersQuery.isLoading ? (
          <div className="p-6 text-center">Loading trainers...</div>
        ) : trainersQuery.error ? (
          <div className="p-6 text-center text-red-600">Failed to load trainers</div>
        ) : paginatedTrainers.length === 0 ? (
          <div className="text-center p-6 text-gray-600">No trainers found.</div>
        ) : (
          <Table
            headers={["#", "Name", "Email", "Actions", "▾"]}
            columnClasses={['w-1/12 text-center', 'w-3/12', 'w-3/12', 'w-3/12 text-center', 'w-1/12 text-center']}
            data={paginatedTrainers}
            renderCells={(trainer, index) => [
              index + 1 + (currentPage - 1) * itemsPerPage,
              <span className="font-medium">{trainer.name}</span>,
              trainer.email,
              <div className="flex gap-2 justify-center">
                {/* EDIT BUTTON */}
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrainer(trainer);
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
                    handleDelete(trainer.id);
                  }}
                >
                  Delete
                </button>
              </div>,
              <span
                className={`inline-block transform transition-transform ${
                  openRowIndex === index ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>,
            ]}
            renderExpandedContent={(trainer) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded bg-white">
                  <p className="text-gray-600">Specialization</p>
                  <p className="font-semibold">{trainer.trainerDetails?.specialization ?? "-"}</p>
                </div>
                <div className="p-3 border rounded bg-white">
                  <p className="text-gray-600">Experience (Years)</p>
                  <p className="font-semibold">{trainer.trainerDetails?.experienceYears ?? "-"}</p>
                </div>
                <div className="p-3 border rounded bg-white">
                  <p className="text-gray-600">Certification</p>
                  <p className="font-semibold">{trainer.trainerDetails?.certification ?? "-"}</p>
                </div>
                <div className="p-3 border rounded bg-white">
                  <p className="text-gray-600">Phone</p>
                  <p className="font-semibold">{trainer.trainerDetails?.phone ?? "-"}</p>
                </div>
              </div>
            )}
            keyExtractor={(trainer) => trainer.id}
            openRowIndex={openRowIndex}
            toggleRow={(index) =>
              setOpenRowIndex(openRowIndex === index ? null : index)
            }
            searchPlaceholder="Search trainers by name, email, or specialization..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
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
