import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dumbbell, Plus, Edit, Trash } from 'lucide-react'; // Import the icons
import PageHeader from '../../components/PageHeader'; // Import PageHeader
import { Button } from '../../components/Button';

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
    <div className="space-y-8">
      <PageHeader
        icon={Dumbbell}
        title="Trainers"
        subtitle="Manage gym trainers and their specializations."
        actions={
          <Button
            onClick={() => setShowAddTrainerModal(true)}
            className="bg-green-600 hover:bg-green-700"
            size="default"
          >
            <Plus size={18} className="mr-2" /> Add Trainer
          </Button>
        }
      />

      {/* TABLE */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        {trainersQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trainers...</p>
            </div>
          </div>
        ) : trainersQuery.error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Failed to load trainers</div>
            <Button
              onClick={() => trainersQuery.refetch()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : paginatedTrainers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <Dumbbell size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No trainers found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'Add trainers to get started'}
            </p>
          </div>
        ) : (
          <Table
            headers={["#", "Name", "Email", "Actions", "▾"]}
            columnClasses={['w-1/12 text-center', 'w-3/12', 'w-3/12', 'w-3/12 text-center', 'w-1/12 text-center']}
            data={paginatedTrainers}
            renderCells={(trainer, index) => [
              <span className="text-gray-500 font-medium">{index + 1 + (currentPage - 1) * itemsPerPage}</span>,
              <span className="font-semibold text-gray-900">{trainer.name}</span>,
              <span className="text-gray-600">{trainer.email}</span>,
              <div className="flex gap-2 justify-center">
                {/* EDIT BUTTON */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrainer(trainer);
                    setShowEditTrainerModal(true);
                  }}
                >
                  <Edit size={14} className="mr-1" /> Edit
                </Button>

                {/* DELETE BUTTON */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(trainer.id);
                  }}
                >
                  <Trash size={14} className="mr-1" /> Delete
                </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-500 mb-1">Specialization</p>
                  <p className="font-semibold text-gray-900">{trainer.trainerDetails?.specialization ?? "-"}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-500 mb-1">Experience (Years)</p>
                  <p className="font-semibold text-gray-900">{trainer.trainerDetails?.experienceYears ?? "-"}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-500 mb-1">Certification</p>
                  <p className="font-semibold text-gray-900">{trainer.trainerDetails?.certification ?? "-"}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold text-gray-900">{trainer.trainerDetails?.phone ?? "-"}</p>
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
